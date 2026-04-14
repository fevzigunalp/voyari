/**
 * Shared wrapper for modular enrichment endpoints.
 *
 * - Enforces a hard AbortController timeout (default 15s) per endpoint.
 * - Wraps agent execution in safeFallbackFor() so provider exhaustion never
 *   throws and always yields a schema-compatible slice.
 * - Standardises the response shape so the frontend can deep-merge slices.
 *
 * This module is imported by the edge routes under src/app/api/plan/*.
 */
import type { ResearchAgentId } from "@/lib/types/research";
import type { TravelerProfile } from "@/lib/types/traveler-profile";
import { AGENTS } from "./research-agents";
import { runAgentSafely } from "./plan-generator";
import { safeFallbackFor } from "./safe-fallbacks";
import { logAi } from "./provider";

export type PlanSection =
  | "hotels"
  | "restaurants"
  | "activities"
  | "logistics"
  | "budget"
  | "weather";

export interface ModuleRequestBody {
  profile: TravelerProfile;
  planId?: string;
  /** Optional prior results (e.g. budget agent benefits from other outputs). */
  priorResults?: Partial<Record<ResearchAgentId, unknown>>;
}

export interface ModuleResponseBody {
  planId: string;
  section: PlanSection;
  data: Record<string, unknown>;
  partial: boolean;
  error?: string;
}

export const SECTION_TO_AGENT: Record<PlanSection, ResearchAgentId> = {
  hotels: "accommodation",
  restaurants: "restaurant",
  activities: "activity",
  logistics: "logistics",
  budget: "budget",
  weather: "weather",
};

const DEFAULT_MODULE_TIMEOUT_MS = 15_000;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function safeParseBody(raw: unknown): ModuleRequestBody | null {
  if (!isRecord(raw)) return null;
  const profile = raw["profile"];
  if (!isRecord(profile)) return null;
  const planIdRaw = raw["planId"];
  const planId = typeof planIdRaw === "string" ? planIdRaw : undefined;
  const priorRaw = raw["priorResults"];
  const priorResults = isRecord(priorRaw)
    ? (priorRaw as Partial<Record<ResearchAgentId, unknown>>)
    : undefined;
  return {
    profile: profile as unknown as TravelerProfile,
    ...(planId ? { planId } : {}),
    ...(priorResults ? { priorResults } : {}),
  };
}

/**
 * Execute a single research agent with a hard timeout; on timeout or any
 * unexpected throw, fall back to the safe schema-compatible slice.
 */
export async function runModuleAgent(
  section: PlanSection,
  profile: TravelerProfile,
  priorResults?: Partial<Record<ResearchAgentId, unknown>>,
  timeoutMs: number = DEFAULT_MODULE_TIMEOUT_MS,
): Promise<{ data: Record<string, unknown>; partial: boolean; error?: string }> {
  const agentId = SECTION_TO_AGENT[section];
  const agent = AGENTS.find((a) => a.id === agentId);
  if (!agent) {
    return {
      data: safeFallbackFor(agentId, profile),
      partial: true,
      error: "agent_not_found",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const input = agent.inputBuilder(profile, priorResults);
    const racePromise = runAgentSafely(agent, input, undefined, profile);

    const timeoutPromise = new Promise<{
      data: Record<string, unknown>;
      partial: true;
      error: string;
    }>((resolve) => {
      controller.signal.addEventListener("abort", () => {
        resolve({
          data: safeFallbackFor(agentId, profile),
          partial: true,
          error: "timeout",
        });
      });
    });

    const outcome = await Promise.race([
      racePromise.then((r) => ({
        data: (isRecord(r.data)
          ? (r.data as Record<string, unknown>)
          : safeFallbackFor(agentId, profile)),
        partial: r.partial,
        ...(r.errorMessage ? { error: r.errorMessage } : {}),
      })),
      timeoutPromise,
    ]);

    return outcome;
  } catch (err) {
    const message = err instanceof Error ? err.message.slice(0, 240) : String(err);
    logAi({
      phase: "exhausted",
      message: `module section=${section} unexpected-throw msg=${message}`,
    });
    return {
      data: safeFallbackFor(agentId, profile),
      partial: true,
      error: "unexpected_error",
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Standard request handler for enrichment endpoints. Always returns 200 with
 * a safe body — never throws, never 500s.
 */
export async function handleModuleRequest(
  section: PlanSection,
  req: Request,
): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    // Even invalid JSON gets a 200 with a stub; frontend tolerates partial.
    return Response.json(
      {
        planId: "unknown",
        section,
        data: safeFallbackFor(SECTION_TO_AGENT[section]),
        partial: true,
        error: "invalid_json",
      } satisfies ModuleResponseBody,
      { status: 200 },
    );
  }

  const body = safeParseBody(raw);
  if (!body) {
    return Response.json(
      {
        planId: "unknown",
        section,
        data: safeFallbackFor(SECTION_TO_AGENT[section]),
        partial: true,
        error: "invalid_body",
      } satisfies ModuleResponseBody,
      { status: 200 },
    );
  }

  const planId = body.planId || `plan_${Date.now()}`;

  logAi({
    phase: "start",
    route: `/api/plan/${section}`,
    message: `planId=${planId}`,
  });

  const outcome = await runModuleAgent(
    section,
    body.profile,
    body.priorResults,
  );

  logAi({
    phase: outcome.partial ? "exhausted" : "success",
    route: `/api/plan/${section}`,
    message: `planId=${planId} partial=${outcome.partial}${outcome.error ? ` error=${outcome.error}` : ""}`,
  });

  const response: ModuleResponseBody = {
    planId,
    section,
    data: outcome.data,
    partial: outcome.partial,
    ...(outcome.error ? { error: outcome.error } : {}),
  };

  return Response.json(response, { status: 200 });
}

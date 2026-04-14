/**
 * /api/plan/core — fast foundation endpoint.
 *
 * Goal: return in 5-10s on the happy path, always ≤15s. We run ONLY the route
 * research agent (with its built-in provider fallback + retry), then build the
 * plan scaffold locally via buildMinimalPlan + generateExperientialDays.
 *
 * NO synthesizer AI call in this hot path — downstream enrichment endpoints
 * fill in hotels/restaurants/activities/logistics/budget/weather.
 */
import type { NextRequest } from "next/server";
import type { TravelerProfile } from "@/lib/types/traveler-profile";
import type { TravelPlan } from "@/lib/types/plan";
import { AGENTS } from "@/lib/ai/research-agents";
import {
  runAgentSafely,
  buildMinimalPlan,
  type ResearchResults,
} from "@/lib/ai/plan-generator";
import { safeFallbackFor } from "@/lib/ai/safe-fallbacks";
import { experientialNarrative } from "@/lib/ai/experiential-content";
import { logAi } from "@/lib/ai/provider";

export const runtime = "edge";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const CORE_TIMEOUT_MS = 12_000;

interface RequestBody {
  profile: TravelerProfile;
  planId?: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parseBody(raw: unknown): RequestBody | null {
  if (!isRecord(raw)) return null;
  const profile = raw["profile"];
  if (!isRecord(profile)) return null;
  const planIdRaw = raw["planId"];
  return {
    profile: profile as unknown as TravelerProfile,
    ...(typeof planIdRaw === "string" ? { planId: planIdRaw } : {}),
  };
}

export async function POST(req: NextRequest): Promise<Response> {
  const traceId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `trace_${Date.now()}`;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return buildFallbackResponse(null, traceId, "invalid_json");
  }

  const body = parseBody(raw);
  if (!body) {
    return buildFallbackResponse(null, traceId, "invalid_body");
  }

  const planId =
    body.planId ||
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `plan_${crypto.randomUUID()}`
      : `plan_${Date.now()}`);

  logAi({
    phase: "start",
    route: "/api/plan/core",
    message: `planId=${planId} traceId=${traceId}`,
  });

  // Hard 12s timeout using Promise.race — we ALWAYS return a plan.
  const timeoutPromise = new Promise<{ routeData: unknown; timedOut: true }>(
    (resolve) => {
      setTimeout(() => {
        resolve({
          routeData: safeFallbackFor("route", body.profile),
          timedOut: true,
        });
      }, CORE_TIMEOUT_MS);
    },
  );

  const routeAgent = AGENTS.find((a) => a.id === "route");

  const routePromise: Promise<{ routeData: unknown; timedOut: false }> =
    (async () => {
      if (!routeAgent) {
        return {
          routeData: safeFallbackFor("route", body.profile),
          timedOut: false,
        };
      }
      try {
        const input = routeAgent.inputBuilder(body.profile, {});
        const outcome = await runAgentSafely(
          routeAgent,
          input,
          undefined,
          body.profile,
        );
        return { routeData: outcome.data, timedOut: false };
      } catch (err) {
        logAi({
          phase: "exhausted",
          route: "/api/plan/core",
          message: `planId=${planId} route-agent-throw msg=${
            err instanceof Error ? err.message.slice(0, 200) : String(err)
          }`,
        });
        return {
          routeData: safeFallbackFor("route", body.profile),
          timedOut: false,
        };
      }
    })();

  const raced = await Promise.race([routePromise, timeoutPromise]);

  const research: ResearchResults = { route: raced.routeData };
  const partialAgents = [
    "logistics",
    "accommodation",
    "activity",
    "restaurant",
    "weather",
    "budget",
  ];

  let plan: TravelPlan;
  try {
    plan = buildMinimalPlan(body.profile, research, partialAgents);
  } catch (err) {
    logAi({
      phase: "exhausted",
      route: "/api/plan/core",
      message: `planId=${planId} buildMinimalPlan-throw msg=${
        err instanceof Error ? err.message.slice(0, 200) : String(err)
      }`,
    });
    // Absolute worst case: return a skeleton with just days stub
    return buildFallbackResponse(body.profile, traceId, "build_failed", planId);
  }

  plan.id = planId;
  plan.createdAt = plan.createdAt || new Date().toISOString();
  if (!plan.narrative) plan.narrative = experientialNarrative(body.profile);
  plan.partial = true;
  plan.partialAgents = partialAgents;

  logAi({
    phase: "success",
    route: "/api/plan/core",
    message: `planId=${planId} timedOut=${raced.timedOut} days=${plan.days.length}`,
  });

  return Response.json(
    {
      planId,
      plan,
      partial: true,
      timedOut: raced.timedOut,
      traceId,
    },
    { status: 200 },
  );
}

function buildFallbackResponse(
  profile: TravelerProfile | null,
  traceId: string,
  reason: string,
  planId?: string,
): Response {
  const id =
    planId ||
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `plan_${crypto.randomUUID()}`
      : `plan_${Date.now()}`);

  // If we have no profile, return a bare stub the client can tolerate.
  if (!profile) {
    return Response.json(
      {
        planId: id,
        plan: null,
        partial: true,
        error: reason,
        traceId,
      },
      { status: 200 },
    );
  }

  const plan = buildMinimalPlan(
    profile,
    { route: safeFallbackFor("route", profile) },
    ["logistics", "accommodation", "activity", "restaurant", "weather", "budget"],
  );
  plan.id = id;
  plan.createdAt = plan.createdAt || new Date().toISOString();
  plan.narrative = plan.narrative || experientialNarrative(profile);
  plan.partial = true;

  return Response.json(
    {
      planId: id,
      plan,
      partial: true,
      error: reason,
      traceId,
    },
    { status: 200 },
  );
}

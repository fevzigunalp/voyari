/**
 * Plan generator — multi-provider orchestrated, resilience-hardened.
 *
 * - Each research agent runs through generateObject() → provider with fallback.
 * - Independent agents run in parallel; budget runs after with prior results.
 * - Every agent call is wrapped in .catch() and NEVER bubbles exhaustion: on
 *   failure a safe-fallback structure is substituted so the pipeline continues.
 * - Synthesizer is also wrapped: on failure we return a minimal plan stub so
 *   the UI always has something to render (with partial=true).
 */
import type { TravelerProfile } from "@/lib/types/traveler-profile";
import type { TravelPlan } from "@/lib/types/plan";
import type { ResearchAgentId } from "@/lib/types/research";
import { AGENTS, type ResearchAgentDef } from "./research-agents";
import { PLAN_SYNTHESIZER_PROMPT } from "./prompts/plan-synthesizer";
import { generateObject, logAi, isExhaustedError } from "./provider";
import { createLimiter } from "./limit";
import { preferredPrimary } from "./agent-routing";
import { safeFallbackFor, isPartial } from "./safe-fallbacks";
import {
  RouteAgentSchema,
  WeatherAgentSchema,
  AccommodationAgentSchema,
  RestaurantAgentSchema,
  ActivityAgentSchema,
  LogisticsAgentSchema,
  BudgetAgentSchema,
  TravelPlanSchema,
} from "./schema";
import { normalizePlan } from "./normalize";
import type { ZodType } from "zod";
import type { ProviderName } from "./types";

export type ResearchResults = Partial<Record<ResearchAgentId, unknown>>;

export type AgentStatus = "pending" | "running" | "done" | "error";

export type AgentErrorCode =
  | "provider_exhausted"
  | "timeout"
  | "rate_limited"
  | "unknown";

export interface AgentUpdate {
  agent: ResearchAgentId;
  status: AgentStatus;
  snippet?: string;
  error?: string;
  errorCode?: AgentErrorCode;
  data?: unknown;
  provider?: string;
  partial?: boolean;
}

const AGENT_SCHEMAS: Record<ResearchAgentId, ZodType<Record<string, unknown>>> = {
  route: RouteAgentSchema,
  weather: WeatherAgentSchema,
  accommodation: AccommodationAgentSchema,
  restaurant: RestaurantAgentSchema,
  activity: ActivityAgentSchema,
  logistics: LogisticsAgentSchema,
  budget: BudgetAgentSchema,
};

function classifyError(err: unknown): AgentErrorCode {
  if (isExhaustedError(err)) {
    if (err.lastKind === "timeout") return "timeout";
    if (err.lastKind === "http" && err.lastStatus === 429) return "rate_limited";
    return "provider_exhausted";
  }
  if (err instanceof Error && /timeout/i.test(err.message)) return "timeout";
  return "unknown";
}

async function callAgent(
  agent: ResearchAgentDef,
  userMessage: string,
): Promise<{ data: unknown; provider: string }> {
  const schema = AGENT_SCHEMAS[agent.id];
  const pref = preferredPrimary(agent.id);
  const overridePrimary: ProviderName | undefined =
    pref === "auto" ? undefined : pref;
  const result = await generateObject(
    {
      system: agent.systemPrompt,
      user: userMessage,
      webSearch: agent.useWebSearch,
      maxTokens: 8000,
      ...(agent.timeoutMs ? { timeoutMs: agent.timeoutMs } : {}),
      ...(overridePrimary ? { overridePrimary } : {}),
    },
    schema,
  );
  return { data: result.data, provider: result.provider };
}

interface AgentRunOutcome {
  data: unknown;
  provider?: string;
  partial: boolean;
  errorCode?: AgentErrorCode;
  errorMessage?: string;
}

async function runAgentSafely(
  agent: ResearchAgentDef,
  input: string,
): Promise<AgentRunOutcome> {
  const pref = preferredPrimary(agent.id);
  logAi({
    phase: "start",
    message: `agent=${agent.id} preferred=${pref}`,
  });
  try {
    const { data, provider } = await callAgent(agent, input);
    logAi({
      phase: "success",
      provider: provider as ProviderName,
      message: `agent=${agent.id} outcome=success`,
    });
    return { data, provider, partial: false };
  } catch (err) {
    const code = classifyError(err);
    const message = err instanceof Error ? err.message.slice(0, 240) : String(err);
    console.error(`[voyari.ai] agent=${agent.id} failed code=${code}`, message);
    logAi({
      phase: "exhausted",
      message: `agent=${agent.id} outcome=fallback code=${code} partial=true`,
    });
    return {
      data: safeFallbackFor(agent.id),
      partial: true,
      errorCode: code,
      errorMessage: "AI hizmeti geçici olarak kullanılamıyor",
    };
  }
}

/**
 * Run all research agents. Independent ones run in parallel; budget runs last.
 * Never throws — all agent failures are absorbed into safe fallbacks.
 */
export async function runResearch(
  profile: TravelerProfile,
  onAgentUpdate?: (u: AgentUpdate) => void,
): Promise<ResearchResults> {
  const results: ResearchResults = {};

  const independent = AGENTS.filter((a) => !a.dependsOnOthers);
  const dependent = AGENTS.filter((a) => a.dependsOnOthers);

  for (const a of AGENTS) {
    onAgentUpdate?.({ agent: a.id, status: "pending" });
  }

  const concurrency = Math.max(
    1,
    Number(process.env.AI_MAX_CONCURRENCY) || 3,
  );
  const limit = createLimiter(concurrency);

  await Promise.all(
    independent.map((agent) =>
      limit(async () => {
        onAgentUpdate?.({
          agent: agent.id,
          status: "running",
          snippet: `${agent.label} araştırma başlıyor...`,
        });
        const input = agent.inputBuilder(profile);
        const outcome = await runAgentSafely(agent, input);
        results[agent.id] = outcome.data;
        if (outcome.partial) {
          onAgentUpdate?.({
            agent: agent.id,
            status: "error",
            error: outcome.errorMessage,
            errorCode: outcome.errorCode,
            data: outcome.data,
            partial: true,
          });
        } else {
          onAgentUpdate?.({
            agent: agent.id,
            status: "done",
            snippet: `${agent.label} tamamlandı (${outcome.provider})`,
            data: outcome.data,
            provider: outcome.provider,
          });
        }
      }),
    ),
  );

  for (const agent of dependent) {
    onAgentUpdate?.({
      agent: agent.id,
      status: "running",
      snippet: `${agent.label} hesaplanıyor...`,
    });
    const input = agent.inputBuilder(profile, results);
    const outcome = await runAgentSafely(agent, input);
    results[agent.id] = outcome.data;
    if (outcome.partial) {
      onAgentUpdate?.({
        agent: agent.id,
        status: "error",
        error: outcome.errorMessage,
        errorCode: outcome.errorCode,
        data: outcome.data,
        partial: true,
      });
    } else {
      onAgentUpdate?.({
        agent: agent.id,
        status: "done",
        snippet: `${agent.label} tamamlandı (${outcome.provider})`,
        data: outcome.data,
        provider: outcome.provider,
      });
    }
  }

  return results;
}

/** Build a minimal skeletal plan when synthesis fully fails. */
function buildMinimalPlan(
  profile: TravelerProfile,
  research: ResearchResults,
  partialAgents: string[],
): TravelPlan {
  return {
    id: `plan_${Date.now()}`,
    createdAt: new Date().toISOString(),
    profile,
    route: {
      totalDistanceKm: 0,
      totalDrivingHours: 0,
      countries: [],
      waypoints: [],
    },
    days: [],
    budget: {
      breakdown: [],
      dailyEstimates: [],
      totalEstimate: 0,
      perPersonEstimate: 0,
      currency: "EUR",
      savingTips: [],
    },
    logistics: {
      countryRules: [],
      vehicleChecklist: [],
      packingList: [],
      documentChecklist: [],
      reservationTimeline: [],
      emergencyContacts: [],
    },
    weather: [],
    narrative: {
      glanceTitle: "Plan İskeleti Hazır",
      emotionalSummary:
        "Plan bazı bölümleri kısmi olarak üretildi — yeniden deneyebilirsiniz.",
      whyPerfectForYou: [],
      whatMakesUnique: [],
    },
    partial: true,
    partialAgents,
    // research preserved via research param in caller; not embedded here
    ...(research ? {} : {}),
  };
}

/**
 * Synthesizer — produces a TravelPlan from profile + research results.
 * Wrapped so it never throws; on failure returns a minimal skeletal plan.
 */
export async function synthesizePlan(
  profile: TravelerProfile,
  research: ResearchResults,
): Promise<TravelPlan> {
  const partialAgents = (Object.keys(research) as ResearchAgentId[]).filter(
    (k) => isPartial(research[k]),
  );

  const userMessage = `Aşağıdaki TravelerProfile ve research sonuçlarını kullanarak TravelPlan JSON'unu oluştur.

=== PROFILE ===
${JSON.stringify(profile, null, 2)}

=== RESEARCH ===
${JSON.stringify(research, null, 2).slice(0, 40000)}

id için "plan_${Date.now()}" kullan. createdAt için şimdiki ISO tarih.
Yalnızca geçerli JSON döndür.`;

  try {
    const result = await generateObject(
      {
        system: PLAN_SYNTHESIZER_PROMPT,
        user: userMessage,
        webSearch: false,
        maxTokens: 16000,
        timeoutMs: 120_000,
      },
      TravelPlanSchema,
    );

    const normalized = normalizePlan(result.data) as unknown as TravelPlan;
    if (!normalized.id) normalized.id = `plan_${Date.now()}`;
    if (!normalized.createdAt) normalized.createdAt = new Date().toISOString();
    if (!normalized.profile) normalized.profile = profile;
    if (partialAgents.length > 0) {
      normalized.partial = true;
      normalized.partialAgents = partialAgents;
    }
    logAi({
      phase: "success",
      provider: result.provider,
      message: `synthesizer outcome=success partial=${partialAgents.length > 0} partialAgents=${partialAgents.join(",")}`,
    });
    return normalized;
  } catch (err) {
    const code = classifyError(err);
    console.error(
      `[voyari.ai] synthesizer failed code=${code}`,
      err instanceof Error ? err.message.slice(0, 240) : String(err),
    );
    logAi({
      phase: "exhausted",
      message: `synthesizer outcome=fallback code=${code} partial=true`,
    });
    return buildMinimalPlan(profile, research, partialAgents);
  }
}

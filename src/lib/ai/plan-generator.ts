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
import { preferredPrimary, getRetryPolicy } from "./agent-routing";
import { safeFallbackFor, isPartial } from "./safe-fallbacks";
import {
  experientialBudget,
  experientialCountryInfo,
  experientialDocChecklist,
  experientialEmergencyContacts,
  experientialNarrative,
  experientialPackingList,
  experientialReservationTimeline,
  experientialCountryRule,
  experientialVehicleChecklist,
  generateExperientialDays,
  currencyOf,
} from "./experiential-content";
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
import type { ProviderName, AttemptEvent } from "./types";

export type ResearchResults = Partial<Record<ResearchAgentId, unknown>>;

export type AgentStatus =
  | "pending"
  | "running"
  | "retrying"
  | "fallback_running"
  | "done"
  | "partial"
  | "failed";

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
  onAttempt?: (ev: AttemptEvent) => void,
): Promise<{ data: unknown; provider: string }> {
  const schema = AGENT_SCHEMAS[agent.id];
  const pref = preferredPrimary(agent.id);
  const policy = getRetryPolicy(agent.id);
  const overridePrimary: ProviderName | undefined =
    pref === "auto" ? undefined : pref;
  const result = await generateObject(
    {
      system: agent.systemPrompt,
      user: userMessage,
      webSearch: agent.useWebSearch,
      maxTokens: 8000,
      maxRetriesOverride: policy.immediateRetries,
      ...(agent.timeoutMs ? { timeoutMs: agent.timeoutMs } : {}),
      ...(overridePrimary ? { overridePrimary } : {}),
      ...(onAttempt ? { onAttempt } : {}),
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

export async function runAgentSafely(
  agent: ResearchAgentDef,
  input: string,
  onAttempt?: (ev: AttemptEvent) => void,
  profile?: TravelerProfile,
): Promise<AgentRunOutcome> {
  const pref = preferredPrimary(agent.id);
  logAi({
    phase: "start",
    message: `agent=${agent.id} preferred=${pref}`,
  });
  let sawFirstFailure = false;
  const wrappedAttempt = (ev: AttemptEvent) => {
    if (ev.phase === "retry") {
      if (!sawFirstFailure) {
        sawFirstFailure = true;
        logAi({
          phase: "error",
          provider: ev.provider,
          message: `agent=${agent.id} event=first_failure`,
        });
      }
      logAi({
        phase: "retry",
        provider: ev.provider,
        attempt: ev.attempt,
        message: `agent=${agent.id} event=retry_started`,
      });
    } else if (ev.phase === "fallback_triggered") {
      logAi({
        phase: "fallback_triggered",
        provider: ev.provider,
        message: `agent=${agent.id} event=fallback_started`,
      });
    }
    onAttempt?.(ev);
  };
  try {
    const { data, provider } = await callAgent(agent, input, wrappedAttempt);
    logAi({
      phase: "success",
      provider: provider as ProviderName,
      message: `agent=${agent.id} event=final_state outcome=success`,
    });
    return { data, provider, partial: false };
  } catch (err) {
    const code = classifyError(err);
    const message = err instanceof Error ? err.message.slice(0, 240) : String(err);
    console.error(`[voyari.ai] agent=${agent.id} failed code=${code}`, message);
    logAi({
      phase: "exhausted",
      message: `agent=${agent.id} event=final_state outcome=fallback code=${code} partial=true`,
    });
    return {
      data: safeFallbackFor(agent.id, profile),
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

  const makeAttemptHandler = (agent: ResearchAgentDef) => {
    let fallbackSignaled = false;
    return (ev: AttemptEvent) => {
      if (ev.phase === "retry") {
        onAgentUpdate?.({
          agent: agent.id,
          status: "retrying",
          snippet: "Yeniden deneniyor...",
          provider: ev.provider,
        });
      } else if (ev.phase === "fallback_triggered") {
        fallbackSignaled = true;
        onAgentUpdate?.({
          agent: agent.id,
          status: "fallback_running",
          snippet: "Yedek sağlayıcı deneniyor...",
          provider: ev.provider,
        });
      } else if (ev.phase === "start" && fallbackSignaled && ev.attempt === 0) {
        // first call on fallback provider after fallback_triggered — already announced
      }
    };
  };

  await Promise.all(
    independent.map((agent) =>
      limit(async () => {
        onAgentUpdate?.({
          agent: agent.id,
          status: "running",
          snippet: `${agent.label} araştırma başlıyor...`,
        });
        const input = agent.inputBuilder(profile);
        const outcome = await runAgentSafely(
          agent,
          input,
          makeAttemptHandler(agent),
          profile,
        );
        results[agent.id] = outcome.data;
        if (outcome.partial) {
          onAgentUpdate?.({
            agent: agent.id,
            status: "partial",
            snippet: "Kısmi sonuç — arka planda tekrar denenecek",
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
    const outcome = await runAgentSafely(
      agent,
      input,
      makeAttemptHandler(agent),
      profile,
    );
    results[agent.id] = outcome.data;
    if (outcome.partial) {
      onAgentUpdate?.({
        agent: agent.id,
        status: "partial",
        snippet: "Kısmi sonuç — arka planda tekrar denenecek",
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

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Build a minimal skeletal plan when synthesis fully fails.
 * Salvages any usable research data (route waypoints, countries, weather,
 * budget, logistics) so the UI has at least stub content per section.
 */
export function buildMinimalPlan(
  profile: TravelerProfile,
  research: ResearchResults,
  partialAgents: string[],
): TravelPlan {
  const route = isRecord(research?.route) ? research.route : {};
  const budget = isRecord(research?.budget) ? research.budget : {};
  const logistics = isRecord(research?.logistics) ? research.logistics : {};
  const weatherRaw = isRecord(research?.weather)
    ? (research.weather as Record<string, unknown>).days
    : null;

  const totalDays = Math.max(1, profile.totalDays || 1);
  const expDays = generateExperientialDays(profile, totalDays);
  const expBudget = experientialBudget(profile);
  const narrative = experientialNarrative(profile);
  const currency = currencyOf(profile);

  const fallbackCountries = [experientialCountryInfo(profile)];
  const fallbackRules = [experientialCountryRule(profile)];
  const fallbackEmergency = experientialEmergencyContacts(profile);
  const fallbackPacking = experientialPackingList();
  const fallbackVehicle = experientialVehicleChecklist();
  const fallbackDocs = experientialDocChecklist();
  const fallbackReservations = experientialReservationTimeline();

  return {
    id: `plan_${Date.now()}`,
    createdAt: new Date().toISOString(),
    profile,
    route: {
      totalDistanceKm:
        typeof route["totalDistanceKm"] === "number"
          ? (route["totalDistanceKm"] as number)
          : 0,
      totalDrivingHours:
        typeof route["totalDrivingHours"] === "number"
          ? (route["totalDrivingHours"] as number)
          : 0,
      countries:
        Array.isArray(route["countries"]) && (route["countries"] as unknown[]).length > 0
          ? (route["countries"] as TravelPlan["route"]["countries"])
          : fallbackCountries,
      waypoints: Array.isArray(route["waypoints"])
        ? (route["waypoints"] as TravelPlan["route"]["waypoints"])
        : [],
    },
    days: expDays,
    budget: {
      breakdown:
        Array.isArray(budget["breakdown"]) && (budget["breakdown"] as unknown[]).length > 0
          ? (budget["breakdown"] as TravelPlan["budget"]["breakdown"])
          : expBudget.breakdown,
      dailyEstimates:
        Array.isArray(budget["dailyEstimates"]) && (budget["dailyEstimates"] as unknown[]).length > 0
          ? (budget["dailyEstimates"] as TravelPlan["budget"]["dailyEstimates"])
          : expBudget.dailyEstimates,
      totalEstimate:
        typeof budget["totalEstimate"] === "number" && (budget["totalEstimate"] as number) > 0
          ? (budget["totalEstimate"] as number)
          : expBudget.totalEstimate,
      perPersonEstimate:
        typeof budget["perPersonEstimate"] === "number" && (budget["perPersonEstimate"] as number) > 0
          ? (budget["perPersonEstimate"] as number)
          : expBudget.perPersonEstimate,
      currency:
        typeof budget["currency"] === "string"
          ? (budget["currency"] as string)
          : currency,
      savingTips:
        Array.isArray(budget["savingTips"]) && (budget["savingTips"] as unknown[]).length > 0
          ? (budget["savingTips"] as string[])
          : expBudget.savingTips,
    },
    logistics: {
      countryRules:
        Array.isArray(logistics["countryRules"]) && (logistics["countryRules"] as unknown[]).length > 0
          ? (logistics["countryRules"] as TravelPlan["logistics"]["countryRules"])
          : fallbackRules,
      vehicleChecklist:
        Array.isArray(logistics["vehicleChecklist"]) && (logistics["vehicleChecklist"] as unknown[]).length > 0
          ? (logistics["vehicleChecklist"] as TravelPlan["logistics"]["vehicleChecklist"])
          : fallbackVehicle,
      packingList:
        Array.isArray(logistics["packingList"]) && (logistics["packingList"] as unknown[]).length > 0
          ? (logistics["packingList"] as TravelPlan["logistics"]["packingList"])
          : fallbackPacking,
      documentChecklist:
        Array.isArray(logistics["documentChecklist"]) && (logistics["documentChecklist"] as unknown[]).length > 0
          ? (logistics["documentChecklist"] as TravelPlan["logistics"]["documentChecklist"])
          : fallbackDocs,
      reservationTimeline:
        Array.isArray(logistics["reservationTimeline"]) && (logistics["reservationTimeline"] as unknown[]).length > 0
          ? (logistics["reservationTimeline"] as TravelPlan["logistics"]["reservationTimeline"])
          : fallbackReservations,
      emergencyContacts:
        Array.isArray(logistics["emergencyContacts"]) && (logistics["emergencyContacts"] as unknown[]).length > 0
          ? (logistics["emergencyContacts"] as TravelPlan["logistics"]["emergencyContacts"])
          : fallbackEmergency,
    },
    weather: Array.isArray(weatherRaw)
      ? (weatherRaw as TravelPlan["weather"])
      : [],
    narrative,
    partial: true,
    partialAgents,
  };
}

/** List research agent ids whose payload was a safe-fallback stub. */
export function missingAgentSections(research: ResearchResults): string[] {
  return (Object.keys(research) as ResearchAgentId[]).filter((k) =>
    isPartial(research[k]),
  );
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

  logAi({
    phase: "start",
    message: `synthesizer started partialAgents=${partialAgents.join(",")}`,
  });

  let rawData: unknown = null;
  let provider: ProviderName | undefined;
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
    rawData = result.data;
    provider = result.provider;
  } catch (err) {
    const code = classifyError(err);
    console.error(
      `[voyari.ai] synthesizer generateObject failed code=${code}`,
      err instanceof Error ? err.message.slice(0, 240) : String(err),
    );
    logAi({
      phase: "exhausted",
      message: `synthesizer outcome=fallback code=${code} partial=true stage=generate`,
    });
    return buildMinimalPlan(profile, research, partialAgents);
  }

  // Normalize is guaranteed not to throw, but guard anyway.
  let normalized: TravelPlan;
  try {
    normalized = normalizePlan(rawData) as unknown as TravelPlan;
  } catch (err) {
    console.error(
      `[voyari.ai] synthesizer normalize failed`,
      err instanceof Error ? err.message.slice(0, 240) : String(err),
    );
    logAi({
      phase: "exhausted",
      message: `synthesizer outcome=fallback stage=normalize partial=true`,
    });
    return buildMinimalPlan(profile, research, partialAgents);
  }

  // Post-normalize integrity: days MUST be an array, shape fields must exist.
  if (!normalized || typeof normalized !== "object") {
    logAi({
      phase: "exhausted",
      message: `synthesizer outcome=fallback stage=post-normalize reason=not-object partial=true`,
    });
    return buildMinimalPlan(profile, research, partialAgents);
  }
  if (!Array.isArray(normalized.days)) normalized.days = [];
  if (!normalized.id) normalized.id = `plan_${Date.now()}`;
  if (!normalized.createdAt) normalized.createdAt = new Date().toISOString();
  if (!normalized.profile) normalized.profile = profile;
  if (partialAgents.length > 0) {
    normalized.partial = true;
    normalized.partialAgents = partialAgents;
  }
  logAi({
    phase: "success",
    provider,
    message: `synthesizer outcome=success partial=${partialAgents.length > 0} partialAgents=${partialAgents.join(",")} days=${normalized.days.length}`,
  });
  return normalized;
}

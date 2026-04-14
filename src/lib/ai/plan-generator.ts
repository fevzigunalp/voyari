/**
 * Plan generator — multi-provider orchestrated.
 *
 * - Each research agent runs through generateObject() → provider with fallback.
 * - Independent agents run in parallel; budget runs after with prior results.
 * - Synthesizer validates against TravelPlanSchema (lax) then coerces to TravelPlan.
 *
 * NDJSON stream shape from /api/research is preserved. The `snippet` on `done`
 * events now includes which provider answered (optional, additive field inside
 * an existing string — does not break the UI contract).
 */
import type { TravelerProfile } from "@/lib/types/traveler-profile";
import type { TravelPlan } from "@/lib/types/plan";
import type { ResearchAgentId } from "@/lib/types/research";
import { AGENTS, type ResearchAgentDef } from "./research-agents";
import { PLAN_SYNTHESIZER_PROMPT } from "./prompts/plan-synthesizer";
import { generateObject } from "./provider";
import { createLimiter } from "./limit";
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

export type ResearchResults = Partial<Record<ResearchAgentId, unknown>>;

export type AgentStatus = "pending" | "running" | "done" | "error";

export interface AgentUpdate {
  agent: ResearchAgentId;
  status: AgentStatus;
  snippet?: string;
  error?: string;
  data?: unknown;
  provider?: string;
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

async function callAgent(
  agent: ResearchAgentDef,
  userMessage: string,
): Promise<{ data: unknown; provider: string }> {
  const schema = AGENT_SCHEMAS[agent.id];
  const result = await generateObject(
    {
      system: agent.systemPrompt,
      user: userMessage,
      webSearch: agent.useWebSearch,
      maxTokens: 8000,
    },
    schema,
  );
  return { data: result.data, provider: result.provider };
}

/**
 * Run all research agents. Independent ones run in parallel; budget runs last.
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
        try {
          const input = agent.inputBuilder(profile);
          const { data, provider } = await callAgent(agent, input);
          results[agent.id] = data;
          onAgentUpdate?.({
            agent: agent.id,
            status: "done",
            snippet: `${agent.label} tamamlandı (${provider})`,
            data,
            provider,
          });
        } catch (err) {
          // Never leak raw provider details to client; log server-side.
          console.error(`[voyari.ai] agent=${agent.id} failed`, err);
          const safeMsg = "AI hizmeti geçici olarak kullanılamıyor";
          results[agent.id] = { error: safeMsg };
          onAgentUpdate?.({ agent: agent.id, status: "error", error: safeMsg });
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
    try {
      const input = agent.inputBuilder(profile, results);
      const { data, provider } = await callAgent(agent, input);
      results[agent.id] = data;
      onAgentUpdate?.({
        agent: agent.id,
        status: "done",
        snippet: `${agent.label} tamamlandı (${provider})`,
        data,
        provider,
      });
    } catch (err) {
      console.error(`[voyari.ai] agent=${agent.id} failed`, err);
      const safeMsg = "AI hizmeti geçici olarak kullanılamıyor";
      results[agent.id] = { error: safeMsg };
      onAgentUpdate?.({ agent: agent.id, status: "error", error: safeMsg });
    }
  }

  return results;
}

/**
 * Synthesizer — produces a TravelPlan from profile + research results.
 */
export async function synthesizePlan(
  profile: TravelerProfile,
  research: ResearchResults,
): Promise<TravelPlan> {
  const userMessage = `Aşağıdaki TravelerProfile ve research sonuçlarını kullanarak TravelPlan JSON'unu oluştur.

=== PROFILE ===
${JSON.stringify(profile, null, 2)}

=== RESEARCH ===
${JSON.stringify(research, null, 2).slice(0, 40000)}

id için "plan_${Date.now()}" kullan. createdAt için şimdiki ISO tarih.
Yalnızca geçerli JSON döndür.`;

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
  return normalized;
}

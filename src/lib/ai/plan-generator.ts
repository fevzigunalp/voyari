import type Anthropic from "@anthropic-ai/sdk";
import type { TravelerProfile } from "@/lib/types/traveler-profile";
import type { TravelPlan } from "@/lib/types/plan";
import type { ResearchAgentId } from "@/lib/types/research";
import { AI_MODEL, extractText, getClient, safeParseJson } from "./client";
import { AGENTS, type ResearchAgentDef } from "./research-agents";
import { PLAN_SYNTHESIZER_PROMPT } from "./prompts/plan-synthesizer";

export type ResearchResults = Partial<Record<ResearchAgentId, unknown>>;

export type AgentStatus = "pending" | "running" | "done" | "error";

export interface AgentUpdate {
  agent: ResearchAgentId;
  status: AgentStatus;
  snippet?: string;
  error?: string;
  data?: unknown;
}

type Block = { type: string; text?: string };

interface CreateMessageParams {
  model: string;
  max_tokens: number;
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  tools?: Array<Record<string, unknown>>;
}

async function callAgent(
  client: Anthropic,
  agent: ResearchAgentDef,
  userMessage: string,
): Promise<{ text: string; parsed: unknown }> {
  const params: CreateMessageParams = {
    model: AI_MODEL,
    max_tokens: 8000,
    system: agent.systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  };

  if (agent.useWebSearch) {
    params.tools = [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 5,
      },
    ];
  }

  // Cast to SDK's expected MessageCreateParams shape.
  const msg = await client.messages.create(
    params as unknown as Parameters<typeof client.messages.create>[0],
  );

  const content = (msg as { content?: Block[] }).content ?? [];
  const text = extractText(content);
  const parsed = safeParseJson(text);
  if (!parsed.ok) {
    // Provide a best-effort empty object so pipeline continues.
    return { text, parsed: { error: parsed.error, raw: text.slice(0, 400) } };
  }
  return { text, parsed: parsed.data };
}

/**
 * Run all research agents. Independent ones run in parallel; budget runs last.
 */
export async function runResearch(
  profile: TravelerProfile,
  onAgentUpdate?: (u: AgentUpdate) => void,
): Promise<ResearchResults> {
  const client = getClient();
  const results: ResearchResults = {};

  const independent = AGENTS.filter((a) => !a.dependsOnOthers);
  const dependent = AGENTS.filter((a) => a.dependsOnOthers);

  // Emit pending for all
  for (const a of AGENTS) {
    onAgentUpdate?.({ agent: a.id, status: "pending" });
  }

  // Run independent agents in parallel
  await Promise.all(
    independent.map(async (agent) => {
      onAgentUpdate?.({
        agent: agent.id,
        status: "running",
        snippet: `${agent.label} araştırma başlıyor...`,
      });
      try {
        const input = agent.inputBuilder(profile);
        const { parsed } = await callAgent(client, agent, input);
        results[agent.id] = parsed;
        onAgentUpdate?.({
          agent: agent.id,
          status: "done",
          snippet: `${agent.label} tamamlandı`,
          data: parsed,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
        results[agent.id] = { error: msg };
        onAgentUpdate?.({ agent: agent.id, status: "error", error: msg });
      }
    }),
  );

  // Run dependent agents sequentially after independent finish
  for (const agent of dependent) {
    onAgentUpdate?.({
      agent: agent.id,
      status: "running",
      snippet: `${agent.label} hesaplanıyor...`,
    });
    try {
      const input = agent.inputBuilder(profile, results);
      const { parsed } = await callAgent(client, agent, input);
      results[agent.id] = parsed;
      onAgentUpdate?.({
        agent: agent.id,
        status: "done",
        snippet: `${agent.label} tamamlandı`,
        data: parsed,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
      results[agent.id] = { error: msg };
      onAgentUpdate?.({ agent: agent.id, status: "error", error: msg });
    }
  }

  return results;
}

/**
 * Synthesizer call — takes research and produces a TravelPlan-shaped object.
 */
export async function synthesizePlan(
  profile: TravelerProfile,
  research: ResearchResults,
): Promise<TravelPlan> {
  const client = getClient();
  const userMessage = `Aşağıdaki TravelerProfile ve research sonuçlarını kullanarak TravelPlan JSON'unu oluştur.

=== PROFILE ===
${JSON.stringify(profile, null, 2)}

=== RESEARCH ===
${JSON.stringify(research, null, 2).slice(0, 40000)}

id için "plan_${Date.now()}" kullan. createdAt için şimdiki ISO tarih.
Yalnızca geçerli JSON döndür.`;

  const params: CreateMessageParams = {
    model: AI_MODEL,
    max_tokens: 16000,
    system: PLAN_SYNTHESIZER_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  };

  const msg = await client.messages.create(
    params as unknown as Parameters<typeof client.messages.create>[0],
  );
  const content = (msg as { content?: Block[] }).content ?? [];
  const text = extractText(content);
  const parsed = safeParseJson(text);
  if (!parsed.ok) {
    throw new Error(`Plan sentezleyici JSON parse hatası: ${parsed.error}`);
  }
  const plan = parsed.data as TravelPlan;
  if (!plan.id) plan.id = `plan_${Date.now()}`;
  if (!plan.createdAt) plan.createdAt = new Date().toISOString();
  if (!plan.profile) plan.profile = profile;
  return plan;
}

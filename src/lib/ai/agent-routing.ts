/**
 * Per-agent provider preference map.
 *
 * "auto" → let generateObject() pick the global primary (env AI_PROVIDER_PRIMARY).
 * Otherwise → force the named provider as primary for that agent.
 * Fallback behavior inside generateObject() remains unchanged.
 */
import type { ResearchAgentId } from "@/lib/types/research";
import type { ProviderName } from "./types";

export type AgentProviderPreference = ProviderName | "auto";

export const AGENT_PROVIDER_PREFERENCE: Record<
  ResearchAgentId,
  AgentProviderPreference
> = {
  route: "auto",
  accommodation: "auto",
  restaurant: "auto",
  activity: "auto",
  weather: "auto",
  budget: "auto",
  logistics: "anthropic",
};

export function preferredPrimary(
  agentId: ResearchAgentId,
): AgentProviderPreference {
  return AGENT_PROVIDER_PREFERENCE[agentId] ?? "auto";
}

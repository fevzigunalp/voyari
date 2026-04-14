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

/**
 * Per-agent retry policy. `immediateRetries` is the upper bound on same-provider
 * retries performed synchronously inside the request (clamped by AI_MAX_RETRIES).
 * `delayedRetryMs` is a client-driven best-effort delay before one extra attempt
 * triggered from the dashboard after research-complete.
 */
export interface RetryPolicy {
  immediateRetries: number;
  fallbackEnabled: boolean;
  delayedRetryMs: number | null;
}

export const AGENT_RETRY_POLICY: Record<ResearchAgentId, RetryPolicy> = {
  route: { immediateRetries: 2, fallbackEnabled: true, delayedRetryMs: 60_000 },
  accommodation: {
    immediateRetries: 2,
    fallbackEnabled: true,
    delayedRetryMs: 75_000,
  },
  restaurant: {
    immediateRetries: 1,
    fallbackEnabled: true,
    delayedRetryMs: 90_000,
  },
  activity: {
    immediateRetries: 1,
    fallbackEnabled: true,
    delayedRetryMs: 90_000,
  },
  logistics: {
    immediateRetries: 2,
    fallbackEnabled: true,
    delayedRetryMs: 60_000,
  },
  budget: {
    immediateRetries: 1,
    fallbackEnabled: true,
    delayedRetryMs: 120_000,
  },
  weather: {
    immediateRetries: 1,
    fallbackEnabled: true,
    delayedRetryMs: 120_000,
  },
};

export function getRetryPolicy(agentId: ResearchAgentId): RetryPolicy {
  return (
    AGENT_RETRY_POLICY[agentId] ?? {
      immediateRetries: 1,
      fallbackEnabled: true,
      delayedRetryMs: null,
    }
  );
}

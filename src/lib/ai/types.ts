/**
 * Shared AI provider types for the Voyari multi-provider orchestrator.
 *
 * Design: a minimal, provider-agnostic call contract. Each provider module
 * (gemini.ts, anthropic.ts) implements `callProvider` returning raw text; the
 * orchestrator (provider.ts) handles repair + schema validation + fallback.
 */

export type ProviderName = "gemini" | "anthropic";

export type ProviderErrorKind =
  | "timeout"
  | "http"
  | "empty"
  | "parse"
  | "validation"
  | "network"
  | "config"
  | "unknown";

export interface CallOptions {
  system: string;
  user: string;
  /** Stringified JSON schema hint (optional, appended into prompt as guidance). */
  jsonSchema?: string;
  /** Per-call timeout override; default from env AI_TIMEOUT_MS. */
  timeoutMs?: number;
  /** Enable provider-native web search / grounding. */
  webSearch?: boolean;
  /** Max output tokens. */
  maxTokens?: number;
  /** Override the global primary provider for this single call. */
  overridePrimary?: ProviderName;
}

export interface CallResult<T> {
  provider: ProviderName;
  raw: string;
  data: T;
  durationMs: number;
  repaired: boolean;
}

export class ProviderError extends Error {
  provider: ProviderName;
  kind: ProviderErrorKind;
  status?: number;
  constructor(
    provider: ProviderName,
    kind: ProviderErrorKind,
    message: string,
    status?: number,
  ) {
    super(message);
    this.name = "ProviderError";
    this.provider = provider;
    this.kind = kind;
    this.status = status;
  }
}

/** Raw provider call (no JSON parsing). Returns text + duration. */
export interface ProviderCall {
  (opts: CallOptions): Promise<{ text: string; durationMs: number }>;
}

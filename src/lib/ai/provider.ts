/**
 * Provider orchestrator — generateObject<T>.
 *
 * Flow:
 *  1. Pick primary provider from AI_PROVIDER_PRIMARY (default "gemini").
 *  2. Call primary with retries on retryable errors (429/5xx/timeout/network).
 *  3. If retries exhausted AND AI_ENABLE_FALLBACK != "false": retry on fallback.
 *  4. If both exhausted: throw an Error stamped with {providersTried, lastKind, lastStatus}.
 *
 * Structured JSON logs via logAi() for Cloudflare Pages / Workers logs.
 */
import type { ZodType } from "zod";
import { callGemini } from "./gemini";
import { callAnthropic } from "./anthropic";
import { repairAndParse } from "./repair";
import {
  ProviderError,
  type CallOptions,
  type CallResult,
  type ProviderCall,
  type ProviderName,
} from "./types";

const PROVIDERS: Record<ProviderName, ProviderCall> = {
  gemini: callGemini,
  anthropic: callAnthropic,
};

interface AiLogEvent {
  route?: string;
  phase:
    | "start"
    | "success"
    | "error"
    | "retry"
    | "fallback_triggered"
    | "exhausted";
  provider?: ProviderName;
  attempt?: number;
  kind?: string;
  status?: number;
  durationMs?: number;
  backoffMs?: number;
  repaired?: boolean;
  message?: string;
}

export function logAi(event: AiLogEvent): void {
  try {
    console.info(
      JSON.stringify({ tag: "voyari.ai", ts: Date.now(), ...event }),
    );
  } catch {
    // ignore serialization failure
  }
}

function readPrimary(): ProviderName {
  const v = (process.env.AI_PROVIDER_PRIMARY || "gemini").toLowerCase();
  return v === "anthropic" ? "anthropic" : "gemini";
}
function fallbackEnabled(): boolean {
  return (process.env.AI_ENABLE_FALLBACK || "true").toLowerCase() !== "false";
}
function defaultTimeout(): number {
  const n = Number(process.env.AI_TIMEOUT_MS);
  return Number.isFinite(n) && n > 0 ? n : 60_000;
}
function maxRetries(): number {
  const n = Number(process.env.AI_MAX_RETRIES);
  return Number.isFinite(n) && n >= 0 ? n : 3;
}

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

export function isRetryableProviderError(err: unknown): boolean {
  if (!(err instanceof ProviderError)) return false;
  if (err.kind === "timeout" || err.kind === "network") return true;
  if (err.kind === "http" && err.status && RETRYABLE_STATUS.has(err.status)) {
    return true;
  }
  return false;
}

function backoffMs(attempt: number): number {
  const base = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s, 8s...
  const jitter = Math.floor(Math.random() * 250);
  return Math.min(base + jitter, 15_000);
}

function errDetails(err: unknown): { kind: string; status?: number; message: string } {
  if (err instanceof ProviderError) {
    return { kind: err.kind, status: err.status, message: err.message };
  }
  if (err instanceof Error) {
    return { kind: "unknown", message: err.message };
  }
  return { kind: "unknown", message: String(err) };
}

async function callOnce<T>(
  provider: ProviderName,
  opts: CallOptions,
  schema: ZodType<T>,
): Promise<CallResult<T>> {
  const call = PROVIDERS[provider];
  const { text, durationMs } = await call({
    ...opts,
    timeoutMs: opts.timeoutMs ?? defaultTimeout(),
  });
  const parsed = repairAndParse(text, schema);
  if (!parsed) {
    throw new ProviderError(
      provider,
      "validation",
      "schema validation failed or JSON unparseable",
    );
  }
  return {
    provider,
    raw: text,
    data: parsed.data,
    durationMs,
    repaired: parsed.repaired,
  };
}

async function runWithRetry<T>(
  provider: ProviderName,
  opts: CallOptions,
  schema: ZodType<T>,
): Promise<CallResult<T>> {
  const retries = maxRetries();
  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    logAi({ phase: "start", provider, attempt });
    try {
      const result = await callOnce(provider, opts, schema);
      logAi({
        phase: "success",
        provider,
        attempt,
        durationMs: result.durationMs,
        repaired: result.repaired,
      });
      return result;
    } catch (err) {
      lastErr = err;
      const d = errDetails(err);
      logAi({
        phase: "error",
        provider,
        attempt,
        kind: d.kind,
        status: d.status,
        message: d.message.slice(0, 240),
      });
      if (attempt < retries && isRetryableProviderError(err)) {
        const wait = backoffMs(attempt);
        logAi({ phase: "retry", provider, attempt: attempt + 1, backoffMs: wait });
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      break;
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new ProviderError(provider, "unknown", String(lastErr));
}

export interface ExhaustedError extends Error {
  providersTried: ProviderName[];
  lastKind: string;
  lastStatus?: number;
}

/** Primary→(retries)→Fallback→(retries)→throw. */
export async function generateObject<T>(
  opts: CallOptions,
  schema: ZodType<T>,
): Promise<CallResult<T>> {
  const primary = readPrimary();
  const fallback: ProviderName = primary === "gemini" ? "anthropic" : "gemini";
  const providersTried: ProviderName[] = [];

  let lastErr: unknown = null;

  // Primary
  providersTried.push(primary);
  try {
    return await runWithRetry(primary, opts, schema);
  } catch (err) {
    lastErr = err;
  }

  // Fallback
  if (!fallbackEnabled()) {
    const d = errDetails(lastErr);
    logAi({ phase: "exhausted", provider: primary, kind: d.kind, status: d.status });
    throw stampError(d, providersTried);
  }

  logAi({ phase: "fallback_triggered", provider: fallback });
  providersTried.push(fallback);
  try {
    return await runWithRetry(fallback, opts, schema);
  } catch (err2) {
    const d = errDetails(err2);
    logAi({ phase: "exhausted", provider: fallback, kind: d.kind, status: d.status });
    throw stampError(d, providersTried);
  }
}

function stampError(
  d: { kind: string; status?: number; message: string },
  providersTried: ProviderName[],
): ExhaustedError {
  const e = new Error("AI provider unavailable") as ExhaustedError;
  e.providersTried = providersTried;
  e.lastKind = d.kind;
  if (typeof d.status === "number") e.lastStatus = d.status;
  return e;
}

export function isExhaustedError(err: unknown): err is ExhaustedError {
  return (
    err instanceof Error &&
    Array.isArray((err as ExhaustedError).providersTried) &&
    typeof (err as ExhaustedError).lastKind === "string"
  );
}

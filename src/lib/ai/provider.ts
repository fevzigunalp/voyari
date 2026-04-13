/**
 * Provider orchestrator — generateObject<T>.
 *
 * Flow:
 *  1. Pick primary provider from AI_PROVIDER_PRIMARY (default "gemini").
 *  2. Call primary, repair + zod-validate. Return on success.
 *  3. If fails AND AI_ENABLE_FALLBACK != "false": call the other provider.
 *  4. If both fail: log details, throw a safe generic error.
 *
 * Logs one-line events via logAi() at every boundary for Cloudflare Pages logs.
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

interface AiEvent {
  provider: ProviderName;
  status: "start" | "success" | "fallback" | "error";
  durationMs?: number;
  reason?: string;
  repaired?: boolean;
}

export function logAi(event: AiEvent): void {
  const parts = [`[voyari.ai]`, `provider=${event.provider}`, `status=${event.status}`];
  if (typeof event.durationMs === "number") parts.push(`durationMs=${event.durationMs}`);
  if (event.reason) parts.push(`reason=${event.reason}`);
  if (typeof event.repaired === "boolean") parts.push(`repaired=${event.repaired}`);
  console.info(parts.join(" "));
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

async function runOne<T>(
  provider: ProviderName,
  opts: CallOptions,
  schema: ZodType<T>,
): Promise<CallResult<T>> {
  logAi({ provider, status: "start" });
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
  logAi({ provider, status: "success", durationMs, repaired: parsed.repaired });
  return {
    provider,
    raw: text,
    data: parsed.data,
    durationMs,
    repaired: parsed.repaired,
  };
}

/**
 * Primary call with schema-validated object return. Falls back on any
 * ProviderError or unexpected error.
 */
export async function generateObject<T>(
  opts: CallOptions,
  schema: ZodType<T>,
): Promise<CallResult<T>> {
  const primary = readPrimary();
  const fallback: ProviderName = primary === "gemini" ? "anthropic" : "gemini";

  try {
    return await runOne(primary, opts, schema);
  } catch (err) {
    const reason =
      err instanceof ProviderError
        ? `${err.kind}:${err.message.slice(0, 160)}`
        : err instanceof Error
          ? `unknown:${err.message.slice(0, 160)}`
          : "unknown";
    logAi({ provider: primary, status: "error", reason });

    if (!fallbackEnabled()) {
      console.error(`[voyari.ai] primary=${primary} failed and fallback disabled`, err);
      throw new Error("AI provider unavailable");
    }

    logAi({ provider: fallback, status: "fallback", reason });
    try {
      return await runOne(fallback, opts, schema);
    } catch (err2) {
      const reason2 =
        err2 instanceof ProviderError
          ? `${err2.kind}:${err2.message.slice(0, 160)}`
          : err2 instanceof Error
            ? `unknown:${err2.message.slice(0, 160)}`
            : "unknown";
      logAi({ provider: fallback, status: "error", reason: reason2 });
      console.error(
        `[voyari.ai] both providers failed primary=${primary} fallback=${fallback}`,
        { primaryErr: err, fallbackErr: err2 },
      );
      throw new Error("AI provider unavailable");
    }
  }
}

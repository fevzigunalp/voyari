/**
 * GET /api/health/ai
 *
 * Lightweight health probe that reports AI provider configuration status
 * without ever leaking secret values. Safe to expose publicly; returns
 * only presence booleans, resolved model names and high-level toggles.
 */
export const runtime = "edge";
export const dynamic = "force-dynamic";

const GEMINI_MODEL = "gemini-1.5-flash";
const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

interface ProviderInfo {
  configured: boolean;
  model: string;
}

interface HealthResponse {
  ok: boolean;
  primary: "gemini" | "anthropic";
  fallback: boolean;
  timeoutMs: number;
  providers: {
    gemini: ProviderInfo;
    anthropic: ProviderInfo;
  };
}

function resolvePrimary(): "gemini" | "anthropic" {
  const v = (process.env.AI_PROVIDER_PRIMARY || "gemini").toLowerCase();
  return v === "anthropic" ? "anthropic" : "gemini";
}

function resolveTimeout(): number {
  const n = Number(process.env.AI_TIMEOUT_MS);
  return Number.isFinite(n) && n > 0 ? n : 60_000;
}

function resolveFallback(): boolean {
  return (process.env.AI_ENABLE_FALLBACK || "true").toLowerCase() !== "false";
}

export async function GET(): Promise<Response> {
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);
  const anthropicConfigured = Boolean(process.env.ANTHROPIC_API_KEY);
  const ok = geminiConfigured || anthropicConfigured;

  const body: HealthResponse = {
    ok,
    primary: resolvePrimary(),
    fallback: resolveFallback(),
    timeoutMs: resolveTimeout(),
    providers: {
      gemini: {
        configured: geminiConfigured,
        model: process.env.GEMINI_MODEL || GEMINI_MODEL,
      },
      anthropic: {
        configured: anthropicConfigured,
        model: process.env.ANTHROPIC_MODEL || ANTHROPIC_MODEL,
      },
    },
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: ok ? 200 : 503,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

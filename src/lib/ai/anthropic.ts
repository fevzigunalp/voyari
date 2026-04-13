/**
 * Anthropic provider — wraps @anthropic-ai/sdk.
 * Lazy key read (no module-load throw). Edge-compatible.
 */
import Anthropic from "@anthropic-ai/sdk";
import { ProviderError, type CallOptions, type ProviderCall } from "./types";

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_TIMEOUT = 60_000;

interface Block {
  type: string;
  text?: string;
}

let cached: Anthropic | null = null;
function getClient(): Anthropic {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new ProviderError("anthropic", "config", "ANTHROPIC_API_KEY not set");
  }
  cached = new Anthropic({ apiKey });
  return cached;
}

export const callAnthropic: ProviderCall = async (opts: CallOptions) => {
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT;
  const client = getClient();

  const params: Record<string, unknown> = {
    model,
    max_tokens: opts.maxTokens ?? 8000,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  };
  if (opts.webSearch) {
    params["tools"] = [
      { type: "web_search_20250305", name: "web_search", max_uses: 5 },
    ];
  }

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  const started = Date.now();
  try {
    const msg = await client.messages.create(
      params as unknown as Parameters<typeof client.messages.create>[0],
      { signal: ac.signal },
    );
    const content = (msg as { content?: Block[] }).content ?? [];
    const text = content
      .filter((b) => b.type === "text" && typeof b.text === "string")
      .map((b) => b.text as string)
      .join("\n")
      .trim();
    if (!text) {
      throw new ProviderError("anthropic", "empty", "Anthropic returned empty text");
    }
    return { text, durationMs: Date.now() - started };
  } catch (err) {
    if (err instanceof ProviderError) throw err;
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new ProviderError(
          "anthropic",
          "timeout",
          `Anthropic timeout after ${timeoutMs}ms`,
        );
      }
      const maybeStatus = (err as { status?: number }).status;
      if (typeof maybeStatus === "number") {
        throw new ProviderError("anthropic", "http", err.message, maybeStatus);
      }
      throw new ProviderError("anthropic", "network", err.message);
    }
    throw new ProviderError("anthropic", "unknown", "unknown error");
  } finally {
    clearTimeout(timer);
  }
};

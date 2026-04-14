/**
 * Gemini provider — REST API, edge-safe (no SDK).
 * Endpoint: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 */
import { ProviderError, type CallOptions, type ProviderCall } from "./types";

const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_TIMEOUT = 60_000;

interface GeminiPart {
  text?: string;
}
interface GeminiCandidate {
  content?: { parts?: GeminiPart[] };
  finishReason?: string;
}
interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: { blockReason?: string };
}

export const callGemini: ProviderCall = async (opts: CallOptions) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ProviderError("gemini", "config", "GEMINI_API_KEY not set");
  }
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  // Web search (grounding) and JSON response mode are mutually exclusive in Gemini.
  // When webSearch is enabled we drop responseMimeType and rely on repair().
  const useGrounding = opts.webSearch === true;

  const body: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: opts.system }] },
    contents: [{ role: "user", parts: [{ text: opts.user }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: opts.maxTokens ?? 8192,
      ...(useGrounding ? {} : { responseMimeType: "application/json" }),
    },
  };
  if (useGrounding) {
    body["tools"] = [{ googleSearch: {} }];
  }

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  const started = Date.now();
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: ac.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      throw new ProviderError("gemini", "timeout", `Gemini timeout after ${timeoutMs}ms`);
    }
    throw new ProviderError(
      "gemini",
      "network",
      err instanceof Error ? err.message : "network error",
    );
  }
  clearTimeout(timer);

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new ProviderError(
      "gemini",
      "http",
      `Gemini HTTP ${res.status}: ${bodyText.slice(0, 300)}`,
      res.status,
    );
  }

  let json: GeminiResponse;
  try {
    json = (await res.json()) as GeminiResponse;
  } catch (err) {
    throw new ProviderError(
      "gemini",
      "parse",
      err instanceof Error ? err.message : "response parse error",
    );
  }

  if (json.promptFeedback?.blockReason) {
    throw new ProviderError(
      "gemini",
      "empty",
      `Gemini blocked: ${json.promptFeedback.blockReason}`,
    );
  }

  const parts = json.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((p) => (typeof p.text === "string" ? p.text : ""))
    .join("\n")
    .trim();
  if (!text) {
    throw new ProviderError("gemini", "empty", "Gemini returned empty text");
  }

  return { text, durationMs: Date.now() - started };
};

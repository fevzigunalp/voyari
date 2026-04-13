import Anthropic from "@anthropic-ai/sdk";

export const AI_MODEL = "claude-sonnet-4-20250514";

let cached: Anthropic | null = null;

export function getClient(): Anthropic {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY environment variable is not set. Add it to .env.local.",
    );
  }
  cached = new Anthropic({ apiKey });
  return cached;
}

/**
 * Strip markdown fences from a model response and try to parse JSON.
 * Returns parsed data (unknown) — callers should validate/shape.
 */
export function safeParseJson(raw: string): { ok: true; data: unknown } | { ok: false; error: string; raw: string } {
  if (!raw || typeof raw !== "string") {
    return { ok: false, error: "Empty response", raw: raw ?? "" };
  }
  let text = raw.trim();
  // Remove ```json fences
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  // Try to locate first { and last }
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last < first) {
    // Try arrays too
    const firstA = text.indexOf("[");
    const lastA = text.lastIndexOf("]");
    if (firstA !== -1 && lastA > firstA) {
      text = text.slice(firstA, lastA + 1);
    } else {
      return { ok: false, error: "No JSON object found", raw };
    }
  } else {
    text = text.slice(first, last + 1);
  }
  try {
    const data: unknown = JSON.parse(text);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "JSON parse error", raw };
  }
}

/**
 * Extract concatenated text from an Anthropic message response content blocks.
 */
export function extractText(content: Array<{ type: string; text?: string }>): string {
  return content
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("\n");
}

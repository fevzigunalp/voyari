/**
 * Legacy client shim.
 *
 * Kept for backward compatibility with any stale imports. The multi-provider
 * orchestrator in ./provider.ts is the real entry point. Key reads are lazy
 * inside each provider module — no module-load throw.
 *
 * Do NOT add new call sites here; use `generateObject` from ./provider.
 */
export const AI_MODEL =
  process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

export function extractText(
  content: Array<{ type: string; text?: string }>,
): string {
  return content
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("\n");
}

export function safeParseJson(
  raw: string,
):
  | { ok: true; data: unknown }
  | { ok: false; error: string; raw: string } {
  if (!raw || typeof raw !== "string") {
    return { ok: false, error: "Empty response", raw: raw ?? "" };
  }
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last < first) {
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
    return {
      ok: false,
      error: err instanceof Error ? err.message : "JSON parse error",
      raw,
    };
  }
}

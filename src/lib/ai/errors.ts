/**
 * Shared helpers for mapping orchestrator exhaustion errors into user-safe
 * HTTP responses. Keep Turkish for end-user messages.
 */
import { isExhaustedError } from "./provider";

export interface ApiErrorShape {
  error: string;
  reason:
    | "rate_limited"
    | "timeout"
    | "provider_exhausted"
    | "invalid_input"
    | "unknown";
  providersTried?: string[];
}

export function buildAiErrorResponse(err: unknown, route: string): Response {
  let shape: ApiErrorShape = {
    error: "AI hizmeti geçici olarak kullanılamıyor",
    reason: "unknown",
  };
  let status = 503;
  let retryAfter: number | undefined;

  if (isExhaustedError(err)) {
    shape.providersTried = err.providersTried;
    if (err.lastKind === "timeout") {
      shape = {
        error: "AI sağlayıcısı geç cevap verdi. Tekrar deneyebilirsiniz.",
        reason: "timeout",
        providersTried: err.providersTried,
      };
    } else if (err.lastKind === "http" && err.lastStatus === 429) {
      shape = {
        error: "Sistem şu an yoğun. Birkaç saniye sonra tekrar deneyin.",
        reason: "rate_limited",
        providersTried: err.providersTried,
      };
      status = 429;
      retryAfter = 5;
    } else {
      shape = {
        error:
          "AI sağlayıcıları geçici olarak kullanılamıyor. Lütfen biraz sonra tekrar deneyin.",
        reason: "provider_exhausted",
        providersTried: err.providersTried,
      };
    }
  }

  // Structured server log (no keys, no user text)
  try {
    console.error(
      JSON.stringify({
        tag: "voyari.api.error",
        route,
        status,
        reason: shape.reason,
        providersTried: shape.providersTried ?? [],
        message: err instanceof Error ? err.message.slice(0, 240) : String(err),
      }),
    );
  } catch {
    // ignore
  }

  const headers: Record<string, string> = {
    "content-type": "application/json; charset=utf-8",
  };
  if (retryAfter) headers["retry-after"] = String(retryAfter);

  return new Response(JSON.stringify(shape), { status, headers });
}

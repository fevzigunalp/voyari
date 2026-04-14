import type { NextRequest } from "next/server";
import type { TravelerProfile } from "@/lib/types/traveler-profile";
import { runResearch, type AgentUpdate } from "@/lib/ai/plan-generator";
import { isExhaustedError } from "@/lib/ai/provider";

export const runtime = "edge";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

interface RequestBody {
  profile: TravelerProfile;
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const profile = body?.profile;
  if (!profile || typeof profile !== "object") {
    return new Response(JSON.stringify({ error: "Missing profile" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      try {
        const research = await runResearch(profile, (u: AgentUpdate) => {
          send(u);
        });
        send({ type: "research-complete", research });
      } catch (err) {
        console.error(
          JSON.stringify({
            tag: "voyari.api.error",
            route: "/api/research",
            message: err instanceof Error ? err.message.slice(0, 240) : String(err),
          }),
        );
        let reason: "rate_limited" | "timeout" | "provider_exhausted" | "unknown" =
          "unknown";
        let message = "AI hizmeti geçici olarak kullanılamıyor";
        if (isExhaustedError(err)) {
          if (err.lastKind === "timeout") {
            reason = "timeout";
            message = "AI sağlayıcısı geç cevap verdi. Tekrar deneyebilirsiniz.";
          } else if (err.lastKind === "http" && err.lastStatus === 429) {
            reason = "rate_limited";
            message = "Sistem şu an yoğun. Birkaç saniye sonra tekrar deneyin.";
          } else {
            reason = "provider_exhausted";
            message =
              "AI sağlayıcıları geçici olarak kullanılamıyor. Lütfen biraz sonra tekrar deneyin.";
          }
        }
        send({ type: "error", error: message, reason });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}

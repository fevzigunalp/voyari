import type { NextRequest } from "next/server";
import type { TravelerProfile } from "@/lib/types/traveler-profile";
import { runResearch, type AgentUpdate } from "@/lib/ai/plan-generator";

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

      let research: Record<string, unknown> = {};
      try {
        // runResearch no longer throws — each agent is isolated and falls back
        // to a safe stub. We always reach research-complete.
        research = (await runResearch(profile, (u: AgentUpdate) => {
          send(u);
        })) as Record<string, unknown>;
      } catch (err) {
        // Defensive — should not happen after hardening.
        console.error(
          JSON.stringify({
            tag: "voyari.api.error",
            route: "/api/research",
            message:
              err instanceof Error ? err.message.slice(0, 240) : String(err),
          }),
        );
      }

      const hasAny =
        research && typeof research === "object" && Object.keys(research).length > 0;
      if (hasAny) {
        send({ type: "research-complete", research });
      } else {
        send({
          type: "error",
          error:
            "AI sağlayıcıları geçici olarak kullanılamıyor. Lütfen biraz sonra tekrar deneyin.",
          reason: "provider_exhausted",
        });
      }
      controller.close();
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

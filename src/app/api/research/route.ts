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
      const MAX_WALL_MS = 4 * 60 * 1000; // 4 min guard
      const wallTimeout = new Promise<"wall-timeout">((resolve) =>
        setTimeout(() => resolve("wall-timeout"), MAX_WALL_MS),
      );
      try {
        // runResearch no longer throws — each agent is isolated and falls back
        // to a safe stub. We always reach research-complete.
        const raceResult = await Promise.race([
          runResearch(
            profile,
            (u: AgentUpdate) => send(u),
            (p) => send(p),
          ),
          wallTimeout,
        ]);
        if (raceResult === "wall-timeout") {
          console.error(
            JSON.stringify({
              tag: "voyari.api.error",
              route: "/api/research",
              message: "wall-time-exceeded",
            }),
          );
          send({
            type: "warning",
            error:
              "Araştırma süresi aşıldı — elde edilen kısmi sonuçlar kullanılacak.",
          });
        } else {
          research = raceResult as Record<string, unknown>;
        }
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

      // Always close cleanly with research-complete, even if the bundle is
      // empty — the /api/generate-plan route will degrade to a minimal plan.
      send({ type: "research-complete", research: research ?? {} });
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

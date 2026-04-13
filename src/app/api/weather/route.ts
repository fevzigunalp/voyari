import type { NextRequest } from "next/server";
import type { TravelerProfile } from "@/lib/types/traveler-profile";
import { getAgent } from "@/lib/ai/research-agents";
import { generateObject } from "@/lib/ai/provider";
import { WeatherAgentSchema } from "@/lib/ai/schema";

export const runtime = "edge";
export const maxDuration = 60;

interface RequestBody {
  profile: TravelerProfile;
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.profile) {
    return Response.json({ error: "Missing profile" }, { status: 400 });
  }

  try {
    const agent = getAgent("weather");
    const userMessage = agent.inputBuilder(body.profile);
    const result = await generateObject(
      {
        system: agent.systemPrompt,
        user: userMessage,
        webSearch: agent.useWebSearch,
        maxTokens: 4000,
      },
      WeatherAgentSchema,
    );
    return Response.json({ data: result.data });
  } catch (err) {
    console.error("[voyari.ai] /api/weather failed", err);
    return Response.json(
      { error: "AI hizmeti geçici olarak kullanılamıyor" },
      { status: 503 },
    );
  }
}

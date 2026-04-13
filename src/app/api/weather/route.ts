import type { NextRequest } from "next/server";
import type { TravelerProfile } from "@/lib/types/traveler-profile";
import { AI_MODEL, extractText, getClient, safeParseJson } from "@/lib/ai/client";
import { getAgent } from "@/lib/ai/research-agents";

export const runtime = "edge";
export const maxDuration = 60;

interface RequestBody {
  profile: TravelerProfile;
}

type Block = { type: string; text?: string };

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
    const client = getClient();
    const agent = getAgent("weather");
    const userMessage = agent.inputBuilder(body.profile);

    const msg = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 4000,
      system: agent.systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 3,
        },
      ],
    } as unknown as Parameters<typeof client.messages.create>[0]);

    const content = (msg as { content?: Block[] }).content ?? [];
    const text = extractText(content);
    const parsed = safeParseJson(text);
    if (!parsed.ok) {
      return Response.json(
        { error: "Parse error", details: parsed.error },
        { status: 500 },
      );
    }
    return Response.json({ data: parsed.data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return Response.json({ error: message }, { status: 500 });
  }
}

import type { NextRequest } from "next/server";
import { generateObject } from "@/lib/ai/provider";
import { ExtractedIntentSchema, type ExtractedIntent } from "@/lib/ai/schema";
import { INTENT_EXTRACTOR_PROMPT } from "@/lib/ai/prompts/intent-extractor";
import { buildAiErrorResponse } from "@/lib/ai/errors";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface RequestBody {
  text?: string;
}

const MAX_CHARS = 4000;

function sanitize(input: string): string {
  return input.replace(/\s+/g, " ").trim().slice(0, MAX_CHARS);
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return Response.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const raw = typeof body?.text === "string" ? body.text : "";
  const text = sanitize(raw);
  if (text.length < 4) {
    return Response.json(
      { error: "Lütfen hayalinizi birkaç cümleyle anlatın" },
      { status: 400 },
    );
  }

  try {
    const result = await generateObject<ExtractedIntent>(
      {
        system: INTENT_EXTRACTOR_PROMPT,
        user: text,
        maxTokens: 800,
      },
      ExtractedIntentSchema,
    );
    return Response.json({ intent: result.data });
  } catch (err) {
    return buildAiErrorResponse(err, "/api/extract-intent");
  }
}

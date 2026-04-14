import type { NextRequest } from "next/server";
import type { TravelPlan } from "@/lib/types/plan";
import { PLAN_REFINER_PROMPT } from "@/lib/ai/prompts/plan-refiner";
import { generateObject } from "@/lib/ai/provider";
import { TravelPlanSchema } from "@/lib/ai/schema";
import { normalizePlan } from "@/lib/ai/normalize";
import { buildAiErrorResponse } from "@/lib/ai/errors";

export const runtime = "edge";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

interface RequestBody {
  planId: string;
  plan: TravelPlan;
  refinement: string;
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.plan || !body?.refinement || typeof body.refinement !== "string") {
    return Response.json(
      { error: "plan ve refinement gerekli" },
      { status: 400 },
    );
  }

  const refinement = body.refinement.trim().slice(0, 2000);
  if (!refinement) {
    return Response.json({ error: "Boş revizyon talebi" }, { status: 400 });
  }

  try {
    const userMessage = `Mevcut TravelPlan aşağıda. Kullanıcının revizyon talebini uygula ve TAM güncellenmiş TravelPlan JSON'unu döndür.

=== MEVCUT PLAN ===
${JSON.stringify(body.plan, null, 2).slice(0, 60000)}

=== KULLANICI REVİZYON TALEBİ ===
${refinement}

Sadece geçerli JSON döndür.`;

    const result = await generateObject(
      {
        system: PLAN_REFINER_PROMPT,
        user: userMessage,
        webSearch: false,
        maxTokens: 16000,
        timeoutMs: 120_000,
      },
      TravelPlanSchema,
    );

    const normalized = normalizePlan(result.data) as unknown as TravelPlan;
    normalized.id = body.plan.id;
    normalized.createdAt = body.plan.createdAt;
    if (!normalized.profile) normalized.profile = body.plan.profile;

    return Response.json({ plan: normalized });
  } catch (err) {
    return buildAiErrorResponse(err, "/api/refine-plan");
  }
}

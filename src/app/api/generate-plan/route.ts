import type { NextRequest } from "next/server";
import type { TravelerProfile } from "@/lib/types/traveler-profile";
import { synthesizePlan, type ResearchResults } from "@/lib/ai/plan-generator";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

interface RequestBody {
  profile: TravelerProfile;
  research: ResearchResults;
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.profile || !body?.research) {
    return Response.json(
      { error: "profile ve research gerekli" },
      { status: 400 },
    );
  }

  try {
    const plan = await synthesizePlan(body.profile, body.research);
    plan.id = crypto.randomUUID();
    plan.createdAt = new Date().toISOString();
    return Response.json({ plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return Response.json({ error: message }, { status: 500 });
  }
}

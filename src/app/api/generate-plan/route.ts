import type { NextRequest } from "next/server";
import type { TravelerProfile } from "@/lib/types/traveler-profile";
import {
  synthesizePlan,
  buildMinimalPlan,
  missingAgentSections,
  type ResearchResults,
} from "@/lib/ai/plan-generator";
import { logAi } from "@/lib/ai/provider";

export const runtime = "edge";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

interface RequestBody {
  profile: TravelerProfile;
  research: ResearchResults;
}

type PlanStatus = "complete" | "partial" | "failed";

export async function POST(req: NextRequest) {
  const traceId = crypto.randomUUID();

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return Response.json(
      { error: "Invalid JSON body", traceId },
      { status: 400 },
    );
  }

  if (!body?.profile || !body?.research) {
    return Response.json(
      { error: "profile ve research gerekli", traceId },
      { status: 400 },
    );
  }

  logAi({
    phase: "start",
    route: "/api/generate-plan",
    message: `traceId=${traceId}`,
  });

  try {
    // synthesizePlan is designed to never throw — still, catch defensively.
    const plan = await synthesizePlan(body.profile, body.research);
    plan.id = plan.id || crypto.randomUUID();
    plan.createdAt = plan.createdAt || new Date().toISOString();
    const missingSections = missingAgentSections(body.research);
    const isPartial =
      plan.partial === true ||
      missingSections.length > 0 ||
      !Array.isArray(plan.days) ||
      plan.days.length === 0;
    const status: PlanStatus = isPartial ? "partial" : "complete";

    logAi({
      phase: "success",
      route: "/api/generate-plan",
      message: `traceId=${traceId} status=${status} missing=${missingSections.join(",")} days=${Array.isArray(plan.days) ? plan.days.length : 0}`,
    });

    return Response.json({
      plan,
      partial: isPartial,
      status,
      traceId,
      ...(missingSections.length > 0 ? { missingSections } : {}),
      ...(isPartial
        ? {
            message:
              "Plan bazı bölümler için kısmi içerikle oluşturuldu. Eksik bölümleri tekrar deneyebilirsiniz.",
          }
        : {}),
    });
  } catch (err) {
    // Absolutely-last-resort fallback. Must still return a plan body at 200.
    console.error(
      `[voyari.api] /api/generate-plan unexpected throw traceId=${traceId}`,
      err instanceof Error ? err.message.slice(0, 240) : String(err),
    );
    logAi({
      phase: "exhausted",
      route: "/api/generate-plan",
      message: `traceId=${traceId} unexpected-throw`,
    });
    const plan = buildMinimalPlan(
      body.profile,
      body.research,
      missingAgentSections(body.research),
    );
    plan.id = plan.id || crypto.randomUUID();
    plan.createdAt = plan.createdAt || new Date().toISOString();
    return Response.json({
      plan,
      partial: true,
      status: "partial" as PlanStatus,
      traceId,
      message:
        "Plan iskeleti hazırlandı; bazı bölümler eksik. Tekrar deneyebilirsiniz.",
      missingSections: missingAgentSections(body.research),
    });
  }
}

/**
 * /api/plan/slice — unified enrichment dispatcher.
 *
 * Single route handling all non-core sections to keep the Cloudflare Pages
 * worker bundle under the 3 MiB free-tier limit (separate routes per section
 * multiplied bundle size by ~7).
 *
 * Accepts: { section: "hotels"|"restaurants"|"activities"|"logistics"|"budget"|"weather", profile, planId?, priorResults? }
 * Returns: { planId, section, data, partial }
 */
import { handleModuleRequest, type PlanSection } from "@/lib/ai/module-handler";

export const runtime = "edge";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const VALID: PlanSection[] = [
  "hotels",
  "restaurants",
  "activities",
  "logistics",
  "budget",
  "weather",
];

export async function POST(req: Request): Promise<Response> {
  // Peek the body once to extract section, then forward to handler with a
  // cloned request so handleModuleRequest can re-read it.
  let body: unknown;
  try {
    body = await req.clone().json();
  } catch {
    return Response.json(
      { error: "Geçersiz istek gövdesi" },
      { status: 400 },
    );
  }
  const section =
    typeof body === "object" &&
    body !== null &&
    typeof (body as { section?: unknown }).section === "string"
      ? ((body as { section: string }).section as PlanSection)
      : null;
  if (!section || !VALID.includes(section)) {
    return Response.json(
      { error: "Geçersiz bölüm: " + String(section) },
      { status: 400 },
    );
  }
  return handleModuleRequest(section, req);
}

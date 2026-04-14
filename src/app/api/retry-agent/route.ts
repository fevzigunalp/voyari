/**
 * POST /api/retry-agent
 *
 * Best-effort single-shot delayed retry for a single research agent.
 * Invoked from the client dashboard ~60-120s after research-complete when
 * an agent returned a partial stub. Does NOT regenerate the full plan.
 *
 * Body: { profile, agentId, research? }
 *   - research is optional and only consulted for dependent agents (budget).
 *
 * Response: { status: "done" | "partial", data, provider?, errorCode? }
 */
import type { NextRequest } from "next/server";
import type { TravelerProfile } from "@/lib/types/traveler-profile";
import type { ResearchAgentId } from "@/lib/types/research";
import { getAgent } from "@/lib/ai/research-agents";
import { runAgentSafely } from "@/lib/ai/plan-generator";
import { logAi } from "@/lib/ai/provider";

export const runtime = "edge";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

interface RequestBody {
  profile: TravelerProfile;
  agentId: ResearchAgentId;
  research?: Partial<Record<ResearchAgentId, unknown>>;
}

const VALID_IDS: ReadonlySet<ResearchAgentId> = new Set<ResearchAgentId>([
  "route",
  "accommodation",
  "restaurant",
  "activity",
  "budget",
  "logistics",
  "weather",
]);

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { profile, agentId, research } = body ?? {};
  if (!profile || typeof profile !== "object") {
    return json({ error: "Missing profile" }, 400);
  }
  if (!agentId || !VALID_IDS.has(agentId)) {
    return json({ error: "Missing or invalid agentId" }, 400);
  }

  let agent;
  try {
    agent = getAgent(agentId);
  } catch {
    return json({ error: "Unknown agent" }, 400);
  }

  logAi({
    phase: "start",
    message: `agent=${agentId} event=delayed_retry_started`,
  });

  const input = agent.dependsOnOthers
    ? agent.inputBuilder(profile, research ?? {})
    : agent.inputBuilder(profile);

  const outcome = await runAgentSafely(agent, input);

  if (outcome.partial) {
    return json({
      status: "partial",
      data: outcome.data,
      errorCode: outcome.errorCode,
    });
  }

  return json({
    status: "done",
    data: outcome.data,
    provider: outcome.provider,
  });
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

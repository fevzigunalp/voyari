import { handleModuleRequest } from "@/lib/ai/module-handler";

export const runtime = "edge";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  return handleModuleRequest("logistics", req);
}

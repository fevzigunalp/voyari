export type ResearchAgentId =
  | "route"
  | "accommodation"
  | "restaurant"
  | "activity"
  | "budget"
  | "logistics"
  | "weather";

export type ResearchStatus = "idle" | "running" | "done" | "error";

export interface ResearchAgentState {
  id: ResearchAgentId;
  label: string;
  icon: string;
  status: ResearchStatus;
  snippets: string[];
  startedAt?: number;
  finishedAt?: number;
  error?: string;
}

export interface ResearchResult<T = unknown> {
  agent: ResearchAgentId;
  data: T;
  raw?: string;
}

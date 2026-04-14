import type { TravelerProfile } from "@/lib/types/traveler-profile";
import type { ResearchAgentId } from "@/lib/types/research";
import { ROUTE_ENGINEER_PROMPT } from "./prompts/route-engineer";
import { ACCOMMODATION_AGENT_PROMPT } from "./prompts/accommodation-agent";
import { RESTAURANT_AGENT_PROMPT } from "./prompts/restaurant-agent";
import { ACTIVITY_AGENT_PROMPT } from "./prompts/activity-agent";
import { BUDGET_AGENT_PROMPT } from "./prompts/budget-agent";
import { LOGISTICS_AGENT_PROMPT } from "./prompts/logistics-agent";
import { WEATHER_AGENT_PROMPT } from "./prompts/weather-agent";

export interface ResearchAgentDef {
  id: ResearchAgentId;
  label: string;
  icon: string;
  systemPrompt: string;
  useWebSearch: boolean;
  dependsOnOthers: boolean;
  /** Optional per-agent timeout override (ms). */
  timeoutMs?: number;
  inputBuilder: (
    profile: TravelerProfile,
    priorResults?: Partial<Record<ResearchAgentId, unknown>>,
  ) => string;
}

function profileSummary(profile: TravelerProfile): string {
  return JSON.stringify(
    {
      startDate: profile.startDate,
      endDate: profile.endDate,
      totalDays: profile.totalDays,
      departure: profile.departure,
      destination: profile.destination,
      travelers: profile.travelers,
      budget: profile.budget,
      transport: profile.transport,
      accommodation: profile.accommodation,
      preferences: profile.preferences,
      documents: profile.documents,
    },
    null,
    2,
  );
}

export const AGENTS: ResearchAgentDef[] = [
  {
    id: "route",
    label: "Rota Mühendisi",
    icon: "🗺️",
    systemPrompt: ROUTE_ENGINEER_PROMPT,
    useWebSearch: true,
    dependsOnOthers: false,
    inputBuilder: (profile) =>
      `Aşağıdaki TravelerProfile için rotayı hazırla.\n\nProfile:\n${profileSummary(profile)}\n\nSadece JSON döndür.`,
  },
  {
    id: "weather",
    label: "Hava Durumu",
    icon: "☀️",
    systemPrompt: WEATHER_AGENT_PROMPT,
    useWebSearch: true,
    dependsOnOthers: false,
    timeoutMs: 30_000,
    inputBuilder: (profile) =>
      `Aşağıdaki seyahat için günlük hava durumu tahmini çıkar.\n\nProfile:\n${profileSummary(profile)}\n\nSadece JSON döndür.`,
  },
  {
    id: "accommodation",
    label: "Konaklama",
    icon: "🏨",
    systemPrompt: ACCOMMODATION_AGENT_PROMPT,
    useWebSearch: true,
    dependsOnOthers: false,
    inputBuilder: (profile) =>
      `Aşağıdaki seyahat için konaklama önerileri hazırla. Her durak şehri için 1 primary + 2 alternative öneri.\n\nProfile:\n${profileSummary(profile)}\n\nSadece JSON döndür.`,
  },
  {
    id: "restaurant",
    label: "Restoran",
    icon: "🍽️",
    systemPrompt: RESTAURANT_AGENT_PROMPT,
    useWebSearch: true,
    dependsOnOthers: false,
    inputBuilder: (profile) =>
      `Aşağıdaki seyahat için restoran önerileri hazırla.\n\nProfile:\n${profileSummary(profile)}\n\nSadece JSON döndür.`,
  },
  {
    id: "activity",
    label: "Aktivite",
    icon: "🎯",
    systemPrompt: ACTIVITY_AGENT_PROMPT,
    useWebSearch: true,
    dependsOnOthers: false,
    inputBuilder: (profile) =>
      `Aşağıdaki seyahat için gün bazlı aktivite / deneyim önerileri hazırla.\n\nProfile:\n${profileSummary(profile)}\n\nSadece JSON döndür.`,
  },
  {
    id: "logistics",
    label: "Lojistik",
    icon: "📋",
    systemPrompt: LOGISTICS_AGENT_PROMPT,
    useWebSearch: true,
    dependsOnOthers: false,
    timeoutMs: 90_000,
    inputBuilder: (profile) =>
      `Aşağıdaki seyahat için lojistik (vize, sürüş kuralları, checklist, sigorta...) hazırla.\n\nProfile:\n${profileSummary(profile)}\n\nSadece JSON döndür.`,
  },
  {
    id: "budget",
    label: "Bütçe",
    icon: "💰",
    systemPrompt: BUDGET_AGENT_PROMPT,
    useWebSearch: true,
    dependsOnOthers: true,
    timeoutMs: 90_000,
    inputBuilder: (profile, priorResults) =>
      `Aşağıdaki profile ve diğer ajan çıktılarına göre bütçe analizini çıkar.\n\nProfile:\n${profileSummary(profile)}\n\nOtherAgents:\n${JSON.stringify(priorResults ?? {}, null, 2).slice(0, 14000)}\n\nSadece JSON döndür.`,
  },
];

export function getAgent(id: ResearchAgentId): ResearchAgentDef {
  const a = AGENTS.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown agent: ${id}`);
  return a;
}

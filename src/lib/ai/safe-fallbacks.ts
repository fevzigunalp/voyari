/**
 * Safe per-agent fallback structures.
 *
 * When an agent call fully fails (both providers exhausted), we return one of
 * these minimal-but-schema-compatible objects so downstream synthesis does not
 * crash. Each carries a `partial: true` marker + Turkish status message.
 */
import type { ResearchAgentId } from "@/lib/types/research";

export interface PartialMarker {
  partial: true;
  message: string;
}

const PARTIAL: PartialMarker = {
  partial: true,
  message: "Bu bölüm kısmi olarak üretildi",
};

export function safeFallbackFor(
  agentId: ResearchAgentId,
): Record<string, unknown> {
  switch (agentId) {
    case "route":
      return {
        waypoints: [],
        totalDistanceKm: 0,
        totalDrivingHours: 0,
        countries: [],
        ...PARTIAL,
      };
    case "accommodation":
      return { recommendations: [], ...PARTIAL };
    case "restaurant":
      return { meals: [], ...PARTIAL };
    case "activity":
      return { activities: [], ...PARTIAL };
    case "logistics":
      return {
        countryRules: [],
        emergencyContacts: [],
        packingList: [],
        vehicleChecklist: [],
        documentChecklist: [],
        reservationTimeline: [],
        ...PARTIAL,
      };
    case "budget":
      return {
        breakdown: [],
        dailyEstimates: [],
        totalEstimate: 0,
        perPersonEstimate: 0,
        currency: "EUR",
        savingTips: [],
        ...PARTIAL,
      };
    case "weather":
      return { days: [], ...PARTIAL };
    default: {
      const _exhaustive: never = agentId;
      void _exhaustive;
      return { ...PARTIAL };
    }
  }
}

export function isPartial(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { partial?: unknown }).partial === true
  );
}

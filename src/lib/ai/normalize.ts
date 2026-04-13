/**
 * Minimal field aliasing between providers.
 * Keep this small — only add aliases when a concrete production issue appears.
 */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Apply common aliases in-place and return the same object. */
export function normalizePlan<T>(input: T): T {
  if (!isRecord(input)) return input;

  const route = (input as Record<string, unknown>)["route"];
  if (isRecord(route)) {
    if (route["totalDistance"] != null && route["totalDistanceKm"] == null) {
      route["totalDistanceKm"] = route["totalDistance"];
    }
    if (route["totalDuration"] != null && route["totalDrivingHours"] == null) {
      route["totalDrivingHours"] = route["totalDuration"];
    }
  }

  const budget = (input as Record<string, unknown>)["budget"];
  if (isRecord(budget)) {
    if (budget["total"] != null && budget["totalEstimate"] == null) {
      budget["totalEstimate"] = budget["total"];
    }
    if (budget["perPerson"] != null && budget["perPersonEstimate"] == null) {
      budget["perPersonEstimate"] = budget["perPerson"];
    }
  }

  return input;
}

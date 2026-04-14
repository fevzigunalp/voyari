/**
 * Safe per-agent fallback structures.
 *
 * When an agent call fully fails (both providers exhausted), we return one of
 * these schema-compatible objects so downstream synthesis does not crash.
 *
 * Each fallback now carries EXPERIENTIAL Turkish content (Voyari concierge
 * tone) instead of empty arrays — the itinerary should never look empty even
 * in worst-case provider outages.
 */
import type { ResearchAgentId } from "@/lib/types/research";
import type { TravelerProfile } from "@/lib/types/traveler-profile";
import {
  currencyOf,
  destinationCountry,
  experientialBudget,
  experientialCountryInfo,
  experientialEmergencyContacts,
  experientialCountryRule,
  experientialDocChecklist,
  experientialHotel,
  experientialMeal,
  experientialPackingList,
  experientialReservationTimeline,
  experientialVehicleChecklist,
  experientialWeatherTips,
  totalEstimateFor,
} from "./experiential-content";

export interface PartialMarker {
  partial: true;
  message: string;
}

export function safeFallbackFor(
  agentId: ResearchAgentId,
  profile?: TravelerProfile,
): Record<string, unknown> {
  switch (agentId) {
    case "route":
      return {
        waypoints: [],
        totalDistanceKm: 0,
        totalDrivingHours: 0,
        countries: [experientialCountryInfo(profile)],
        partial: true,
        message:
          "Rota detayları yeni denemede güncellenecek — bu sırada ana duraklar bağlam üzerinden işaretlendi.",
      };
    case "accommodation":
      return {
        recommendations: [experientialHotel(profile)],
        partial: true,
        message: "Konaklama önerileri genel rehberlikle sunuldu.",
      };
    case "restaurant":
      return {
        meals: [
          experientialMeal("breakfast", profile),
          experientialMeal("lunch", profile),
          experientialMeal("dinner", profile),
        ],
        partial: true,
        message:
          "Spesifik restoran önerileri hazırlanıyor — bu sırada deneyim odaklı yönlendirme sunuldu.",
      };
    case "activity":
      return {
        activities: [
          {
            title: "Tarihi merkez keşfi",
            description:
              "Eski sokaklarda yürüyüş, meydanlarda kahve molası ve yerel pazar ziyareti.",
            duration: "2-3 saat",
            bookingRequired: false,
            cost: 0,
          },
          {
            title: "Sahil ya da doğa yürüyüşü",
            description:
              "Manzaralı bir rota boyunca yavaş tempoda keşif — fotoğraf ve dinlenme molaları.",
            duration: "1-2 saat",
            bookingRequired: false,
            cost: 0,
          },
        ],
        partial: true,
        message: "Aktivite önerileri deneyim odaklı genel rehberlik olarak sunuldu.",
      };
    case "logistics":
      return {
        countryRules: [experientialCountryRule(profile)],
        emergencyContacts: experientialEmergencyContacts(profile),
        packingList: experientialPackingList(),
        vehicleChecklist: experientialVehicleChecklist(),
        documentChecklist: experientialDocChecklist(),
        reservationTimeline: experientialReservationTimeline(),
        partial: true,
        message: "Lojistik bilgiler genel rehberlik olarak hazırlandı.",
      };
    case "budget": {
      const b = experientialBudget(profile);
      return {
        breakdown: b.breakdown,
        dailyEstimates: b.dailyEstimates,
        totalEstimate: b.totalEstimate,
        perPersonEstimate: b.perPersonEstimate,
        currency: b.currency,
        savingTips: b.savingTips,
        partial: true,
        message: "Bütçe tahminleri profil bütçe seviyesine göre hesaplandı.",
      };
    }
    case "weather":
      return {
        days: [],
        tips: experientialWeatherTips(),
        partial: true,
        message:
          "Hava verileri yeni denemede güncellenecek — bu sırada mevsimsel öneriler sunuldu.",
      };
    default: {
      const _exhaustive: never = agentId;
      void _exhaustive;
      return {
        partial: true,
        message: "Bu bölüm kısmi olarak üretildi.",
        // Reference variables to satisfy noUnusedLocals across module surface.
        _ctx: {
          country: destinationCountry(profile),
          currency: currencyOf(profile),
          totalEstimate: totalEstimateFor(profile),
        },
      };
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

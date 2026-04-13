import type { TransportType } from "@/lib/types/traveler-profile";

export interface TransportRule {
  type: TransportType;
  label: string;
  icon: string;
  tagline: string;
  maxDailyKm?: number;
  supportsVehicleInfo: boolean;
  supportsRestStops: boolean;
  requiresFitness: boolean;
}

export const TRANSPORT_RULES: Record<TransportType, TransportRule> = {
  plane: {
    type: "plane",
    label: "Uçak",
    icon: "✈️",
    tagline: "Hızlı ve konforlu",
    supportsVehicleInfo: false,
    supportsRestStops: false,
    requiresFitness: false,
  },
  car: {
    type: "car",
    label: "Araç",
    icon: "🚗",
    tagline: "Özgür road trip",
    maxDailyKm: 500,
    supportsVehicleInfo: true,
    supportsRestStops: true,
    requiresFitness: false,
  },
  caravan: {
    type: "caravan",
    label: "Karavan",
    icon: "🚐",
    tagline: "Evin hep yanında",
    maxDailyKm: 400,
    supportsVehicleInfo: true,
    supportsRestStops: true,
    requiresFitness: false,
  },
  gulet: {
    type: "gulet",
    label: "Gulet / Yat",
    icon: "⛵",
    tagline: "Özel deniz turu",
    supportsVehicleInfo: false,
    supportsRestStops: false,
    requiresFitness: false,
  },
  train: {
    type: "train",
    label: "Tren",
    icon: "🚂",
    tagline: "Manzaralı yolculuk",
    supportsVehicleInfo: false,
    supportsRestStops: false,
    requiresFitness: false,
  },
  cruise: {
    type: "cruise",
    label: "Cruise",
    icon: "🚢",
    tagline: "Yüzen otel",
    supportsVehicleInfo: false,
    supportsRestStops: false,
    requiresFitness: false,
  },
  bicycle: {
    type: "bicycle",
    label: "Bisiklet",
    icon: "🚴",
    tagline: "Macera dolu pedal",
    maxDailyKm: 90,
    supportsVehicleInfo: false,
    supportsRestStops: true,
    requiresFitness: true,
  },
  trekking: {
    type: "trekking",
    label: "Trekking",
    icon: "🥾",
    tagline: "Yürüyerek keşif",
    maxDailyKm: 25,
    supportsVehicleInfo: false,
    supportsRestStops: true,
    requiresFitness: true,
  },
  mixed: {
    type: "mixed",
    label: "Kombine",
    icon: "🔀",
    tagline: "Karışık ulaşım",
    supportsVehicleInfo: false,
    supportsRestStops: true,
    requiresFitness: false,
  },
};

export const TRANSPORT_LIST = Object.values(TRANSPORT_RULES);

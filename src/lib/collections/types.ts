import type {
  TransportType,
  TravelProfileType,
} from "@/lib/types/traveler-profile";

export interface Collection {
  slug: string;
  title: string;
  subtitle: string;
  vibe: string;
  heroGradient: string;
  icon: string;
  highlights: string[];
  sampleDays: number;
  sampleTransport: TransportType;
  sampleProfileType: TravelProfileType;
  seedAnswers: Partial<Record<string, unknown>>;
}

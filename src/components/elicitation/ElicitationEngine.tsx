"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { useElicitationStore } from "@/lib/store/elicitation-store";
import { useTravelStore } from "@/lib/store/travel-store";
import type { QuestionId } from "@/lib/types/questions";
import { QUESTION_META } from "@/lib/constants/question-flow";
import type {
  AccommodationType,
  TravelerProfile,
} from "@/lib/types/traveler-profile";
import { buildQuestionFlow } from "./AdaptiveLogic";
import { determineProfileType } from "./ProfileBuilder";
import { QuestionCard } from "./QuestionCard";
import { DatePicker } from "./questions/DatePicker";
import { TravelerSelector } from "./questions/TravelerSelector";
import { BudgetSlider } from "./questions/BudgetSlider";
import { TransportPicker } from "./questions/TransportPicker";
import { AccommodationPicker } from "./questions/AccommodationPicker";
import { InterestCloud } from "./questions/InterestCloud";
import { DestinationInput } from "./questions/DestinationInput";
import { DepartureInput } from "./questions/DepartureInput";
import { PaceSelector } from "./questions/PaceSelector";
import { FoodPreference } from "./questions/FoodPreference";
import { VehicleInfo } from "./questions/VehicleInfo";
import { VisaChecker } from "./questions/VisaChecker";
import { SpecialRequests } from "./questions/SpecialRequests";
import {
  makeBoolChoice,
  makeMultiChip,
  makeSingleChip,
} from "./questions/ChipQuestion";
import type {
  AccommodationValue,
  BudgetValue,
  DateRangeValue,
  DepartureValue,
  DestinationValue,
  FoodValue,
  PaceValue,
  TransportValue,
  TravelersValue,
  VehicleValue,
  VisaValue,
} from "./questions/types";

const TransitStopsQ = makeBoolChoice(
  "Evet, ara ülkelerde durmak isterim",
  "Hayır, doğrudan ulaşalım",
);
const FitnessQ = makeSingleChip([
  { id: "low", label: "Düşük" },
  { id: "moderate", label: "Orta" },
  { id: "high", label: "Yüksek" },
  { id: "athletic", label: "Atletik" },
]);
const BikeTypeQ = makeSingleChip([
  { id: "road", label: "Yol" },
  { id: "mtb", label: "Dağ" },
  { id: "ebike", label: "E-Bike" },
  { id: "gravel", label: "Gravel" },
]);
const AltitudeQ = makeSingleChip([
  { id: "comfortable", label: "Rahatım" },
  { id: "moderate", label: "2500m'ye kadar" },
  { id: "sensitive", label: "Hassasım" },
]);
const CampingQ = makeMultiChip([
  { id: "campsite", label: "Karavan parkı" },
  { id: "wild", label: "Doğa kampı" },
  { id: "mixed", label: "Karma" },
  { id: "with_facilities", label: "Tam donanımlı" },
]);
const GuletQ = makeSingleChip([
  { id: "private", label: "Tüm tekne özel" },
  { id: "shared", label: "Paylaşımlı kabin" },
  { id: "luxury", label: "Premium yat" },
]);
const WaterSportsQ = makeMultiChip([
  { id: "diving", label: "Dalış" },
  { id: "snorkel", label: "Şnorkel" },
  { id: "wakeboard", label: "Wakeboard" },
  { id: "jetski", label: "Jet Ski" },
  { id: "sup", label: "SUP" },
  { id: "kayak", label: "Kayak" },
]);
const CruiseQ = makeSingleChip([
  { id: "interior", label: "İç kabin" },
  { id: "ocean", label: "Okyanus manzaralı" },
  { id: "balcony", label: "Balkonlu" },
  { id: "suite", label: "Suit" },
]);
const ChildPriorityQ = makeMultiChip([
  { id: "pool", label: "Havuz" },
  { id: "kids_club", label: "Mini kulüp" },
  { id: "theme_park", label: "Tema park" },
  { id: "beach_safe", label: "Güvenli plaj" },
  { id: "early_dinner", label: "Erken akşam yemeği" },
]);
const AdventureQ = makeMultiChip([
  { id: "trekking", label: "Trekking" },
  { id: "diving", label: "Dalış" },
  { id: "safari", label: "Safari" },
  { id: "rafting", label: "Rafting" },
  { id: "paragliding", label: "Yamaç paraşütü" },
  { id: "climbing", label: "Tırmanış" },
]);
const WellnessQ = makeMultiChip([
  { id: "spa", label: "Spa" },
  { id: "yoga", label: "Yoga" },
  { id: "detox", label: "Detoks" },
  { id: "thermal", label: "Termal" },
  { id: "meditation", label: "Meditasyon" },
]);
const CulturalQ = makeMultiChip([
  { id: "ancient", label: "Antik dönem" },
  { id: "modern_art", label: "Modern sanat" },
  { id: "architecture", label: "Mimari" },
  { id: "religious", label: "Dini miras" },
  { id: "literature", label: "Edebiyat" },
]);
const CuisineQ = makeMultiChip([
  { id: "italian", label: "İtalyan" },
  { id: "french", label: "Fransız" },
  { id: "japanese", label: "Japon" },
  { id: "thai", label: "Thai" },
  { id: "mexican", label: "Meksika" },
  { id: "middle_eastern", label: "Orta Doğu" },
  { id: "local", label: "Tamamen yerel" },
]);
const CookingClassesQ = makeBoolChoice("Evet ilgilenirim", "Hayır gerek yok");
const PhotoQ = makeMultiChip([
  { id: "landscape", label: "Manzara" },
  { id: "portrait", label: "Portre" },
  { id: "street", label: "Sokak" },
  { id: "astro", label: "Astro" },
  { id: "drone", label: "Drone" },
]);
const GoldenHourQ = makeBoolChoice("Evet, gün doğumu/batımına göre planla", "Hayır gerek yok");

interface QuestionRendererProps {
  id: QuestionId;
  value: unknown;
  onChange: (v: unknown) => void;
}

function QuestionRenderer({ id, value, onChange }: QuestionRendererProps) {
  switch (id) {
    case "destination":
      return (
        <DestinationInput
          value={value as DestinationValue | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "departure":
      return (
        <DepartureInput
          value={value as DepartureValue | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "dates":
      return (
        <DatePicker
          value={value as DateRangeValue | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "travelers":
      return (
        <TravelerSelector
          value={value as TravelersValue | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "transport":
      return (
        <TransportPicker
          value={value as TransportValue | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "budget":
      return (
        <BudgetSlider
          value={value as BudgetValue | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "vehicleInfo":
      return (
        <VehicleInfo
          value={value as VehicleValue | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "transitStops":
      return (
        <TransitStopsQ
          value={value as boolean | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "campingPreferences":
      return (
        <CampingQ
          value={value as string[] | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "guletPreferences":
      return (
        <GuletQ
          value={value as string | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "waterSports":
      return (
        <WaterSportsQ
          value={value as string[] | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "cruisePreferences":
      return (
        <CruiseQ
          value={value as string | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "fitnessLevel":
      return (
        <FitnessQ
          value={value as string | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "bikeType":
      return (
        <BikeTypeQ
          value={value as string | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "altitudeComfort":
      return (
        <AltitudeQ
          value={value as string | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "accommodation":
      return (
        <AccommodationPicker
          value={value as AccommodationValue | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "interests":
      return (
        <InterestCloud
          value={value as string[] | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "pace":
      return (
        <PaceSelector
          value={value as PaceValue | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "food":
      return (
        <FoodPreference
          value={value as FoodValue | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "childFriendlyPriorities":
      return (
        <ChildPriorityQ
          value={value as string[] | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "adventureTypes":
      return (
        <AdventureQ
          value={value as string[] | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "wellnessTypes":
      return (
        <WellnessQ
          value={value as string[] | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "culturalInterests":
      return (
        <CulturalQ
          value={value as string[] | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "cuisineTypes":
      return (
        <CuisineQ
          value={value as string[] | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "cookingClasses":
      return (
        <CookingClassesQ
          value={value as boolean | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "photoInterests":
      return (
        <PhotoQ
          value={value as string[] | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "goldenHourPriority":
      return (
        <GoldenHourQ
          value={value as boolean | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "specialRequests":
      return (
        <SpecialRequests
          value={value as string | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "visa" as QuestionId:
      return (
        <VisaChecker
          value={value as VisaValue | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    default:
      return <div className="text-sm text-text-muted">Bu soru henüz hazır değil.</div>;
  }
}

function isAnswered(id: QuestionId, value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "boolean") return true;
  if (typeof value === "object") {
    const v = value as Record<string, unknown>;
    if (id === "destination") {
      const dv = v as unknown as DestinationValue;
      return dv.flexible || (dv.query ?? "").trim().length > 0;
    }
    if (id === "departure") {
      const dv = v as unknown as DepartureValue;
      return (dv.query ?? "").trim().length > 0;
    }
    return Object.keys(v).length > 0;
  }
  return false;
}

function buildProfile(
  answers: Record<string, unknown>,
): Partial<TravelerProfile> {
  const dest = answers.destination as DestinationValue | undefined;
  const dep = answers.departure as DepartureValue | undefined;
  const dates = answers.dates as DateRangeValue | undefined;
  const travelers = answers.travelers as TravelersValue | undefined;
  const budget = answers.budget as BudgetValue | undefined;
  const transport = answers.transport as TransportValue | undefined;
  const vehicle = answers.vehicleInfo as VehicleValue | undefined;
  const accommodation = answers.accommodation as AccommodationValue | undefined;
  const interests = (answers.interests as string[] | undefined) ?? [];
  const pace = answers.pace as PaceValue | undefined;
  const food = answers.food as FoodValue | undefined;
  const transitStops = answers.transitStops as boolean | undefined;
  const visa = answers.visa as VisaValue | undefined;
  const profileType = determineProfileType(answers);

  const profile: Partial<TravelerProfile> = {
    startDate: dates?.startDate ?? "",
    endDate: dates?.endDate ?? "",
    totalDays: dates?.totalDays ?? 0,
    departure: {
      city: dep?.query ?? "",
      country: dep?.countryCode ?? dep?.query ?? "",
      coordinates: [0, 0],
    },
    destination: {
      city: dest?.flexible ? undefined : dest?.query,
      country: dest?.countryCode ?? dest?.query ?? "",
      flexible: dest?.flexible ?? false,
    },
    travelers: travelers ?? {
      adults: 2,
      children: 0,
      childAges: [],
      type: "couple",
    },
    budget: budget ?? { level: "moderate", currency: "EUR" },
    transport: {
      type: transport?.type ?? "plane",
      vehicle: vehicle,
    },
    accommodation: {
      type: (accommodation?.type ?? "4star") as AccommodationType,
      priorities: accommodation?.priorities ?? [],
    },
    preferences: {
      profileType,
      interests,
      pace: pace?.pace ?? "balanced",
      food: {
        style: food?.style ?? "mixed",
        restrictions: food?.restrictions ?? [],
      },
      transitStops: transitStops ?? false,
    },
    documents: {
      nationality: visa?.nationality ?? "TR",
      passportValid: visa?.passportValid ?? true,
    },
  };

  return profile;
}

interface ElicitationEngineProps {
  onComplete?: () => void;
}

export function ElicitationEngine({ onComplete }: ElicitationEngineProps = {}) {
  const router = useRouter();
  const {
    answers,
    setAnswer,
    currentIndex,
    goNext,
    goBack,
    setHistory,
  } = useElicitationStore();
  const setProfile = useTravelStore((s) => s.setProfile);

  const flow = useMemo(() => buildQuestionFlow(answers), [answers]);

  // Keep store history in sync (but only when it actually changes)
  const flowKey = flow.join("|");
  useEffect(() => {
    setHistory(flow);
  }, [flowKey, flow, setHistory]);

  const safeIndex = Math.min(currentIndex, flow.length - 1);
  const currentId = flow[safeIndex];
  const meta = QUESTION_META[currentId];
  const currentValue = answers[currentId];
  const answered = isAnswered(currentId, currentValue);
  const isLast = safeIndex >= flow.length - 1;

  const [submitting, setSubmitting] = useState(false);

  const handleNext = () => {
    if (isLast) {
      setSubmitting(true);
      const profile = buildProfile(answers);
      setProfile(profile);
      if (onComplete) {
        setTimeout(() => onComplete(), 400);
      } else {
        setTimeout(() => router.push("/result/preview"), 600);
      }
      return;
    }
    goNext();
  };

  const handleBack = () => {
    if (safeIndex > 0) goBack();
  };

  return (
    <div className="relative min-h-[100svh] flex flex-col">
      <div className="sticky top-16 z-30 bg-[rgba(10,14,26,0.7)] backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-3xl mx-auto px-6 py-3">
          <ProgressBar
            current={safeIndex + 1}
            total={flow.length}
            label="Yolculuk DNA"
          />
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-10 sm:py-16">
        <div className="w-full">
          <AnimatePresence mode="wait">
            <QuestionCard
              key={currentId}
              title={meta.title}
              subtitle={meta.subtitle}
              required={meta.required}
              step={safeIndex + 1}
              total={flow.length}
              footer={
                <div className="flex items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={safeIndex === 0 || submitting}
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                  >
                    Geri
                  </Button>
                  <div className="flex items-center gap-2">
                    {!meta.required && !answered && !isLast && (
                      <Button variant="subtle" onClick={goNext}>
                        Atla
                      </Button>
                    )}
                    <Button
                      onClick={handleNext}
                      disabled={(meta.required && !answered) || submitting}
                      loading={submitting}
                      rightIcon={
                        isLast ? (
                          <Sparkles className="h-4 w-4" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )
                      }
                    >
                      {isLast ? "Planımı Hazırla" : "Devam"}
                    </Button>
                  </div>
                </div>
              }
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.05 }}
              >
                <QuestionRenderer
                  id={currentId}
                  value={currentValue}
                  onChange={(v) => setAnswer(currentId, v)}
                />
              </motion.div>
              {answered && (
                <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-emerald-300/80 font-mono uppercase tracking-[0.18em]">
                  <Check className="h-3 w-3" /> Cevap kaydedildi
                </div>
              )}
            </QuestionCard>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

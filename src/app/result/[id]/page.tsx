"use client";

export const runtime = "edge";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Map as MapIcon, CalendarDays, Wallet, ListChecks, CloudSun } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  PlanOverview,
  DayTimeline,
  DayCard,
  BudgetDashboard,
  CountryInfoCard,
  ChecklistPanel,
  WeatherStrip,
  AlternativePlan,
  ExportButton,
} from "@/components/plan";
import { usePlanStore } from "@/lib/store/plan-store";
import { cn } from "@/lib/utils/cn";

const RouteMap = dynamic(() => import("@/components/plan/RouteMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] rounded-xl border border-[var(--border-subtle)] bg-[rgba(17,24,39,0.5)] animate-pulse" />
  ),
});
const DayMap = dynamic(() => import("@/components/plan/DayMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] rounded-xl border border-[var(--border-subtle)] bg-[rgba(17,24,39,0.5)] animate-pulse" />
  ),
});

type Tab = "days" | "map" | "budget" | "logistics" | "weather";

const TABS: Array<{ key: Tab; label: string; icon: typeof MapIcon }> = [
  { key: "days", label: "Gün Gün", icon: CalendarDays },
  { key: "map", label: "Harita", icon: MapIcon },
  { key: "budget", label: "Bütçe", icon: Wallet },
  { key: "logistics", label: "Lojistik", icon: ListChecks },
  { key: "weather", label: "Hava", icon: CloudSun },
];

export default function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const plan = usePlanStore((s) => s.plans[id]);
  const [tab, setTab] = useState<Tab>("days");
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    if (!plan) {
      const t = setTimeout(() => router.replace("/plan"), 50);
      return () => clearTimeout(t);
    }
  }, [plan, router]);

  const days = useMemo(() => plan?.days ?? [], [plan]);
  const current = days[activeDay];

  if (!plan) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="text-center">
            <div className="font-display text-2xl text-text-primary">
              Plan bulunamadı
            </div>
            <p className="text-sm text-text-secondary mt-2">
              /plan sayfasına yönlendiriliyorsunuz...
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const currency = plan.budget?.currency ?? "EUR";

  return (
    <>
      <Header />
      <main className="flex-1">
        <section
          id="voyari-plan-export-root"
          className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12"
        >
          <div className="flex justify-end mb-4">
            <ExportButton plan={plan} />
          </div>

          <PlanOverview plan={plan} />

          <div className="mt-6 sticky top-0 z-20 -mx-4 md:-mx-6 px-4 md:px-6 py-3 bg-[rgba(10,14,26,0.85)] backdrop-blur-md border-b border-[var(--border-subtle)]">
            <div className="flex gap-1 overflow-x-auto">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-mono uppercase tracking-wider transition-colors",
                      active
                        ? "bg-[linear-gradient(135deg,#E8C97A_0%,#D4A853_50%,#F59E0B_100%)] text-[#0A0E1A] shadow-[0_8px_24px_-8px_rgba(212,168,83,0.5)]"
                        : "text-text-muted hover:text-text-primary hover:bg-white/5",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {tab === "days" && (
                  <div className="grid gap-6 md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr]">
                    <DayTimeline
                      days={days}
                      activeIndex={activeDay}
                      onSelect={setActiveDay}
                    />
                    <div className="flex flex-col gap-5">
                      {current ? (
                        <>
                          <DayCard day={current} currency={currency} />
                          <DayMap day={current} />
                        </>
                      ) : (
                        <div className="text-sm text-text-muted">
                          Gün verisi yok.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {tab === "map" && (
                  <div className="flex flex-col gap-5">
                    <RouteMap waypoints={plan.route?.waypoints ?? []} height={560} />
                    <AlternativePlan
                      alternatives={plan.route?.alternativeRoutes}
                    />
                  </div>
                )}

                {tab === "budget" && <BudgetDashboard plan={plan} />}

                {tab === "logistics" && (
                  <div className="grid gap-5 lg:grid-cols-2">
                    <div className="flex flex-col gap-4">
                      {(plan.route?.countries ?? []).map((c) => {
                        const rule = (plan.logistics?.countryRules ?? []).find(
                          (r) => r.country === c.name || r.country === c.code,
                        );
                        const emergency = (
                          plan.logistics?.emergencyContacts ?? []
                        )
                          .filter(
                            (e) =>
                              e.country === c.name || e.country === c.code,
                          )
                          .map((e) => ({ label: e.label, number: e.number }));
                        return (
                          <CountryInfoCard
                            key={c.code || c.name}
                            country={c}
                            rule={rule}
                            emergency={emergency}
                          />
                        );
                      })}
                    </div>
                    <ChecklistPanel plan={plan} />
                  </div>
                )}

                {tab === "weather" && (
                  <div className="flex flex-col gap-5">
                    <WeatherStrip weather={plan.weather ?? []} />
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {(plan.weather ?? []).map((w, i) => (
                        <div
                          key={`${w.date}-${i}`}
                          className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(17,24,39,0.5)] p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                                {w.date}
                              </div>
                              <div className="font-display text-lg">
                                {w.city}
                              </div>
                            </div>
                            <div className="text-3xl">{w.icon || "🌤️"}</div>
                          </div>
                          <div className="mt-2 text-sm text-text-secondary">
                            {w.summary}
                          </div>
                          <div className="mt-2 font-mono text-sm text-[#E8C97A]">
                            {w.tempMin}° / {w.tempMax}° · Yağış %
                            {w.precipitationChance}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

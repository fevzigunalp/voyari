"use client";

export const runtime = "edge";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  Map as MapIcon,
  Wallet,
  ListChecks,
  CloudSun,
  ChevronDown,
  Settings2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  PlanOverview,
  PlanNarrative,
  DayTimeline,
  DayCard,
  BudgetDashboard,
  CountryInfoCard,
  ChecklistPanel,
  WeatherStrip,
  AlternativePlan,
  ExportButton,
  RefineChat,
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

type OpTab = "map" | "budget" | "logistics" | "weather";

const OP_TABS: Array<{ key: OpTab; label: string; icon: typeof MapIcon }> = [
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
  const [opTab, setOpTab] = useState<OpTab>("map");
  const [activeDay, setActiveDay] = useState(0);
  const [opOpen, setOpOpen] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOpOpen(window.matchMedia("(min-width: 768px)").matches);
    }
  }, []);

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
  const narrative = plan.narrative ?? null;

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

          {/* LAYER 1 — Emotional */}
          {narrative ? (
            <PlanNarrative narrative={narrative} />
          ) : (
            <PlanOverview plan={plan} />
          )}

          {/* Compact overview strip when narrative exists */}
          {narrative && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
              className="mt-5"
            >
              <PlanOverview plan={plan} />
            </motion.div>
          )}

          {/* LAYER 2 — Structured (day by day) */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-10"
          >
            <div className="flex items-end justify-between mb-5">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#E8C97A]">
                  02 · Yapı
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-text-primary mt-1">
                  Gün Gün Yolculuğunuz
                </h2>
              </div>
            </div>

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
          </motion.section>

          {/* LAYER 3 — Operational (collapsible) */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="mt-12"
          >
            <button
              type="button"
              onClick={() => setOpOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[rgba(17,24,39,0.5)] px-5 py-4 hover:border-[rgba(212,168,83,0.35)] transition-colors"
              aria-expanded={opOpen}
            >
              <div className="flex items-center gap-3">
                <Settings2 className="h-4 w-4 text-[#E8C97A]" />
                <div className="text-left">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#E8C97A]">
                    03 · Operasyon
                  </div>
                  <div className="font-display text-xl text-text-primary mt-0.5">
                    Operasyon Katmanı
                  </div>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-text-muted transition-transform",
                  opOpen && "rotate-180",
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {opOpen && (
                <motion.div
                  key="op-body"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-5">
                    <div className="sticky top-0 z-20 -mx-4 md:-mx-6 px-4 md:px-6 py-3 bg-[rgba(10,14,26,0.85)] backdrop-blur-md border-b border-[var(--border-subtle)]">
                      <div className="flex gap-1 overflow-x-auto">
                        {OP_TABS.map((t) => {
                          const Icon = t.icon;
                          const active = opTab === t.key;
                          return (
                            <button
                              key={t.key}
                              onClick={() => setOpTab(t.key)}
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
                          key={opTab}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25 }}
                        >
                          {opTab === "map" && (
                            <div className="flex flex-col gap-5">
                              <RouteMap
                                waypoints={plan.route?.waypoints ?? []}
                                height={560}
                              />
                              <AlternativePlan
                                alternatives={plan.route?.alternativeRoutes}
                              />
                            </div>
                          )}

                          {opTab === "budget" && <BudgetDashboard plan={plan} />}

                          {opTab === "logistics" && (
                            <div className="grid gap-5 lg:grid-cols-2">
                              <div className="flex flex-col gap-4">
                                {(plan.route?.countries ?? []).map((c) => {
                                  const rule = (
                                    plan.logistics?.countryRules ?? []
                                  ).find(
                                    (r) =>
                                      r.country === c.name ||
                                      r.country === c.code,
                                  );
                                  const emergency = (
                                    plan.logistics?.emergencyContacts ?? []
                                  )
                                    .filter(
                                      (e) =>
                                        e.country === c.name ||
                                        e.country === c.code,
                                    )
                                    .map((e) => ({
                                      label: e.label,
                                      number: e.number,
                                    }));
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

                          {opTab === "weather" && (
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
                                      <div className="text-3xl">
                                        {w.icon || "🌤️"}
                                      </div>
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        </section>
      </main>
      <Footer />
      <RefineChat plan={plan} />
    </>
  );
}

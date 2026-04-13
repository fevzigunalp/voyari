"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import type { TravelPlan } from "@/lib/types/plan";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const COLORS = [
  "#D4A853",
  "#E8C97A",
  "#F59E0B",
  "#38BDF8",
  "#10B981",
  "#FB7185",
  "#A78BFA",
  "#F472B6",
];

export interface BudgetDashboardProps {
  plan: TravelPlan;
}

export function BudgetDashboard({ plan }: BudgetDashboardProps) {
  const [perPerson, setPerPerson] = useState(false);
  const currency = plan.budget?.currency ?? "EUR";
  const travelers = Math.max(
    1,
    (plan.profile?.travelers?.adults ?? 0) +
      (plan.profile?.travelers?.children ?? 0),
  );
  const divisor = perPerson ? travelers : 1;

  const breakdown = useMemo(() => {
    return (plan.budget?.breakdown ?? []).map((b) => ({
      name: b.category,
      value: Math.round((b.amount ?? 0) / divisor),
      percentage: b.percentage,
    }));
  }, [plan, divisor]);

  const daily = useMemo(() => {
    return (plan.budget?.dailyEstimates ?? []).map((d) => ({
      day: `G${d.dayNumber}`,
      amount: Math.round((d.amount ?? 0) / divisor),
    }));
  }, [plan, divisor]);

  const total = Math.round((plan.budget?.totalEstimate ?? 0) / divisor);
  const tips = plan.budget?.savingTips ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-2xl text-gradient-gold">Bütçe</h2>
          <p className="text-sm text-text-secondary">
            {perPerson ? "Kişi başı" : "Toplam grup"} · {currency}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={perPerson ? "outline" : "gold"}
            size="sm"
            onClick={() => setPerPerson(false)}
          >
            Toplam
          </Button>
          <Button
            variant={perPerson ? "gold" : "outline"}
            size="sm"
            onClick={() => setPerPerson(true)}
          >
            Kişi Başı
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card variant="default">
          <h3 className="font-display text-lg mb-3">Kategori Dağılımı</h3>
          {breakdown.length > 0 ? (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={55}
                    paddingAngle={2}
                  >
                    {breakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip
                    contentStyle={{
                      background: "#1A1F35",
                      border: "1px solid rgba(212,168,83,0.3)",
                      borderRadius: 8,
                      color: "#F1F5F9",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "#94A3B8", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-sm text-text-muted">Kategori verisi yok.</div>
          )}
        </Card>

        <Card variant="default">
          <h3 className="font-display text-lg mb-3">Günlük Harcama</h3>
          {daily.length > 0 ? (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={daily}>
                  <CartesianGrid stroke="rgba(148,163,184,0.1)" />
                  <XAxis
                    dataKey="day"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <RTooltip
                    contentStyle={{
                      background: "#1A1F35",
                      border: "1px solid rgba(212,168,83,0.3)",
                      borderRadius: 8,
                      color: "#F1F5F9",
                    }}
                  />
                  <Bar dataKey="amount" fill="#D4A853" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-sm text-text-muted">Günlük veri yok.</div>
          )}
        </Card>
      </div>

      <Card variant="glass">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-mono text-text-muted">
              {perPerson ? "Kişi Başı" : "Toplam"} Tahmini
            </div>
            <div className="font-display text-3xl text-[#E8C97A]">
              {total.toLocaleString("tr-TR")} {currency}
            </div>
          </div>
          <div className="text-sm text-text-secondary">
            {travelers} kişi · {plan.days?.length ?? 0} gün
          </div>
        </div>

        {breakdown.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-text-muted font-mono border-b border-[var(--border-subtle)]">
                  <th className="py-2">Kategori</th>
                  <th className="py-2 text-right">Tutar</th>
                  <th className="py-2 text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((b) => (
                  <tr
                    key={b.name}
                    className="border-b border-[var(--border-subtle)]"
                  >
                    <td className="py-2 text-text-primary">{b.name}</td>
                    <td className="py-2 text-right font-mono text-text-primary">
                      {b.value.toLocaleString("tr-TR")} {currency}
                    </td>
                    <td className="py-2 text-right font-mono text-text-muted">
                      {b.percentage ?? 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {tips.length > 0 && (
        <Card variant="default">
          <h3 className="font-display text-lg mb-3">Tasarruf İpuçları</h3>
          <ul className="text-sm text-text-secondary space-y-1.5 list-disc list-inside">
            {tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

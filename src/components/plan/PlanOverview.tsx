"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  Wallet,
  Route as RouteIcon,
  Car,
  Plane,
  Ship,
  Train,
  Bike,
  Mountain,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TravelPlan } from "@/lib/types/plan";
import type { TransportType } from "@/lib/types/traveler-profile";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const TRANSPORT_ICONS: Record<TransportType, LucideIcon> = {
  plane: Plane,
  car: Car,
  caravan: Car,
  gulet: Ship,
  cruise: Ship,
  train: Train,
  bicycle: Bike,
  trekking: Mountain,
  mixed: RouteIcon,
};

export interface PlanOverviewProps {
  plan: TravelPlan;
}

export function PlanOverview({ plan }: PlanOverviewProps) {
  const days = plan.days?.length ?? 0;
  const countries = plan.route?.countries ?? [];
  const totalKm = plan.route?.totalDistanceKm ?? 0;
  const totalHours = plan.route?.totalDrivingHours ?? 0;
  const total = plan.budget?.totalEstimate ?? 0;
  const perPerson = plan.budget?.perPersonEstimate ?? 0;
  const currency = plan.budget?.currency ?? "EUR";
  const travelers =
    (plan.profile?.travelers?.adults ?? 0) +
    (plan.profile?.travelers?.children ?? 0);
  const transport = plan.profile?.transport?.type ?? "mixed";
  const TransportIcon = TRANSPORT_ICONS[transport] ?? RouteIcon;

  const title =
    countries.length > 0
      ? `${countries.map((c) => c.name).join(" · ")}`
      : plan.profile?.destination?.city ||
        plan.profile?.destination?.country ||
        "Voyari Seyahati";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card variant="gold" className="overflow-hidden">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <Badge tone="gold" icon={<Sparkles className="h-3.5 w-3.5" />}>
              Seyahat Planı
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl tracking-tight mt-3 text-gradient-gold">
              {title}
            </h1>
            <p className="text-sm text-text-secondary mt-2">
              {plan.profile?.startDate || "—"} → {plan.profile?.endDate || "—"}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[rgba(212,168,83,0.3)] bg-[rgba(26,31,53,0.6)] px-4 py-2">
            <TransportIcon className="h-5 w-5 text-[#E8C97A]" />
            <span className="font-mono text-xs uppercase tracking-wider text-text-secondary">
              {transport}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <Stat icon={Calendar} label="Gün" value={`${days}`} />
          <Stat
            icon={MapPin}
            label="Ülke"
            value={`${countries.length || 1}`}
          />
          <Stat icon={RouteIcon} label="Km" value={totalKm.toLocaleString("tr-TR")} />
          <Stat icon={Car} label="Saat" value={`${Math.round(totalHours)}`} />
          <Stat icon={Users} label="Kişi" value={`${travelers || 1}`} />
          <Stat
            icon={Wallet}
            label={`Toplam (${currency})`}
            value={total ? total.toLocaleString("tr-TR") : "—"}
            sub={
              perPerson
                ? `${perPerson.toLocaleString("tr-TR")} / kişi`
                : undefined
            }
          />
        </div>
      </Card>
    </motion.div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(17,24,39,0.6)] p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-text-muted font-mono">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 font-display text-xl text-text-primary">{value}</div>
      {sub && <div className="text-[11px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  );
}

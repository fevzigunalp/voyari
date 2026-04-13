"use client";

import { Phone, Plug, Coins, Car, FileText } from "lucide-react";
import type { CountryInfo, CountryRule } from "@/lib/types/plan";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export interface CountryInfoCardProps {
  country: CountryInfo;
  rule?: CountryRule;
  emergency?: { label: string; number: string }[];
  visa?: string;
}

export function CountryInfoCard({
  country,
  rule,
  emergency,
  visa,
}: CountryInfoCardProps) {
  return (
    <Card variant="default">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="font-display text-xl text-text-primary">
            {country.name}
          </div>
          <div className="text-xs text-text-muted font-mono">
            {country.code}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(country.language ?? []).map((l) => (
            <Badge key={l} tone="neutral">
              {l}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Info icon={Coins} label="Para Birimi" value={country.currency} />
        <Info icon={Plug} label="Priz Tipi" value={country.plugType} />
        <Info
          icon={Phone}
          label="Acil"
          value={country.emergencyNumber}
        />
        {visa && <Info icon={FileText} label="Vize" value={visa} />}
      </div>

      {rule?.speedLimits && Object.keys(rule.speedLimits).length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-text-muted font-mono mb-2">
            <Car className="h-3 w-3" /> Hız Limitleri
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(rule.speedLimits).map(([k, v]) => (
              <Badge key={k} tone="neutral">
                {k}: {v}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {rule?.mandatoryEquipment && rule.mandatoryEquipment.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] uppercase tracking-wider text-text-muted font-mono mb-2">
            Zorunlu Ekipman
          </div>
          <div className="flex flex-wrap gap-1.5">
            {rule.mandatoryEquipment.map((e) => (
              <Badge key={e} tone="gold">
                {e}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {rule?.notes && rule.notes.length > 0 && (
        <ul className="mt-3 text-xs text-text-secondary list-disc list-inside space-y-1">
          {rule.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      )}

      {emergency && emergency.length > 0 && (
        <div className="mt-3 text-xs text-text-secondary">
          {emergency.map((e, i) => (
            <div key={i}>
              <span className="text-text-muted">{e.label}:</span>{" "}
              <span className="font-mono text-text-primary">{e.number}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Coins;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(17,24,39,0.4)] p-2.5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-text-muted font-mono">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-sm text-text-primary mt-0.5">{value}</div>
    </div>
  );
}

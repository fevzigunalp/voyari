"use client";

import { ExternalLink } from "lucide-react";
import type { TimelineItem } from "@/lib/types/plan";
import { Badge } from "@/components/ui/Badge";

export interface ActivityItemProps {
  item: TimelineItem;
}

export function ActivityItem({ item }: ActivityItemProps) {
  return (
    <div className="flex gap-3 rounded-xl border border-[var(--border-subtle)] bg-[rgba(17,24,39,0.4)] p-3">
      <div className="flex flex-col items-center gap-1 min-w-[60px]">
        <div className="font-mono text-xs text-[#E8C97A]">{item.time}</div>
        {item.endTime && (
          <div className="font-mono text-[10px] text-text-muted">
            {item.endTime}
          </div>
        )}
        <div className="text-2xl leading-none">{item.icon || "•"}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="font-display text-base text-text-primary">
            {item.title}
          </div>
          {typeof item.cost === "number" && item.cost > 0 && (
            <Badge tone="gold">
              {item.cost.toLocaleString("tr-TR")} {item.currency || ""}
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-text-secondary mt-1">{item.description}</p>
        )}
        {item.location && (
          <p className="text-xs text-text-muted mt-1">{item.location}</p>
        )}
        {item.bookingRequired && item.bookingUrl && (
          <a
            href={item.bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#E8C97A] hover:underline mt-2"
          >
            Rezervasyon <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

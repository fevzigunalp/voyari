"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ResearchAgentId,
  ResearchAgentState,
  ResearchStatus,
} from "@/lib/types/research";
import type { TravelerProfile } from "@/lib/types/traveler-profile";
import { useTravelStore, type ResearchBundle } from "@/lib/store/travel-store";
import { AgentCard } from "./AgentCard";
import { ResearchAnimation } from "./ResearchAnimation";

const AGENT_DEFS: Array<{
  id: ResearchAgentId;
  label: string;
  icon: string;
}> = [
  { id: "route", label: "Rota Mühendisi", icon: "🗺️" },
  { id: "weather", label: "Hava Durumu", icon: "☀️" },
  { id: "accommodation", label: "Konaklama", icon: "🏨" },
  { id: "restaurant", label: "Restoran", icon: "🍽️" },
  { id: "activity", label: "Aktivite", icon: "🎯" },
  { id: "logistics", label: "Lojistik", icon: "📋" },
  { id: "budget", label: "Bütçe", icon: "💰" },
];

interface AgentEvent {
  agent: ResearchAgentId;
  status: "pending" | "running" | "done" | "error";
  snippet?: string;
  error?: string;
  data?: unknown;
}

interface CompleteEvent {
  type: "research-complete";
  research: ResearchBundle;
}

interface ErrorEvent {
  type: "error";
  error: string;
}

type StreamEvent = AgentEvent | CompleteEvent | ErrorEvent;

function initialStates(): Record<ResearchAgentId, ResearchAgentState> {
  const out = {} as Record<ResearchAgentId, ResearchAgentState>;
  for (const a of AGENT_DEFS) {
    out[a.id] = {
      id: a.id,
      label: a.label,
      icon: a.icon,
      status: "idle",
      snippets: [],
    };
  }
  return out;
}

function mapStatus(s: AgentEvent["status"]): ResearchStatus {
  if (s === "pending") return "idle";
  if (s === "running") return "running";
  if (s === "done") return "done";
  return "error";
}

export interface ResearchDashboardProps {
  profile: TravelerProfile;
  onComplete: (research: ResearchBundle) => void;
  onError?: (err: string) => void;
}

export function ResearchDashboard({
  profile,
  onComplete,
  onError,
}: ResearchDashboardProps) {
  const [states, setStates] = useState<
    Record<ResearchAgentId, ResearchAgentState>
  >(() => initialStates());
  const [globalError, setGlobalError] = useState<string | null>(null);
  const setResearch = useTravelStore((s) => s.setResearch);
  const startedRef = useRef(false);

  const updateAgent = useCallback((evt: AgentEvent) => {
    setStates((prev) => {
      const cur = prev[evt.agent];
      if (!cur) return prev;
      const snippets = evt.snippet
        ? [...cur.snippets, evt.snippet].slice(-4)
        : cur.snippets;
      return {
        ...prev,
        [evt.agent]: {
          ...cur,
          status: mapStatus(evt.status),
          snippets,
          error: evt.error ?? cur.error,
          startedAt:
            evt.status === "running" && !cur.startedAt
              ? Date.now()
              : cur.startedAt,
          finishedAt:
            evt.status === "done" || evt.status === "error"
              ? Date.now()
              : cur.finishedAt,
        },
      };
    });
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const run = async () => {
      try {
        const res = await fetch("/api/research", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profile }),
        });
        if (!res.ok || !res.body) {
          const text = await res.text().catch(() => "");
          throw new Error(`Sunucu hatası (${res.status}): ${text || "—"}`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finalResearch: ResearchBundle | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            let evt: StreamEvent;
            try {
              evt = JSON.parse(trimmed) as StreamEvent;
            } catch {
              continue;
            }
            if ("type" in evt && evt.type === "research-complete") {
              finalResearch = evt.research;
            } else if ("type" in evt && evt.type === "error") {
              setGlobalError(evt.error);
              onError?.(evt.error);
            } else if ("agent" in evt) {
              updateAgent(evt);
            }
          }
        }

        if (finalResearch) {
          setResearch(finalResearch);
          onComplete(finalResearch);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
        setGlobalError(msg);
        onError?.(msg);
      }
    };

    void run();
  }, [profile, onComplete, onError, setResearch, updateAgent]);

  const total = AGENT_DEFS.length;
  const doneCount = Object.values(states).filter(
    (s) => s.status === "done" || s.status === "error",
  ).length;
  const anyRunning = Object.values(states).some(
    (s) => s.status === "running",
  );
  const progress = (doneCount / total) * 100;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
          Seyahat DNA&apos;nız işleniyor
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          7 uzman ajan paralel olarak araştırma yapıyor. Bu 1-3 dakika sürebilir.
        </p>
      </div>

      <ResearchAnimation
        active={anyRunning}
        progress={progress}
        label={`${doneCount}/${total} ajan tamamlandı`}
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AGENT_DEFS.map((a) => (
          <AgentCard
            key={a.id}
            id={a.id}
            icon={a.icon}
            label={a.label}
            status={states[a.id].status}
            snippets={states[a.id].snippets}
            error={states[a.id].error}
          />
        ))}
      </div>

      {globalError && (
        <div className="mt-6 rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {globalError}
        </div>
      )}
    </div>
  );
}

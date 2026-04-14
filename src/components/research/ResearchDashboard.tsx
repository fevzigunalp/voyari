"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ResearchAgentId } from "@/lib/types/research";
import type { TravelerProfile } from "@/lib/types/traveler-profile";
import { useTravelStore, type ResearchBundle } from "@/lib/store/travel-store";
import { AGENT_RETRY_POLICY } from "@/lib/ai/agent-routing";
import { AgentCard, type UiAgentStatus } from "./AgentCard";
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

type ServerAgentStatus =
  | "pending"
  | "running"
  | "retrying"
  | "fallback_running"
  | "done"
  | "partial"
  | "failed"
  // Legacy value still emitted if an older server build is reached — treat as "failed".
  | "error";

interface AgentEvent {
  agent: ResearchAgentId;
  status: ServerAgentStatus;
  snippet?: string;
  error?: string;
  data?: unknown;
  provider?: string;
  partial?: boolean;
}

interface CompleteEvent {
  type: "research-complete";
  research: ResearchBundle;
}

interface ErrorEvent {
  type: "error";
  error: string;
}

interface PhaseEvent {
  type: "phase";
  phase: 1 | 2 | 3;
  status: "start" | "complete";
  agents: ResearchAgentId[];
}

type StreamEvent = AgentEvent | CompleteEvent | ErrorEvent | PhaseEvent;

interface AgentUiState {
  id: ResearchAgentId;
  label: string;
  icon: string;
  status: UiAgentStatus;
  snippets: string[];
  error?: string;
  startedAt?: number;
  finishedAt?: number;
  retryInFlight?: boolean;
}

function initialStates(): Record<ResearchAgentId, AgentUiState> {
  const out = {} as Record<ResearchAgentId, AgentUiState>;
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

function mapServerStatus(s: ServerAgentStatus): UiAgentStatus {
  if (s === "pending") return "idle";
  if (s === "error") return "failed"; // legacy fallback
  return s;
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
  const [states, setStates] = useState<Record<ResearchAgentId, AgentUiState>>(
    () => initialStates(),
  );
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<1 | 2 | 3 | null>(null);
  const [completedPhases, setCompletedPhases] = useState<Array<1 | 2 | 3>>([]);
  const setResearch = useTravelStore((s) => s.setResearch);
  const updateResearchAgent = useTravelStore((s) => s.updateResearchAgent);
  const startedRef = useRef(false);
  // True once the user has navigated away from this dashboard (onComplete fired
  // and parent unmounted, OR the component unmounted for any reason). We skip
  // client-side delayed retries if unmounted.
  const mountedRef = useRef(true);
  const timeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const researchRef = useRef<ResearchBundle | null>(null);

  const updateAgent = useCallback((evt: AgentEvent) => {
    setStates((prev) => {
      const cur = prev[evt.agent];
      if (!cur) return prev;
      const uiStatus = mapServerStatus(evt.status);
      const snippets = evt.snippet
        ? [...cur.snippets, evt.snippet].slice(-4)
        : cur.snippets;
      const isTerminal =
        uiStatus === "done" || uiStatus === "partial" || uiStatus === "failed";
      const isTransient =
        uiStatus === "running" ||
        uiStatus === "retrying" ||
        uiStatus === "fallback_running";
      return {
        ...prev,
        [evt.agent]: {
          ...cur,
          status: uiStatus,
          snippets,
          error: evt.error ?? cur.error,
          startedAt:
            isTransient && !cur.startedAt ? Date.now() : cur.startedAt,
          finishedAt: isTerminal ? Date.now() : cur.finishedAt,
        },
      };
    });
  }, []);

  const runManualRetry = useCallback(
    async (agentId: ResearchAgentId) => {
      setStates((prev) => {
        const cur = prev[agentId];
        if (!cur) return prev;
        return {
          ...prev,
          [agentId]: { ...cur, retryInFlight: true, status: "retrying" },
        };
      });
      try {
        const res = await fetch("/api/retry-agent", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            profile,
            agentId,
            research: researchRef.current ?? undefined,
          }),
        });
        const payload = (await res.json()) as
          | { status: "done"; data: unknown; provider?: string }
          | { status: "partial"; data: unknown; errorCode?: string }
          | { error: string };
        if (!res.ok || "error" in payload) {
          throw new Error(
            "error" in payload ? payload.error : `HTTP ${res.status}`,
          );
        }
        if (payload.status === "done") {
          updateResearchAgent(agentId, payload.data);
          if (researchRef.current) {
            researchRef.current = {
              ...researchRef.current,
              [agentId]: payload.data,
            };
          }
          setStates((prev) => {
            const cur = prev[agentId];
            if (!cur) return prev;
            return {
              ...prev,
              [agentId]: {
                ...cur,
                status: "done",
                retryInFlight: false,
                snippets: [...cur.snippets, "Tamamlandı"].slice(-4),
                finishedAt: Date.now(),
                error: undefined,
              },
            };
          });
        } else {
          setStates((prev) => {
            const cur = prev[agentId];
            if (!cur) return prev;
            return {
              ...prev,
              [agentId]: {
                ...cur,
                status: "partial",
                retryInFlight: false,
              },
            };
          });
        }
      } catch {
        setStates((prev) => {
          const cur = prev[agentId];
          if (!cur) return prev;
          return {
            ...prev,
            [agentId]: {
              ...cur,
              status: "partial",
              retryInFlight: false,
            },
          };
        });
      }
    },
    [profile, updateResearchAgent],
  );

  const scheduleDelayedRetries = useCallback(
    (bundle: ResearchBundle) => {
      // For each agent currently in "partial" state, schedule ONE delayed retry.
      setStates((prev) => {
        for (const def of AGENT_DEFS) {
          const cur = prev[def.id];
          if (!cur) continue;
          if (cur.status !== "partial") continue;
          const policy = AGENT_RETRY_POLICY[def.id];
          if (!policy || policy.delayedRetryMs == null) continue;
          // Stagger jitter 0-30s on top of the policy delay.
          const jitter = Math.floor(Math.random() * 30_000);
          const delay = policy.delayedRetryMs + jitter;
          const handle = setTimeout(() => {
            if (!mountedRef.current) return;
            void runManualRetry(def.id);
          }, delay);
          timeoutsRef.current.push(handle);
        }
        return prev;
      });
      // Reference bundle just to satisfy TS; actual data is in researchRef.
      void bundle;
    },
    [runManualRetry],
  );

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
            } else if ("type" in evt && evt.type === "phase") {
              setActivePhase(evt.status === "start" ? evt.phase : null);
              if (evt.status === "complete") {
                setCompletedPhases((prev) =>
                  prev.includes(evt.phase) ? prev : [...prev, evt.phase],
                );
              }
            } else if ("agent" in evt) {
              updateAgent(evt);
            }
          }
        }

        if (finalResearch) {
          researchRef.current = finalResearch;
          setResearch(finalResearch);
          // Fire-and-forget client-driven delayed retries before notifying parent
          // — if the parent navigates away, mountedRef flips to false and the
          // scheduled retries will skip themselves.
          scheduleDelayedRetries(finalResearch);
          onComplete(finalResearch);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
        setGlobalError(msg);
        onError?.(msg);
      }
    };

    void run();
  }, [
    profile,
    onComplete,
    onError,
    setResearch,
    updateAgent,
    scheduleDelayedRetries,
  ]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      for (const h of timeoutsRef.current) clearTimeout(h);
      timeoutsRef.current = [];
    };
  }, []);

  const total = AGENT_DEFS.length;
  const doneCount = Object.values(states).filter(
    (s) =>
      s.status === "done" ||
      s.status === "partial" ||
      s.status === "failed",
  ).length;
  const anyRunning = Object.values(states).some(
    (s) =>
      s.status === "running" ||
      s.status === "retrying" ||
      s.status === "fallback_running",
  );
  const progress = (doneCount / total) * 100;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
          Seyahat DNA&apos;nız işleniyor
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          3 fazda sıralı araştırma — her faz bir öncekinin sonucuna dayanıyor.
        </p>
      </div>

      <ResearchAnimation
        active={anyRunning}
        progress={progress}
        label={`${doneCount}/${total} ajan tamamlandı`}
      />

      {([
        { phase: 1, title: "Faz 1 — Temel", subtitle: "Rota · Lojistik (sıralı)", ids: ["route", "logistics"] as ResearchAgentId[] },
        { phase: 2, title: "Faz 2 — İçerik", subtitle: "Konaklama · Aktivite · Restoran (paralel)", ids: ["accommodation", "activity", "restaurant"] as ResearchAgentId[] },
        { phase: 3, title: "Faz 3 — Zenginleştirme", subtitle: "Hava · Bütçe (sıralı)", ids: ["weather", "budget"] as ResearchAgentId[] },
      ] as const).map((p) => {
        const isActive = activePhase === p.phase;
        const isDone = completedPhases.includes(p.phase);
        const isPending = !isActive && !isDone;
        return (
          <div key={p.phase} className="mt-10">
            <div className="flex items-baseline justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`font-mono text-[10px] uppercase tracking-[0.22em] ${
                    isActive
                      ? "text-[#E8C97A]"
                      : isDone
                        ? "text-emerald-300/80"
                        : "text-text-muted/60"
                  }`}
                >
                  {isDone ? "✓ " : isActive ? "▸ " : ""}
                  {p.title}
                </div>
                <span className="text-xs text-text-muted">{p.subtitle}</span>
              </div>
              {isPending && (
                <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted/60 font-mono">
                  Beklemede
                </span>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {p.ids.map((id) => (
                <AgentCard
                  key={id}
                  id={id}
                  icon={AGENT_DEFS.find((a) => a.id === id)?.icon ?? "●"}
                  label={AGENT_DEFS.find((a) => a.id === id)?.label ?? id}
                  status={states[id].status}
                  snippets={states[id].snippets}
                  error={states[id].error}
                  retryInFlight={states[id].retryInFlight}
                  onManualRetry={() => {
                    void runManualRetry(id);
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}

      {globalError && (
        <div className="mt-6 rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {globalError}
        </div>
      )}
    </div>
  );
}

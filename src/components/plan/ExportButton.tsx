"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileText, FileDown, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { TravelPlan } from "@/lib/types/plan";
import {
  exportPlanToMarkdown,
  exportPlanToPdf,
} from "@/lib/utils/export-pdf";

export interface ExportButtonProps {
  plan: TravelPlan;
  targetId?: string;
  label?: string;
}

export function ExportButton({
  plan,
  targetId = "voyari-plan-export-root",
  label = "Planı Dışa Aktar",
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<"pdf" | "md" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handlePdf = async () => {
    setBusy("pdf");
    setErr(null);
    try {
      await exportPlanToPdf(targetId, plan);
      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "PDF oluşturulamadı");
    } finally {
      setBusy(null);
    }
  };

  const handleMd = () => {
    setBusy("md");
    setErr(null);
    try {
      exportPlanToMarkdown(plan);
      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Markdown oluşturulamadı");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div ref={ref} className="relative inline-block">
      <Button
        variant="gold"
        size="sm"
        leftIcon={<Download className="h-4 w-4" />}
        rightIcon={
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              open && "rotate-180",
            )}
          />
        }
        onClick={() => setOpen((o) => !o)}
        disabled={busy !== null}
      >
        {label}
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 z-50 rounded-2xl border border-[rgba(212,168,83,0.25)] bg-[rgba(10,14,26,0.96)] backdrop-blur-xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] overflow-hidden"
        >
          <button
            role="menuitem"
            type="button"
            onClick={handlePdf}
            disabled={busy !== null}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-text-primary hover:bg-[rgba(212,168,83,0.08)] disabled:opacity-60"
          >
            {busy === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#E8C97A]" />
            ) : (
              <FileDown className="h-4 w-4 text-[#E8C97A]" />
            )}
            <div className="flex flex-col">
              <span className="font-medium">PDF olarak indir</span>
              <span className="text-[11px] text-text-muted">
                Yazdırmaya hazır A4 dosyası
              </span>
            </div>
          </button>
          <div className="h-px bg-white/[0.06]" />
          <button
            role="menuitem"
            type="button"
            onClick={handleMd}
            disabled={busy !== null}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-text-primary hover:bg-[rgba(212,168,83,0.08)] disabled:opacity-60"
          >
            {busy === "md" ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#E8C97A]" />
            ) : (
              <FileText className="h-4 w-4 text-[#E8C97A]" />
            )}
            <div className="flex flex-col">
              <span className="font-medium">Markdown olarak indir</span>
              <span className="text-[11px] text-text-muted">
                .md — Notion/Obsidian uyumlu
              </span>
            </div>
          </button>
          {err && (
            <div className="px-4 py-2 text-[11px] text-rose-300 border-t border-rose-400/20 bg-rose-500/5">
              {err}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

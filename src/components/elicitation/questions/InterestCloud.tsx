"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Check,
  Landmark,
  Leaf,
  Music,
  Plus,
  ShoppingBag,
  Sparkles,
  Trees,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useMemo } from "react";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils/cn";
import { INTEREST_TAXONOMY, MAIN_BY_ID, SUB_BY_ID } from "@/lib/interests/taxonomy";
import { suggestionsFor } from "@/lib/interests/suggestions";
import { toInterestsValue } from "@/lib/interests/normalize";
import type { InterestsValue } from "@/lib/interests/types";
import type { MainCategory } from "@/lib/interests/types";
import type { QuestionComponentProps } from "./types";

const ICONS: Record<MainCategory["iconName"], React.ComponentType<{ className?: string }>> = {
  Landmark,
  UtensilsCrossed,
  Trees,
  Sparkles,
  Music,
  ShoppingBag,
  Leaf,
  Camera,
};

const HARD_MAX_SUBS = 12;
const SOFT_MIN_SUBS = 3;
const SOFT_MAX_SUBS = 8;

function withMeta(
  next: Omit<InterestsValue, "meta">,
): InterestsValue {
  const suggestedCount = next.acceptedSuggestions.length;
  return {
    ...next,
    meta: {
      manualCount: Math.max(0, next.subInterests.length - suggestedCount),
      suggestedCount,
    },
  };
}

export function InterestCloud({
  value,
  onChange,
}: QuestionComponentProps<InterestsValue>) {
  // Accept undefined OR legacy string[] silently (migration-safe).
  const current = useMemo<InterestsValue>(
    () => (value ? toInterestsValue(value) : toInterestsValue(undefined)),
    [value],
  );

  const totalSubs = current.subInterests.length;
  const atHardMax = totalSubs >= HARD_MAX_SUBS;

  const toggleMain = (mainId: string) => {
    const isSelected = current.mainCategories.includes(mainId);
    if (isSelected) {
      // Deselect main: also drop its subs + accepted suggestions from that main.
      const subsOfMain = new Set(
        (MAIN_BY_ID[mainId]?.subs ?? []).map((s) => s.id),
      );
      onChange(
        withMeta({
          mainCategories: current.mainCategories.filter((m) => m !== mainId),
          subInterests: current.subInterests.filter((s) => !subsOfMain.has(s)),
          acceptedSuggestions: current.acceptedSuggestions.filter(
            (s) => !subsOfMain.has(s),
          ),
        }),
      );
      return;
    }
    onChange(
      withMeta({
        ...current,
        mainCategories: [...current.mainCategories, mainId],
      }),
    );
  };

  const toggleSub = (subId: string, opts: { fromSuggestion?: boolean } = {}) => {
    const isSelected = current.subInterests.includes(subId);
    if (isSelected) {
      onChange(
        withMeta({
          ...current,
          subInterests: current.subInterests.filter((s) => s !== subId),
          acceptedSuggestions: current.acceptedSuggestions.filter(
            (s) => s !== subId,
          ),
        }),
      );
      return;
    }
    if (atHardMax) return;
    onChange(
      withMeta({
        ...current,
        subInterests: [...current.subInterests, subId],
        acceptedSuggestions: opts.fromSuggestion
          ? [...current.acceptedSuggestions, subId]
          : current.acceptedSuggestions,
      }),
    );
  };

  const selectedSubs = new Set(current.subInterests);
  const selectedMains = new Set(current.mainCategories);

  const softHintTone =
    totalSubs === 0
      ? "text-text-muted"
      : totalSubs < SOFT_MIN_SUBS
        ? "text-amber-300/80"
        : totalSubs > SOFT_MAX_SUBS
          ? "text-amber-300/80"
          : "text-emerald-300/80";

  return (
    <div className="space-y-8">
      {/* Intro copy */}
      <div className="space-y-1.5">
        <p className="text-sm text-text-secondary">
          Önce ana ilgi alanlarını seçin, sonra detaylara inelim.
        </p>
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-text-muted">
          Birden fazla seçebilirsiniz.
        </p>
      </div>

      {/* STAGE 1 — Main category grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {INTEREST_TAXONOMY.map((main) => {
          const Icon = ICONS[main.iconName];
          const isSelected = selectedMains.has(main.id);
          return (
            <motion.button
              type="button"
              key={main.id}
              onClick={() => toggleMain(main.id)}
              layout
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={cn(
                "group relative overflow-hidden rounded-2xl p-4 text-left",
                "backdrop-blur-xl border transition-colors",
                "min-h-[108px] flex flex-col justify-between",
                isSelected
                  ? "bg-[rgba(212,168,83,0.12)] border-[rgba(212,168,83,0.65)] shadow-[0_0_0_3px_rgba(212,168,83,0.08),0_8px_30px_-12px_rgba(212,168,83,0.35)]"
                  : "bg-white/[0.03] border-white/[0.08] hover:border-[rgba(212,168,83,0.35)]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isSelected ? "text-[#E8C97A]" : "text-text-secondary",
                  )}
                />
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(212,168,83,0.25)] text-[#E8C97A]"
                  >
                    <Check className="h-3 w-3" />
                  </motion.span>
                )}
              </div>
              <div>
                <div
                  className={cn(
                    "text-sm font-semibold leading-tight",
                    isSelected ? "text-[#E8C97A]" : "text-text-primary",
                  )}
                >
                  {main.label}
                </div>
                <div className="mt-1 text-[11px] text-text-muted leading-snug">
                  {main.description}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* STAGE 2 — Per-category sub sections */}
      <AnimatePresence initial={false}>
        {current.mainCategories.map((mainId) => {
          const main = MAIN_BY_ID[mainId];
          if (!main) return null;
          const suggestedIds = suggestionsFor(mainId);
          const Icon = ICONS[main.iconName];
          return (
            <motion.section
              key={main.id}
              initial={{ opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-3 overflow-hidden"
            >
              <div className="flex items-center gap-2 pt-2">
                <Icon className="h-4 w-4 text-[#E8C97A]" />
                <h4 className="text-sm font-semibold text-text-primary">
                  {main.label}
                </h4>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">
                  {
                    main.subs.filter((s) => selectedSubs.has(s.id)).length
                  }
                  /{main.subs.length}
                </span>
              </div>

              {/* Suggestions strip */}
              {suggestedIds.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#E8C97A]/80">
                    Seçiminize göre önerilenler
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedIds.map((subId) => {
                      const entry = SUB_BY_ID[subId];
                      if (!entry) return null;
                      const isSel = selectedSubs.has(subId);
                      return (
                        <motion.button
                          type="button"
                          key={`sugg-${subId}`}
                          whileTap={{ scale: 0.96 }}
                          whileHover={{ y: -1 }}
                          onClick={() =>
                            toggleSub(subId, { fromSuggestion: !isSel })
                          }
                          disabled={!isSel && atHardMax}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-medium transition-colors",
                            isSel
                              ? "bg-[rgba(212,168,83,0.18)] text-[#E8C97A] border border-[rgba(212,168,83,0.7)]"
                              : "bg-transparent text-[#E8C97A]/85 border border-dashed border-[rgba(212,168,83,0.55)] hover:bg-[rgba(212,168,83,0.06)]",
                            !isSel && atHardMax
                              ? "opacity-40 cursor-not-allowed"
                              : "",
                          )}
                        >
                          {isSel ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                          <span>{entry.sub.label}</span>
                          {isSel && (
                            <X
                              className="h-3 w-3 opacity-70 hover:opacity-100"
                              aria-label="Öneriyi kaldır"
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Full chip cloud for this category */}
              <div className="flex flex-wrap gap-2 pt-1">
                {main.subs.map((sub) => {
                  const isSel = selectedSubs.has(sub.id);
                  const disabled = !isSel && atHardMax;
                  return (
                    <Chip
                      key={sub.id}
                      label={sub.label}
                      selected={isSel}
                      disabled={disabled}
                      onClick={() => toggleSub(sub.id)}
                    />
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </AnimatePresence>

      {/* Sticky summary */}
      <div className="sticky bottom-2 z-10">
        <div
          className={cn(
            "flex items-center justify-between gap-4 rounded-xl px-4 py-2.5",
            "backdrop-blur-xl bg-[rgba(10,14,26,0.7)] border border-white/[0.06]",
          )}
        >
          <div className="text-xs font-mono uppercase tracking-[0.18em] text-text-secondary">
            {current.mainCategories.length} ana kategori ·{" "}
            <span className={softHintTone}>{totalSubs} alt ilgi</span> seçildi
          </div>
          <div
            className={cn(
              "text-[10px] font-mono uppercase tracking-[0.18em]",
              softHintTone,
            )}
          >
            {totalSubs === 0
              ? "Daha iyi öneriler için 3-8 alt ilgi seçmenizi öneririz."
              : totalSubs < SOFT_MIN_SUBS
                ? `${SOFT_MIN_SUBS - totalSubs} daha seçmenizi öneririz`
                : totalSubs > SOFT_MAX_SUBS
                  ? atHardMax
                    ? "Maksimum sayıya ulaştınız"
                    : "Odaklı tutmak için 8 ile sınırlamayı düşünün"
                  : "Harika seçim"}
          </div>
        </div>
      </div>
    </div>
  );
}

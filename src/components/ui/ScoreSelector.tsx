"use client";

import React, { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface ScoreSelectorProps {
  value: number | null | undefined;
  onChange: (score: number) => void;
  disabled?: boolean;
  className?: string;
  enableKeyboardShortcuts?: boolean;
}

const SCORE_LABELS: Record<number, { title: string; desc: string }> = {
  1: { title: "1 Perlu Pengembangan", desc: "Belum tampak atau kurang memadai" },
  2: { title: "2 Berkembang", desc: "Mulai tampak namun belum konsisten" },
  3: { title: "3 Mahir", desc: "Konsisten dan efektif berpusat pada siswa" },
  4: { title: "4 Sangat Mahir", desc: "Inspiratif dan melampaui kriteria baku" },
};

/**
 * Komponen pemilih skor observasi 1 s.d. 4 berbasis Apple HIG
 * Menyediakan area sentuh luas (min 44x44px), label kata lengkap, dan pintasan keyboard
 */
export const ScoreSelector: React.FC<ScoreSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className,
  enableKeyboardShortcuts = false,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled || !enableKeyboardShortcuts) return;
      if (["1", "2", "3", "4"].includes(e.key)) {
        onChange(parseInt(e.key, 10));
      }
    },
    [disabled, enableKeyboardShortcuts, onChange]
  );

  useEffect(() => {
    if (enableKeyboardShortcuts) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [enableKeyboardShortcuts, handleKeyDown]);

  return (
    <div
      role="group"
      aria-label="Pilihan skor indikator 1 sampai 4"
      className={cn("grid grid-cols-2 md:grid-cols-4 gap-2", className)}
    >
      {([1, 2, 3, 4] as const).map((score) => {
        const isSelected = value === score;
        return (
          <button
            key={score}
            type="button"
            role="button"
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => onChange(score)}
            className={cn(
              "flex flex-col items-center justify-center min-h-[52px] p-3 rounded-control border text-left transition-smooth select-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-sm font-semibold ring-1 ring-primary"
                : "bg-surface text-foreground border-border hover:bg-black/5 dark:hover:bg-white/5",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-center gap-1.5 w-full justify-center">
              <span className="text-base md:text-lg font-bold">{score}</span>
              <span className="text-xs md:text-sm truncate">
                {score === 1
                  ? "Perlu"
                  : score === 2
                  ? "Berkembang"
                  : score === 3
                  ? "Mahir"
                  : "Sangat Mahir"}
              </span>
            </div>
            <span
              className={cn(
                "text-[10px] hidden md:block text-center mt-0.5 line-clamp-1",
                isSelected ? "text-white/80" : "text-muted"
              )}
            >
              {SCORE_LABELS[score].desc}
            </span>
          </button>
        );
      })}
    </div>
  );
};

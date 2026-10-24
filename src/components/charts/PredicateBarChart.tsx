"use client";

import React from "react";

export interface PredicateData {
  label: string; // e.g. "Amat Baik (≥90%)" or "Amat Baik"
  range?: string; // e.g. "≥90%"
  count: number;
  color: string;
}

interface PredicateBarChartProps {
  data: PredicateData[];
  height?: number;
}

export const PredicateBarChart: React.FC<PredicateBarChartProps> = ({
  data,
}) => {
  const totalEvaluated = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="w-full space-y-3 py-1">
      {data.map((item, idx) => {
        const percent = totalEvaluated > 0 ? Math.round((item.count / totalEvaluated) * 100) : 0;
        return (
          <div
            key={idx}
            className="p-2.5 rounded-xl bg-surface/70 border border-border/60 hover:border-border transition-colors space-y-1.5"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-bold text-foreground text-xs">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="font-extrabold text-foreground">{item.count} Guru</span>
                <span className="text-muted">({percent}%)</span>
              </div>
            </div>

            {/* Progress Bar Horizontal */}
            <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${percent}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Ringkasan Bawah yang Informatif */}
      <div className="pt-1 text-[11px] text-muted flex items-center justify-between">
        <span>Total Dinilai: <strong className="text-foreground">{totalEvaluated} Guru</strong></span>
        <span>Standar Minimal Kelulusan: <strong className="text-emerald-700 dark:text-emerald-400">≥ 75%</strong></span>
      </div>
    </div>
  );
};

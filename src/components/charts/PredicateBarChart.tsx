"use client";

import React from "react";

export interface PredicateData {
  label: string; // Misal: "Amat Baik (≥ 90%)" atau nama predikat
  name?: string; // "Amat Baik", "Baik", dll
  range?: string; // "≥ 90%", "75 - 89%", dll
  count: number;
  color: string;
}

interface PredicateBarChartProps {
  data: PredicateData[];
}

export const PredicateBarChart: React.FC<PredicateBarChartProps> = ({
  data,
}) => {
  const totalEvaluated = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="w-full space-y-2.5 py-1">
      {data.map((item, idx) => {
        const percent = totalEvaluated > 0 ? Math.round((item.count / totalEvaluated) * 100) : 0;
        
        // Ekstrak nama dan rentang nilai secara aman
        const displayName = item.name || item.label.split("(")[0].trim();
        const displayRange = item.range || (item.label.includes("(") ? item.label.slice(item.label.indexOf("(")) : "");

        return (
          <div
            key={idx}
            className="p-2 sm:p-2.5 rounded-xl bg-surface/80 border border-border/60 hover:border-border transition-colors space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-bold text-foreground text-xs truncate">
                  {displayName}
                </span>
                {displayRange && (
                  <span className="text-[10px] text-muted font-mono shrink-0">
                    {displayRange}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 font-mono text-xs shrink-0">
                <span className="font-extrabold text-foreground">{item.count}</span>
                <span className="text-muted text-[11px]">({percent}%)</span>
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

      {/* Ringkasan Bawah yang Rapi dan Tidak Memaksa Baris Baru */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-1 text-[11px] text-muted border-t border-border/60">
        <span>
          Total Dinilai: <strong className="text-foreground">{totalEvaluated} Guru</strong>
        </span>
        <span>
          Batas Kelulusan:{" "}
          <strong className="text-emerald-700 dark:text-emerald-400 font-bold">≥ 75%</strong>
        </span>
      </div>
    </div>
  );
};

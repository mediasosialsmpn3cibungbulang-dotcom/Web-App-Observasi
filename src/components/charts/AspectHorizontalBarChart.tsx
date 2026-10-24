"use client";

import React from "react";

export interface AspectBarData {
  kode: string;
  nama: string;
  average: number; // 1.00 s.d. 4.00
}

interface AspectHorizontalBarChartProps {
  data: AspectBarData[];
  threshold?: number; // default 3.00
}

export const AspectHorizontalBarChart: React.FC<AspectHorizontalBarChartProps> = ({
  data,
  threshold = 3.0,
}) => {
  const maxScale = 4.0;
  const thresholdPercent = (threshold / maxScale) * 100;

  return (
    <div className="w-full space-y-3.5 relative">
      {/* Garis Batas Ambang 3.00 */}
      <div
        className="absolute top-0 bottom-6 z-10 pointer-events-none flex flex-col items-center"
        style={{ left: `${thresholdPercent}%` }}
      >
        <div className="h-full border-r-2 border-dashed border-red-500/70" />
        <span className="text-[10px] font-mono font-bold text-red-600 dark:text-red-400 bg-card px-1 rounded shadow-xs mt-1">
          Batas {threshold.toFixed(1)}
        </span>
      </div>

      {data.map((item) => {
        const percent = Math.min((item.average / maxScale) * 100, 100);
        const isBelowThreshold = item.average > 0 && item.average < threshold;

        return (
          <div key={item.kode} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground truncate max-w-[70%]">
                {item.kode}. {item.nama}
              </span>
              <span
                className={`font-mono font-bold ${
                  isBelowThreshold
                    ? "text-red-600 dark:text-red-400"
                    : "text-pine-600 dark:text-pine-400"
                }`}
              >
                {item.average > 0 ? item.average.toFixed(2) : "-"}{" "}
                <span className="text-[10px] text-muted font-normal">/ 4.00</span>
              </span>
            </div>

            <div className="w-full bg-black/5 dark:bg-white/5 h-3.5 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isBelowThreshold ? "bg-amber-500" : "bg-pine-600 dark:bg-pine-400"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}

      <div className="flex justify-between text-[10px] font-mono text-muted pt-2 border-t border-border">
        <span>1.0</span>
        <span>2.0</span>
        <span className="text-red-600 font-bold">3.0 (Target)</span>
        <span>4.0</span>
      </div>
    </div>
  );
};

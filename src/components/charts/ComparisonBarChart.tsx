"use client";

import React from "react";

export interface ComparisonData {
  guruNama: string;
  skorAwal: number; // persentase 0-100
  skorTerbaru: number; // persentase 0-100
}

interface ComparisonBarChartProps {
  data: ComparisonData[];
  height?: number;
}

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({
  data,
  height = 180,
}) => {
  return (
    <div className="w-full flex flex-col justify-end">
      {/* Legend */}
      <div className="flex items-center justify-end gap-4 text-xs mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-zinc-400" />
          <span className="text-muted">Observasi 1 (Awal)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-pine-600 dark:bg-pine-400" />
          <span className="font-semibold text-foreground">Observasi Terbaru</span>
        </div>
      </div>

      {/* Bar Area */}
      <div className="flex items-end justify-between gap-4 pt-4 pb-2 border-b border-border" style={{ height }}>
        {data.map((item, idx) => {
          const delta = item.skorTerbaru - item.skorAwal;
          const isHigher = delta > 0;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
              {/* Selisih delta label */}
              <span
                className={`text-[10px] font-mono font-bold mb-1 ${
                  isHigher ? "text-emerald-600" : delta < 0 ? "text-red-600" : "text-muted"
                }`}
              >
                {delta > 0 ? `+${delta.toFixed(1)}%` : delta === 0 ? "0%" : `${delta.toFixed(1)}%`}
              </span>

              {/* Batang Berdampingan */}
              <div className="flex items-end gap-1.5 w-full max-w-[64px] h-full justify-center">
                {/* Batang Obs-1 */}
                <div
                  className="w-1/2 bg-zinc-400 dark:bg-zinc-600 rounded-t-sm transition-all duration-700 ease-out"
                  style={{ height: `${item.skorAwal}%` }}
                  title={`Obs-1: ${item.skorAwal}%`}
                />
                {/* Batang Obs-Terbaru */}
                <div
                  className="w-1/2 bg-pine-600 dark:bg-pine-400 rounded-t-sm transition-all duration-700 ease-out"
                  style={{ height: `${item.skorTerbaru}%` }}
                  title={`Terbaru: ${item.skorTerbaru}%`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Label Guru Sumbu X */}
      <div className="flex items-center justify-between gap-4 pt-2 text-center">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1">
            <span
              className="text-[11px] font-semibold text-foreground block truncate"
              title={item.guruNama}
            >
              {item.guruNama.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

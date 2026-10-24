"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

export interface AspectBarData {
  kode: string;
  nama: string;
  average: number; // 0.00 s.d. 4.00
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
  const thresholdPercent = (threshold / maxScale) * 100; // 75%

  return (
    <div className="w-full space-y-4 py-1">
      {/* Keterangan Standar Kelulusan */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pb-1 border-b border-border/60">
        <span className="text-muted">
          Evaluasi 7 Aspek Observasi Kelas (Skor 1.00 s.d. 4.00):
        </span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold font-mono text-[11px]">
          <span>Standar Tuntas Minimal: Skor {threshold.toFixed(2)}</span>
        </div>
      </div>

      {/* Daftar 7 Aspek */}
      <div className="space-y-3.5">
        {data.map((item) => {
          const percent = Math.min((item.average / maxScale) * 100, 100);
          const hasScore = item.average > 0;
          const isPassed = item.average >= threshold;

          return (
            <div key={item.kode} className="space-y-1.5 group">
              {/* Header Baris Aspek */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <span className="w-5 h-5 rounded-md bg-pine-100 dark:bg-pine-900/40 text-pine-800 dark:text-pine-300 flex items-center justify-center text-[11px] shrink-0 font-mono">
                    {item.kode}
                  </span>
                  <span className="truncate max-w-[240px] sm:max-w-md">{item.nama}</span>
                </div>

                <div className="flex items-center gap-2">
                  {hasScore ? (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isPassed
                          ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300"
                          : "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      {isPassed ? "Tuntas" : "Perlu Bimbingan"}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-muted bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
                      Belum Ada Observasi
                    </span>
                  )}

                  <span className="font-mono font-extrabold text-foreground text-xs">
                    {hasScore ? item.average.toFixed(2) : "-"}
                    <span className="text-muted font-normal text-[10px]"> / 4.00</span>
                  </span>
                </div>
              </div>

              {/* Batang Track Progress */}
              <div className="relative w-full bg-black/5 dark:bg-white/5 h-2.5 rounded-full overflow-hidden">
                {/* Marker Garis Batas Ambang 3.00 (hanya di dalam track bar) */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500/80 z-10"
                  style={{ left: `${thresholdPercent}%` }}
                  title={`Target Minimal ${threshold.toFixed(2)}`}
                />

                {/* Bar Capaian */}
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    !hasScore
                      ? "bg-transparent"
                      : isPassed
                      ? "bg-emerald-600 dark:bg-emerald-400"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Skala Ruler Bawah (Presisi Matematis) */}
      <div className="relative h-6 pt-1 text-[10px] font-mono text-muted border-t border-border/60">
        <span className="absolute left-0">0.0</span>
        <span className="absolute left-[25%] -translate-x-1/2">1.0</span>
        <span className="absolute left-[50%] -translate-x-1/2">2.0</span>
        <span className="absolute left-[75%] -translate-x-1/2 font-bold text-red-600 dark:text-red-400">
          ▲ 3.0 (Target Minimal)
        </span>
        <span className="absolute right-0">4.0 (Maks)</span>
      </div>
    </div>
  );
};

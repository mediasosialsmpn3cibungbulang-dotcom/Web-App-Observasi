"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, TrendingUp } from "lucide-react";

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
  // Hanya tampilkan jika ada data guru yang benar-benar berbeda antar sesi (lonjakan nilai)
  const hasMultipleObservations = data.some((d) => d.skorTerbaru !== d.skorAwal || data.length > 1);

  if (!hasMultipleObservations || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 rounded-xl bg-surface/50 border border-border/60 min-h-[220px]">
        <div className="w-12 h-12 rounded-full bg-pine-100 dark:bg-pine-950/40 text-pine-700 dark:text-pine-300 flex items-center justify-center">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-sm">
          <p className="text-sm font-bold text-foreground">Menunggu Observasi Sesi 2</p>
          <p className="text-xs text-muted leading-relaxed">
            Grafik komparasi perkembangan akan aktif secara otomatis saat guru melaksanakan observasi sesi ke-2 untuk mengukur kenaikan mutu pembelajaran.
          </p>
        </div>
        <Link
          href="/jadwal"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-pine-700 dark:text-pine-300 hover:underline pt-1"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          Lihat Jadwal Observasi Berikutnya
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col justify-end space-y-3 py-1">
      {/* Legend */}
      <div className="flex items-center justify-between text-xs pb-1 border-b border-border/60">
        <span className="text-muted text-[11px]">Komparasi Sesi 1 vs Sesi Terbaru:</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-zinc-400" />
            <span className="text-muted text-[11px]">Sesi 1</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-pine-600 dark:bg-pine-400" />
            <span className="font-bold text-foreground text-[11px]">Terbaru</span>
          </div>
        </div>
      </div>

      {/* Bar Area */}
      <div
        className="flex items-end justify-around gap-4 pt-4 pb-2 border-b border-border/60"
        style={{ height }}
      >
        {data.map((item, idx) => {
          const delta = item.skorTerbaru - item.skorAwal;
          const isHigher = delta > 0;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
              {/* Selisih delta label */}
              <span
                className={`text-[10px] font-mono font-bold mb-1.5 ${
                  isHigher
                    ? "text-emerald-600 dark:text-emerald-400"
                    : delta < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted"
                }`}
              >
                {delta > 0 ? `+${delta.toFixed(1)}%` : delta === 0 ? "0%" : `${delta.toFixed(1)}%`}
              </span>

              {/* Batang Berdampingan */}
              <div className="flex items-end gap-1.5 w-full max-w-[56px] h-full justify-center">
                {/* Batang Obs-1 */}
                <div
                  className="w-1/2 bg-zinc-400 dark:bg-zinc-600 rounded-t-md transition-all duration-700 ease-out"
                  style={{ height: `${item.skorAwal}%` }}
                  title={`Sesi 1: ${item.skorAwal}%`}
                />
                {/* Batang Obs-Terbaru */}
                <div
                  className="w-1/2 bg-pine-600 dark:bg-pine-400 rounded-t-md transition-all duration-700 ease-out"
                  style={{ height: `${item.skorTerbaru}%` }}
                  title={`Terbaru: ${item.skorTerbaru}%`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Label Guru Sumbu X */}
      <div className="flex items-center justify-around gap-4 pt-1 text-center">
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

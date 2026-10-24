"use client";

import React from "react";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface RtlGaugeChartProps {
  selesai: number;
  berjalan: number;
  overdue: number;
}

export const RtlGaugeChart: React.FC<RtlGaugeChartProps> = ({
  selesai,
  berjalan,
  overdue,
}) => {
  const total = selesai + berjalan + overdue;
  const persentaseSelesai = total > 0 ? Math.round((selesai / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Semi-circular Gauge atau Donut Progress */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            className="text-black/5 dark:text-white/5"
          />

          {/* Selesai ring (Emerald) */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#1F5C45"
            strokeWidth="12"
            strokeDasharray={`${(persentaseSelesai / 100) * 251.2} 251.2`}
            strokeDashoffset="0"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold font-mono text-foreground">
            {persentaseSelesai}%
          </span>
          <span className="text-[10px] uppercase font-bold text-muted tracking-wider">
            Realisasi Tuntas
          </span>
        </div>
      </div>

      {/* Rincian Status */}
      <div className="grid grid-cols-3 gap-2 w-full mt-4 text-center">
        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
          <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">Tuntas</p>
          <p className="text-base font-bold font-mono text-emerald-800 dark:text-emerald-200">{selesai}</p>
        </div>
        <div className="p-2 rounded-lg bg-pine-50 dark:bg-pine-950/20 border border-pine-200 dark:border-pine-800">
          <p className="text-[10px] text-pine-700 dark:text-pine-300 font-semibold">Berjalan</p>
          <p className="text-base font-bold font-mono text-pine-800 dark:text-pine-200">{berjalan}</p>
        </div>
        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <p className="text-[10px] text-red-700 dark:text-red-300 font-semibold">Overdue</p>
          <p className="text-base font-bold font-mono text-red-800 dark:text-red-200">{overdue}</p>
        </div>
      </div>
    </div>
  );
};

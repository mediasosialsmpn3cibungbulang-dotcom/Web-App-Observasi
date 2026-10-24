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
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center justify-center w-full py-2">
      {/* Donut Progress Ring Responsive */}
      <div className="relative w-36 h-36 md:w-40 md:h-40 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
          {/* Latar Belakang */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            className="text-black/5 dark:text-white/5"
          />

          {/* Selesai Ring (Emerald) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#166534"
            strokeWidth="12"
            strokeDasharray={`${(persentaseSelesai / 100) * circumference} ${circumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Teks Tengah */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2 pointer-events-none">
          <span className="text-2xl md:text-3xl font-extrabold font-mono text-foreground">
            {persentaseSelesai}%
          </span>
          <span className="text-[10px] md:text-[11px] uppercase font-bold text-muted tracking-wider mt-0.5">
            RTL Tuntas
          </span>
        </div>
      </div>

      {/* Rincian Status 3 Kolom */}
      <div className="grid grid-cols-3 gap-2 w-full mt-4 text-center">
        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60">
          <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">
            Tuntas
          </p>
          <p className="text-base font-extrabold font-mono text-emerald-800 dark:text-emerald-200">
            {selesai}
          </p>
        </div>
        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/60">
          <p className="text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider">
            Berjalan
          </p>
          <p className="text-base font-extrabold font-mono text-amber-800 dark:text-amber-200">
            {berjalan}
          </p>
        </div>
        <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/60">
          <p className="text-[10px] text-red-700 dark:text-red-300 font-bold uppercase tracking-wider">
            Lewat Batas
          </p>
          <p className="text-base font-extrabold font-mono text-red-800 dark:text-red-200">
            {overdue}
          </p>
        </div>
      </div>
    </div>
  );
};

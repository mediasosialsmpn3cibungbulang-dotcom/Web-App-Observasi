"use client";

import React from "react";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  strokeWidth = 12,
  centerLabel,
  centerValue,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col items-center justify-center w-full py-1">
      {/* Donut Ring Responsif (Pusat Simetris, Tidak Pernah Terpotong) */}
      <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
          {/* Lingkaran Latar Belakang */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-black/5 dark:text-white/5"
          />

          {total === 0 ? (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#A0AEC0"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={0}
              opacity={0.3}
            />
          ) : (
            data.map((item, idx) => {
              if (item.value === 0) return null;
              const percent = item.value / total;
              const strokeDasharray = `${percent * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercent * circumference;
              accumulatedPercent += percent;

              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              );
            })
          )}
        </svg>

        {/* Teks di Tengah Lingkaran */}
        {(centerValue !== undefined || centerLabel) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-1">
            {centerValue !== undefined && (
              <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-foreground leading-none">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider mt-1">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legenda & Rincian Segment Vertikal Penuh (Tidak Akan Berdesakan) */}
      <div className="w-full mt-4 space-y-2 text-xs">
        {data.map((item, idx) => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div
              key={idx}
              className="p-2 sm:p-2.5 rounded-xl bg-surface/80 border border-border/60 hover:border-border transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-foreground font-bold text-xs truncate">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs shrink-0">
                  <span className="font-extrabold text-foreground">{item.value}</span>
                  <span className="text-muted text-[11px]">({percent}%)</span>
                </div>
              </div>

              {/* Mini progress bar di bawah legenda */}
              <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

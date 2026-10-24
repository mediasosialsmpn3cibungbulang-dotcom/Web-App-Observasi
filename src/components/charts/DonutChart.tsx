"use client";

import React from "react";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
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
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center w-full py-2">
      {/* Donut Ring Container Responsive */}
      <div className="relative w-36 h-36 md:w-40 md:h-40 shrink-0 flex items-center justify-center">
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
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
            {centerValue !== undefined && (
              <span className="text-2xl md:text-3xl font-extrabold font-mono tracking-tight text-foreground">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-[10px] md:text-[11px] text-muted font-bold uppercase tracking-wider mt-0.5">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legenda & Rincian Segment */}
      <div className="w-full sm:w-auto flex-1 space-y-2.5 text-xs">
        {data.map((item, idx) => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={idx} className="p-2 rounded-lg bg-surface/80 border border-border/60">
              <div className="flex items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-foreground font-semibold text-xs">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="font-extrabold text-foreground">{item.value}</span>
                  <span className="text-muted">({percent}%)</span>
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

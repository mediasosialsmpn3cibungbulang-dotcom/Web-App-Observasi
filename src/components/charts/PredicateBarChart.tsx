"use client";

import React from "react";

export interface PredicateData {
  label: string; // "Amat Baik", "Baik", "Cukup", "Perlu Pembinaan"
  count: number;
  color: string;
}

interface PredicateBarChartProps {
  data: PredicateData[];
  height?: number;
}

export const PredicateBarChart: React.FC<PredicateBarChartProps> = ({
  data,
  height = 160,
}) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="w-full flex flex-col justify-end">
      <div className="flex items-end justify-between gap-3 pt-6 pb-2 border-b border-border" style={{ height }}>
        {data.map((item, idx) => {
          const heightPercent = (item.count / maxCount) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
              {/* Tooltip Nilai di atas batang */}
              <span className="text-xs font-mono font-bold text-foreground mb-1.5 transition-transform group-hover:scale-110">
                {item.count}
              </span>

              {/* Batang SVG/HTML */}
              <div className="w-full max-w-[48px] bg-black/5 dark:bg-white/5 rounded-t-md overflow-hidden flex flex-col justify-end h-full">
                <div
                  className="w-full rounded-t-md transition-all duration-700 ease-out"
                  style={{
                    height: `${Math.max(heightPercent, item.count > 0 ? 12 : 0)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Label Sumbu X */}
      <div className="flex items-center justify-between gap-3 pt-2 text-center">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1">
            <span className="text-[11px] font-semibold text-muted block truncate" title={item.label}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

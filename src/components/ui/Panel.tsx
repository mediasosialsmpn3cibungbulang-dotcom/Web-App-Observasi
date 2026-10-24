import React from "react";
import { cn } from "@/lib/utils";

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/**
 * Komponen kontainer panel kerja modern
 * Mengutamakan keterbacaan data, tipografi jernih, dan kenyamanan mata
 */
export const Panel: React.FC<PanelProps> = ({
  className,
  title,
  subtitle,
  action,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-surface text-foreground border border-border rounded-panel p-5 md:p-6 shadow-subtle transition-all",
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-border">
          <div>
            {title && (
              <h3 className="text-base md:text-lg font-bold text-foreground font-sans tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs md:text-sm text-muted mt-1 leading-relaxed">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

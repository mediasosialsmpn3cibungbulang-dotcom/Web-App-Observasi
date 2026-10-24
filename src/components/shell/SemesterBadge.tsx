import React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface SemesterBadgeProps {
  semester?: string;
  className?: string;
}

/**
 * Lencana informasi semester akademik aktif
 */
export const SemesterBadge: React.FC<SemesterBadgeProps> = ({
  semester = "2026/2027 Ganjil",
  className,
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-subtle text-primary border border-primary/20",
        className
      )}
      title="Semester Akademik Aktif"
    >
      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
      <span>{semester}</span>
    </div>
  );
};

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Predicate, SupervisionStatus, FollowupStatus } from "@/contracts/enums";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "predikat" | "status" | "followup";
  predikat?: Predicate;
  statusSupervisi?: SupervisionStatus;
  statusFollowup?: FollowupStatus;
}

/**
 * Komponen label status dengan teks eksplisit dan bentuk penanda visual (anti-slop)
 */
export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  predikat,
  statusSupervisi,
  statusFollowup,
  children,
  ...props
}) => {
  // 1. Gaya Khusus Predikat (Amat Baik, Baik, Cukup, Perlu Pembinaan)
  if (predikat) {
    const predikatStyles: Record<Predicate, { bg: string; dot: string; text: string }> = {
      "Amat Baik": {
        bg: "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800",
        dot: "bg-emerald-600 dark:bg-emerald-400",
        text: "Amat Baik",
      },
      "Baik": {
        bg: "bg-sky-50 text-sky-900 border-sky-300 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800",
        dot: "bg-sky-600 dark:bg-sky-400",
        text: "Baik",
      },
      "Cukup": {
        bg: "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800",
        dot: "bg-amber-600 dark:bg-amber-400",
        text: "Cukup",
      },
      "Perlu Pembinaan": {
        bg: "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800",
        dot: "bg-rose-600 dark:bg-rose-400",
        text: "Perlu Pembinaan",
      },
    };

    const config = predikatStyles[predikat];
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
          config.bg,
          className
        )}
        {...props}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} aria-hidden="true" />
        {config.text}
      </span>
    );
  }

  // 2. Gaya Khusus Status Supervisi (Belum Mulai, Dalam Proses, Selesai)
  if (statusSupervisi) {
    const statusStyles: Record<SupervisionStatus, { bg: string; dot: string }> = {
      "Belum Mulai": {
        bg: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
        dot: "bg-gray-400",
      },
      "Dalam Proses": {
        bg: "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
        dot: "bg-blue-500",
      },
      "Selesai": {
        bg: "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        dot: "bg-emerald-600",
      },
    };

    const config = statusStyles[statusSupervisi];
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
          config.bg,
          className
        )}
        {...props}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} aria-hidden="true" />
        {statusSupervisi}
      </span>
    );
  }

  // 3. Gaya Khusus Status Tindak Lanjut
  if (statusFollowup) {
    const followupStyles: Record<FollowupStatus, { bg: string; dot: string }> = {
      "Belum Dimulai": {
        bg: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
        dot: "bg-gray-400",
      },
      "Pending": {
        bg: "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
        dot: "bg-amber-500",
      },
      "Berjalan": {
        bg: "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
        dot: "bg-blue-500",
      },
      "Selesai": {
        bg: "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        dot: "bg-emerald-600",
      },
    };

    const config = followupStyles[statusFollowup];
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
          config.bg,
          className
        )}
        {...props}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} aria-hidden="true" />
        {statusFollowup}
      </span>
    );
  }

  // 4. Default badge
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-surface text-foreground border-border",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

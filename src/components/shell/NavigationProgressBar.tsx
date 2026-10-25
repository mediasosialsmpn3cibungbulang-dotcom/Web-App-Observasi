"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Bar indikator progres navigasi ultra-tipis di bagian paling atas layar.
 * Muncul sesaat saat rute berganti memberikan feedback visual instan yang elegan dan responsif.
 */
export const NavigationProgressBar: React.FC = () => {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isNavigating) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2.5px] z-50 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <div className="h-full bg-pine-600 dark:bg-emerald-400 shadow-[0_0_8px_rgba(30,92,69,0.6)] dark:shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-nav-progress" />
    </div>
  );
};

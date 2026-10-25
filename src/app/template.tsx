"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Template wrapper resmi Next.js App Router untuk transisi antar halaman.
 * Berbeda dengan layout yang persisten, template di-remount pada setiap navigasi rute,
 * memungkinkan animasi masuk yang halus (fade-in + gentle slide) dan scroll reset
 * yang mulus tanpa sentakan visual (jarring jump).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Pastikan posisi scroll kembali ke atas secara instan saat rute berganti
    // sebelum animasi transisi selesai, sehingga pengguna tidak melihat hentakan kasar
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div key={pathname} className="animate-page-enter w-full">
      {children}
    </div>
  );
}

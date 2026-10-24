"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  ListTodo,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileDrawer } from "./MobileDrawer";

/**
 * Bilah navigasi bawah khusus mobile berbasis Apple HIG (maksimal 5 item)
 * Tombol observasi di tengah dirancang sebagai aksi utama (Hero CTA)
 */
export const BottomBar: React.FC = () => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-surface/90 backdrop-blur-md border-t border-border px-2 py-1 select-none"
        aria-label="Navigasi Bawah Mobile"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* 1. Beranda */}
          <Link
            href="/beranda"
            className={cn(
              "flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-control transition-smooth text-xs",
              pathname === "/beranda"
                ? "text-primary font-semibold"
                : "text-muted hover:text-foreground"
            )}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Beranda</span>
          </Link>

          {/* 2. Jadwal */}
          <Link
            href="/jadwal"
            className={cn(
              "flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-control transition-smooth text-xs",
              pathname.startsWith("/jadwal")
                ? "text-primary font-semibold"
                : "text-muted hover:text-foreground"
            )}
          >
            <CalendarDays className="w-5 h-5 mb-0.5" />
            <span>Jadwal</span>
          </Link>

          {/* 3. Observasi Kelas (Aksi Utama / Center Hero Button) */}
          <Link
            href="/observasi"
            className={cn(
              "flex flex-col items-center justify-center min-w-[60px] min-h-[52px] -mt-3 p-1.5 rounded-full shadow-md transition-smooth",
              pathname.startsWith("/observasi")
                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-surface"
                : "bg-primary text-primary-foreground hover:bg-primary-hover"
            )}
            aria-label="Mulai atau Lanjutkan Observasi Kelas"
          >
            <GraduationCap className="w-6 h-6 mb-0.5" />
            <span className="text-[10px] font-bold">Observasi</span>
          </Link>

          {/* 4. Tindak Lanjut */}
          <Link
            href="/tindak-lanjut"
            className={cn(
              "flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-control transition-smooth text-xs",
              pathname.startsWith("/tindak-lanjut")
                ? "text-primary font-semibold"
                : "text-muted hover:text-foreground"
            )}
          >
            <ListTodo className="w-5 h-5 mb-0.5" />
            <span>Tindak Lanjut</span>
          </Link>

          {/* 5. Lainnya (Drawer Sheet) */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-control transition-smooth text-xs text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Buka menu lengkap lainnya"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span>Lainnya</span>
          </button>
        </div>
      </nav>

      {/* Drawer Menu Lengkap */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};

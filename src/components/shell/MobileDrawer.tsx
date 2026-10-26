"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Users,
  CalendarClock,
  MessageSquare,
  FileBarChart,
  CheckSquare,
  HelpCircle,
  Settings,
  BookOpen,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DRAWER_ITEMS = [
  { label: "Database Guru", href: "/guru", icon: Users },
  { label: "Jadwal Guru", href: "/jadwal-guru", icon: CalendarClock },
  { label: "Pra-Observasi", href: "/pra-observasi", icon: ClipboardList },
  { label: "Sesi Coaching", href: "/coaching", icon: MessageSquare },
  { label: "Rekap & Laporan", href: "/laporan", icon: FileBarChart },
  { label: "Checklist Semester", href: "/checklist", icon: CheckSquare },
  { label: "Bank Pertanyaan", href: "/pertanyaan", icon: HelpCircle },
  { label: "Pengaturan Sistem", href: "/pengaturan", icon: Settings },
  { label: "Panduan & Bantuan", href: "/bantuan", icon: BookOpen },
];

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  // Kunci scroll body saat drawer terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu Lengkap">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-surface border-t border-border rounded-t-panel p-5 overflow-y-auto shadow-xl transition-smooth">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground font-serif">Menu Lengkap</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-muted hover:text-foreground rounded-full hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {DRAWER_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                scroll={false}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-control border text-sm font-medium transition-all duration-200 active:scale-95",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary font-semibold"
                    : "bg-surface text-foreground border-border hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted")} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

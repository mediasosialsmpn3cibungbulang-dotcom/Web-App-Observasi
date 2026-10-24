"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  MessageSquare,
  ListTodo,
  FileBarChart,
  CheckSquare,
  HelpCircle,
  Settings,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupName: "Utama",
    items: [
      { label: "Beranda", href: "/beranda", icon: LayoutDashboard },
      { label: "Database Guru", href: "/guru", icon: Users },
      { label: "Jadwal Supervisi", href: "/jadwal", icon: CalendarDays },
    ],
  },
  {
    groupName: "Supervisi Kelas",
    items: [
      { label: "Pra-Observasi", href: "/pra-observasi", icon: ClipboardList },
      { label: "Observasi Kelas", href: "/observasi", icon: GraduationCap },
      { label: "Sesi Coaching", href: "/coaching", icon: MessageSquare },
      { label: "Tindak Lanjut & RTL", href: "/tindak-lanjut", icon: ListTodo },
    ],
  },
  {
    groupName: "Evaluasi & Laporan",
    items: [
      { label: "Rekap & Laporan", href: "/laporan", icon: FileBarChart },
      { label: "Checklist Semester", href: "/checklist", icon: CheckSquare },
      { label: "Bank Pertanyaan", href: "/pertanyaan", icon: HelpCircle },
    ],
  },
  {
    groupName: "Sistem",
    items: [
      { label: "Pengaturan", href: "/pengaturan", icon: Settings },
      { label: "Panduan & Bantuan", href: "/bantuan", icon: BookOpen },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex flex-col w-64 bg-surface border-r border-border min-h-screen p-4 select-none flex-shrink-0"
      aria-label="Navigasi Utama Aplikasi"
    >
      {/* Header Logo & Identitas */}
      <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-pine-600 text-white flex items-center justify-center font-extrabold text-base shadow-xs">
          SS
        </div>
        <div>
          <h2 className="text-sm font-extrabold tracking-tight text-foreground leading-none">
            Smart Supervisi
          </h2>
          <p className="text-xs text-muted mt-1 leading-tight">
            Coaching Guru Sekolah
          </p>
        </div>
      </div>

      {/* Navigasi Berkelompok */}
      <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
        {NAV_GROUPS.map((group) => (
          <div key={group.groupName}>
            <p className="px-3 text-[11px] font-semibold tracking-wider text-muted uppercase mb-2">
              {group.groupName}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-control text-sm font-medium transition-smooth",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                          : "text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted")} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer Info Instansi */}
      <div className="pt-4 border-t border-border px-2">
        <div className="text-[11px] text-muted">
          <p className="font-semibold text-foreground truncate">SMAN 1 Prestasi Bangsa</p>
          <p className="truncate">NPSN: 20101234</p>
        </div>
      </div>
    </aside>
  );
};

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CalendarClock,
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
      { label: "Jadwal Guru", href: "/jadwal-guru", icon: CalendarClock },
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
      className="hidden lg:flex flex-col w-64 bg-surface border-r border-border h-screen sticky top-0 p-4 select-none flex-shrink-0 z-20 overflow-hidden"
      aria-label="Navigasi Utama Aplikasi"
    >
      {/* Header Logo & Identitas */}
      <div className="flex items-center gap-3 px-2 py-3 mb-3 border-b border-border flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-pine-600 dark:bg-emerald-600 text-white flex items-center justify-center font-extrabold text-base shadow-xs transition-transform duration-200 hover:scale-105">
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

      {/* Navigasi Berkelompok dengan Scrollbar Ramping */}
      <nav className="flex-1 space-y-5 overflow-y-auto pr-1 sidebar-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.groupName}>
            <p className="px-3 text-[11px] font-semibold tracking-wider text-muted uppercase mb-1.5">
              {group.groupName}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href + "/"));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={true}
                      scroll={false}
                      className={cn(
                        "group relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ease-out active:scale-[0.98]",
                        isActive
                          ? "bg-pine-600 text-white shadow-xs font-semibold dark:bg-emerald-600 dark:text-white"
                          : "text-muted hover:text-foreground hover:bg-pine-50/70 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                      )}
                    >
                      {/* Indikator Aksen Halus untuk Item Aktif */}
                      {isActive && (
                        <span className="absolute left-1.5 w-1 h-3.5 bg-white/90 rounded-full" />
                      )}
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110",
                          isActive
                            ? "text-white scale-105 ml-1"
                            : "text-muted group-hover:text-pine-700 dark:group-hover:text-emerald-400"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer Info Instansi */}
      <div className="pt-3 border-t border-border px-2 flex-shrink-0">
        <div className="text-[11px] text-muted">
          <p className="font-semibold text-foreground truncate">SMPN 3 Cibungbulang</p>
          <p className="truncate">NPSN: 20200551</p>
        </div>
      </div>
    </aside>
  );
};

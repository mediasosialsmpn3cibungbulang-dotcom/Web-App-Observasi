"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, UserCheck } from "lucide-react";
import { SemesterBadge } from "./SemesterBadge";
import { CloudSyncIndicator } from "./CloudSyncIndicator";
import { SettingsService } from "@/features/settings/settings-service";
import { SchoolSettings } from "@/contracts/schemas";

export const Header: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);

  // Inisialisasi tema dari preferensi sistem / localStorage & data sekolah
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }

    const loadSettings = () => {
      try {
        const settings = SettingsService.getSchoolSettings();
        setSchoolSettings(settings);
      } catch (e) {
        console.warn("Gagal memuat pengaturan sekolah di Header:", e);
      }
    };

    loadSettings();

    // Dengarkan event pembaruan pengaturan sekolah dari formulir maupun cloud
    window.addEventListener("smart-supervisi-data-synced", loadSettings);
    window.addEventListener("storage", loadSettings);

    return () => {
      window.removeEventListener("smart-supervisi-data-synced", loadSettings);
      window.removeEventListener("storage", loadSettings);
    };
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-surface/80 backdrop-blur-md border-b border-border select-none">
      {/* Kiri: Identitas Aplikasi Mobile & Info Semester */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pine-600 text-white flex items-center justify-center font-extrabold text-xs">
            SS
          </div>
          <span className="font-bold text-sm text-foreground">Smart Supervisi</span>
        </div>

        {/* Badge Semester Aktif */}
        <SemesterBadge semester={schoolSettings?.semester_aktif || "2026/2027 Ganjil"} />

        {/* Indikator Status Cloud Sync Multi-Device */}
        <CloudSyncIndicator />
      </div>

      {/* Kanan: Sakelar Tema & Profil Ringkas */}
      <div className="flex items-center gap-3">
        {/* Tombol Tema Terang/Gelap */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-muted hover:text-foreground rounded-control hover:bg-black/5 dark:hover:bg-white/5 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={isDarkMode ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
          title={isDarkMode ? "Mode Terang" : "Mode Gelap"}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Profil Mini Kepala Sekolah (Dinamis dari Identitas Satuan Pendidikan) */}
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {schoolSettings?.nama_kepala_sekolah?.charAt(0) || <UserCheck className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-left max-w-[200px]">
            <p className="text-xs font-semibold text-foreground leading-tight truncate">
              {schoolSettings?.nama_kepala_sekolah || "Dra. Juwariyah, M.Pd"}
            </p>
            <p className="text-[10px] text-muted leading-tight">Kepala Sekolah (Admin)</p>
          </div>
        </div>
      </div>
    </header>
  );
};

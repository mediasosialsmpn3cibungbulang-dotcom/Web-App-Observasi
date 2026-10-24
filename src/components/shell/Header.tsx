"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, UserCheck } from "lucide-react";
import { SemesterBadge } from "./SemesterBadge";

export const Header: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Inisialisasi tema dari preferensi sistem / localStorage
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
          <div className="w-8 h-8 rounded-control bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm font-serif">
            S
          </div>
          <span className="font-serif font-bold text-sm text-foreground">Smart Supervisi</span>
        </div>

        {/* Badge Semester Aktif */}
        <SemesterBadge semester="2026/2027 Ganjil" />
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

        {/* Profil Mini */}
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-foreground leading-tight">Dr. Hj. Rahmawati</p>
            <p className="text-[10px] text-muted leading-tight">Kepala Sekolah (Admin)</p>
          </div>
        </div>
      </div>
    </header>
  );
};

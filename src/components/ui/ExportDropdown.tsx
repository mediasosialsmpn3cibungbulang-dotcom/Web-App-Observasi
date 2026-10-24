"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { Button } from "./Button";

interface ExportDropdownProps {
  label?: string;
  onExportExcel: () => void;
  onExportCSV: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Komponen Dropdown Ekspor Data Profesional
 * Menyediakan opsi unduh Excel (.xlsx) rapi berkolom dan CSV (.csv) ramah regional
 */
export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  label = "Download Data",
  onExportExcel,
  onExportCSV,
  className,
  size = "md",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Deteksi klik di luar dropdown untuk menutup menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className || ""}`} ref={dropdownRef}>
      <Button
        type="button"
        variant="secondary"
        size={size}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Download className="w-4 h-4 text-pine-600 dark:text-pine-400" />
        <span>{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-72 rounded-xl bg-surface border border-border shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1.5 border-b border-border text-[11px] font-bold uppercase text-muted tracking-wider">
            Pilih Format Berkas
          </div>

          {/* Opsi 1: Microsoft Excel (.xlsx) */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onExportExcel();
            }}
            className="w-full text-left px-3.5 py-2.5 flex items-start gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0 mt-0.5">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-xs text-foreground group-hover:text-pine-600 transition-colors">
                  Microsoft Excel (.xlsx)
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  Rapi
                </span>
              </div>
              <p className="text-[11px] text-muted mt-0.5 leading-snug">
                Berkolom rapi, tidak tergabung koma, langsung siap cetak atau olah di Excel/WPS.
              </p>
            </div>
          </button>

          {/* Opsi 2: CSV Semicolon (.csv) */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onExportCSV();
            }}
            className="w-full text-left px-3.5 py-2.5 flex items-start gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-border shrink-0 mt-0.5">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-xs text-foreground group-hover:text-pine-600 transition-colors block">
                Teks CSV Standar (.csv)
              </span>
              <p className="text-[11px] text-muted mt-0.5 leading-snug">
                Pemisah titik-koma (;) UTF-8, kompatibel dengan sistem arsip dan analisis data.
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

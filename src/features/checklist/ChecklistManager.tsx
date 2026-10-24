"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Printer,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChecklistItem } from "@/contracts/schemas";
import { ChecklistService } from "./checklist-service";
import { SettingsService } from "../settings/settings-service";
import { ChecklistPrintModal } from "./ChecklistPrintModal";

export function ChecklistManager() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [faseFilter, setFaseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const refreshData = () => {
    setItems(ChecklistService.getChecklistItems());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleStatusChange = (
    item: ChecklistItem,
    newStatus: ChecklistItem["status"]
  ) => {
    const today = newStatus === "Selesai" ? new Date().toISOString().split("T")[0] : item.tanggal_deadline_aktual;
    ChecklistService.updateStatus(item.id, newStatus, today);
    refreshData();
  };

  const handleDateChange = (item: ChecklistItem, newDate: string) => {
    ChecklistService.updateStatus(item.id, item.status, newDate);
    refreshData();
  };

  const handleCatatanChange = (item: ChecklistItem, catatan: string) => {
    ChecklistService.updateStatus(item.id, item.status, item.tanggal_deadline_aktual, catatan);
    refreshData();
  };

  const handleReset = () => {
    if (confirm("Apakah Anda yakin ingin mengatur ulang status checklist semesteran ke default?")) {
      ChecklistService.resetToDefault();
      refreshData();
    }
  };

  const progress = ChecklistService.calculateProgress();
  const school = SettingsService.getSchoolSettings();

  // Ekstrak daftar fase unik
  const distinctFases = Array.from(new Set(items.map((i) => i.fase_nama)));

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.kegiatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nomor_kode.includes(searchQuery) ||
      item.dokumen_dihasilkan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pic_peran.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFase = faseFilter === "all" || item.fase_nama === faseFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesFase && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-foreground flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-pine-600 dark:text-pine-400" />
            Checklist 29 Kegiatan Supervisi Semesteran
          </h1>
          <p className="text-sm text-muted mt-1">
            Panduan operasional baku alur supervisi akademik dari persiapan awal hingga pelaporan akhir ke pengawas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="secondary" size="md" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Default
          </Button>
          <Button variant="primary" size="md" onClick={() => setIsPrintModalOpen(true)}>
            <Printer className="w-4 h-4 mr-2" />
            Cetak Lembar Checklist (A4)
          </Button>
        </div>
      </div>

      {/* Ringkasan Progres Bar */}
      <Panel className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Ketercapaian Kegiatan Semester Ini
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold font-mono text-foreground">
                {progress.percentage}%
              </span>
              <span className="text-xs text-muted">
                ({progress.selesai} selesai dari {progress.effectiveTotal} butir efektif)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300">
              {progress.selesai} Selesai
            </span>
            <span className="px-2.5 py-1 rounded-md bg-pine-50 text-pine-800 border border-pine-300 dark:bg-pine-950/40 dark:text-pine-300">
              {progress.berjalan} Berjalan
            </span>
            <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300">
              {progress.belum} Belum
            </span>
            {progress.tidakBerlaku > 0 && (
              <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300">
                {progress.tidakBerlaku} Tidak Berlaku
              </span>
            )}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-border h-3 rounded-full overflow-hidden">
          <div
            className="bg-pine-600 dark:bg-pine-400 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </Panel>

      {/* Bar Filter & Pencarian */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari butir kegiatan, kode, atau PIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-pine-500"
            />
          </div>

          <select
            value={faseFilter}
            onChange={(e) => setFaseFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-pine-500 max-w-[220px]"
          >
            <option value="all">Semua Fase Kegiatan</option>
            {distinctFases.map((fase) => (
              <option key={fase} value={fase}>
                {fase}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-pine-500"
          >
            <option value="all">Semua Status</option>
            <option value="Belum">Belum</option>
            <option value="Berjalan">Berjalan</option>
            <option value="Selesai">Selesai</option>
            <option value="Tidak Berlaku">Tidak Berlaku</option>
          </select>
        </div>

        <p className="text-xs text-muted self-end md:self-center">
          Menampilkan {filteredItems.length} dari {items.length} butir
        </p>
      </div>

      {/* Tabel 29 Butir Kegiatan */}
      <Panel title="Daftar 29 Butir Kegiatan Supervisi Akademik Baku">
        <div className="overflow-x-auto -mx-4 md:-mx-6">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-border text-xs uppercase text-muted tracking-wider">
              <tr>
                <th className="py-3 px-3 md:px-4 text-center w-12">Kode</th>
                <th className="py-3 px-4">Kegiatan & Fase Pelaksanaan</th>
                <th className="py-3 px-4">Dokumen Fisik / Output</th>
                <th className="py-3 px-4">PIC & Estimasi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Tanggal Aktual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                    item.status === "Selesai" ? "bg-emerald-50/20 dark:bg-emerald-950/10" : ""
                  }`}
                >
                  {/* Kode */}
                  <td className="py-3.5 px-3 md:px-4 text-center font-mono font-bold text-xs align-top">
                    {item.nomor_kode}
                  </td>

                  {/* Kegiatan & Fase */}
                  <td className="py-3.5 px-4 align-top max-w-[300px]">
                    <p className="font-semibold text-foreground text-xs leading-relaxed">
                      {item.kegiatan}
                    </p>
                    <span className="text-[10px] text-muted block mt-1">
                      {item.fase_nama} • Tenggat: {item.deadline_deskripsi}
                    </span>
                  </td>

                  {/* Dokumen Dihasilkan */}
                  <td className="py-3.5 px-4 align-top max-w-[200px]">
                    <p className="text-xs text-muted leading-relaxed">
                      {item.dokumen_dihasilkan}
                    </p>
                  </td>

                  {/* PIC & Durasi */}
                  <td className="py-3.5 px-4 align-top text-xs whitespace-nowrap">
                    <p className="font-semibold text-foreground">{item.pic_peran}</p>
                    <p className="text-[10px] text-muted mt-0.5">{item.durasi_estimasi}</p>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4 align-top">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item, e.target.value as ChecklistItem["status"])
                      }
                      className={`text-xs font-semibold px-2 py-1 rounded border focus:outline-none focus:ring-1 focus:ring-pine-500 ${
                        item.status === "Selesai"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700"
                          : item.status === "Berjalan"
                          ? "bg-pine-50 text-pine-800 border-pine-300 dark:bg-pine-950/40 dark:text-pine-300 dark:border-pine-700"
                          : item.status === "Tidak Berlaku"
                          ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700"
                          : "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                      }`}
                    >
                      <option value="Belum">Belum</option>
                      <option value="Berjalan">Berjalan</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Tidak Berlaku">Tidak Berlaku</option>
                    </select>
                  </td>

                  {/* Tanggal Realisasi */}
                  <td className="py-3.5 px-4 align-top">
                    <input
                      type="date"
                      value={item.tanggal_deadline_aktual || ""}
                      onChange={(e) => handleDateChange(item, e.target.value)}
                      className="text-xs p-1 rounded border border-border bg-card text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-pine-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Modal Cetak Checklist */}
      {isPrintModalOpen && (
        <ChecklistPrintModal
          isOpen={true}
          items={items}
          school={school}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarDays,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  Filter,
} from "lucide-react";
import { Schedule } from "@/contracts/schemas";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScheduleService, ScheduleWithDetails } from "./schedule-service";
import { ScheduleFormModal } from "./ScheduleFormModal";
import { formatTanggalIndonesia } from "@/lib/utils";

export const ScheduleList: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [filterGelombang, setFilterGelombang] = useState<string>("Semua");
  const [filterMissedOnly, setFilterMissedOnly] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const loadData = () => {
    setSchedules(ScheduleService.getSchedulesWithDetails());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return schedules.filter((s) => {
      if (filterGelombang !== "Semua" && s.gelombang !== filterGelombang) {
        return false;
      }
      if (filterMissedOnly && !s.isMissed) {
        return false;
      }
      return true;
    });
  }, [schedules, filterGelombang, filterMissedOnly]);

  const handleSave = (data: Omit<Schedule, "id" | "created_at" | "version">) => {
    if (editingSchedule) {
      ScheduleService.updateSchedule(editingSchedule.id, data);
    } else {
      ScheduleService.createSchedule(data);
    }
    loadData();
  };

  const handleDelete = (s: ScheduleWithDetails) => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus jadwal supervisi untuk ${s.teacher.nama_lengkap}?`
      )
    ) {
      ScheduleService.deleteSchedule(s.id);
      loadData();
    }
  };

  const missedCount = schedules.filter((s) => s.isMissed).length;

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-foreground">
            Jadwal Supervisi Akademik
          </h1>
          <p className="text-sm text-muted mt-1">
            Matriks rencana dan realisasi supervisi gelombang 1 (Prioritas) dan gelombang 2 (Reguler).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setEditingSchedule(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Rencana Jadwal
          </Button>
        </div>
      </div>

      {/* Banner Perhatian Jadwal Terlewat */}
      {missedCount > 0 && (
        <div className="p-3.5 rounded-control bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs md:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>
              Terdapat <strong>{missedCount} jadwal observasi</strong> yang telah melewati tanggal rencana dan belum terealisasi.
            </span>
          </div>
          <button
            onClick={() => setFilterMissedOnly(!filterMissedOnly)}
            className="text-xs font-semibold underline hover:no-underline ml-2"
          >
            {filterMissedOnly ? "Tampilkan Semua" : "Saring yang Terlewat"}
          </button>
        </div>
      )}

      {/* Filter Gelombang & Tampilan */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {["Semua", "1 Prioritas", "2 Reguler"].map((gel) => (
          <button
            key={gel}
            onClick={() => setFilterGelombang(gel)}
            className={`px-3 py-1.5 rounded-control font-medium border transition-smooth whitespace-nowrap ${
              filterGelombang === gel
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-surface text-foreground border-border hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {gel === "Semua" ? "Semua Gelombang" : `Gelombang ${gel}`}
          </button>
        ))}
      </div>

      {/* Matriks Jadwal */}
      <Panel>
        <div className="overflow-x-auto -mx-4 md:-mx-6">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-border text-xs uppercase text-muted tracking-wider">
              <tr>
                <th className="py-3 px-4 md:px-6">Guru Sasaran</th>
                <th className="py-3 px-4">Gelombang</th>
                <th className="py-3 px-4">Rencana Pra-Obs</th>
                <th className="py-3 px-4">Rencana Observasi</th>
                <th className="py-3 px-4">Rencana Coaching</th>
                <th className="py-3 px-4">Realisasi 3 Tahap</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted">
                    Tidak ada jadwal yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                      s.isMissed ? "bg-rose-50/40 dark:bg-rose-950/20" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 md:px-6">
                      <p className="font-semibold text-foreground leading-tight">
                        {s.teacher.nama_lengkap}
                      </p>
                      <p className="text-xs text-muted mt-0.5">{s.teacher.mata_pelajaran}</p>
                      {s.warnings.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                          <span>{s.warnings[0]}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-xs border border-border bg-black/5 dark:bg-white/5 whitespace-nowrap">
                        {s.gelombang}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono">
                      {formatTanggalIndonesia(s.rencana_pra_observasi)}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono font-semibold text-primary">
                      {formatTanggalIndonesia(s.rencana_observasi)}
                      {s.isMissed && (
                        <span className="block text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-0.5">
                          TERLEWAT (BR-12)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono">
                      {formatTanggalIndonesia(s.rencana_coaching)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            s.realisasiPraObs
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                          }`}
                          title={s.realisasiPraObs ? "Pra-Obs Selesai" : "Pra-Obs Belum"}
                        >
                          P
                        </span>
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            s.realisasiObs
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                          }`}
                          title={s.realisasiObs ? "Observasi Selesai" : "Observasi Belum"}
                        >
                          O
                        </span>
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            s.realisasiCoaching
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                          }`}
                          title={s.realisasiCoaching ? "Coaching Selesai" : "Coaching Belum"}
                        >
                          C
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingSchedule(s);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit className="w-3.5 h-3.5 text-muted hover:text-foreground" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(s)}>
                          <Trash2 className="w-3.5 h-3.5 text-rose-500 hover:text-rose-700" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <ScheduleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingSchedule}
      />
    </div>
  );
};

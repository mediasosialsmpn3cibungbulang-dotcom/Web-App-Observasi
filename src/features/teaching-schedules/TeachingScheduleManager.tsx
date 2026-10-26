"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarDays,
  Plus,
  RotateCcw,
  Search,
  Clock,
  BookOpen,
  Edit2,
  Trash2,
  CheckCircle2,
  Layers,
  GraduationCap,
  Sparkles,
  Download,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { DayName, TeachingSlot, TeacherSchedule } from "@/contracts/teaching-schedules";
import { Teacher } from "@/contracts/schemas";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TeacherService } from "../teachers/teacher-service";
import { TeachingScheduleService } from "./teaching-schedule-service";
import { TeachingSlotModal } from "./TeachingSlotModal";

const DAYS_LIST: DayName[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

export const TeachingScheduleManager: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allSchedules, setAllSchedules] = useState<Record<string, TeacherSchedule>>({});

  // Modal State
  const [isSlotModalOpen, setIsSlotModalOpen] = useState<boolean>(false);
  const [editingSlot, setEditingSlot] = useState<TeachingSlot | null>(null);
  const [activeDayForNewSlot, setActiveDayForNewSlot] = useState<DayName>("Senin");
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Muat data awal
  const loadData = () => {
    const teacherList = TeacherService.getTeachers().filter((t) => t.aktif);
    setTeachers(teacherList);

    const schedules = TeachingScheduleService.getAllSchedules();
    setAllSchedules(schedules);

    // Set guru default jika belum ada yang dipilih
    if (teacherList.length > 0 && !selectedTeacherId) {
      setSelectedTeacherId(teacherList[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Notifikasi otomatis hilang setelah 4 detik
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Saring daftar guru berdasarkan kata kunci pencarian
  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teachers;
    const q = searchQuery.toLowerCase();
    return teachers.filter(
      (t) =>
        t.nama_lengkap.toLowerCase().includes(q) ||
        t.mata_pelajaran.toLowerCase().includes(q) ||
        t.nip_nuptk.includes(q)
    );
  }, [teachers, searchQuery]);

  // Guru yang sedang aktif dipilih
  const currentTeacher = useMemo(() => {
    return teachers.find((t) => t.id === selectedTeacherId) || teachers[0] || null;
  }, [teachers, selectedTeacherId]);

  // Jadwal guru aktif
  const currentSchedule = useMemo(() => {
    if (!currentTeacher) return null;
    return (
      allSchedules[currentTeacher.id] || {
        teacher_id: currentTeacher.id,
        nama_lengkap: currentTeacher.nama_lengkap,
        slots: [],
      }
    );
  }, [allSchedules, currentTeacher]);

  // Statistik KBM sekolah
  const stats = useMemo(() => {
    return TeachingScheduleService.getStatistics();
  }, [allSchedules]);

  // Handler simpan slot (tambah / ubah)
  const handleSaveSlot = (slotData: Omit<TeachingSlot, "id">, slotId?: string) => {
    if (!currentTeacher) return;

    try {
      if (slotId) {
        TeachingScheduleService.updateSlot(currentTeacher.id, slotId, slotData);
        setNotification({
          type: "success",
          text: `Slot hari ${slotData.hari} (${slotData.waktu}) berhasil diperbarui.`,
        });
      } else {
        TeachingScheduleService.addSlot(currentTeacher.id, slotData, currentTeacher.nama_lengkap);
        setNotification({
          type: "success",
          text: `Slot baru hari ${slotData.hari} (${slotData.waktu}) berhasil ditambahkan.`,
        });
      }
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan slot jadwal.";
      setNotification({ type: "error", text: msg });
    }
  };

  // Handler hapus slot
  const handleDeleteSlot = (slot: TeachingSlot) => {
    if (!currentTeacher) return;
    if (
      window.confirm(
        `Hapus slot mengajar hari ${slot.hari} jam ${slot.waktu} (Kelas ${slot.kelas}) untuk ${currentTeacher.nama_lengkap}?`
      )
    ) {
      TeachingScheduleService.deleteSlot(currentTeacher.id, slot.id);
      loadData();
      setNotification({
        type: "success",
        text: `Slot hari ${slot.hari} berhasil dihapus.`,
      });
    }
  };

  // Handler reset ke default aSc Timetables
  const handleResetToDefault = (targetTeacherOnly: boolean = true) => {
    if (targetTeacherOnly && currentTeacher) {
      if (
        window.confirm(
          `Kembalikan jadwal mengajar ${currentTeacher.nama_lengkap} ke jadwal bawaan resmi aSc Timetables? Perubahan manual pada guru ini akan diganti.`
        )
      ) {
        TeachingScheduleService.resetToDefault(currentTeacher.id);
        loadData();
        setNotification({
          type: "success",
          text: `Jadwal ${currentTeacher.nama_lengkap} berhasil dikembalikan ke default aSc.`,
        });
      }
    } else {
      if (
        window.confirm(
          "PERINGATAN: Apakah Anda yakin ingin me-reset SELURUH jadwal mengajar 26 guru ke data resmi aSc Timetables bawaan sekolah?"
        )
      ) {
        TeachingScheduleService.resetToDefault();
        loadData();
        setNotification({
          type: "success",
          text: "Seluruh jadwal mengajar 26 guru berhasil di-reset ke data resmi aSc Timetables.",
        });
      }
    }
  };

  // Ekspor jadwal ke format JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allSchedules, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `jadwal_mengajar_guru_smpn3_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setNotification({
      type: "success",
      text: "Data jadwal mengajar berhasil diekspor ke file JSON.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Jadwal Mengajar Guru
            </h1>
            <Badge variant="default" className="text-xs">
              KBM Riil Sekolah
            </Badge>
          </div>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Kelola jam pelajaran dan kelas mengajar mingguan guru (Senin s.d. Jumat). Jadwal ini menjadi acuan mutlak penetapan tanggal dan jam observasi supervisi kelas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportJSON}
            title="Cadangkan data jadwal ke file JSON"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Ekspor JSON
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleResetToDefault(false)}
            title="Reset seluruh jadwal 26 guru ke setelan resmi aSc"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reset Semua aSc
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setEditingSlot(null);
              setActiveDayForNewSlot("Senin");
              setIsSlotModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Slot Mengajar
          </Button>
        </div>
      </div>

      {/* Banner Notifikasi */}
      {notification && (
        <div
          className={`p-3.5 rounded-control text-xs md:text-sm font-medium flex items-center justify-between animate-fadeIn ${
            notification.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs opacity-75 hover:opacity-100 ml-3"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Kartu Ringkasan Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Panel className="p-4 border-l-4 border-l-primary">
          <div className="text-xs font-semibold uppercase text-muted">Guru Terjadwal</div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">
            {stats.totalGuruTerjadwal} <span className="text-xs font-sans text-muted">/ {teachers.length} Guru</span>
          </div>
          <div className="text-[11px] text-muted mt-1">Memiliki slot mengajar aktif</div>
        </Panel>

        <Panel className="p-4 border-l-4 border-l-sky-500">
          <div className="text-xs font-semibold uppercase text-muted">Total Jam Pelajaran</div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">
            {stats.totalJamPelajaran} <span className="text-xs font-sans text-muted">Slot JP</span>
          </div>
          <div className="text-[11px] text-muted mt-1">Tersebar di seluruh kelas 7, 8, 9</div>
        </Panel>

        <Panel className="p-4 border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase text-muted">Rata-rata Beban Mengajar</div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">
            {stats.rataRataJamPerGuru} <span className="text-xs font-sans text-muted">JP / Guru</span>
          </div>
          <div className="text-[11px] text-muted mt-1">Beban mengajar mingguan</div>
        </Panel>

        <Panel className="p-4 border-l-4 border-l-amber-500">
          <div className="text-xs font-semibold uppercase text-muted">Sebaran Hari Sekolah</div>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px] font-mono">
            {DAYS_LIST.map((d) => (
              <span key={d} className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-border">
                {d.substring(0, 3)}: <strong>{stats.distribusiHari[d]}</strong>
              </span>
            ))}
          </div>
        </Panel>
      </div>

      {/* Konten Utama: Kolom Kiri Pilihan Guru & Kolom Kanan Jadwal Mingguan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Navigasi Daftar Guru (4 Kolom) */}
        <div className="lg:col-span-4 space-y-3">
          <Panel className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Pilih Guru Sasaran ({filteredTeachers.length})
              </span>
              <span className="text-[11px] text-muted">Klik nama guru</span>
            </div>

            {/* Input Pencarian Guru */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama guru atau mata pelajaran..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              />
            </div>

            {/* List Guru */}
            <div className="max-h-[550px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-border/40">
              {filteredTeachers.map((t) => {
                const isSelected = t.id === selectedTeacherId;
                const teacherSch = allSchedules[t.id];
                const slotCount = teacherSch?.slots.length || 0;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTeacherId(t.id)}
                    className={`w-full text-left p-2.5 rounded-control transition-all flex items-start justify-between gap-2 pt-2.5 ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                        : "hover:bg-black/5 dark:hover:bg-white/5 text-foreground"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate leading-tight">
                        {t.nama_lengkap}
                      </div>
                      <div
                        className={`text-[11px] truncate mt-0.5 ${
                          isSelected ? "text-primary-foreground/90" : "text-muted"
                        }`}
                      >
                        {t.mata_pelajaran} • {t.status_kepegawaian}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold flex-shrink-0 ${
                        isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : slotCount > 0
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-black/5 dark:bg-white/5 text-muted"
                      }`}
                    >
                      {slotCount} JP
                    </span>
                  </button>
                );
              })}

              {filteredTeachers.length === 0 && (
                <div className="py-6 text-center text-xs text-muted">
                  Tidak ada guru yang cocok dengan pencarian.
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* Kolom Kanan: Jadwal Mingguan Guru Terpilih (8 Kolom) */}
        <div className="lg:col-span-8 space-y-4">
          {currentTeacher && (
            <Panel className="p-4 md:p-6 space-y-5">
              {/* Profil Singkat Guru Aktif */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg md:text-xl font-bold font-serif text-foreground">
                      {currentTeacher.nama_lengkap}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                      {currentTeacher.mata_pelajaran}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    NIP/NUPTK: {currentTeacher.nip_nuptk} • Status: {currentTeacher.status_kepegawaian} • Fase {currentTeacher.fase}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResetToDefault(true)}
                    title="Kembalikan jadwal guru ini ke data aSc bawaan"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    Reset Guru Ini
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setEditingSlot(null);
                      setActiveDayForNewSlot("Senin");
                      setIsSlotModalOpen(true);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Tambah Slot
                  </Button>
                </div>
              </div>

              {/* Tabel Jadwal Mingguan 5 Hari (Senin s.d. Jumat) */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {DAYS_LIST.map((day) => {
                  const daySlots = (currentSchedule?.slots || []).filter((s) => s.hari === day);

                  return (
                    <div
                      key={day}
                      className="flex flex-col rounded-control border border-border bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden"
                    >
                      {/* Header Hari */}
                      <div className="p-2.5 bg-black/5 dark:bg-white/5 border-b border-border flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground font-serif">
                          {day}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-surface border border-border text-muted">
                          {daySlots.length} JP
                        </span>
                      </div>

                      {/* Konten Slot Mengajar Hari Ini */}
                      <div className="p-2 space-y-2 flex-1 min-h-[160px] flex flex-col justify-between">
                        <div className="space-y-2">
                          {daySlots.map((slot) => (
                            <div
                              key={slot.id}
                              className="p-2 rounded-control bg-surface border border-border shadow-2xs hover:shadow-xs transition-shadow space-y-1 group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-primary font-mono">
                                  {slot.jam_ke || "KBM"}
                                </span>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSlot(slot);
                                      setIsSlotModalOpen(true);
                                    }}
                                    className="p-0.5 text-muted hover:text-foreground"
                                    title="Ubah slot"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSlot(slot)}
                                    className="p-0.5 text-rose-500 hover:text-rose-700"
                                    title="Hapus slot"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              <div className="text-[11px] font-mono font-semibold text-foreground">
                                {slot.waktu}
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
                                <span className="font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                                  Kelas {slot.kelas}
                                </span>
                                <span className="text-[10px] text-muted truncate max-w-[90px]" title={slot.mata_pelajaran}>
                                  {slot.mata_pelajaran}
                                </span>
                              </div>
                            </div>
                          ))}

                          {daySlots.length === 0 && (
                            <div className="py-8 text-center text-[11px] text-muted italic">
                              Tidak ada jadwal mengajar
                            </div>
                          )}
                        </div>

                        {/* Tombol Tambah Slot Cepat di Hari Ini */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSlot(null);
                            setActiveDayForNewSlot(day);
                            setIsSlotModalOpen(true);
                          }}
                          className="w-full mt-2 py-1.5 px-2 text-[11px] font-medium text-muted hover:text-primary rounded border border-dashed border-border hover:border-primary/50 transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Tambah {day}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Catatan Keterangan Sistem */}
              <div className="p-3.5 rounded-control bg-primary/5 border border-primary/20 text-xs text-muted space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Keterangan Sinkronisasi Otomatis:
                </div>
                <p className="text-[11px] leading-relaxed">
                  Perubahan slot mengajar yang Anda simpan di halaman ini akan secara otomatis terhubung langsung ke formulir penetapan <strong>Jadwal Supervisi</strong>. Pilihan tanggal dan jam observasi hanya dapat diambil dari slot mengajar aktif yang tertera di atas.
                </p>
              </div>
            </Panel>
          )}
        </div>
      </div>

      {/* Modal Tambah / Ubah Slot */}
      {currentTeacher && (
        <TeachingSlotModal
          isOpen={isSlotModalOpen}
          onClose={() => {
            setIsSlotModalOpen(false);
            setEditingSlot(null);
          }}
          onSave={handleSaveSlot}
          initialSlot={editingSlot}
          teacherName={currentTeacher.nama_lengkap}
          defaultMapel={currentTeacher.mata_pelajaran}
          defaultDay={activeDayForNewSlot}
        />
      )}
    </div>
  );
};
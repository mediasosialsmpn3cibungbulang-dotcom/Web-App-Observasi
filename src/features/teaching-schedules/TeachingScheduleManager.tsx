"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  User,
  X,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import { DayName, TeachingSlot, TeacherSchedule, calculateSlotJP, getTeacherTotalJP } from "@/contracts/teaching-schedules";
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
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState<boolean>(false);
  const [allSchedules, setAllSchedules] = useState<Record<string, TeacherSchedule>>({});

  // Modal State
  const [isSlotModalOpen, setIsSlotModalOpen] = useState<boolean>(false);
  const [editingSlot, setEditingSlot] = useState<TeachingSlot | null>(null);
  const [activeDayForNewSlot, setActiveDayForNewSlot] = useState<DayName>("Senin");
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Muat data awal
  const loadData = () => {
    const teacherList = TeacherService.getTeachers().filter((t) => t.aktif);
    setTeachers(teacherList);

    const schedules = TeachingScheduleService.getAllSchedules();
    setAllSchedules(schedules);
  };

  useEffect(() => {
    loadData();
    const handleRefresh = () => loadData();
    window.addEventListener("storage", handleRefresh);
    window.addEventListener("smart-supervisi-data-synced", handleRefresh);
    window.addEventListener("focus", handleRefresh);
    return () => {
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener("smart-supervisi-data-synced", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
    };
  }, []);

  // Tutup dropdown pencarian saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    if (!selectedTeacherId) return null;
    return teachers.find((t) => t.id === selectedTeacherId) || null;
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

  // Total guru terdaftar (penyebut akurat)
  const totalGuruCount = Math.max(stats.totalGuruTerjadwal, teachers.length);

  // Handler memilih guru dari pencarian
  const handleSelectTeacher = (teacher: Teacher) => {
    setSelectedTeacherId(teacher.id);
    setSearchQuery(teacher.nama_lengkap);
    setIsSearchDropdownOpen(false);
  };

  // Handler reset pencarian / ganti guru
  const handleClearTeacher = () => {
    setSelectedTeacherId(null);
    setSearchQuery("");
    setIsSearchDropdownOpen(true);
  };

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
            {stats.totalGuruTerjadwal} <span className="text-xs font-sans text-muted">/ {totalGuruCount} Guru</span>
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

      {/* CARD TUNGGAL UTAMA (SINGLE CARD FULL WIDTH) */}
      <Panel className="p-4 md:p-6 space-y-6 shadow-sm">
        {/* Bilah Pencarian Guru Terpadu (Search Bar Interaktif) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted">
            Cari Guru Sasaran
          </label>
          <div ref={searchContainerRef} className="relative max-w-2xl">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-3.5 text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchDropdownOpen(true);
                  // Jika teks dihapus manual, kosongkan pilihan guru
                  if (!e.target.value.trim()) {
                    setSelectedTeacherId(null);
                  }
                }}
                placeholder="Ketik nama guru atau mata pelajaran (contoh: Lilis, Matematika, Acip)..."
                className="w-full pl-11 pr-10 py-3 text-sm rounded-xl border border-border bg-surface text-foreground font-medium shadow-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearTeacher}
                  className="absolute right-3 p-1 rounded-full text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  title="Bersihkan pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown Floating Hasil Pencarian */}
            {isSearchDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-30 max-h-72 overflow-y-auto rounded-xl bg-surface border border-border shadow-2xl divide-y divide-border/40 animate-fadeIn">
                {filteredTeachers.map((t) => {
                  const isSelected = t.id === selectedTeacherId;
                  const teacherSch = allSchedules[t.id];
                  const totalJP = getTeacherTotalJP(t.id, teacherSch);

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTeacher(t)}
                      className={`w-full text-left p-3 transition-colors flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-black/5 dark:hover:bg-white/5 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {t.nama_lengkap.charAt(0)}
                        </div>
                        <div className="truncate">
                          <div className="text-sm font-bold truncate leading-tight text-foreground">
                            {t.nama_lengkap}
                          </div>
                          <div className="text-xs text-muted truncate mt-0.5">
                            {t.mata_pelajaran} • {t.status_kepegawaian} • NIP: {t.nip_nuptk}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                        {totalJP} JP
                      </span>
                    </button>
                  );
                })}

                {filteredTeachers.length === 0 && (
                  <div className="p-6 text-center text-xs text-muted">
                    Tidak ditemukan guru dengan kata kunci &quot;{searchQuery}&quot;.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rekomendasi Pintas / Guru Cepat Saat Belum Memilih */}
          {!currentTeacher && teachers.length > 0 && (
            <div className="pt-2 flex items-center gap-1.5 flex-wrap text-xs text-muted">
              <span className="text-[11px] font-semibold text-foreground">Pilihan cepat:</span>
              {teachers.slice(0, 6).map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => handleSelectTeacher(t)}
                  className="px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-border hover:border-primary/50 hover:bg-primary/5 text-foreground text-[11px] transition-colors"
                >
                  {t.nama_lengkap}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* KONTEN JADWAL (HANYA MUNCUL JIKA GURU SUDAH DIPILIH / DICARI) */}
        {currentTeacher ? (
          <div className="space-y-5 pt-4 border-t border-border animate-fadeIn">
            {/* Header Informasi Guru Terpilih */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-border">
              <div className="flex items-start md:items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-lg shadow-sm flex-shrink-0">
                  {currentTeacher.nama_lengkap.charAt(0)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-bold font-serif text-foreground">
                      {currentTeacher.nama_lengkap}
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
                      {currentTeacher.mata_pelajaran}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                      Beban Mengajar: {getTeacherTotalJP(currentTeacher.id, currentSchedule)} JP / Minggu
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-muted font-medium border border-border">
                      {currentTeacher.status_kepegawaian}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    NIP/NUPTK: <span className="font-mono text-foreground font-semibold">{currentTeacher.nip_nuptk}</span> • Kelas Diampu: {currentTeacher.kelas_diampu} • Fase {currentTeacher.fase}
                  </p>
                </div>
              </div>

              {/* Aksi Guru */}
              <div className="flex items-center gap-2 self-end md:self-center">
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
                  Tambah Slot Mengajar
                </Button>
              </div>
            </div>

            {/* TABEL JADWAL MINGGUAN 5 HARI (SENIN S.D. JUMAT) - LEBAR PENUH & LEGA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {DAYS_LIST.map((day) => {
                const daySlots = (currentSchedule?.slots || []).filter((s) => s.hari === day);
                const dayJP = daySlots.reduce((acc, s) => acc + calculateSlotJP(s), 0);

                return (
                  <div
                    key={day}
                    className="flex flex-col rounded-xl border border-border bg-slate-50/60 dark:bg-slate-900/30 overflow-hidden shadow-2xs"
                  >
                    {/* Header Hari */}
                    <div className="p-3 bg-black/5 dark:bg-white/5 border-b border-border flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground font-serif">
                        {day}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-surface border border-border text-muted">
                        {dayJP} JP
                      </span>
                    </div>

                    {/* Konten Slot Mengajar Hari Ini */}
                    <div className="p-2.5 space-y-2.5 flex-1 min-h-[220px] flex flex-col justify-between">
                      <div className="space-y-2.5">
                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="p-3 rounded-xl bg-surface border border-border shadow-2xs hover:shadow-sm transition-all space-y-1.5 group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-primary font-mono">
                                  {slot.jam_ke || "KBM"}
                                </span>
                                <span className="text-[10px] font-semibold text-muted bg-black/5 dark:bg-white/5 px-1 rounded">
                                  {calculateSlotJP(slot)} JP
                                </span>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSlot(slot);
                                    setIsSlotModalOpen(true);
                                  }}
                                  className="p-1 text-muted hover:text-foreground rounded hover:bg-black/5"
                                  title="Ubah slot"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSlot(slot)}
                                  className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                  title="Hapus slot"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="text-xs font-mono font-semibold text-foreground">
                              {slot.waktu}
                            </div>

                            <div className="flex items-center justify-between pt-1.5 border-t border-border/50 text-xs">
                              <span className="font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                                Kelas {slot.kelas}
                              </span>
                              <span className="text-[11px] text-muted truncate max-w-[100px]" title={slot.mata_pelajaran}>
                                {slot.mata_pelajaran}
                              </span>
                            </div>
                          </div>
                        ))}

                        {daySlots.length === 0 && (
                          <div className="py-12 text-center text-xs text-muted italic">
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
                        className="w-full mt-2 py-2 px-2 text-xs font-semibold text-muted hover:text-primary rounded-lg border border-dashed border-border hover:border-primary/50 transition-colors flex items-center justify-center gap-1 bg-surface/50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah {day}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Catatan Keterangan Sistem */}
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Sinkronisasi Otomatis ke Jadwal Supervisi:
              </div>
              <p className="text-[11px] leading-relaxed">
                Slot mengajar <strong>{currentTeacher.nama_lengkap}</strong> di atas secara otomatis terhubung langsung ke formulir penetapan <strong>Jadwal Supervisi</strong>. Pilihan tanggal dan jam observasi hanya dapat diambil dari hari dan jam mengajar yang tertera di atas.
              </p>
            </div>
          </div>
        ) : (
          /* EMPTY STATE KETIKA BELUM ADA GURU YANG DICARI / DIPILIH */
          <div className="py-16 text-center space-y-3.5 border-t border-border">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center shadow-xs">
              <Search className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-foreground font-serif">
                Cari Guru untuk Menampilkan Jadwal Mengajar
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Ketik nama guru atau mata pelajaran pada kolom pencarian di atas untuk melihat, menambah, atau mengubah jam pelajaran KBM mingguan guru tersebut.
              </p>
            </div>
          </div>
        )}
      </Panel>

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
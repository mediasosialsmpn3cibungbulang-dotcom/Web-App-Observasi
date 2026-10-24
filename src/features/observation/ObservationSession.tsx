"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  GraduationCap,
  Save,
  CheckCircle2,
  Clock,
  Plus,
  AlertCircle,
  Lock,
  Unlock,
  Printer,
  FileText,
  Trash2,
  Info,
  Calendar,
  Users,
  Layers,
  ChevronRight,
  Eye,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import {
  Observation,
  ObservationScoreItem,
  FactNote,
  Teacher,
  SchoolSettings,
} from "@/contracts/schemas";
import { AspectCode, ASPECT_NAMES } from "@/contracts/enums";
import { SEED_INDICATORS } from "@/contracts/seed-data";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScoreSelector } from "@/components/ui/ScoreSelector";
import {
  ObservationService,
  ObservationCalculationResult,
} from "./observation-service";
import { ObservationPrintModal } from "./ObservationPrintModal";
import { ObservationUnlockModal } from "./ObservationUnlockModal";
import { TeacherService } from "../teachers/teacher-service";
import { SettingsService } from "../settings/settings-service";

export const ObservationSession: React.FC = () => {
  // State data referensi dan pengaturan
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedSesiKe, setSelectedSesiKe] = useState<number>(1);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);

  // State observasi aktif dan instrumen
  const [observation, setObservation] = useState<Observation | null>(null);
  const [scoreItems, setScoreItems] = useState<ObservationScoreItem[]>([]);
  const [factNotes, setFactNotes] = useState<FactNote[]>([]);

  // State navigasi dan alur kerja (Anti-Tabrakan)
  const [activeAspect, setActiveAspect] = useState<AspectCode>("A");
  const [activeTab, setActiveTab] = useState<"rubrik" | "fakta">("rubrik");
  const [isSplitView, setIsSplitView] = useState<boolean>(false);

  // State stopwatch waktu observasi
  const [timerMinutes, setTimerMinutes] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // State formulir catatan fakta baru
  const [factInput, setFactInput] = useState<string>("");
  const [verbatimInput, setVerbatimInput] = useState<string>("");
  const [studentResponseInput, setStudentResponseInput] = useState<string>("");
  const [linkedIndicatorInput, setLinkedIndicatorInput] = useState<string>("");

  // State modal dialog dan notifikasi
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState<boolean>(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Inisialisasi data guru dan pengaturan sekolah
  useEffect(() => {
    const list = TeacherService.getTeachers().filter((t) => t.aktif);
    setTeachers(list);
    const school = SettingsService.getSchoolSettings();
    setSchoolSettings(school);

    if (list.length > 0) {
      setSelectedTeacherId(list[0].id);
      loadObservation(list[0].id, school.semester_aktif, 1);
    }
  }, []);

  // Interval timer waktu pengamatan kelas (menit ke-n)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerMinutes((prev) => prev + 1);
      }, 60000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  /**
   * Memuat data sesi observasi berdasarkan guru, semester, dan nomor sesi.
   * Jika sesi belum dibuat, draf baru otomatis diinisialisasi.
   */
  const loadObservation = (teacherId: string, semester: string, sesiKe: number) => {
    let existing = ObservationService.getObservationByTeacherSemesterAndSession(
      teacherId,
      semester,
      sesiKe
    );

    if (!existing) {
      const teacher = TeacherService.getTeacherById(teacherId);
      existing = ObservationService.createObservationSession(teacherId, semester, sesiKe, {
        kelas: teacher ? teacher.kelas_diampu : "X-A",
        jumlah_siswa_hadir: 32,
      });
    }

    setObservation(existing);
    setScoreItems(ObservationService.getAllScores(existing.id));
    setFactNotes(ObservationService.getAllFactNotes(existing.id));
  };

  /**
   * Menangani penggantian guru yang diamati
   */
  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    setSelectedSesiKe(1);
    if (schoolSettings) {
      loadObservation(teacherId, schoolSettings.semester_aktif, 1);
    }
  };

  /**
   * Menangani perpindahan nomor sesi (Sesi 1, Sesi 2, Sesi 3)
   */
  const handleSesiChange = (sesiKe: number) => {
    setSelectedSesiKe(sesiKe);
    if (schoolSettings && selectedTeacherId) {
      loadObservation(selectedTeacherId, schoolSettings.semester_aktif, sesiKe);
    }
  };

  /**
   * Menangani pembaruan metadata sesi observasi (kelas, jumlah siswa, jam, tanggal)
   */
  const handleMetadataChange = (field: keyof Observation, value: any) => {
    if (!observation || observation.is_locked) return;

    const updated: Observation = {
      ...observation,
      [field]: value,
    };

    setObservation(updated);
    ObservationService.saveObservation(updated);

    setSaveBanner(
      `Informasi sesi tersimpan (${new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })})`
    );
    setTimeout(() => setSaveBanner(null), 2500);
  };

  // Kalkulasi metrik observasi secara reaktif (BR-01 s.d. BR-04)
  const metrics: ObservationCalculationResult = useMemo(() => {
    return ObservationService.calculateObservationMetrics(scoreItems);
  }, [scoreItems]);

  /**
   * Menangani perubahan skor indikator rubrik (1 s.d. 4)
   */
  const handleScoreChange = (kode_indikator: string, skor: number) => {
    if (!observation || observation.is_locked) return;

    const existingIndex = scoreItems.findIndex((s) => s.kode_indikator === kode_indikator);
    const updated = [...scoreItems];

    if (existingIndex >= 0) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        skor,
      };
    } else {
      const ind = SEED_INDICATORS.find((i) => i.kode === kode_indikator);
      updated.push({
        observation_id: observation.id,
        kode_indikator,
        skor,
        bukti_nyata: `Teramati guru menerapkan ${ind?.pernyataan.slice(0, 35)}...`,
        catatan: "",
      });
    }

    setScoreItems(updated);
    ObservationService.saveScoreItem(
      updated.find((s) => s.kode_indikator === kode_indikator)!
    );

    setSaveBanner(
      `Skor tersimpan di perangkat (${new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })})`
    );
    setTimeout(() => setSaveBanner(null), 2500);
  };

  /**
   * Menangani perubahan deskripsi bukti nyata teramati per butir
   */
  const handleBuktiChange = (kode_indikator: string, bukti_nyata: string) => {
    if (!observation || observation.is_locked) return;
    const existingIndex = scoreItems.findIndex((s) => s.kode_indikator === kode_indikator);
    if (existingIndex >= 0) {
      const updated = [...scoreItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        bukti_nyata,
      };
      setScoreItems(updated);
      ObservationService.saveScoreItem(updated[existingIndex]);
    }
  };

  /**
   * Menambahkan catatan fakta objektif baru berbasis waktu nyata
   */
  const handleAddFactNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observation || !factInput.trim()) return;

    const newNote = ObservationService.saveFactNote({
      observation_id: observation.id,
      menit_ke: timerMinutes,
      fakta_terlihat: factInput.trim(),
      ucapan_guru_verbatim: verbatimInput.trim() || undefined,
      respons_ucapan_siswa: studentResponseInput.trim() || undefined,
      jumlah_siswa_terlibat: undefined,
      bukti_artefak_teks: undefined,
      foto_artefak_url: null,
      dampak_pembelajaran: undefined,
      kode_indikator_tertaut: (linkedIndicatorInput as any) || undefined,
    });

    setFactNotes([newNote, ...factNotes]);
    setFactInput("");
    setVerbatimInput("");
    setStudentResponseInput("");
    setLinkedIndicatorInput("");

    setSaveBanner("Catatan fakta teramati berhasil ditambahkan ke linimasa");
    setTimeout(() => setSaveBanner(null), 3000);
  };

  /**
   * Menghapus catatan fakta dari linimasa
   */
  const handleDeleteFactNote = (id: string) => {
    if (observation?.is_locked) return;
    ObservationService.deleteFactNote(id);
    setFactNotes(factNotes.filter((n) => n.id !== id));
  };

  /**
   * Finalisasi lembar observasi setelah seluruh 28 butir terisi
   */
  const handleFinalize = () => {
    if (!observation) return;
    setErrorBanner(null);

    try {
      if (factNotes.length === 0) {
        if (
          !window.confirm(
            "Perhatian: Observasi ini belum memiliki catatan fakta objektif (live notes). Apakah Anda yakin ingin tetap memfinalisasi?"
          )
        ) {
          return;
        }
      }

      ObservationService.saveObservation(observation);
      const finalized = ObservationService.finalizeObservation(observation.id);
      setObservation(finalized);
      setSaveBanner(
        `Observasi Sesi ${observation.sesi_ke} berhasil difinalisasi dan dikunci resmi!`
      );
      setTimeout(() => setSaveBanner(null), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorBanner(err.message);
      }
    }
  };

  /**
   * Konfirmasi buka kunci lembar observasi yang sudah final
   */
  const handleUnlockConfirm = (alasan: string) => {
    if (!observation) return;
    try {
      const unlocked = ObservationService.unlockObservation(observation.id, alasan);
      setObservation(unlocked);
      setSaveBanner("Kunci observasi berhasil dibuka. Perubahan telah dicatat di audit log.");
      setTimeout(() => setSaveBanner(null), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorBanner(err.message);
      }
    }
  };

  const currentTeacher = teachers.find((t) => t.id === selectedTeacherId);

  // Hitung target sesi guru terpilih
  const teacherTargetSesi = currentTeacher
    ? currentTeacher.target_sesi || TeacherService.getRequiredFrequency(currentTeacher) || 1
    : 1;

  // Ambil seluruh observasi guru di semester aktif untuk melihat status masing-masing sesi
  const teacherObservations = useMemo(() => {
    if (!selectedTeacherId || !schoolSettings) return [];
    return ObservationService.getObservationsByTeacherAndSemester(
      selectedTeacherId,
      schoolSettings.semester_aktif
    );
  }, [selectedTeacherId, schoolSettings, observation]);

  if (!observation || !currentTeacher || !schoolSettings) {
    return (
      <div className="p-12 text-center text-muted">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Memuat data lembar observasi kelas...</p>
      </div>
    );
  }

  const scoreMap = new Map(scoreItems.map((s) => [s.kode_indikator, s]));

  // Buat daftar sesi yang tersedia (minimal 1 hingga target sesi, maks 3)
  const maxSessionCount = Math.max(teacherTargetSesi, teacherObservations.length, 1);
  const sessionNumbers = Array.from(
    { length: Math.min(Math.max(maxSessionCount, selectedSesiKe), 3) },
    (_, i) => i + 1
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notifikasi Status */}
      {saveBanner && (
        <div className="p-3.5 rounded-control bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{saveBanner}</span>
          </div>
          <span className="text-[11px] font-mono opacity-80">Tersimpan Otomatis</span>
        </div>
      )}

      {errorBanner && (
        <div className="p-3.5 rounded-control bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-sm flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span className="font-medium">{errorBanner}</span>
        </div>
      )}

      {/* Header Utama Lembar Observasi */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground font-serif">
              Pengamatan Mengajar di Kelas (Observasi)
            </h1>
            <span
              className={`px-2.5 py-1 rounded text-xs font-bold border inline-flex items-center gap-1.5 ${
                observation.is_locked
                  ? "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200"
                  : "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200"
              }`}
            >
              {observation.is_locked ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  Status: Final (Terkunci Resmi)
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Status: Draf Pengisian Aktif
                </>
              )}
            </span>
          </div>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Catat fakta objektif langsung dari baris belakang kelas dan isi 28 butir indikator
            rubrik penilaian pembelajaran.
          </p>
        </div>

        {/* Tombol Aksi Dokumen */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => setIsPrintModalOpen(true)}
            className="whitespace-nowrap"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Cetak Lembar A4
          </Button>

          {observation.is_locked ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsUnlockModalOpen(true)}
              className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30 whitespace-nowrap"
            >
              <Unlock className="w-4 h-4 mr-1.5" />
              Buka Kunci Sesi
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleFinalize}
              disabled={metrics.completedCount < 28}
              className="whitespace-nowrap font-semibold"
              title={
                metrics.completedCount < 28
                  ? `Lengkapi seluruh 28 butir (saat ini ${metrics.completedCount}/28)`
                  : "Finalisasi lembar observasi sesi ini"
              }
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Finalisasi Sesi ({metrics.completedCount}/28)
            </Button>
          )}
        </div>
      </div>

      {/* Panel Parameter Guru & Pemilih Sesi (Sangat Lega & Terorganisir) */}
      <div className="rounded-panel border border-border bg-surface p-5 space-y-4 shadow-xs">
        {/* Baris 1: Pemilih Guru & Pemilih Sesi Dinamis */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/80">
          {/* Dropdown Guru */}
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-primary" />
              Guru yang Diobservasi:
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => handleTeacherChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-control border border-border bg-surface text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {teachers.map((t) => {
                const req = t.target_sesi || TeacherService.getRequiredFrequency(t);
                return (
                  <option key={t.id} value={t.id}>
                    {t.nama_lengkap} — {t.mata_pelajaran} ({t.status_kepegawaian} • Target {req} Sesi)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Pemilih Sesi Dinamis (Sesi 1, Sesi 2, Sesi 3) */}
          <div className="space-y-1.5 lg:w-auto">
            <label className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" />
              Sesi Observasi (Target: {teacherTargetSesi}x Sesi):
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {sessionNumbers.map((sNum) => {
                const isSelected = selectedSesiKe === sNum;
                const obsSesi = teacherObservations.find((o) => o.sesi_ke === sNum);
                const isLocked = obsSesi?.status === "Final";
                const isDraft = obsSesi && obsSesi.status !== "Final";

                return (
                  <button
                    key={sNum}
                    type="button"
                    onClick={() => handleSesiChange(sNum)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-control text-xs font-bold border transition-smooth ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20"
                        : "bg-surface text-foreground border-border hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <span>Sesi {sNum}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isSelected
                          ? "bg-white/25 text-white"
                          : isLocked
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : isDraft
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-black/5 dark:bg-white/10 text-muted"
                      }`}
                    >
                      {isLocked ? "✓ Final" : isDraft ? "✎ Draf" : "○ Baru"}
                    </span>
                  </button>
                );
              })}

              {/* Tombol Tambah Sesi Tambahan jika belum mencapai 3 sesi */}
              {sessionNumbers.length < 3 && (
                <button
                  type="button"
                  onClick={() => handleSesiChange(sessionNumbers.length + 1)}
                  className="flex items-center gap-1 px-3 py-2 rounded-control text-xs font-semibold border border-dashed border-border hover:border-primary text-muted hover:text-primary transition-smooth"
                  title="Tambah sesi observasi berikutnya"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Sesi {sessionNumbers.length + 1}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Baris 2: Parameter Pelaksanaan Supervisi di Kelas (Bisa Diedit & Auto-Save) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {/* Tanggal Pelaksanaan */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Tanggal Observasi:
            </label>
            <input
              type="date"
              value={observation.tanggal_observasi}
              disabled={observation.is_locked}
              onChange={(e) => handleMetadataChange("tanggal_observasi", e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-control border border-border bg-surface text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-75"
            />
          </div>

          {/* Jam Mulai & Selesai */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Waktu Pelaksanaan (WIB):
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="time"
                value={observation.jam_mulai}
                disabled={observation.is_locked}
                onChange={(e) => handleMetadataChange("jam_mulai", e.target.value)}
                className="w-1/2 h-10 px-2 text-sm rounded-control border border-border bg-surface text-foreground font-medium text-center focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-75"
                title="Jam Mulai"
              />
              <span className="text-muted text-xs font-bold">-</span>
              <input
                type="time"
                value={observation.jam_selesai}
                disabled={observation.is_locked}
                onChange={(e) => handleMetadataChange("jam_selesai", e.target.value)}
                className="w-1/2 h-10 px-2 text-sm rounded-control border border-border bg-surface text-foreground font-medium text-center focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-75"
                title="Jam Selesai"
              />
            </div>
          </div>

          {/* Kelas Diampu */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              Kelas yang Diobservasi:
            </label>
            <input
              type="text"
              value={observation.kelas}
              disabled={observation.is_locked}
              onChange={(e) => handleMetadataChange("kelas", e.target.value)}
              placeholder="Contoh: 9-A / VII-B"
              className="w-full h-10 px-3 text-sm rounded-control border border-border bg-surface text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-75"
            />
          </div>

          {/* Jumlah Siswa Hadir */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Jumlah Siswa Hadir:
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={60}
                value={observation.jumlah_siswa_hadir}
                disabled={observation.is_locked}
                onChange={(e) =>
                  handleMetadataChange("jumlah_siswa_hadir", parseInt(e.target.value, 10) || 0)
                }
                className="w-full h-10 px-3 text-sm rounded-control border border-border bg-surface text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-75 pr-14"
              />
              <span className="absolute right-3 top-2.5 text-xs text-muted pointer-events-none">
                Siswa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Kartu Ringkasan Metrik Observasi (4 Kartu Bersih & Proporsional) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Kelengkapan 28 Indikator */}
        <Panel className="p-4 shadow-xs">
          <span className="text-[11px] uppercase text-muted font-bold tracking-wider block">
            Kelengkapan Indikator
          </span>
          <p className="text-2xl font-black font-serif text-foreground mt-1">
            {metrics.completedCount}{" "}
            <span className="text-xs text-muted font-normal font-sans">/ 28 Butir</span>
          </p>
          <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                metrics.completedCount === 28 ? "bg-emerald-500" : "bg-primary"
              }`}
              style={{ width: `${(metrics.completedCount / 28) * 100}%` }}
            />
          </div>
        </Panel>

        {/* Total Skor & Persentase */}
        <Panel className="p-4 shadow-xs">
          <span className="text-[11px] uppercase text-muted font-bold tracking-wider block">
            Total & Persentase Nilai
          </span>
          <p className="text-2xl font-black font-mono text-foreground mt-1">
            {metrics.totalScore !== null ? metrics.totalScore : "-"}{" "}
            <span className="text-base font-bold text-primary font-sans">
              ({metrics.percentage !== null ? `${metrics.percentage.toFixed(1)}%` : "Draf"})
            </span>
          </p>
          <p className="text-[11px] text-muted mt-1.5">Skala Standar 28 s.d. 112 Poin</p>
        </Panel>

        {/* Predikat Capaian */}
        <Panel className="p-4 shadow-xs">
          <span className="text-[11px] uppercase text-muted font-bold tracking-wider block">
            Predikat Kinerja
          </span>
          <div className="mt-2">
            {metrics.predikat ? (
              <Badge predikat={metrics.predikat as any} />
            ) : (
              <span className="text-xs text-muted font-medium bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded">
                Menunggu 28 Butir
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted mt-2">Berdasarkan Ambang Batas SK</p>
        </Panel>

        {/* Aspek Prioritas (BR-04) */}
        <Panel className="p-4 shadow-xs">
          <span className="text-[11px] uppercase text-muted font-bold tracking-wider block">
            Fokus Peningkatan
          </span>
          <p className="text-sm font-extrabold text-foreground mt-1 truncate" title={metrics.priorityAspect ? `Aspek ${metrics.priorityAspect}: ${ASPECT_NAMES[metrics.priorityAspect]}` : undefined}>
            {metrics.priorityAspect
              ? `Aspek ${metrics.priorityAspect}: ${ASPECT_NAMES[metrics.priorityAspect]}`
              : "Belum Ada Catatan"}
          </p>
          <p className="text-[11px] text-muted mt-1.5">Rata-rata aspek terendah</p>
        </Panel>
      </div>

      {/* Navigasi Mode Pengamatan (Anti-Tabrakan & Nyaman untuk Pengguna 50++) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-control bg-surface border border-border">
        {/* Tombol Tab Kerja Utama */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("rubrik")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-control text-xs md:text-sm font-bold transition-smooth ${
              activeTab === "rubrik"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Rubrik Penilaian (28 Indikator)</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                activeTab === "rubrik"
                  ? "bg-white/20 text-white"
                  : "bg-black/10 dark:bg-white/10 text-muted"
              }`}
            >
              {metrics.completedCount}/28
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("fakta")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-control text-xs md:text-sm font-bold transition-smooth ${
              activeTab === "fakta"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>2. Catatan Fakta Kelas (Live Notes)</span>
            {factNotes.length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                  activeTab === "fakta"
                    ? "bg-white/20 text-white"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                }`}
              >
                {factNotes.length}
              </span>
            )}
          </button>
        </div>

        {/* Stopwatch Timer Sesi Aktif */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-control bg-black/5 dark:bg-white/5 border border-border self-end sm:self-auto">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <span className="font-mono font-bold text-xs">Menit ke-{timerMinutes}</span>
          {!observation.is_locked && (
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-smooth ${
                isTimerRunning
                  ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200"
                  : "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
              }`}
            >
              {isTimerRunning ? "Jeda" : "Mulai Timer"}
            </button>
          )}
        </div>
      </div>

      {/* KONTEN MODE 1: RUBRIK PENILAIAN 28 INDIKATOR (FULL WIDTH & LEGA) */}
      {activeTab === "rubrik" && (
        <div className="space-y-6">
          {/* Bilah Pilihan 7 Aspek (Aspek A s.d. G) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Pilih Aspek Pembelajaran:
              </span>
              <span className="text-xs text-muted">
                Klik aspek untuk berpindah butir penilaian
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {(["A", "B", "C", "D", "E", "F", "G"] as const).map((aspek) => {
                const isActive = activeAspect === aspek;
                const avg = metrics.aspectAverages[aspek];

                return (
                  <button
                    key={aspek}
                    type="button"
                    onClick={() => setActiveAspect(aspek)}
                    className={`flex flex-col p-2.5 rounded-control border text-left transition-smooth select-none ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20 font-bold"
                        : "bg-surface text-foreground border-border hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold">Aspek {aspek}</span>
                      {avg !== null && avg !== undefined ? (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-black/10 dark:bg-white/10 text-foreground"
                          }`}
                        >
                          {avg.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-[10px] opacity-60">-</span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] mt-1 line-clamp-1 ${
                        isActive ? "text-white/90" : "text-muted"
                      }`}
                    >
                      {ASPECT_NAMES[aspek]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Judul & Deskripsi Aspek Aktif */}
          <div className="p-4 rounded-control bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base md:text-lg font-bold font-serif text-foreground">
                Aspek {activeAspect}: {ASPECT_NAMES[activeAspect]}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Beri nilai pada 4 butir indikator di bawah dengan skala 1 (Perlu Pengembangan)
                sampai 4 (Sangat Mahir).
              </p>
            </div>
            {metrics.aspectAverages[activeAspect] !== null &&
              metrics.aspectAverages[activeAspect] !== undefined && (
                <div className="flex items-center gap-1.5 text-xs font-bold bg-surface px-3 py-1.5 rounded-control border border-border shrink-0">
                  <span className="text-muted">Rata-rata Aspek {activeAspect}:</span>
                  <span className="text-primary font-mono text-sm">
                    {metrics.aspectAverages[activeAspect]?.toFixed(2)}
                  </span>
                </div>
              )}
          </div>

          {/* Daftar 4 Indikator untuk Aspek Terpilih */}
          <div className="space-y-4">
            {SEED_INDICATORS.filter((ind) => ind.aspek === activeAspect).map((ind) => {
              const item = scoreMap.get(ind.kode);
              const scoreVal = item?.skor;

              return (
                <Panel key={ind.kode} className="p-5 md:p-6 shadow-xs border-border space-y-4">
                  {/* Header Indikator */}
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-sm flex items-center justify-center shrink-0 font-mono mt-0.5">
                      {ind.kode}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm md:text-base font-bold text-foreground leading-snug">
                        {ind.pernyataan}
                      </p>
                    </div>
                  </div>

                  {/* Panduan Rubrik Baku (Skor 1 s.d. 4 Berdasarkan Dokumen Resmi) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-3 rounded-control bg-black/5 dark:bg-white/5 border border-border/80 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-rose-700 dark:text-rose-400 block">
                        Skor 1 (Perlu Pengembangan):
                      </span>
                      <p className="text-muted text-[11px] leading-relaxed">
                        {ind.panduan_skor.skor_1}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-amber-700 dark:text-amber-400 block">
                        Skor 2 (Berkembang):
                      </span>
                      <p className="text-muted text-[11px] leading-relaxed">
                        {ind.panduan_skor.skor_2}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-blue-700 dark:text-blue-400 block">
                        Skor 3 (Mahir):
                      </span>
                      <p className="text-muted text-[11px] leading-relaxed">
                        {ind.panduan_skor.skor_3}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                        Skor 4 (Sangat Mahir):
                      </span>
                      <p className="text-muted text-[11px] leading-relaxed">
                        {ind.panduan_skor.skor_4}
                      </p>
                    </div>
                  </div>

                  {/* Pemilih Skor 1 s.d. 4 yang Lega */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">
                      Pilih Skor Penilaian:
                    </label>
                    <ScoreSelector
                      value={scoreVal}
                      onChange={(val) => handleScoreChange(ind.kode, val)}
                      disabled={observation.is_locked}
                      enableKeyboardShortcuts={false}
                    />
                  </div>

                  {/* Input Bukti Nyata Teramati (Lega & Tidak Sempit) */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted flex items-center justify-between">
                      <span>Bukti Nyata Teramati di Kelas:</span>
                      <span className="font-normal text-[11px] lowercase text-muted">
                        Wajib diisi sebagai bukti supervisi
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      value={item?.bukti_nyata || ""}
                      disabled={observation.is_locked}
                      onChange={(e) => handleBuktiChange(ind.kode, e.target.value)}
                      placeholder={`Contoh: Teramati guru menerapkan apersepsi dengan video kontekstual dan menanyakan keterkaitan materi lalu...`}
                      className="w-full px-3.5 py-2.5 text-xs md:text-sm rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-75 leading-relaxed"
                    />
                  </div>
                </Panel>
              );
            })}
          </div>

          {/* Banner Pintas ke Catatan Fakta */}
          <div className="p-4 rounded-control border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Catatan Fakta Teramati ({factNotes.length} Catatan)
                </p>
                <p className="text-xs text-muted">
                  Perkaya hasil observasi dengan kutipan ucapan guru dan respon siswa waktu nyata.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("fakta")}
              className="shrink-0"
            >
              Buka Catatan Fakta
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* KONTEN MODE 2: CATATAN FAKTA KELAS / LIVE NOTES (FULL WIDTH & LEGA) */}
      {activeTab === "fakta" && (
        <div className="space-y-6">
          {/* Uji Fakta Panduan Objektif */}
          <div className="p-4 rounded-control bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200 text-xs md:text-sm leading-relaxed flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Panduan Etika & Uji Fakta Objektif:</strong>
              <p className="mt-1 text-xs opacity-90">
                Tuliskan hanya apa yang benar-benar terdengar dan terlihat (bisa dibuktikan rekaman
                video). Hindari label interpretatif seperti <em>&ldquo;guru kurang siap&rdquo;</em>{" "}
                atau <em>&ldquo;siswa malas&rdquo;</em>. Utamakan kutipan kata demi kata (verbatim).
              </p>
            </div>
          </div>

          {/* Formulir Penambahan Catatan Fakta Baru (Lega & Nyaman) */}
          {!observation.is_locked ? (
            <Panel
              title="Tambah Catatan Fakta Teramati Baru"
              subtitle="Pencatatan langsung peristiwa belajar dari baris belakang kelas"
              className="p-5 md:p-6 shadow-xs border-border"
            >
              <form onSubmit={handleAddFactNote} className="space-y-4">
                {/* Baris 1: Waktu Kejadian & Tautan Indikator */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted flex items-center justify-between">
                      <span>Waktu Kejadian Belajar:</span>
                      <span className="font-mono text-[11px] text-primary">
                        Timer: Menit ke-{timerMinutes}
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={180}
                        value={timerMinutes}
                        onChange={(e) => setTimerMinutes(parseInt(e.target.value, 10) || 0)}
                        className="w-24 h-10 px-3 text-sm rounded-control border border-border bg-surface text-foreground font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-xs text-muted font-medium">
                        Menit sejak pembelajaran dimulai
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">
                      Hubungkan ke Indikator (Opsional):
                    </label>
                    <select
                      value={linkedIndicatorInput}
                      onChange={(e) => setLinkedIndicatorInput(e.target.value)}
                      className="w-full h-10 px-3 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">-- Tidak Ditautkan / Catatan Umum --</option>
                      {SEED_INDICATORS.map((ind) => (
                        <option key={ind.kode} value={ind.kode}>
                          [{ind.kode}] {ind.pernyataan.slice(0, 50)}...
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Baris 2: Fakta Terlihat / Peristiwa */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">
                    Fakta Kejadian Terlihat (Apa yang sedang terjadi di kelas) *
                  </label>
                  <textarea
                    rows={2}
                    value={factInput}
                    onChange={(e) => setFactInput(e.target.value)}
                    placeholder="Contoh: Guru berkeliling mendampingi kelompok 3 yang kesulitan merumuskan hipotesis..."
                    className="w-full px-3.5 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                    required
                  />
                </div>

                {/* Baris 3: Ucapan Guru & Respon Siswa (Dua Kolom Bersih) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-primary">
                      Ucapan Guru Verbatim (Kutipan Kata demi Kata):
                    </label>
                    <input
                      type="text"
                      value={verbatimInput}
                      onChange={(e) => setVerbatimInput(e.target.value)}
                      placeholder='Contoh: "Perhatikan variabel bebasnya, apa yang kalian ubah?"'
                      className="w-full h-10 px-3.5 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Respons / Perilaku Nyata Siswa:
                    </label>
                    <input
                      type="text"
                      value={studentResponseInput}
                      onChange={(e) => setStudentResponseInput(e.target.value)}
                      placeholder='Contoh: Siswa serentak menunjuk diagram di LKPD: "Suhu Pak!"'
                      className="w-full h-10 px-3.5 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Baris 4: Tombol Aksi Simpan */}
                <div className="flex items-center justify-between pt-2 border-t border-border/80">
                  <span className="text-xs text-muted">
                    Pencatatan fakta akan tersimpan permanen di lembar observasi sesi ini.
                  </span>
                  <Button type="submit" variant="primary" size="md">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Simpan Fakta ke Linimasa
                  </Button>
                </div>
              </form>
            </Panel>
          ) : (
            <div className="p-4 rounded-control bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs md:text-sm">
              Observasi Sesi {observation.sesi_ke} ini telah berstatus Final (Terkunci). Untuk
              menambah atau merevisi fakta, silakan klik tombol <strong>Buka Kunci Sesi</strong> di
              kanan atas.
            </div>
          )}

          {/* Daftar Linimasa Catatan Fakta Teramati */}
          <Panel
            title={`Linimasa Catatan Fakta Teramati (${factNotes.length} Kejadian)`}
            subtitle="Rekaman kronologis peristiwa dan interaksi kelas"
            className="p-5 md:p-6 shadow-xs border-border"
          >
            {factNotes.length === 0 ? (
              <div className="py-12 text-center text-muted space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-sm font-medium">Belum ada catatan fakta yang direkam.</p>
                <p className="text-xs max-w-md mx-auto">
                  Gunakan formulir di atas untuk mencatat kejadian autentik yang terjadi selama
                  pembelajaran berlangsung.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {factNotes.map((note, idx) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-control border border-border bg-black/5 dark:bg-white/5 space-y-2.5 transition-smooth hover:border-primary/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-mono font-bold text-xs">
                          Menit ke-{note.menit_ke}
                        </span>
                        {note.kode_indikator_tertaut && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                            Indikator {note.kode_indikator_tertaut}
                          </span>
                        )}
                      </div>

                      {!observation.is_locked && (
                        <button
                          type="button"
                          onClick={() => handleDeleteFactNote(note.id)}
                          className="text-muted hover:text-rose-600 p-1.5 rounded transition-smooth hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Hapus Catatan Fakta Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Deskripsi Fakta */}
                    <p className="text-sm font-semibold text-foreground leading-relaxed">
                      {note.fakta_terlihat}
                    </p>

                    {/* Kutipan Guru & Respon Siswa */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {note.ucapan_guru_verbatim && (
                        <div className="border-l-3 border-primary pl-3 py-1 bg-surface/50 rounded-r text-xs leading-relaxed">
                          <span className="font-bold text-primary block text-[11px]">
                            Ucapan Guru Verbatim:
                          </span>
                          <span className="text-muted italic">
                            &ldquo;{note.ucapan_guru_verbatim}&rdquo;
                          </span>
                        </div>
                      )}

                      {note.respons_ucapan_siswa && (
                        <div className="border-l-3 border-blue-500 pl-3 py-1 bg-surface/50 rounded-r text-xs leading-relaxed">
                          <span className="font-bold text-blue-600 dark:text-blue-400 block text-[11px]">
                            Respons / Perilaku Siswa:
                          </span>
                          <span className="text-muted">
                            {note.respons_ucapan_siswa}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* Modal Dialog Pratinjau Dokumen Cetak A4 */}
      <ObservationPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        observation={observation}
        scores={scoreItems}
        metrics={metrics}
        teacher={currentTeacher}
        school={schoolSettings}
      />

      {/* Modal Dialog Buka Kunci Observasi */}
      <ObservationUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onConfirm={handleUnlockConfirm}
      />
    </div>
  );
};

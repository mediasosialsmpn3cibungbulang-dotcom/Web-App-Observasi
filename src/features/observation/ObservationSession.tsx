"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  GraduationCap,
  Save,
  CheckCircle2,
  Clock,
  Plus,
  Camera,
  AlertCircle,
  Lock,
  Unlock,
  Printer,
  FileText,
  Trash2,
} from "lucide-react";
import { Observation, ObservationScoreItem, FactNote, Teacher, SchoolSettings } from "@/contracts/schemas";
import { AspectCode, ASPECT_NAMES } from "@/contracts/enums";
import { SEED_INDICATORS } from "@/contracts/seed-data";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScoreSelector } from "@/components/ui/ScoreSelector";
import { ObservationService, ObservationCalculationResult } from "./observation-service";
import { ObservationPrintModal } from "./ObservationPrintModal";
import { ObservationUnlockModal } from "./ObservationUnlockModal";
import { TeacherService } from "../teachers/teacher-service";
import { SettingsService } from "../settings/settings-service";

export const ObservationSession: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);

  const [observation, setObservation] = useState<Observation | null>(null);
  const [scoreItems, setScoreItems] = useState<ObservationScoreItem[]>([]);
  const [factNotes, setFactNotes] = useState<FactNote[]>([]);

  const [activeAspect, setActiveAspect] = useState<AspectCode>("A");
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Form input fact note
  const [factInput, setFactInput] = useState("");
  const [verbatimInput, setVerbatimInput] = useState("");
  const [studentResponseInput, setStudentResponseInput] = useState("");

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    const list = TeacherService.getTeachers().filter((t) => t.aktif);
    setTeachers(list);
    const school = SettingsService.getSchoolSettings();
    setSchoolSettings(school);

    if (list.length > 0) {
      setSelectedTeacherId(list[0].id);
      loadObservation(list[0].id, school.semester_aktif);
    }
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerMinutes((prev) => prev + 1);
      }, 60000); // Tiap 1 menit
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const loadObservation = (teacherId: string, semester: string) => {
    const existing = ObservationService.getObservationByTeacherAndSemester(teacherId, semester);
    if (existing) {
      setObservation(existing);
      setScoreItems(ObservationService.getAllScores(existing.id));
      setFactNotes(ObservationService.getAllFactNotes(existing.id));
    } else {
      // Buat draf observasi baru
      const newObs: Observation = {
        id: crypto.randomUUID(),
        schedule_id: crypto.randomUUID(),
        teacher_id: teacherId,
        supervisor_id: "00000000-0000-0000-0000-000000000001",
        semester,
        sesi_ke: 1,
        tanggal_observasi: new Date().toISOString().split("T")[0],
        jam_mulai: "08:00",
        jam_selesai: "09:30",
        kelas: "X-A",
        jumlah_siswa_hadir: 32,
        catatan_umum: "",
        status: "Draf",
        is_locked: false,
        alasan_buka_kunci: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
      };
      setObservation(newObs);
      setScoreItems([]);
      setFactNotes([]);
    }
  };

  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    if (schoolSettings) {
      loadObservation(teacherId, schoolSettings.semester_aktif);
    }
  };

  // Perhitungan real-time
  const metrics: ObservationCalculationResult = useMemo(() => {
    return ObservationService.calculateObservationMetrics(scoreItems);
  }, [scoreItems]);

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
        bukti_nyata: `Teramati guru menerapkan ${ind?.pernyataan.slice(0, 30)}...`,
        catatan: "",
      });
    }

    setScoreItems(updated);
    ObservationService.saveScoreItem(
      updated.find((s) => s.kode_indikator === kode_indikator)!
    );

    // Indikasi simpan otomatis ke perangkat (ADR-0005)
    setSaveBanner(`Tersimpan di perangkat (${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })})`);
    setTimeout(() => setSaveBanner(null), 2500);
  };

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
      kode_indikator_tertaut: undefined,
    });

    setFactNotes([newNote, ...factNotes]);
    setFactInput("");
    setVerbatimInput("");
    setStudentResponseInput("");
  };

  const handleDeleteFactNote = (id: string) => {
    ObservationService.deleteFactNote(id);
    setFactNotes(factNotes.filter((n) => n.id !== id));
  };

  const handleFinalize = () => {
    if (!observation) return;
    setErrorBanner(null);

    try {
      if (factNotes.length === 0) {
        if (
          !window.confirm(
            "Perhatian: Observasi ini belum memiliki satupun catatan fakta objektif (live notes). Apakah Anda yakin ingin tetap memfinalisasi?"
          )
        ) {
          return;
        }
      }

      ObservationService.saveObservation(observation);
      const finalized = ObservationService.finalizeObservation(observation.id);
      setObservation(finalized);
      setSaveBanner("Observasi pembelajaran berhasil difinalisasi dan dikunci!");
      setTimeout(() => setSaveBanner(null), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorBanner(err.message);
      }
    }
  };

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

  if (!observation || !currentTeacher || !schoolSettings) {
    return <div className="p-8 text-center text-muted">Memuat data lembar observasi...</div>;
  }

  const scoreMap = new Map(scoreItems.map((s) => [s.kode_indikator, s]));

  return (
    <div className="space-y-6">
      {/* Toast Notifikasi Simpan Otomatis */}
      {saveBanner && (
        <div className="p-3.5 rounded-control bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{saveBanner}</span>
          </div>
          <span className="text-[11px] font-mono opacity-80">Offline-First Safe</span>
        </div>
      )}

      {errorBanner && (
        <div className="p-3.5 rounded-control bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Header Observasi */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-foreground">
              Lembar Observasi Pembelajaran
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${
                observation.is_locked
                  ? "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200"
                  : "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200"
              }`}
            >
              {observation.is_locked ? "Status: Final (Terkunci)" : "Status: Draf Aktif"}
            </span>
          </div>
          <p className="text-sm text-muted mt-1">
            Rubrik baku 28 indikator (7 aspek) dan pencatatan fakta langsung saat jam mengajar di kelas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => setIsPrintModalOpen(true)}
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Cetak (A4)
          </Button>

          {observation.is_locked ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsUnlockModalOpen(true)}
            >
              <Unlock className="w-4 h-4 mr-1.5 text-rose-600" />
              Buka Kunci
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleFinalize}
              disabled={metrics.completedCount < 28}
              title={
                metrics.completedCount < 28
                  ? `Lengkapi seluruh 28 indikator (saat ini ${metrics.completedCount}/28)`
                  : "Finalisasi observasi ini"
              }
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Finalisasi ({metrics.completedCount}/28)
            </Button>
          )}
        </div>
      </div>

      {/* Pemilih Guru & Pengontrol Timer Sesi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-control border border-border bg-surface">
        <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-semibold uppercase text-muted whitespace-nowrap">
            Guru yang Diamati:
          </label>
          <select
            value={selectedTeacherId}
            onChange={(e) => handleTeacherChange(e.target.value)}
            disabled={observation.is_locked}
            className="flex-1 px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nama_lengkap} ({t.mata_pelajaran} - Kelas {t.kelas_diampu})
              </option>
            ))}
          </select>
        </div>

        {/* Pengatur Timer Berjalan */}
        <div className="flex items-center justify-end gap-3 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-control bg-black/5 dark:bg-white/5 border border-border">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-mono font-bold text-sm">Menit ke-{timerMinutes}</span>
          </div>
          {!observation.is_locked && (
            <Button
              type="button"
              variant={isTimerRunning ? "secondary" : "outline"}
              size="sm"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
            >
              {isTimerRunning ? "Jeda" : "Mulai Timer"}
            </Button>
          )}
        </div>
      </div>

      {/* Bar Indikator Kemajuan & Nilai Real-time */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Kelengkapan 28 Indikator */}
        <Panel className="p-3.5">
          <span className="text-[11px] uppercase text-muted font-semibold block">Kelengkapan Indikator</span>
          <p className="text-xl font-bold font-serif text-foreground mt-0.5">
            {metrics.completedCount} <span className="text-xs text-muted font-normal">/ 28 butir</span>
          </p>
          <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(metrics.completedCount / 28) * 100}%` }}
            />
          </div>
        </Panel>

        {/* Total Skor & Persentase */}
        <Panel className="p-3.5">
          <span className="text-[11px] uppercase text-muted font-semibold block">Total & Persentase</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">
            {metrics.totalScore ? `${metrics.totalScore} ` : "-"}
            <span className="text-sm font-semibold text-primary">
              ({metrics.percentage !== null ? `${metrics.percentage.toFixed(1)}%` : "Draf"})
            </span>
          </p>
          <p className="text-[10px] text-muted mt-1">Skala 28 - 112</p>
        </Panel>

        {/* Predikat */}
        <Panel className="p-3.5">
          <span className="text-[11px] uppercase text-muted font-semibold block">Predikat Capaian</span>
          <div className="mt-1.5">
            {metrics.predikat ? (
              <Badge predikat={metrics.predikat as any} />
            ) : (
              <span className="text-xs text-muted">Belum Lengkap</span>
            )}
          </div>
        </Panel>

        {/* Aspek Prioritas (BR-04) */}
        <Panel className="p-3.5">
          <span className="text-[11px] uppercase text-muted font-semibold block">Aspek Prioritas</span>
          <p className="text-sm font-bold text-foreground mt-1 truncate">
            {metrics.priorityAspect
              ? `Aspek ${metrics.priorityAspect}: ${ASPECT_NAMES[metrics.priorityAspect]}`
              : "-"}
          </p>
          <p className="text-[10px] text-muted">Rata-rata terendah</p>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri & Tengah: Rubrik 7 Aspek Observasi */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Aspek A s.d. G */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 select-none">
            {(["A", "B", "C", "D", "E", "F", "G"] as const).map((aspek) => {
              const isActive = activeAspect === aspek;
              const avg = metrics.aspectAverages[aspek];

              return (
                <button
                  key={aspek}
                  onClick={() => setActiveAspect(aspek)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-control text-xs font-semibold border whitespace-nowrap transition-smooth ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-surface text-foreground border-border hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <span>Aspek {aspek}</span>
                  {avg !== null && avg !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-black/5 dark:bg-white/10 text-muted"
                      }`}
                    >
                      {avg.toFixed(1)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Judul Aspek Aktif */}
          <div className="pb-2 border-b border-border">
            <h3 className="text-base font-bold font-serif text-foreground">
              Aspek {activeAspect}: {ASPECT_NAMES[activeAspect]}
            </h3>
            <p className="text-xs text-muted">
              Nilai 4 indikator berikut dengan skala rubrik 1 sampai 4.
            </p>
          </div>

          {/* Daftar 4 Indikator untuk Aspek Terpilih */}
          <div className="space-y-4">
            {SEED_INDICATORS.filter((ind) => ind.aspek === activeAspect).map((ind) => {
              const item = scoreMap.get(ind.kode);
              const scoreVal = item?.skor;

              return (
                <Panel key={ind.kode} className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 font-mono">
                      {ind.kode}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground leading-snug">
                        {ind.pernyataan}
                      </p>
                    </div>
                  </div>

                  {/* Rubrik Pemilih Skor */}
                  <ScoreSelector
                    value={scoreVal}
                    onChange={(val) => handleScoreChange(ind.kode, val)}
                    disabled={observation.is_locked}
                    enableKeyboardShortcuts={true}
                  />

                  {/* Input Bukti Nyata & Catatan */}
                  <div className="mt-3 space-y-2">
                    <div>
                      <input
                        type="text"
                        value={item?.bukti_nyata || ""}
                        disabled={observation.is_locked}
                        onChange={(e) => handleBuktiChange(ind.kode, e.target.value)}
                        placeholder="Ketik bukti nyata yang teramati di kelas untuk indikator ini..."
                        className="w-full px-3 py-1.5 text-xs rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>
        </div>

        {/* Kolom Kanan: Live Fact Notes (Sheet 6) */}
        <div className="space-y-4">
          <Panel
            title="Catatan Fakta Teramati"
            subtitle="Pencatatan bukti objektif langsung berbasis waktu"
          >
            {/* Peringatan Etika & Uji Fakta Panduan */}
            <div className="p-2.5 rounded-control bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200 text-[11px] leading-tight mb-3">
              <strong>Uji Fakta:</strong> Apakah ucapan atau kejadian ini bisa dibuktikan rekaman video? Hindari kata interpretatif seperti <em>&ldquo;guru kurang semangat&rdquo;</em>.
            </div>

            {/* Form Tambah Fakta Cepat */}
            {!observation.is_locked && (
              <form onSubmit={handleAddFactNote} className="space-y-2.5 pb-4 mb-4 border-b border-border">
                <div>
                  <div className="flex items-center justify-between text-xs text-muted mb-1">
                    <span className="font-semibold">Fakta Kejadian Teramati *</span>
                    <span className="font-mono text-[10px]">Menit ke-{timerMinutes}</span>
                  </div>
                  <textarea
                    rows={2}
                    value={factInput}
                    onChange={(e) => setFactInput(e.target.value)}
                    placeholder="Apa yang terjadi secara objektif..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={verbatimInput}
                    onChange={(e) => setVerbatimInput(e.target.value)}
                    placeholder="Ucapan guru verbatim (kutipan kata demi kata)..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={studentResponseInput}
                    onChange={(e) => setStudentResponseInput(e.target.value)}
                    placeholder="Reaksi atau respon siswa..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-muted">Hindari foto wajah siswa</span>
                  <Button type="submit" variant="primary" size="sm">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Simpan Fakta
                  </Button>
                </div>
              </form>
            )}

            {/* Riwayat Catatan Fakta */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {factNotes.length === 0 ? (
                <p className="text-xs text-muted text-center py-6">
                  Belum ada catatan fakta yang ditambahkan.
                </p>
              ) : (
                factNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-control border border-border bg-black/5 dark:bg-white/5 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-primary text-[11px]">
                        Menit ke-{note.menit_ke}
                      </span>
                      {!observation.is_locked && (
                        <button
                          type="button"
                          onClick={() => handleDeleteFactNote(note.id)}
                          className="text-muted hover:text-rose-600"
                          title="Hapus Catatan Fakta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-foreground leading-snug">{note.fakta_terlihat}</p>
                    {note.ucapan_guru_verbatim && (
                      <div className="border-l-2 border-primary pl-2 py-0.5 text-muted italic text-[11px]">
                        Guru: {note.ucapan_guru_verbatim}
                      </div>
                    )}
                    {note.respons_ucapan_siswa && (
                      <div className="border-l-2 border-blue-400 pl-2 py-0.5 text-muted text-[11px]">
                        Siswa: {note.respons_ucapan_siswa}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>

      {/* Modals */}
      <ObservationPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        observation={observation}
        scores={scoreItems}
        metrics={metrics}
        teacher={currentTeacher}
        school={schoolSettings}
      />

      <ObservationUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onConfirm={handleUnlockConfirm}
      />
    </div>
  );
};

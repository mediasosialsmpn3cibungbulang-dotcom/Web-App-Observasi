"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Shield,
  Clock,
  Plus,
  CheckCircle,
  Printer,
  Award,
  AlertCircle,
  CheckCircle2,
  Trash2,
  HeartHandshake,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Calendar,
  UserCheck,
  Target,
  Lightbulb,
  HelpCircle,
  Search,
  BookOpen,
  Send,
  Save,
} from "lucide-react";
import {
  CoachingSession,
  CoachingSessionQuestionItem,
  Teacher,
  SchoolSettings,
  FollowupItem,
  Observation,
  Schedule,
} from "@/contracts/schemas";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { SEED_COACHING_QUESTIONS } from "@/contracts/seed-data";
import { CoachingService } from "./coaching-service";
import { CoachingPrintModal } from "./CoachingPrintModal";
import { TeacherService } from "../teachers/teacher-service";
import { SettingsService } from "../settings/settings-service";
import { ObservationService } from "../observation/observation-service";
import { FollowupService } from "../followup/followup-service";
import { ScheduleService } from "../schedules/schedule-service";

export const CoachingSessionView: React.FC = () => {
  // State data master dan pengaturan
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);

  // State sesi coaching dan instrumen
  const [session, setSession] = useState<CoachingSession | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<CoachingSessionQuestionItem[]>([]);
  const [followups, setFollowups] = useState<FollowupItem[]>([]);
  const [observation, setObservation] = useState<Observation | null>(null);

  // State navigasi langkah alur dialog (Langkah 1, 2, atau 3)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // State filter bank pertanyaan
  const [activeCategory, setActiveCategory] = useState<string>("A");
  const [searchQuestion, setSearchQuestion] = useState<string>("");

  // State input form RTL cepat
  const [rtlMasalah, setRtlMasalah] = useState<string>("");
  const [rtlSolusi, setRtlSolusi] = useState<string>("");
  const [rtlAksi, setRtlAksi] = useState<string>("");
  const [rtlDukungan, setRtlDukungan] = useState<string>("");
  const [rtlDeadline, setRtlDeadline] = useState<string>("");

  // Modals & notifikasi
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const paramScheduleId = searchParams.get("schedule_id");
  const paramTeacherId = searchParams.get("teacher_id");

  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Inisialisasi data guru dan pengaturan semester
  useEffect(() => {
    const list = TeacherService.getTeachers().filter((t) => t.aktif);
    setTeachers(list);
    const scList = ScheduleService.getSchedules();
    const school = SettingsService.getSchoolSettings();
    setSchoolSettings(school);

    let activeTeacherId = list.length > 0 ? list[0].id : "";
    let activeScheduleId = paramScheduleId;

    if (paramScheduleId) {
      const matchSc = scList.find((s) => s.id === paramScheduleId);
      if (matchSc) {
        activeTeacherId = matchSc.teacher_id;
      }
    } else if (paramTeacherId) {
      activeTeacherId = paramTeacherId;
    }

    if (activeTeacherId) {
      setSelectedTeacherId(activeTeacherId);
      loadSession(activeTeacherId, school.semester_aktif, activeScheduleId);
    }
  }, [paramScheduleId, paramTeacherId]);

  /**
   * Memuat data sesi coaching berdasarkan guru dan semester aktif
   */
  const loadSession = (
    teacherId: string,
    semester: string,
    targetScheduleId?: string | null
  ) => {
    let obs: Observation | undefined;
    if (targetScheduleId) {
      obs = ObservationService.getObservationByScheduleId(targetScheduleId);
    }
    if (!obs) {
      obs = ObservationService.getObservationByTeacherAndSemester(teacherId, semester);
    }
    setObservation(obs || null);

    const sessions = CoachingService.getSessions();
    let existing: CoachingSession | undefined;
    if (obs) {
      existing = sessions.find((s) => s.observation_id === obs!.id);
    }
    if (!existing && !targetScheduleId) {
      existing = sessions.find((s) => s.teacher_id === teacherId && s.semester === semester);
    }

    if (existing) {
      setSession(existing);
      setSessionQuestions(CoachingService.getSessionQuestions(existing.id));
      const flList = FollowupService.getFollowupsByCoachingSessionId(existing.id);
      setFollowups(flList);
      if (flList.length > 0) {
        setRtlMasalah(flList[0].masalah_utama || "");
        setRtlSolusi(flList[0].solusi_disepakati || "");
        setRtlAksi(flList[0].aksi_konkret_guru || "");
        setRtlDukungan(flList[0].dukungan_kepala_sekolah || "");
        setRtlDeadline(flList[0].deadline || "");
      }
    } else {
      const sc = targetScheduleId ? ScheduleService.getSchedules().find((s) => s.id === targetScheduleId) : undefined;
      const newSession: CoachingSession = {
        id: crypto.randomUUID(),
        observation_id: obs ? obs.id : crypto.randomUUID(),
        teacher_id: teacherId,
        supervisor_id: "00000000-0000-0000-0000-000000000001",
        semester,
        tanggal_coaching: sc?.rencana_coaching || new Date().toISOString().split("T")[0],
        waktu_mulai: "10:00",
        tempat: "Ruang Konsultasi Akademik",
        nomor_dokumen: `NC/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/001`,
        refleksi_guru: {
          hal_sudah_baik: "",
          hal_perlu_ditingkatkan: "",
          tantangan_terbesar: "",
          perasaan_setelah_mengajar: "",
        },
        poin_kunci_dialog: "",
        insight_utama_guru: "",
        komitmen_utama_guru: "",
        rencana_monitoring_berikutnya: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split("T")[0],
        catatan_supervisor: "",
        status: "Draf",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
      };

      setSession(newSession);
      setSessionQuestions([]);
      setFollowups([]);
      setRtlMasalah("");
      setRtlSolusi("");
      setRtlAksi("");
      setRtlDukungan("Pendampingan dan modul referensi kurikulum");
      setRtlDeadline(new Date(Date.now() + 21 * 24 * 3600 * 1000).toISOString().split("T")[0]);
    }
  };

  /**
   * Menangani penggantian guru sasaran
   */
  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    setActiveStep(1);
    const sc = ScheduleService.getSchedules().find((s) => s.teacher_id === teacherId);
    if (schoolSettings) {
      loadSession(teacherId, schoolSettings.semester_aktif, sc ? sc.id : null);
    }
  };

  /**
   * Memperbarui field refleksi mandiri guru (Doc 5 Bagian A)
   */
  const handleRefleksiChange = (field: keyof NonNullable<CoachingSession["refleksi_guru"]>, value: string) => {
    if (!session || session.status === "Final") return;
    setSession({
      ...session,
      refleksi_guru: {
        ...session.refleksi_guru,
        [field]: value,
      },
    });
  };

  /**
   * Menambah atau melepas pertanyaan percakapan dari bank pertanyaan
   */
  const toggleQuestion = (kode: string) => {
    if (!session || session.status === "Final") return;

    const existingIndex = sessionQuestions.findIndex((q) => q.kode_pertanyaan === kode);
    if (existingIndex >= 0) {
      setSessionQuestions(sessionQuestions.filter((q) => q.kode_pertanyaan !== kode));
    } else {
      setSessionQuestions([
        ...sessionQuestions,
        {
          session_id: session.id,
          kode_pertanyaan: kode,
          urutan: sessionQuestions.length + 1,
          jawaban_ringkas_guru: "",
        },
      ]);
    }
  };

  /**
   * Mengubah catatan jawaban guru untuk pertanyaan tertentu
   */
  const handleAnswerChange = (kode: string, jawaban: string) => {
    if (!session || session.status === "Final") return;
    setSessionQuestions(
      sessionQuestions.map((q) =>
        q.kode_pertanyaan === kode ? { ...q, jawaban_ringkas_guru: jawaban } : q
      )
    );
  };

  /**
   * Menyimpan draf sesi coaching dan RTL terkait
   */
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!session) return;
    setErrorBanner(null);

    try {
      CoachingService.saveSession(session);
      CoachingService.saveSessionQuestions(session.id, sessionQuestions);

      // Simpan kesepakatan RTL jika telah diisi
      if (rtlMasalah.trim() || rtlAksi.trim() || session.komitmen_utama_guru.trim()) {
        const item: FollowupItem = {
          id: followups[0]?.id || crypto.randomUUID(),
          coaching_session_id: session.id,
          teacher_id: session.teacher_id,
          semester: session.semester,
          masalah_utama: rtlMasalah.trim() || session.poin_kunci_dialog || "Peningkatan kualitas pembelajaran kelas",
          solusi_disepakati: rtlSolusi.trim() || session.insight_utama_guru || "Penerapan strategi interaktif berpusat pada siswa",
          aksi_konkret_guru: rtlAksi.trim() || session.komitmen_utama_guru || "Mempraktikkan model pembelajaran yang disepakati",
          dukungan_kepala_sekolah: rtlDukungan.trim() || "Fasilitasi modul dan sarana ajar",
          deadline: rtlDeadline || session.rencana_monitoring_berikutnya,
          bukti_tindak_lanjut: "Dokumentasi modul ajar dan hasil karya belajar siswa",
          foto_bukti_url: null,
          status: "Berjalan",
          kode_pertanyaan_pemicu: sessionQuestions[0]?.kode_pertanyaan || "A-01",
          target_indikator_sukses: "Meningkatnya keaktifan dan pemahaman siswa di kelas",
          sumber_daya_dibutuhkan: "Bahan ajar dan media kontekstual",
          jenis_dukungan: "Sarana dan Prasarana",
          created_at: followups[0]?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: followups[0]?.version || 1,
        };

        const savedFollowup = FollowupService.saveFollowupItem(item);
        setFollowups([savedFollowup]);
      }

      setSuccessBanner("Sesi percakapan coaching berhasil disimpan!");
      setTimeout(() => setSuccessBanner(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorBanner(err.message);
      }
    }
  };

  /**
   * Memfinalisasi sesi coaching secara resmi
   */
  const handleFinalize = () => {
    if (!session) return;
    setErrorBanner(null);

    try {
      // Pastikan data tersimpan terlebih dahulu
      CoachingService.saveSession(session);
      CoachingService.saveSessionQuestions(session.id, sessionQuestions);

      // Pastikan ada minimal 1 kesepakatan RTL agar syarat finalisasi terpenuhi
      let currentFollowups = FollowupService.getFollowupsByCoachingSessionId(session.id);
      if (currentFollowups.length === 0) {
        const autoFollowup: FollowupItem = {
          id: crypto.randomUUID(),
          coaching_session_id: session.id,
          teacher_id: session.teacher_id,
          semester: session.semester,
          masalah_utama: rtlMasalah.trim() || session.poin_kunci_dialog || "Refleksi dan perbaikan hasil observasi pembelajaran",
          solusi_disepakati: rtlSolusi.trim() || session.insight_utama_guru || "Penguatan diferensiasi dan keterlibatan aktif siswa",
          aksi_konkret_guru: rtlAksi.trim() || session.komitmen_utama_guru || "Menyusun perangkat ajar berdiferensiasi untuk pertemuan berikutnya",
          dukungan_kepala_sekolah: rtlDukungan.trim() || "Dukungan modul ajar dan pendampingan berkala",
          deadline: rtlDeadline || session.rencana_monitoring_berikutnya,
          bukti_tindak_lanjut: "Modul ajar dan asesmen pembelajaran",
          foto_bukti_url: null,
          status: "Berjalan",
          kode_pertanyaan_pemicu: sessionQuestions[0]?.kode_pertanyaan || "A-01",
          target_indikator_sukses: "Keterlibatan belajar siswa meningkat optimal",
          sumber_daya_dibutuhkan: "Sarana modul ajar dan LKPD",
          jenis_dukungan: "Sarana dan Prasarana",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1,
        };
        FollowupService.saveFollowupItem(autoFollowup);
        currentFollowups = [autoFollowup];
        setFollowups(currentFollowups);
      }

      const finalized = CoachingService.finalizeSession(session.id);
      setSession(finalized);
      setSuccessBanner("Sesi coaching pasca-observasi berhasil difinalisasi dan dikunci!");
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorBanner(err.message);
      }
    }
  };

  const currentTeacher = teachers.find((t) => t.id === selectedTeacherId);

  // Ambil metrik observasi untuk rekomendasi pertanyaan pintar
  const obsMetrics = useMemo(() => {
    if (!observation) return null;
    const scores = ObservationService.getAllScores(observation.id);
    return ObservationService.calculateObservationMetrics(scores);
  }, [observation]);

  // Rekomendasi 3 pertanyaan otomatis sesuai area prioritas observasi
  const recommendedQuestions = useMemo(() => {
    const priority = obsMetrics?.priorityAspect || "A";
    const matched = SEED_COACHING_QUESTIONS.filter((q) => q.kategori === priority);
    if (matched.length >= 3) return matched.slice(0, 3);
    const fallback = SEED_COACHING_QUESTIONS.filter((q) => q.kategori === "A");
    return [...matched, ...fallback].slice(0, 3);
  }, [obsMetrics]);

  if (!session || !currentTeacher || !schoolSettings) {
    return (
      <div className="p-12 text-center text-muted">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Memuat ruang percakapan coaching guru...</p>
      </div>
    );
  }

  const selectedCodes = sessionQuestions.map((q) => q.kode_pertanyaan);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notifikasi Status */}
      {successBanner && (
        <div className="p-3.5 rounded-control bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{successBanner}</span>
          </div>
          <span className="text-[11px] font-mono opacity-80">Tersimpan</span>
        </div>
      )}

      {errorBanner && (
        <div className="p-3.5 rounded-control bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-sm flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span className="font-medium">{errorBanner}</span>
        </div>
      )}

      {/* Header Utama: Hangat, Bersahabat & Menenangkan */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground font-serif">
              Percakapan Refleksi & Coaching Guru
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <HeartHandshake className="w-3.5 h-3.5" />
              Ruang Kemitraan Aman & Konfidensial
            </span>
          </div>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Dialog kemitraan setelah observasi kelas: temani guru menemukan pemahaman baru,
            merayakan hal baik, dan menyepakati langkah perbaikan secara mandiri.
          </p>
        </div>

        {/* Tombol Aksi Dokumen */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => setIsPrintModalOpen(true)}
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Cetak Notulen A4
          </Button>

          {session.status !== "Final" ? (
            <>
              <Button type="button" variant="outline" size="md" onClick={() => handleSave()}>
                <Save className="w-4 h-4 mr-1.5" />
                Simpan Draf
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleFinalize}
                disabled={sessionQuestions.length < 3}
                title={
                  sessionQuestions.length < 3
                    ? `Pilih minimal 3 pertanyaan pemantik (saat ini ${sessionQuestions.length}/3)`
                    : "Finalisasi sesi coaching ini"
                }
              >
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Finalisasi Sesi ({sessionQuestions.length}/3 Pertanyaan)
              </Button>
            </>
          ) : (
            <span className="px-3.5 py-2 rounded text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Sesi Final & Terkunci
            </span>
          )}
        </div>
      </div>

      {/* Kartu Profil Guru & Sintesis Hasil Observasi Terkait */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Kolom 1-2: Informasi Guru & Waktu Dialog */}
        <div className="lg:col-span-2 rounded-panel border border-border bg-surface p-5 space-y-3.5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-primary" />
                Guru Rekan Dialog:
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => handleTeacherChange(e.target.value)}
                className="w-full sm:w-80 px-3.5 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama_lengkap} — {t.mata_pelajaran} ({t.kelas_diampu})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-muted space-y-0.5 sm:text-right">
              <p>
                <strong>Tanggal Dialog:</strong> {session.tanggal_coaching}
              </p>
              <p>
                <strong>Tempat:</strong> {session.tempat} (Pukul {session.waktu_mulai} WIB)
              </p>
            </div>
          </div>

          {/* Sintesis Hasil Observasi Kelas */}
          {obsMetrics ? (
            <div className="p-3.5 rounded-control bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-foreground block">
                    Hasil Observasi Terakhir: {obsMetrics.percentage?.toFixed(1)}% ({obsMetrics.predikat})
                  </span>
                  <span className="text-muted">
                    Fokus Penguatan: <strong>Aspek {obsMetrics.priorityAspect}</strong> (Nilai rata-rata butir terendah)
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-medium text-primary bg-surface px-2.5 py-1 rounded border border-border shrink-0">
                Data Terhubung Otomatis
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-control bg-black/5 dark:bg-white/5 border border-border text-xs text-muted flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Belum ada lembar observasi yang difinalisasi untuk guru ini pada semester aktif.</span>
            </div>
          )}
        </div>

        {/* Kolom 3: Prinsip Coaching Ramah (Sahabat Guru) */}
        <div className="rounded-panel border border-border bg-gradient-to-br from-surface to-primary/5 p-5 space-y-2.5 shadow-xs text-xs">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>3 Kunci Percakapan Kemitraan</span>
          </div>
          <ul className="space-y-2 text-muted leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">1.</span>
              <span><strong>Mendengarkan 70% | Bertanya 30%:</strong> Biarkan guru banyak bercerita dan menganalisis pengalamannya.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">2.</span>
              <span><strong>Tahan Solusi Instan:</strong> Hindari langsung menggurui, pancing guru menemukan solusinya sendiri.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">3.</span>
              <span><strong>Apresiasi Otentik:</strong> Rayakan usaha dan ide baru yang telah dicoba di kelas.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Navigasi Alur 3 Langkah Bertahap (Guided Stepper Sangat Mudah Dipahami 50++) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 p-1.5 rounded-panel bg-surface border border-border select-none">
        {/* Tombol Langkah 1 */}
        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className={`flex items-center gap-3 p-3.5 rounded-control text-left transition-smooth border ${
            activeStep === 1
              ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20"
              : "bg-surface text-foreground border-border hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              activeStep === 1 ? "bg-white text-primary" : "bg-black/10 dark:bg-white/10 text-muted"
            }`}
          >
            1
          </div>
          <div>
            <span className="text-xs font-bold block">Langkah 1: Refleksi Awal</span>
            <span
              className={`text-[11px] line-clamp-1 ${
                activeStep === 1 ? "text-white/80" : "text-muted"
              }`}
            >
              Dengarkan perasaan & pengalaman guru
            </span>
          </div>
        </button>

        {/* Tombol Langkah 2 */}
        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className={`flex items-center gap-3 p-3.5 rounded-control text-left transition-smooth border ${
            activeStep === 2
              ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20"
              : "bg-surface text-foreground border-border hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              activeStep === 2 ? "bg-white text-primary" : "bg-black/10 dark:bg-white/10 text-muted"
            }`}
          >
            2
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold block">Langkah 2: Pertanyaan Pemantik</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  activeStep === 2
                    ? "bg-white/20 text-white"
                    : sessionQuestions.length >= 3
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                {sessionQuestions.length}/3-5
              </span>
            </div>
            <span
              className={`text-[11px] line-clamp-1 ${
                activeStep === 2 ? "text-white/80" : "text-muted"
              }`}
            >
              Pilih 3–5 pertanyaan pemantik dialog
            </span>
          </div>
        </button>

        {/* Tombol Langkah 3 */}
        <button
          type="button"
          onClick={() => setActiveStep(3)}
          className={`flex items-center gap-3 p-3.5 rounded-control text-left transition-smooth border ${
            activeStep === 3
              ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20"
              : "bg-surface text-foreground border-border hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              activeStep === 3 ? "bg-white text-primary" : "bg-black/10 dark:bg-white/10 text-muted"
            }`}
          >
            3
          </div>
          <div>
            <span className="text-xs font-bold block">Langkah 3: Kesepakatan & RTL</span>
            <span
              className={`text-[11px] line-clamp-1 ${
                activeStep === 3 ? "text-white/80" : "text-muted"
              }`}
            >
              Komitmen nyata & rencana tindak lanjut
            </span>
          </div>
        </button>
      </div>

      {/* KONTEN LANGKAH 1: REFLEKSI AWAL GURU (MENDENGARKAN) */}
      {activeStep === 1 && (
        <div className="space-y-6">
          <Panel
            title="Langkah 1: Ungkapan Perasaan & Refleksi Mandiri Guru"
            subtitle="Tanyakan secara ramah dan catat apa yang dirasakan rekan guru saat mengajar di kelas tadi (Dokumen 5 Bagian A)"
            className="p-6 md:p-8 shadow-xs border-border space-y-6"
          >
            <div className="p-3.5 rounded-control bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs md:text-sm leading-relaxed flex items-start gap-2.5">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Tips Membuka Dialog yang Nyaman:</strong> Awali dengan sapaan hangat dan tulus.
                Biarkan guru merasa aman untuk menceritakan rasa lelah atau kebanggaannya tanpa khawatir dinilai negatif.
              </div>
            </div>

            <div className="space-y-5">
              {/* 1. Perasaan Setelah Mengajar */}
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-bold text-foreground flex items-center justify-between">
                  <span>1. Bagaimana perasaan Bapak/Ibu setelah menyelesaikan sesi mengajar tadi?</span>
                  <span className="text-xs font-normal text-muted">Refleksi Emosional</span>
                </label>
                <textarea
                  rows={2}
                  value={session.refleksi_guru?.perasaan_setelah_mengajar || ""}
                  disabled={session.status === "Final"}
                  onChange={(e) => handleRefleksiChange("perasaan_setelah_mengajar", e.target.value)}
                  placeholder="Contoh: Merasa lega namun agak lelah karena banyak mendampingi kelompok yang kesulitan pemahaman aljabar..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>

              {/* 2. Hal yang Sudah Baik */}
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-bold text-foreground flex items-center justify-between">
                  <span>2. Aktivitas atau momen apa yang dirasa sudah berjalan sangat baik dan memuaskan?</span>
                  <span className="text-xs font-normal text-emerald-600 font-semibold">Kekuatan & Keberhasilan</span>
                </label>
                <textarea
                  rows={2}
                  value={session.refleksi_guru?.hal_sudah_baik || ""}
                  disabled={session.status === "Final"}
                  onChange={(e) => handleRefleksiChange("hal_sudah_baik", e.target.value)}
                  placeholder="Contoh: Apersepsi dengan video kontekstual parkir berhasil memancing rasa ingin tahu siswa sejak menit pertama..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>

              {/* 3. Tantangan atau Kendala */}
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-bold text-foreground flex items-center justify-between">
                  <span>3. Apa tantangan atau kendala terbesar yang dirasakan selama pembelajaran berlangsung?</span>
                  <span className="text-xs font-normal text-rose-600 font-semibold">Tantangan Kelas</span>
                </label>
                <textarea
                  rows={2}
                  value={session.refleksi_guru?.tantangan_terbesar || ""}
                  disabled={session.status === "Final"}
                  onChange={(e) => handleRefleksiChange("tantangan_terbesar", e.target.value)}
                  placeholder="Contoh: Siswa di kelompok 4 kesulitan mengubah soal cerita menjadi model matematika sehingga butuh bimbingan terus-menerus..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>

              {/* 4. Hal yang Ingin Ditingkatkan */}
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-bold text-foreground flex items-center justify-between">
                  <span>4. Jika Bapak/Ibu berkesempatan mengulang sesi ini, hal apa yang ingin ditingkatkan?</span>
                  <span className="text-xs font-normal text-primary font-semibold">Peluang Pertumbuhan</span>
                </label>
                <textarea
                  rows={2}
                  value={session.refleksi_guru?.hal_perlu_ditingkatkan || ""}
                  disabled={session.status === "Final"}
                  onChange={(e) => handleRefleksiChange("hal_perlu_ditingkatkan", e.target.value)}
                  placeholder="Contoh: Ingin menyiapkan lembar scaffolding berjenjang agar siswa yang kesulitan bisa mandiri tanpa menunggu guru..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>
            </div>

            {/* Tombol Navigasi Bawah */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-xs text-muted">
                Langkah 1 selesai? Lanjutkan ke pemilihan pertanyaan dialog.
              </span>
              <Button type="button" variant="primary" size="md" onClick={() => setActiveStep(2)}>
                Lanjut ke Langkah 2: Pertanyaan Pemantik
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* KONTEN LANGKAH 2: PERTANYAAN PEMANTIK DIALOG */}
      {activeStep === 2 && (
        <div className="space-y-6">
          {/* Rekomendasi Pertanyaan Pintar (Smart Recommendation) */}
          {obsMetrics && session.status !== "Final" && (
            <div className="rounded-panel border border-primary/30 bg-primary/5 p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm md:text-base font-bold text-foreground">
                    Saran Pertanyaan Pemantik Otomatis (Rekomendasi Berbasis Hasil Observasi)
                  </h3>
                </div>
                <span className="text-xs font-mono text-primary font-semibold">
                  Prioritas Aspek {obsMetrics.priorityAspect}
                </span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Berdasarkan observasi kelas, guru memerlukan eksplorasi pada{" "}
                <strong>Aspek {obsMetrics.priorityAspect}</strong>. Anda dapat langsung memilih pertanyaan di bawah ini:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recommendedQuestions.map((q) => {
                  const isSelected = selectedCodes.includes(q.kode);
                  return (
                    <div
                      key={q.kode}
                      className={`p-3.5 rounded-control border flex flex-col justify-between transition-smooth ${
                        isSelected
                          ? "bg-primary/10 border-primary text-foreground"
                          : "bg-surface border-border text-foreground hover:border-primary/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono font-bold text-primary text-xs">
                            {q.kode} (Kategori {q.kategori})
                          </span>
                          <span className="text-[10px] text-muted">Rekomendasi</span>
                        </div>
                        <p className="text-xs font-semibold leading-snug">{q.pertanyaan}</p>
                      </div>
                      <div className="pt-3">
                        <Button
                          type="button"
                          variant={isSelected ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => toggleQuestion(q.kode)}
                          className="w-full text-xs"
                        >
                          {isSelected ? "✓ Sudah Terpilih" : "+ Gunakan Pertanyaan Ini"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Daftar Pertanyaan yang Telah Dipilih (Kolom Catatan Respon Guru) */}
          <Panel
            title={`Pertanyaan Percakapan Terpilih (${sessionQuestions.length} Pertanyaan)`}
            subtitle="Gunakan pertanyaan berikut saat berdialog dengan guru dan catat gagasan utama yang disampaikan"
            className="p-6 md:p-8 shadow-xs border-border space-y-5"
          >
            {sessionQuestions.length === 0 ? (
              <div className="py-12 text-center text-muted space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-sm font-medium">Belum ada pertanyaan percakapan yang dipilih.</p>
                <p className="text-xs max-w-md mx-auto">
                  Pilih dari rekomendasi di atas atau jelajahi bank pertanyaan di bawah ini. Sesi
                  coaching memerlukan minimal 3 pertanyaan pemantik.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessionQuestions.map((sq, idx) => {
                  const q = SEED_COACHING_QUESTIONS.find((item) => item.kode === sq.kode_pertanyaan);
                  if (!q) return null;

                  return (
                    <div
                      key={sq.kode_pertanyaan}
                      className="p-5 rounded-control border border-border bg-black/5 dark:bg-white/5 space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded bg-primary/10 text-primary font-mono font-bold text-xs">
                          Pertanyaan #{idx + 1}: {q.kode} (Kategori {q.kategori})
                        </span>
                        {session.status !== "Final" && (
                          <button
                            type="button"
                            onClick={() => toggleQuestion(sq.kode_pertanyaan)}
                            className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 hover:underline"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Lepas Pertanyaan
                          </button>
                        )}
                      </div>

                      <div>
                        <p className="text-sm md:text-base font-bold text-foreground leading-snug">
                          &ldquo;{q.pertanyaan}&rdquo;
                        </p>
                        <p className="text-xs text-muted mt-1 italic">
                          Tujuan dialog: {q.tujuan}
                        </p>
                      </div>

                      {/* Catatan Jawaban / Gagasan Guru */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">
                          Catatan Jawaban / Kesadaran Baru Guru:
                        </label>
                        <textarea
                          rows={2}
                          value={sq.jawaban_ringkas_guru}
                          disabled={session.status === "Final"}
                          onChange={(e) => handleAnswerChange(sq.kode_pertanyaan, e.target.value)}
                          placeholder="Ketik poin jawaban, pemikiran, atau komitmen yang disampaikan guru..."
                          className="w-full px-3.5 py-2 text-xs md:text-sm rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* Bank 45 Pertanyaan Lengkap (Bisa Dicari & Difilter Kategori) */}
          {session.status !== "Final" && (
            <Panel
              title="Bank Lengkap 45 Pertanyaan Coaching (Sheet 7)"
              subtitle="Pilih pertanyaan tambahan sesuai dinamika percakapan di ruang coaching"
              className="p-6 md:p-8 shadow-xs border-border space-y-4"
            >
              {/* Tab Kategori A s.d. G */}
              <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-border">
                {[
                  { cat: "A", label: "A. Reflektif Awal" },
                  { cat: "B", label: "B. Pemecahan Masalah" },
                  { cat: "C", label: "C. Strategi Inovasi" },
                  { cat: "D", label: "D. Diferensiasi" },
                  { cat: "E", label: "E. Iklim Belajar" },
                  { cat: "F", label: "F. Asesmen & Umpan Balik" },
                  { cat: "G", label: "G. Komitmen RTL" },
                ].map((item) => (
                  <button
                    key={item.cat}
                    type="button"
                    onClick={() => setActiveCategory(item.cat)}
                    className={`px-3 py-1.5 rounded-control text-xs font-semibold border transition-smooth whitespace-nowrap ${
                      activeCategory === item.cat
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-surface text-foreground border-border hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Daftar Pertanyaan per Kategori */}
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {SEED_COACHING_QUESTIONS.filter((q) => q.kategori === activeCategory).map((q) => {
                  const isSelected = selectedCodes.includes(q.kode);
                  return (
                    <div
                      key={q.kode}
                      onClick={() => toggleQuestion(q.kode)}
                      className={`p-3.5 rounded-control border text-xs md:text-sm cursor-pointer flex items-start justify-between gap-3 transition-colors ${
                        isSelected
                          ? "bg-primary/10 border-primary text-foreground font-medium"
                          : "bg-surface border-border text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex-1">
                        <span className="font-bold font-mono text-primary mr-2">[{q.kode}]</span>
                        <span>{q.pertanyaan}</span>
                        <p className="text-[11px] text-muted mt-1 italic">Tujuan: {q.tujuan}</p>
                      </div>
                      <span
                        className={`text-xs font-bold shrink-0 px-2.5 py-1 rounded ${
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-black/5 dark:bg-white/10 text-muted"
                        }`}
                      >
                        {isSelected ? "✓ Terpilih" : "+ Tambah"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}

          {/* Tombol Navigasi Bawah */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button type="button" variant="secondary" size="md" onClick={() => setActiveStep(1)}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Kembali ke Langkah 1
            </Button>
            <Button type="button" variant="primary" size="md" onClick={() => setActiveStep(3)}>
              Lanjut ke Langkah 3: Kesepakatan & RTL
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* KONTEN LANGKAH 3: KESEPAKATAN & RENCANA TINDAK LANJUT (RTL) */}
      {activeStep === 3 && (
        <div className="space-y-6">
          <Panel
            title="Langkah 3: Kesepakatan, Komitmen & Rencana Tindak Lanjut (RTL)"
            subtitle="Rumuskan komitmen mandiri rekan guru beserta dukungan nyata yang disiapkan pihak sekolah"
            className="p-6 md:p-8 shadow-xs border-border space-y-6"
          >
            {/* Bagian A: Intisari Dialog Reflektif */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border/80 pb-1.5 flex items-center gap-2">
                <Target className="w-4 h-4" />
                A. Intisari Kesepakatan Dialog
              </h3>

              {/* 1. Poin Kunci Dialog */}
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-bold text-foreground">
                  1. Poin Kunci Dialog (Inti Pokok yang Dibahas Bersama) *
                </label>
                <textarea
                  rows={2}
                  value={session.poin_kunci_dialog}
                  disabled={session.status === "Final"}
                  onChange={(e) => setSession({ ...session, poin_kunci_dialog: e.target.value })}
                  placeholder="Contoh: Mendiskusikan cara agar siswa di kelompok yang kesulitan aljabar dapat belajar mandiri tanpa terus bergantung pada penjelasan guru..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                  required
                />
              </div>

              {/* 2. Insight / Kesadaran Baru Guru */}
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-bold text-foreground">
                  2. Insight / Kesadaran Baru Guru (Aha-Moment yang Ditemukan Guru) *
                </label>
                <textarea
                  rows={2}
                  value={session.insight_utama_guru}
                  disabled={session.status === "Final"}
                  onChange={(e) => setSession({ ...session, insight_utama_guru: e.target.value })}
                  placeholder="Contoh: Guru menyadari perlunya lembar bantuan visual (scaffolding sheet) berjenjang sebelum latihan mandiri dimulai..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                  required
                />
              </div>

              {/* 3. Komitmen Utama Guru */}
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-bold text-foreground">
                  3. Komitmen Aksi Nyata Guru (Janji yang Akan Diterapkan di Kelas) *
                </label>
                <textarea
                  rows={2}
                  value={session.komitmen_utama_guru}
                  disabled={session.status === "Final"}
                  onChange={(e) => setSession({ ...session, komitmen_utama_guru: e.target.value })}
                  placeholder="Contoh: Akan menyusun dan mempraktikkan LKPD berjenjang 2 tingkat kesulitan pada pertemuan pekan depan..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                  required
                />
              </div>
            </div>

            {/* Bagian B: Rencana Tindak Lanjut Nyata (RTL Terintegrasi) */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-border/80 pb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                B. Rencana Tindak Lanjut Konkret (RTL) & Dukungan Sekolah
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Aksi Konkret yang Dilakukan Guru:
                  </label>
                  <input
                    type="text"
                    value={rtlAksi}
                    disabled={session.status === "Final"}
                    onChange={(e) => setRtlAksi(e.target.value)}
                    placeholder="Contoh: Menyusun 2 varian LKPD berdiferensiasi"
                    className="w-full h-10 px-3.5 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Bentuk Dukungan dari Pihak Sekolah:
                  </label>
                  <input
                    type="text"
                    value={rtlDukungan}
                    disabled={session.status === "Final"}
                    onChange={(e) => setRtlDukungan(e.target.value)}
                    placeholder="Contoh: Fasilitasi modul ajar & penggandaan lembar kerja"
                    className="w-full h-10 px-3.5 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Target Selesai / Deadline Aksi:
                  </label>
                  <input
                    type="date"
                    value={rtlDeadline}
                    disabled={session.status === "Final"}
                    onChange={(e) => setRtlDeadline(e.target.value)}
                    className="w-full h-10 px-3.5 text-sm rounded-control border border-border bg-surface text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Jadwal Cek-in Monitoring Berkala (Pekan ke-2) *
                  </label>
                  <input
                    type="date"
                    value={session.rencana_monitoring_berikutnya}
                    disabled={session.status === "Final"}
                    onChange={(e) =>
                      setSession({ ...session, rencana_monitoring_berikutnya: e.target.value })
                    }
                    className="w-full h-10 px-3.5 text-sm rounded-control border border-border bg-surface text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              {/* Catatan Apresiasi Supervisor */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-foreground">
                  Catatan Apresiasi & Penguatan dari Supervisor:
                </label>
                <input
                  type="text"
                  value={session.catatan_supervisor || ""}
                  disabled={session.status === "Final"}
                  onChange={(e) => setSession({ ...session, catatan_supervisor: e.target.value })}
                  placeholder="Contoh: Terima kasih atas keterbukaan dan semangat belajarnya, Ibu guru yang hebat..."
                  className="w-full h-10 px-3.5 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Tombol Navigasi Bawah */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border">
              <Button type="button" variant="secondary" size="md" onClick={() => setActiveStep(2)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Kembali ke Langkah 2
              </Button>

              <div className="flex items-center gap-2.5">
                <Button type="button" variant="outline" size="md" onClick={() => handleSave()}>
                  <Save className="w-4 h-4 mr-1.5" />
                  Simpan Draf Keseluruhan
                </Button>
                {session.status !== "Final" && (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleFinalize}
                    disabled={sessionQuestions.length < 3}
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Finalisasi & Kunci Notulen
                  </Button>
                )}
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* Modal Cetak Notulen Konfidensial A4 */}
      <CoachingPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        session={session}
        teacher={currentTeacher}
        school={schoolSettings}
        followups={followups}
      />
    </div>
  );
};

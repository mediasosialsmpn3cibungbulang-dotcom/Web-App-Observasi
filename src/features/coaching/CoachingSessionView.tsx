"use client";

import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import {
  CoachingSession,
  CoachingSessionQuestionItem,
  Teacher,
  SchoolSettings,
  FollowupItem,
  Observation,
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

export const CoachingSessionView: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);

  const [session, setSession] = useState<CoachingSession | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<CoachingSessionQuestionItem[]>([]);
  const [followups, setFollowups] = useState<FollowupItem[]>([]);
  const [observation, setObservation] = useState<Observation | null>(null);

  const [activeCategory, setActiveCategory] = useState("A");
  const [searchQuestion, setSearchQuestion] = useState("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    const list = TeacherService.getTeachers().filter((t) => t.aktif);
    setTeachers(list);
    const school = SettingsService.getSchoolSettings();
    setSchoolSettings(school);

    if (list.length > 0) {
      setSelectedTeacherId(list[0].id);
      loadSession(list[0].id, school.semester_aktif);
    }
  }, []);

  const loadSession = (teacherId: string, semester: string) => {
    const obs = ObservationService.getObservationByTeacherAndSemester(teacherId, semester);
    setObservation(obs || null);

    const sessions = CoachingService.getSessions();
    const existing = sessions.find((s) => s.teacher_id === teacherId && s.semester === semester);

    if (existing) {
      setSession(existing);
      setSessionQuestions(CoachingService.getSessionQuestions(existing.id));
      setFollowups(FollowupService.getFollowupsByCoachingSessionId(existing.id));
    } else {
      const newSession: CoachingSession = {
        id: crypto.randomUUID(),
        observation_id: obs ? obs.id : crypto.randomUUID(),
        teacher_id: teacherId,
        supervisor_id: "00000000-0000-0000-0000-000000000001",
        semester,
        tanggal_coaching: new Date().toISOString().split("T")[0],
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
    }
  };

  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    if (schoolSettings) {
      loadSession(teacherId, schoolSettings.semester_aktif);
    }
  };

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

  const handleAnswerChange = (kode: string, jawaban: string) => {
    if (!session || session.status === "Final") return;
    setSessionQuestions(
      sessionQuestions.map((q) =>
        q.kode_pertanyaan === kode ? { ...q, jawaban_ringkas_guru: jawaban } : q
      )
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setErrorBanner(null);

    try {
      CoachingService.saveSession(session);
      CoachingService.saveSessionQuestions(session.id, sessionQuestions);
      setSuccessBanner("Sesi coaching dan jawaban refleksi berhasil disimpan!");
      setTimeout(() => setSuccessBanner(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorBanner(err.message);
      }
    }
  };

  const handleFinalize = () => {
    if (!session) return;
    setErrorBanner(null);

    try {
      CoachingService.saveSession(session);
      CoachingService.saveSessionQuestions(session.id, sessionQuestions);
      const finalized = CoachingService.finalizeSession(session.id);
      setSession(finalized);
      setSuccessBanner("Sesi coaching pasca-observasi berhasil difinalisasi!");
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorBanner(err.message);
      }
    }
  };

  const currentTeacher = teachers.find((t) => t.id === selectedTeacherId);

  // Observasi metrics
  const obsMetrics = useMemo(() => {
    if (!observation) return null;
    const scores = ObservationService.getAllScores(observation.id);
    return ObservationService.calculateObservationMetrics(scores);
  }, [observation]);

  if (!session || !currentTeacher || !schoolSettings) {
    return <div className="p-8 text-center text-muted">Memuat data sesi coaching...</div>;
  }

  const selectedCodes = sessionQuestions.map((q) => q.kode_pertanyaan);

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Toast Alert */}
      {successBanner && (
        <div className="p-3.5 rounded-control bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
          <span className="text-[11px] font-mono opacity-80">Saved</span>
        </div>
      )}

      {errorBanner && (
        <div className="p-3.5 rounded-control bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Diskusi Refleksi & Coaching Guru
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-300 font-semibold">
              <Shield className="w-3 h-3" />
              KONFIDENSIAL (RAHASIA)
            </span>
          </div>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Dialog kemitraan 5 fase setelah observasi kelas: bantu guru merefleksikan proses belajar dan menyepakati rencana perbaikan.
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
            Cetak Notulen
          </Button>

          {session.status !== "Final" ? (
            <>
              <Button type="submit" variant="secondary" size="md">
                Simpan Draf
              </Button>
              <Button type="button" variant="primary" size="md" onClick={handleFinalize}>
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Finalisasi Sesi
              </Button>
            </>
          ) : (
            <span className="px-3 py-1.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300">
              Sesi Final & Terkunci
            </span>
          )}
        </div>
      </div>

      {/* Pemilih Guru Sasaran */}
      <div className="flex items-center gap-4 p-4 rounded-control border border-border bg-surface">
        <label className="text-xs font-semibold uppercase text-muted whitespace-nowrap">
          Guru yang Dicoaching:
        </label>
        <select
          value={selectedTeacherId}
          onChange={(e) => handleTeacherChange(e.target.value)}
          className="flex-1 max-w-md px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nama_lengkap} ({t.mata_pelajaran} - {t.kelas_diampu})
            </option>
          ))}
        </select>
        <div className="ml-auto text-xs text-muted">
          Tanggal: <strong>{session.tanggal_coaching}</strong> (Pukul {session.waktu_mulai} WIB)
        </div>
      </div>

      {/* Alur 5 Fase Coaching dengan Rekomendasi Durasi */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 select-none">
        {[
          { fase: "1. Pembukaan", durasi: "5 - 8 Menit", desc: "Mencairkan suasana & emosi guru" },
          { fase: "2. Eksplorasi", durasi: "10 - 15 Menit", desc: "Menganalisis bukti fakta di kelas" },
          { fase: "3. Strategi", durasi: "8 - 12 Menit", desc: "Curah ide alternatif solusi mandiri" },
          { fase: "4. Komitmen", durasi: "7 - 10 Menit", desc: "Aksi konkret & deadline RTL" },
          { fase: "5. Penutup", durasi: "3 - 5 Menit", desc: "Apresiasi & insight kesadaran diri" },
        ].map((item, idx) => (
          <div
            key={item.fase}
            className="p-3 rounded-control border border-border bg-surface text-foreground text-xs"
          >
            <p className="font-bold text-foreground">{item.fase}</p>
            <p className="text-[11px] font-mono text-primary mt-0.5">{item.durasi}</p>
            <p className="text-[10px] text-muted mt-1 line-clamp-1">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Ringkasan Otomatis dari Hasil Observasi (PRD M7) */}
      {obsMetrics && (
        <div className="p-4 rounded-control border border-border bg-black/5 dark:bg-white/5 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <Award className="w-4 h-4 text-primary" />
            <span>Sintesis Bukti dari Lembar Observasi Terkait:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-muted">
            <p>
              <strong>Nilai Observasi:</strong> {obsMetrics.percentage?.toFixed(1)}% ({obsMetrics.predikat})
            </p>
            <p>
              <strong>Area Prioritas Pengembangan:</strong> Aspek {obsMetrics.priorityAspect}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri & Tengah: Pertanyaan Terpilih & Form Jawaban */}
        <div className="lg:col-span-2 space-y-6">
          <Panel
            title="Daftar Pertanyaan Percakapan Terpilih"
            subtitle={`Pilih 3 - 5 pertanyaan kunci (saat ini ${sessionQuestions.length} pertanyaan dipilih)`}
          >
            {sessionQuestions.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">
                Belum ada pertanyaan yang dipilih dari bank pertanyaan di bawah.
              </p>
            ) : (
              <div className="space-y-4">
                {sessionQuestions.map((sq, idx) => {
                  const q = SEED_COACHING_QUESTIONS.find((item) => item.kode === sq.kode_pertanyaan);
                  if (!q) return null;

                  return (
                    <div
                      key={sq.kode_pertanyaan}
                      className="p-4 rounded-control border border-border bg-black/5 dark:bg-white/5 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-primary">
                          #{idx + 1} | {q.kode} (Kategori {q.kategori})
                        </span>
                        {session.status !== "Final" && (
                          <button
                            type="button"
                            onClick={() => toggleQuestion(sq.kode_pertanyaan)}
                            className="text-rose-500 hover:underline flex items-center text-[11px]"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Lepas
                          </button>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-foreground leading-snug">
                        {q.pertanyaan}
                      </p>
                      <p className="text-[11px] text-muted">
                        <em>Tujuan: {q.tujuan}</em>
                      </p>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-muted mb-1">
                          Catatan Jawaban / Komitmen Ringkas Guru:
                        </label>
                        <textarea
                          rows={2}
                          value={sq.jawaban_ringkas_guru}
                          disabled={session.status === "Final"}
                          onChange={(e) => handleAnswerChange(sq.kode_pertanyaan, e.target.value)}
                          placeholder="Ketik poin jawaban atau kesadaran baru guru..."
                          className="w-full px-2.5 py-1.5 text-xs rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* Pemilih dari Bank 45 Pertanyaan */}
          {session.status !== "Final" && (
            <Panel
              title="Bank 45 Pertanyaan Coaching (Sheet 7 & Bonus 1)"
              subtitle="Klik pertanyaan untuk menambahkan ke alur percakapan"
            >
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 border-b border-border">
                {["A", "B", "C", "D", "E", "F", "G"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-control text-xs font-semibold border transition-smooth whitespace-nowrap ${
                      activeCategory === cat
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-surface text-foreground border-border"
                    }`}
                  >
                    Kategori {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {SEED_COACHING_QUESTIONS.filter((q) => q.kategori === activeCategory).map((q) => {
                  const isSelected = selectedCodes.includes(q.kode);
                  return (
                    <div
                      key={q.kode}
                      onClick={() => toggleQuestion(q.kode)}
                      className={`p-3 rounded-control border text-xs cursor-pointer flex items-start justify-between gap-3 transition-colors ${
                        isSelected
                          ? "bg-primary/10 border-primary text-foreground"
                          : "bg-surface border-border text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                    >
                      <div>
                        <span className="font-bold font-mono text-primary mr-2">{q.kode}</span>
                        <span>{q.pertanyaan}</span>
                      </div>
                      <span className="font-semibold text-primary flex-shrink-0">
                        {isSelected ? "Terpilih ✓" : "+ Tambah"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}

          {/* Inti Percakapan & Insight Akhir */}
          <Panel title="Intisari Kesepakatan & Komitmen Dialog">
            <div className="space-y-4 text-xs md:text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Poin Kunci Dialog *
                </label>
                <textarea
                  rows={2}
                  value={session.poin_kunci_dialog}
                  disabled={session.status === "Final"}
                  onChange={(e) => setSession({ ...session, poin_kunci_dialog: e.target.value })}
                  placeholder="Inti tantangan utama yang dibahas..."
                  className="w-full px-3 py-2 text-xs rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Insight / Kesadaran Baru Guru *
                </label>
                <textarea
                  rows={2}
                  value={session.insight_utama_guru}
                  disabled={session.status === "Final"}
                  onChange={(e) => setSession({ ...session, insight_utama_guru: e.target.value })}
                  placeholder="Pemahaman baru yang ditemukan mandiri oleh guru..."
                  className="w-full px-3 py-2 text-xs rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Komitmen Utama Guru *
                </label>
                <textarea
                  rows={2}
                  value={session.komitmen_utama_guru}
                  disabled={session.status === "Final"}
                  onChange={(e) => setSession({ ...session, komitmen_utama_guru: e.target.value })}
                  placeholder="Langkah nyata yang akan dipraktikkan di kelas..."
                  className="w-full px-3 py-2 text-xs rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Jadwal Cek Monitoring Berikutnya *
                  </label>
                  <input
                    type="date"
                    value={session.rencana_monitoring_berikutnya}
                    disabled={session.status === "Final"}
                    onChange={(e) =>
                      setSession({ ...session, rencana_monitoring_berikutnya: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-control border border-border bg-surface text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                  <span className="text-[10px] text-muted">Jadwal cek-in pekan ke-2 pasca coaching</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Catatan Supervisor
                  </label>
                  <input
                    type="text"
                    value={session.catatan_supervisor || ""}
                    disabled={session.status === "Final"}
                    onChange={(e) => setSession({ ...session, catatan_supervisor: e.target.value })}
                    placeholder="Apresiasi atau rekomendasi sesi berikutnya..."
                    className="w-full px-3 py-2 text-xs rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Kolom Kanan: Refleksi Guru & Prinsip Coaching */}
        <div className="space-y-6">
          <Panel title="Refleksi Mandiri Guru (Doc 5)">
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-muted uppercase text-[10px] block">Hal Sudah Baik:</span>
                <p className="text-foreground mt-0.5">
                  {session.refleksi_guru?.hal_sudah_baik || "Belum diisi guru"}
                </p>
              </div>
              <div>
                <span className="font-semibold text-muted uppercase text-[10px] block">Hal Perlu Ditingkatkan:</span>
                <p className="text-foreground mt-0.5">
                  {session.refleksi_guru?.hal_perlu_ditingkatkan || "Belum diisi guru"}
                </p>
              </div>
              <div>
                <span className="font-semibold text-muted uppercase text-[10px] block">Tantangan Terbesar:</span>
                <p className="text-foreground mt-0.5">
                  {session.refleksi_guru?.tantangan_terbesar || "Belum diisi guru"}
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="Prinsip Kemitraan Coaching">
            <div className="space-y-2.5 text-xs text-muted">
              <p>
                <strong>Dengarkan 70% | Bicara 30%:</strong> Biarkan guru mengeksplorasi dan menemukan solusinya sendiri.
              </p>
              <p>
                <strong>Bebas Solusi Instan:</strong> Hindari langsung memberi instruksi perintah; ajukan pertanyaan yang memantik metakognisi.
              </p>
              <p>
                <strong>Apresiasi:</strong> Hargai sekecil apapun kemajuan dan keberanian guru bereksperimen.
              </p>
            </div>
          </Panel>
        </div>
      </div>

      {/* Modal Cetak Notulen Konfidensial */}
      <CoachingPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        session={session}
        teacher={currentTeacher}
        school={schoolSettings}
        followups={followups}
      />
    </form>
  );
};

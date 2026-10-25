"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Printer,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Sparkles,
  Calendar,
  Lightbulb,
  Check,
  X,
} from "lucide-react";
import { PreObservation, Teacher, SchoolSettings, Schedule } from "@/contracts/schemas";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { PreObservationService } from "./pre-observation-service";
import { PreObservationPrintModal } from "./PreObservationPrintModal";
import { TeacherService } from "../teachers/teacher-service";
import { SettingsService } from "../settings/settings-service";
import { ScheduleService } from "../schedules/schedule-service";
import { AspectCode } from "@/contracts/enums";
import { formatTanggalIndonesia } from "@/lib/utils";

// 3 Pilihan Template Praktis Kurikulum Merdeka yang Siap Dipakai Sekali Klik
interface QuickTemplate {
  nama: string;
  labelPendek: string;
  deskripsi: string;
  icon: string;
  topik: string;
  tujuan: string;
  metode: string;
  media: string;
  asesmen: string;
  alokasi: string;
  fokus: { aspek: AspectCode; indikator: string; catatan: string }[];
  karakteristik: string;
  tantangan: string;
  diferensiasi: string;
  harapan: string;
}

const TEMPLATE_CONTOH: QuickTemplate[] = [
  {
    nama: "Diskusi Kelompok & Pemecahan Masalah (PBL)",
    labelPendek: "PBL & Diskusi Kelompok",
    deskripsi: "Cocok untuk mapel IPA, IPS, Matematika, dan PPKn",
    icon: "👥",
    topik: "Pemecahan Masalah Kontekstual melalui Diskusi Kelompok Terbimbing",
    tujuan: "Siswa mampu mengidentifikasi masalah nyata, berkolaborasi aktif dalam kelompok kecil, dan mempresentasikan hasil kesepakatan secara percaya diri.",
    metode: "Problem-Based Learning (PBL) & Diskusi Kelompok Terbimbing",
    media: "Lembar Kerja Peserta Didik (LKPD), Bahan Tayang LCD Proyektor & Buku Paket",
    asesmen: "Pengamatan Keaktifan Diskusi Kelompok & Penilaian Hasil LKPD",
    alokasi: "2 JP (2 x 45 Menit)",
    fokus: [
      {
        aspek: "C",
        indikator: "Pemerataan kesempatan bertanya dan merespons bagi seluruh siswa di setiap kelompok.",
        catatan: "Perhatikan siswa yang pendiam di baris belakang agar ikut berpendapat.",
      },
      {
        aspek: "D",
        indikator: "Pemberian bimbingan khusus (scaffolding) bagi kelompok siswa yang butuh bantuan ekstra.",
        catatan: "Guru berkeliling mendampingi kelompok yang mengalami kesulitan memahami LKPD.",
      },
    ],
    karakteristik: "Kemampuan belajar siswa beragam; sebagian cepat memahami instruksi dan sebagian membutuhkan bimbingan langsung.",
    tantangan: "Sebagian siswa cenderung pasif dan mengandalkan teman kelompoknya yang lebih dominan.",
    diferensiasi: "Menyediakan tugas berjenjang pada LKPD dan membentuk kelompok heterogen dengan tutor sebaya.",
    harapan: "Mendapatkan saran praktis tentang manajemen waktu kerja kelompok agar tidak molor.",
  },
  {
    nama: "Praktik & Eksperimen Nyata (Inquiry)",
    labelPendek: "Inquiry & Praktikum",
    deskripsi: "Cocok untuk PJOK, Seni, Informatika, dan IPA Praktikum",
    icon: "🔬",
    topik: "Praktik Demonstrasi dan Analisis Hasil Pengamatan Nyata",
    tujuan: "Siswa mampu mempraktikkan keterampilan dasar secara berurutan, mengamati hasilnya, dan menarik kesimpulan berdasarkan bukti nyata.",
    metode: "Inquiry Terbimbing, Eksperimen Nyata & Presentasi Hasil Praktik",
    media: "Alat Peraga Praktik / Perangkat Alat Nyata & Format Lembar Pengamatan",
    asesmen: "Rubrik Penilaian Unjuk Kerja (Kinerja Praktik) & Catatan Anekdot",
    alokasi: "2 JP (2 x 45 Menit)",
    fokus: [
      {
        aspek: "B",
        indikator: "Penyampaian instruksi kerja dan keselamatan praktik disampaikan dengan jelas dan runtut.",
        catatan: "Amati apakah seluruh siswa memahami aturan keselamatan sebelum praktik dimulai.",
      },
      {
        aspek: "F",
        indikator: "Suasana ruang praktik tetap tertib, kondusif, dan terkontrol selama siswa beraktivitas.",
        catatan: "Perhatikan kerapian alat setelah selesai digunakan.",
      },
    ],
    karakteristik: "Siswa sangat antusias dengan kegiatan fisik dan praktik langsung dibanding teori.",
    tantangan: "Pengelolaan alat dan waktu persiapan alat butuh koordinasi agar tidak ramai.",
    diferensiasi: "Membagi peran spesifik dalam tiap kelompok (pencatat data, pelaksana alat, pemateri).",
    harapan: "Masukan mengenai cara mengontrol kedisiplinan dan fokus siswa selama sesi praktik.",
  },
  {
    nama: "Literasi Kritis & Diferensiasi Minat",
    labelPendek: "Literasi & Diferensiasi",
    deskripsi: "Cocok untuk Bahasa Indonesia, Bahasa Inggris, dan Agama",
    icon: "📖",
    topik: "Membaca Kritis, Menemukan Gagasan Utama & Membuat Rangkuman Kreatif",
    tujuan: "Siswa mampu menyimpulkan ide pokok dari bacaan serta menyajikan rangkumannya dalam bentuk tulisan atau bagan sesuai minat belajar masing-masing.",
    metode: "Membaca Terbimbing, Curah Pendapat & Penugasan Berdiferensiasi Produk",
    media: "Teks Bacaan Bertingkat, Kartu Bacaan Ringkas & Peta Konsep (Mind Map)",
    asesmen: "Asesmen Formatif Produk Kreatif (Bagan / Paragraf Rangkuman / Presentasi Lisan)",
    alokasi: "2 JP (2 x 45 Menit)",
    fokus: [
      {
        aspek: "D",
        indikator: "Siswa diberi kebebasan memilih bentuk produk akhir (gambar bagan, tulisan, atau lisan).",
        catatan: "Cermati apakah siswa merasa nyaman dengan pilihan bentuk tugasnya.",
      },
      {
        aspek: "E",
        indikator: "Guru memberikan umpan balik (feedback) langsung yang menguatkan saat proses menulis.",
        catatan: "Perhatikan komentar positif yang diberikan guru pada draft karya siswa.",
      },
    ],
    karakteristik: "Kecepatan membaca dan perbendaharaan kosakata siswa bervariasi antar tingkatan.",
    tantangan: "Beberapa siswa merasa kesulitan menuangkan ide ke dalam tulisan terstruktur.",
    diferensiasi: "Menyediakan bacaan dengan tingkat kesulitan berbeda dan panduan kalimat pembuka bagi yang butuh bantuan.",
    harapan: "Mendapatkan arahan bagaimana memberi umpan balik yang efektif tanpa memakan terlalu banyak waktu.",
  },
];

// Label Nama Aspek Lengkap dan Mudah Dipahami
const ASPECT_DESCRIPTIONS: Record<AspectCode, { nama: string; ringkasan: string }> = {
  A: {
    nama: "Aspek A: Pembukaan & Apersepsi",
    ringkasan: "Kesiapan, doa, dan mengaitkan materi",
  },
  B: {
    nama: "Aspek B: Penyampaian Materi Pembelajaran",
    ringkasan: "Kejelasan penjelasan & penguasaan konsep",
  },
  C: {
    nama: "Aspek C: Interaksi & Keaktifan Guru-Siswa",
    ringkasan: "Tanya jawab dua arah & memotivasi siswa",
  },
  D: {
    nama: "Aspek D: Bimbingan Keberagaman (Diferensiasi)",
    ringkasan: "Membantu siswa lambat & pengayaan siswa cepat",
  },
  E: {
    nama: "Aspek E: Penilaian & Umpan Balik Belajar",
    ringkasan: "Mengecek pemahaman siswa & evaluasi formatif",
  },
  F: {
    nama: "Aspek F: Pengelolaan & Suasana Kelas",
    ringkasan: "Disiplin positif & kelas tertib kondusif",
  },
  G: {
    nama: "Aspek G: Penutup, Rangkuman & Refleksi",
    ringkasan: "Menyimpulkan materi & refleksi bersama siswa",
  },
};

export const PreObservationForm: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);

  const [formData, setFormData] = useState<PreObservation | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isTemplateApplied, setIsTemplateApplied] = useState<string | null>(null);

  useEffect(() => {
    const list = TeacherService.getTeachers().filter((t) => t.aktif);
    setTeachers(list);
    setSchedules(ScheduleService.getSchedules());

    const settings = SettingsService.getSchoolSettings();
    setSchoolSettings(settings);

    if (list.length > 0) {
      setSelectedTeacherId(list[0].id);
      loadPreObs(list[0].id, settings.semester_aktif);
    }
  }, []);

  const loadPreObs = (teacherId: string, semester: string) => {
    const existing = PreObservationService.getByTeacherId(teacherId);
    if (existing) {
      setFormData(existing);
    } else {
      setFormData({
        id: crypto.randomUUID(),
        schedule_id: crypto.randomUUID(),
        teacher_id: teacherId,
        supervisor_id: "00000000-0000-0000-0000-000000000001",
        semester,
        tanggal_pelaksanaan: new Date().toISOString().split("T")[0],
        topik_pembelajaran: "",
        tujuan_pembelajaran: "",
        metode_pembelajaran: "Problem-Based Learning (PBL)",
        media_alat: "Lembar Kerja Siswa (LKPD) & LCD Proyektor",
        teknik_asesmen: "Asesmen Formatif & Pengamatan Keaktifan Belajar",
        alokasi_waktu: "2 JP (2 x 45 Menit)",
        jumlah_siswa: 32,
        karakteristik_siswa: "",
        tantangan_dihadapi: "",
        rencana_diferensiasi: "",
        harapan_guru: "",
        fokus_amatan: [
          {
            aspek: "C",
            indikator_sukses: "Pemerataan kesempatan bertanya dan merespons bagi seluruh siswa di kelas.",
            catatan_khusus: "Perhatikan siswa yang duduk di baris tengah dan belakang.",
          },
          {
            aspek: "D",
            indikator_sukses: "Pemberian bimbingan khusus (scaffolding) bagi siswa yang mengalami kesulitan.",
            catatan_khusus: "Guru mendatangi meja kelompok yang butuh arahan ekstra.",
          },
        ],
        status: "Draf",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
      });
    }
  };

  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    setIsTemplateApplied(null);
    if (schoolSettings) {
      loadPreObs(teacherId, schoolSettings.semester_aktif);
    }
  };

  const handleApplyTemplate = (tpl: QuickTemplate) => {
    if (!formData) return;
    setFormData({
      ...formData,
      topik_pembelajaran: tpl.topik,
      tujuan_pembelajaran: tpl.tujuan,
      metode_pembelajaran: tpl.metode,
      media_alat: tpl.media,
      teknik_asesmen: tpl.asesmen,
      alokasi_waktu: tpl.alokasi,
      fokus_amatan: tpl.fokus.map((f) => ({
        aspek: f.aspek,
        indikator_sukses: f.indikator,
        catatan_khusus: f.catatan,
      })),
      karakteristik_siswa: tpl.karakteristik,
      tantangan_dihadapi: tpl.tantangan,
      rencana_diferensiasi: tpl.diferensiasi,
      harapan_guru: tpl.harapan,
      status: "Draf",
    });
    setIsTemplateApplied(tpl.labelPendek);
    setTimeout(() => setIsTemplateApplied(null), 4000);
  };

  const handleAddFokus = () => {
    if (!formData || formData.fokus_amatan.length >= 5) return;
    setFormData({
      ...formData,
      fokus_amatan: [
        ...formData.fokus_amatan,
        {
          aspek: "B",
          indikator_sukses: "Penyampaian materi menggunakan bahasa yang lugas dan mudah dipahami siswa.",
          catatan_khusus: "",
        },
      ],
    });
  };

  const handleRemoveFokus = (index: number) => {
    if (!formData || formData.fokus_amatan.length <= 1) return;
    setFormData({
      ...formData,
      fokus_amatan: formData.fokus_amatan.filter((_, idx) => idx !== index),
    });
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData) return;

    PreObservationService.savePreObservation({
      ...formData,
      status: "Final",
    });
    setSuccessMsg(
      `Hasil wawancara persiapan bersama ${currentTeacher?.nama_lengkap} berhasil disimpan!`
    );
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const currentTeacher = teachers.find((t) => t.id === selectedTeacherId);
  const currentSchedule = schedules.find((s) => s.teacher_id === selectedTeacherId);

  if (!formData || !currentTeacher || !schoolSettings) {
    return (
      <div className="p-8 text-center text-muted font-medium text-sm">
        Sedang memuat data pra-observasi...
      </div>
    );
  }

  const isAlreadySaved = formData.status === "Final";

  return (
    <div className="space-y-4 md:space-y-5 pb-16">
      {/* Notifikasi Keberhasilan (Di Dalam Halaman Seperti Semula) */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-950 dark:text-emerald-100 text-sm font-semibold flex items-center justify-between gap-2.5 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white p-1 text-sm font-bold"
            aria-label="Tutup notifikasi"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Halaman yang Ramping & Proporsional (Sesuai Desain Halaman Lain) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-pine-600 dark:text-pine-400" />
              Diskusi Persiapan (Pra-Observasi)
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary-subtle text-primary border border-primary/20">
              Tahap 1
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted mt-0.5 leading-relaxed">
            Wawancara awal bersama guru untuk menyepakati materi, metode belajar, dan fokus amatan (minimal H-5 sebelum observasi).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="h-9 px-3.5 text-xs md:text-sm font-semibold whitespace-nowrap shadow-xs"
            onClick={() => setIsPrintModalOpen(true)}
            title="Cetak lembar Berita Acara resmi untuk tanda tangan"
          >
            <Printer className="w-4 h-4 mr-1.5 text-pine-600" />
            Cetak Berita Acara (A4)
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            className="h-9 px-4 text-xs md:text-sm font-bold whitespace-nowrap shadow-xs"
            onClick={() => handleSave()}
          >
            <Save className="w-4 h-4 mr-1.5" />
            Simpan Diskusi
          </Button>
        </div>
      </div>

      {/* Baris Pemilih Guru & Tanggal (Kompak & Jelas) */}
      <Panel className="p-4 md:p-5">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Dropdown Guru */}
            <div className="md:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-foreground">
                Pilih Guru Sasaran:
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => handleTeacherChange(e.target.value)}
                className="w-full h-10 px-3 text-sm font-semibold rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs cursor-pointer"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama_lengkap} — {t.mata_pelajaran} ({t.kelas_diampu})
                  </option>
                ))}
              </select>
            </div>

            {/* Input Tanggal */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pine-600" />
                Tanggal Pertemuan:
              </label>
              <input
                type="date"
                value={formData.tanggal_pelaksanaan}
                onChange={(e) => setFormData({ ...formData, tanggal_pelaksanaan: e.target.value })}
                className="w-full h-10 px-3 text-sm font-medium rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                required
              />
            </div>
          </div>

          {/* Baris Ringkas Profil Guru Terpilih */}
          <div className="p-2.5 md:p-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shrink-0">
                {currentTeacher.nama_lengkap.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-foreground text-sm">
                    {currentTeacher.nama_lengkap}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary-subtle text-primary border border-primary/20">
                    Target: {TeacherService.getRequiredFrequency(currentTeacher)}x Sesi
                  </span>
                  {currentTeacher.target_sesi && (
                    <span className="text-[10px] text-pine-700 dark:text-pine-300 font-semibold">(Kustom)</span>
                  )}
                </div>
                <p className="text-[11px] text-muted">
                  NIP: {currentTeacher.nip_nuptk} • {currentTeacher.mata_pelajaran} • Kelas {currentTeacher.kelas_diampu}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isAlreadySaved ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  <Check className="w-3 h-3" /> Tersimpan
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-[11px] bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  <ClipboardList className="w-3 h-3" /> Draf
                </span>
              )}

              {currentSchedule && (
                <span className="text-[11px] text-muted border-l border-border pl-2">
                  Observasi Kelas: <strong>{formatTanggalIndonesia(currentSchedule.rencana_observasi)}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </Panel>

      {/* BILAH CONTOH CEPAT RAMPING (Tidak Memakan Ruang Layar) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 md:p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-bold text-foreground">💡 Contoh Siap Pakai:</span>
          <span className="text-muted hidden md:inline">Klik salah satu untuk mengisi formulir otomatis:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {TEMPLATE_CONTOH.map((tpl) => (
            <button
              key={tpl.nama}
              type="button"
              onClick={() => handleApplyTemplate(tpl)}
              className="px-2.5 py-1 rounded-lg bg-surface hover:bg-primary/10 hover:border-primary border border-border text-foreground font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              title={tpl.deskripsi}
            >
              <span>{tpl.icon}</span>
              <span>{tpl.labelPendek}</span>
            </button>
          ))}
          {isTemplateApplied && (
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full ml-1">
              ✓ {isTemplateApplied} Terpasang
            </span>
          )}
        </div>
      </div>

      {/* Rencana Pembelajaran Kelas */}
      <Panel
        title="Rencana Pelaksanaan Pembelajaran (Disepakati Bersama Guru)"
        subtitle="Materi, tujuan, metode belajar, dan asesmen yang disiapkan"
        className="p-4 md:p-5"
      >
        <div className="space-y-4">
          {/* Topik / Materi */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-foreground">
              Topik / Materi Pembelajaran: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.topik_pembelajaran}
              onChange={(e) => setFormData({ ...formData, topik_pembelajaran: e.target.value })}
              placeholder="Contoh: Sistem Persamaan Linear Tiga Variabel / Teks Eksplanasi / Ekosistem Lingkungan"
              className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              required
            />
          </div>

          {/* Tujuan Pembelajaran */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-foreground">
              Tujuan Pembelajaran (Capaian Siswa): <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.tujuan_pembelajaran}
              onChange={(e) => setFormData({ ...formData, tujuan_pembelajaran: e.target.value })}
              placeholder="Contoh: Melalui diskusi kelompok, siswa mampu memahami konsep dasar dan memecahkan soal cerita dengan tepat."
              className="w-full p-2.5 text-sm rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs leading-relaxed"
              required
            />
          </div>

          {/* Metode, Media, Asesmen & Waktu dalam Grid 2 Kolom Seimbang */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-foreground">
                Metode Mengajar: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.metode_pembelajaran}
                onChange={(e) => setFormData({ ...formData, metode_pembelajaran: e.target.value })}
                placeholder="Contoh: Problem-Based Learning (PBL) & Diskusi Kelompok"
                className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-foreground">
                Media & Alat Bantu: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.media_alat}
                onChange={(e) => setFormData({ ...formData, media_alat: e.target.value })}
                placeholder="Contoh: LKPD, Proyektor LCD, Kartu Gambar"
                className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-foreground">
                Teknik Asesmen Formatif: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.teknik_asesmen}
                onChange={(e) => setFormData({ ...formData, teknik_asesmen: e.target.value })}
                placeholder="Contoh: Pengamatan Keaktifan, Hasil LKPD, Kuis Singkat"
                className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-foreground">
                Alokasi Waktu: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.alokasi_waktu}
                onChange={(e) => setFormData({ ...formData, alokasi_waktu: e.target.value })}
                placeholder="Contoh: 2 JP (2 x 45 Menit)"
                className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>
        </div>
      </Panel>

      {/* Kesepakatan Fokus Pengamatan */}
      <Panel
        title="Fokus Pengamatan Bersama (Maksimal 5 Butir)"
        subtitle="Hal khusus yang disepakati untuk dicermati secara mendalam saat observasi kelas"
        className="p-4 md:p-5"
        action={
          formData.fokus_amatan.length < 5 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs font-semibold h-8"
              onClick={handleAddFokus}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Tambah Fokus
            </Button>
          )
        }
      >
        <div className="space-y-3">
          {formData.fokus_amatan.map((fokus, idx) => (
            <div
              key={idx}
              className="p-3 md:p-3.5 rounded-xl border border-border bg-black/[0.015] dark:bg-white/[0.015] space-y-2.5"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-border">
                <span className="font-bold text-xs text-primary flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[11px]">
                    {idx + 1}
                  </span>
                  Fokus Pengamatan #{idx + 1}
                </span>

                {formData.fokus_amatan.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFokus(idx)}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {/* Pilihan Aspek */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-muted">
                    Aspek Observasi:
                  </label>
                  <select
                    value={fokus.aspek}
                    onChange={(e) => {
                      const updated = [...formData.fokus_amatan];
                      updated[idx].aspek = e.target.value as AspectCode;
                      setFormData({ ...formData, fokus_amatan: updated });
                    }}
                    className="w-full h-9 px-2.5 text-xs font-semibold rounded-lg border border-border bg-surface text-foreground"
                  >
                    {(["A", "B", "C", "D", "E", "F", "G"] as const).map((a) => (
                      <option key={a} value={a}>
                        {ASPECT_DESCRIPTIONS[a].nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Indikator Keberhasilan */}
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-[11px] font-bold text-muted">
                    Indikator yang Diharapkan Terlihat: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fokus.indikator_sukses}
                    onChange={(e) => {
                      const updated = [...formData.fokus_amatan];
                      updated[idx].indikator_sukses = e.target.value;
                      setFormData({ ...formData, fokus_amatan: updated });
                    }}
                    placeholder="Contoh: Siswa aktif bertanya dalam kelompok dan guru berkeliling memberi bantuan..."
                    className="w-full h-9 px-3 text-xs md:text-sm rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Kondisi Siswa & Catatan Guru */}
      <Panel
        title="Kondisi Siswa & Catatan Khusus"
        subtitle="Jumlah siswa, karakteristik kelas, dan harapan guru"
        className="p-4 md:p-5"
      >
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1 md:col-span-1">
              <label className="block text-xs font-bold text-foreground">
                Jumlah Siswa di Kelas:
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={formData.jumlah_siswa}
                onChange={(e) =>
                  setFormData({ ...formData, jumlah_siswa: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full h-9 px-3 text-sm font-bold font-mono rounded-lg border border-border bg-surface text-foreground"
                required
              />
            </div>

            <div className="space-y-1 md:col-span-3">
              <label className="block text-xs font-bold text-foreground">
                Profil & Karakteristik Siswa:
              </label>
              <input
                type="text"
                value={formData.karakteristik_siswa}
                onChange={(e) => setFormData({ ...formData, karakteristik_siswa: e.target.value })}
                placeholder="Contoh: Kemampuan beragam, siswa antusias namun beberapa butuh pendampingan khusus."
                className="w-full h-9 px-3 text-xs md:text-sm rounded-lg border border-border bg-surface text-foreground"
              />
            </div>
          </div>

          {/* 3 Isian Berbaris Vertikal Satu-Satu agar Lapang dan Tidak Sempit */}
          <div className="space-y-3.5 pt-1">
            {/* Baris 1: Tantangan */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-foreground">
                1. Kendala / Tantangan yang Dikhawatirkan:
              </label>
              <textarea
                rows={2}
                value={formData.tantangan_dihadapi}
                onChange={(e) => setFormData({ ...formData, tantangan_dihadapi: e.target.value })}
                placeholder="Contoh: Sebagian siswa cenderung pasif dan mengandalkan teman kelompoknya yang lebih dominan..."
                className="w-full p-2.5 text-xs md:text-sm rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>

            {/* Baris 2: Rencana Diferensiasi */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-foreground">
                2. Bantuan untuk Siswa Tertinggal (Rencana Diferensiasi):
              </label>
              <textarea
                rows={2}
                value={formData.rencana_diferensiasi}
                onChange={(e) => setFormData({ ...formData, rencana_diferensiasi: e.target.value })}
                placeholder="Contoh: Menyediakan tugas berjenjang pada LKPD dan membentuk kelompok heterogen dengan tutor sebaya..."
                className="w-full p-2.5 text-xs md:text-sm rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>

            {/* Baris 3: Harapan Guru */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-foreground">
                3. Harapan Guru Terhadap Supervisi Ini:
              </label>
              <textarea
                rows={2}
                value={formData.harapan_guru}
                onChange={(e) => setFormData({ ...formData, harapan_guru: e.target.value })}
                placeholder="Contoh: Mendapatkan saran praktis tentang manajemen waktu kerja kelompok agar tidak molor..."
                className="w-full p-2.5 text-xs md:text-sm rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>
          </div>
        </div>
      </Panel>

      {/* BILAH TOMBOL AKSI BAWAH RAMPING & PROPORSIONAL */}
      <div className="p-3.5 md:p-4 rounded-xl bg-surface border border-border shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-xs md:text-sm text-foreground">
              Seluruh kesepakatan pra-observasi telah siap?
            </p>
            <p className="text-[11px] text-muted">
              Klik simpan agar hasil diskusi tersimpan dan siap dicetak sebagai Berita Acara A4.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="h-10 px-4 font-semibold text-xs md:text-sm whitespace-nowrap shrink-0 shadow-xs"
            onClick={() => setIsPrintModalOpen(true)}
          >
            <Printer className="w-4 h-4 mr-1.5 text-pine-600" />
            Cetak Berita Acara (A4)
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            className="h-10 px-5 font-bold text-xs md:text-sm shadow-sm whitespace-nowrap shrink-0"
            onClick={() => handleSave()}
          >
            <Save className="w-4 h-4 mr-1.5" />
            Simpan Diskusi
          </Button>
        </div>
      </div>

      {/* Modal Cetak Berita Acara A4 */}
      <PreObservationPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={formData}
        teacher={currentTeacher}
        school={schoolSettings}
      />
    </div>
  );
};

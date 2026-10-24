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
  UserCheck,
  Calendar,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Check,
  Info,
} from "lucide-react";
import { PreObservation, Teacher, SchoolSettings, Schedule } from "@/contracts/schemas";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { PreObservationService } from "./pre-observation-service";
import { PreObservationPrintModal } from "./PreObservationPrintModal";
import { TeacherService } from "../teachers/teacher-service";
import { SettingsService } from "../settings/settings-service";
import { ScheduleService } from "../schedules/schedule-service";
import { AspectCode, ASPECT_NAMES } from "@/contracts/enums";
import { formatTanggalIndonesia } from "@/lib/utils";

// 3 Pilihan Template Praktis Kurikulum Merdeka yang Siap Dipakai Sekali Klik
interface QuickTemplate {
  nama: string;
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
    deskripsi: "Sangat cocok untuk mapel IPA, IPS, Matematika, dan PPKn",
    icon: "👥",
    topik: "Pemecahan Masalah Kontekstual melalui Diskusi Kelompok",
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
    deskripsi: "Sangat cocok untuk PJOK, Seni, Informatika, dan IPA Praktikum",
    icon: "🔬",
    topik: "Praktik Demonstrasi dan Analisis Hasil Pengamatan",
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
    deskripsi: "Sangat cocok untuk Bahasa Indonesia, Bahasa Inggris, dan Agama",
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
const ASPECT_DESCRIPTIONS: Record<AspectCode, { nama: string; contoh: string }> = {
  A: {
    nama: "Aspek A: Pembukaan & Apersepsi",
    contoh: "Kesiapan belajar, doa, dan mengaitkan materi dengan pengalaman siswa",
  },
  B: {
    nama: "Aspek B: Penyampaian Materi Pembelajaran",
    contoh: "Kejelasan penjelasan konsep, contoh nyata, dan penguasaan bahan ajar",
  },
  C: {
    nama: "Aspek C: Interaksi & Keaktifan Guru-Siswa",
    contoh: "Tanya jawab dua arah, giliran bicara, dan memotivasi siswa bertanya",
  },
  D: {
    nama: "Aspek D: Bimbingan Keberagaman Siswa (Diferensiasi)",
    contoh: "Membantu siswa lambat dan memberi tantangan lebih bagi siswa yang cepat",
  },
  E: {
    nama: "Aspek E: Penilaian & Umpan Balik Selama Belajar",
    contoh: "Mengecek pemahaman siswa di tengah jam pelajaran dan memberi masukan",
  },
  F: {
    nama: "Aspek F: Pengelolaan Kelas & Suasana Belajar",
    contoh: "Disiplin positif, kelas tertib, suasana menyenangkan dan aman",
  },
  G: {
    nama: "Aspek G: Penutup, Rangkuman & Refleksi Siswa",
    contoh: "Menyimpulkan bersama siswa apa yang dipelajari dan refleksi perasaan",
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

  // Terapkan contoh otomatis yang ramah pengguna
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
    setIsTemplateApplied(tpl.nama);
    setTimeout(() => setIsTemplateApplied(null), 5000);
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
      `Alhamdulillah! Hasil diskusi persiapan mengajar dengan ${currentTeacher?.nama_lengkap} berhasil disimpan dengan aman.`
    );
    setTimeout(() => setSuccessMsg(null), 6000);
  };

  const currentTeacher = teachers.find((t) => t.id === selectedTeacherId);
  const currentSchedule = schedules.find((s) => s.teacher_id === selectedTeacherId);

  if (!formData || !currentTeacher || !schoolSettings) {
    return (
      <div className="p-12 text-center text-foreground font-medium text-lg">
        Sedang menyiapkan lembar kerja pra-observasi...
      </div>
    );
  }

  const isAlreadySaved = formData.status === "Final";

  return (
    <div className="space-y-6 pb-20">
      {/* Notifikasi Keberhasilan Berukuran Besar & Ramah */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-950 dark:text-emerald-100 text-base font-semibold flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-base">Berhasil Disimpan!</p>
            <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Kartu Judul & Panduan Ramah Usia 50++ */}
      <div className="p-5 md:p-6 rounded-2xl bg-surface border border-border shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-subtle text-primary text-xs font-bold uppercase tracking-wider mb-1">
              <ClipboardList className="w-4 h-4" />
              Tahap 1 dari Siklus Supervisi
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Wawancara Awal & Persiapan Belajar (Pra-Observasi)
            </h1>
            <p className="text-sm md:text-base text-muted max-w-4xl leading-relaxed">
              Bapak/Ibu Kepala Sekolah & Pengawas, gunakan halaman ini untuk berdialog santai bersama guru sebelum pelaksanaan supervisi kelas. Tujuannya adalah menyepakati materi yang akan diajarkan dan hal-hal yang ingin diamati bersama.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="font-bold text-sm md:text-base h-12 px-5"
              onClick={() => setIsPrintModalOpen(true)}
              title="Cetak lembar Berita Acara resmi untuk tanda tangan"
            >
              <Printer className="w-5 h-5 mr-2 text-pine-600" />
              Cetak Berita Acara (A4)
            </Button>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="font-bold text-sm md:text-base h-12 px-6 shadow-sm"
              onClick={() => handleSave()}
            >
              <Save className="w-5 h-5 mr-2" />
              Simpan Hasil Diskusi
            </Button>
          </div>
        </div>

        {/* 3 Langkah Alur yang Jernih */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border">
            <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shrink-0">
              1
            </span>
            <div>
              <p className="font-bold text-xs md:text-sm text-foreground">Pilih Guru & Jadwal</p>
              <p className="text-xs text-muted">Tentukan guru yang diajak dialog</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border">
            <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shrink-0">
              2
            </span>
            <div>
              <p className="font-bold text-xs md:text-sm text-foreground">Sepakati Rencana Mengajar</p>
              <p className="text-xs text-muted">Metode, media, & fokus amatan</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border">
            <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shrink-0">
              3
            </span>
            <div>
              <p className="font-bold text-xs md:text-sm text-foreground">Simpan & Cetak Berkas</p>
              <p className="text-xs text-muted">Lampiran sah tanda tangan A4</p>
            </div>
          </div>
        </div>
      </div>

      {/* LANGKAH 1: Pemilih Guru Sasaran & Tanggal Wawancara */}
      <Panel
        title="1. Guru Sasaran & Jadwal Pertemuan"
        subtitle="Pilih guru yang sedang berdialog dengan Anda hari ini"
        className="border-2 border-primary/20"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dropdown Pilihan Guru Berukuran Besar */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-sm md:text-base font-bold text-foreground">
                Pilih Nama Guru:
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => handleTeacherChange(e.target.value)}
                className="w-full h-12 px-4 text-sm md:text-base font-bold rounded-xl border-2 border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs cursor-pointer"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama_lengkap} — {t.mata_pelajaran} (Kelas {t.kelas_diampu})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted">
                💡 Klik kotak di atas untuk beralih ke guru lain. Data guru yang sudah diisi akan tersimpan otomatis.
              </p>
            </div>

            {/* Input Tanggal Wawancara */}
            <div className="space-y-1.5">
              <label className="block text-sm md:text-base font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-pine-600" />
                Tanggal Pertemuan:
              </label>
              <input
                type="date"
                value={formData.tanggal_pelaksanaan}
                onChange={(e) => setFormData({ ...formData, tanggal_pelaksanaan: e.target.value })}
                className="w-full h-12 px-3 text-sm md:text-base font-semibold rounded-xl border-2 border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                required
              />
              <p className="text-xs text-muted">
                Terformat: <strong>{formatTanggalIndonesia(formData.tanggal_pelaksanaan)}</strong>
              </p>
            </div>
          </div>

          {/* Kartu Profil Singkat Guru Terpilih */}
          <div className="p-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
                {currentTeacher.nama_lengkap.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base md:text-lg font-bold text-foreground">
                    {currentTeacher.nama_lengkap}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary-subtle text-primary border border-primary/20">
                    Target: {TeacherService.getRequiredFrequency(currentTeacher)}x Sesi
                  </span>
                  {currentTeacher.target_sesi && (
                    <span className="text-[11px] text-pine-700 dark:text-pine-300 font-semibold">(Kustom)</span>
                  )}
                </div>
                <p className="text-xs md:text-sm text-muted mt-0.5">
                  NIP: <span className="font-mono">{currentTeacher.nip_nuptk}</span> • {currentTeacher.mata_pelajaran} • Fase {currentTeacher.fase} ({currentTeacher.kelas_diampu})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:self-center">
              {isAlreadySaved ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  <Check className="w-4 h-4" /> Sudah Tersimpan
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  <ClipboardList className="w-4 h-4" /> Draf / Siap Diisi
                </span>
              )}

              {currentSchedule && (
                <span className="text-xs text-muted border-l border-border pl-3">
                  Rencana Observasi Kelas: <strong>{formatTanggalIndonesia(currentSchedule.rencana_observasi)}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </Panel>

      {/* KOTAK BANTUAN CONTOH CEPAT (Sangat Membantu Orang Tua 50++) */}
      <div className="p-5 md:p-6 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-base md:text-lg font-bold text-foreground">
              ⚡ Ingin Cepat? Gunakan Contoh Siap Pakai
            </h2>
          </div>
          {isTemplateApplied && (
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full animate-pulse">
              ✓ Contoh &quot;{isTemplateApplied}&quot; berhasil dipasang!
            </span>
          )}
        </div>
        <p className="text-xs md:text-sm text-muted">
          Bapak/Ibu tidak perlu mengetik panjang dari awal. Cukup klik salah satu contoh di bawah ini, formulir akan terisi otomatis dengan kalimat baku Kurikulum Merdeka, lalu tinggal Anda sesuaikan sedikit:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {TEMPLATE_CONTOH.map((tpl) => (
            <button
              key={tpl.nama}
              type="button"
              onClick={() => handleApplyTemplate(tpl)}
              className="text-left p-3.5 rounded-xl border border-border bg-surface hover:border-primary hover:bg-primary/5 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="text-2xl mb-1.5">{tpl.icon}</div>
                <h4 className="font-bold text-xs md:text-sm text-foreground group-hover:text-primary transition-colors">
                  {tpl.nama}
                </h4>
                <p className="text-[11px] text-muted mt-1 leading-snug">
                  {tpl.deskripsi}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary mt-3">
                <Sparkles className="w-3.5 h-3.5" /> Pasang Contoh Ini
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* LANGKAH 2: Rencana Pembelajaran Kelas */}
      <Panel
        title="2. Rencana Pelaksanaan Pembelajaran (Disepakati Bersama Guru)"
        subtitle="Rincian materi, tujuan pembelajaran, metode mengajar, dan alat bantu yang disiapkan guru"
      >
        <div className="space-y-5">
          {/* Topik / Materi */}
          <div className="space-y-1.5">
            <label className="block text-sm md:text-base font-bold text-foreground">
              A. Topik / Materi Pembelajaran yang Akan Diajarkan: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.topik_pembelajaran}
              onChange={(e) => setFormData({ ...formData, topik_pembelajaran: e.target.value })}
              placeholder="Contoh: Sistem Persamaan Linear Tiga Variabel / Teks Eksplanasi / Ekosistem Lingkungan"
              className="w-full h-12 px-4 text-sm md:text-base rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              required
            />
            <p className="text-xs text-muted">
              💡 Tuliskan judul bab atau sub-materi pokok yang akan dipelajari siswa saat Anda masuk kelas nanti.
            </p>
          </div>

          {/* Tujuan Pembelajaran */}
          <div className="space-y-1.5">
            <label className="block text-sm md:text-base font-bold text-foreground">
              B. Tujuan Pembelajaran (Capaian yang Ingin Diraih Siswa): <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.tujuan_pembelajaran}
              onChange={(e) => setFormData({ ...formData, tujuan_pembelajaran: e.target.value })}
              placeholder="Contoh: Melalui diskusi kelompok, siswa mampu memahami konsep dasar dan memecahkan soal cerita dengan tepat."
              className="w-full p-3.5 text-sm md:text-base rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs leading-relaxed"
              required
            />
            <p className="text-xs text-muted">
              💡 Tanyakan ke guru: <em>&quot;Setelah pelajaran ini selesai, apa hal terpenting yang diharapkan bisa dipahami oleh siswa?&quot;</em>
            </p>
          </div>

          {/* Metode, Media, Asesmen & Waktu dalam Grid 2 Kolom Lega */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-foreground">
                C. Metode / Cara Mengajar: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.metode_pembelajaran}
                onChange={(e) => setFormData({ ...formData, metode_pembelajaran: e.target.value })}
                placeholder="Contoh: Diskusi Kelompok, Tanya Jawab & Problem-Based Learning"
                className="w-full h-11 px-3.5 text-sm md:text-base rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-xs text-muted">Model belajar yang dipakai guru di kelas.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-foreground">
                D. Media & Alat Belajar yang Dipakai: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.media_alat}
                onChange={(e) => setFormData({ ...formData, media_alat: e.target.value })}
                placeholder="Contoh: Lembar Kerja Siswa (LKPD), Proyektor, Kartu Gambar"
                className="w-full h-11 px-3.5 text-sm md:text-base rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-xs text-muted">Alat bantu yang disiapkan agar siswa mudah paham.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-foreground">
                E. Cara Penilaian Selama Belajar (Asesmen Formatif): <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.teknik_asesmen}
                onChange={(e) => setFormData({ ...formData, teknik_asesmen: e.target.value })}
                placeholder="Contoh: Pengamatan Keaktifan, Hasil Lembar Kerja (LKPD), Kuis Singkat"
                className="w-full h-11 px-3.5 text-sm md:text-base rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-xs text-muted">Cara guru mengetahui siswa sudah mengerti atau belum.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-foreground">
                F. Alokasi Waktu Jam Pelajaran: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.alokasi_waktu}
                onChange={(e) => setFormData({ ...formData, alokasi_waktu: e.target.value })}
                placeholder="Contoh: 2 JP (2 x 45 Menit)"
                className="w-full h-11 px-3.5 text-sm md:text-base rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-xs text-muted">Durasi jam tatap muka di kelas.</p>
            </div>
          </div>
        </div>
      </Panel>

      {/* LANGKAH 3: Kesepakatan Fokus Pengamatan (Apa yang Ingin Diamati) */}
      <Panel
        title="3. Kesepakatan Fokus Pengamatan (Apa yang Mau Diamati)"
        subtitle="Pilih hal khusus yang disepakati bersama guru untuk dicermati secara mendalam saat observasi kelas (Maksimal 5 butir)"
        action={
          formData.fokus_amatan.length < 5 && (
            <Button
              type="button"
              variant="outline"
              size="md"
              className="font-bold text-xs md:text-sm"
              onClick={handleAddFokus}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Butir Fokus Baru
            </Button>
          )
        }
      >
        <div className="space-y-4">
          <p className="text-xs md:text-sm text-muted">
            💡 Tanyakan kepada guru: <em>&quot;Bapak/Ibu, pada bagian mana di kelas nanti yang Anda merasa paling ingin saya bantu amati agar bisa kita diskusikan bersama solusinya?&quot;</em>
          </p>

          <div className="space-y-3">
            {formData.fokus_amatan.map((fokus, idx) => (
              <div
                key={idx}
                className="p-4 md:p-5 rounded-2xl border-2 border-border bg-black/[0.02] dark:bg-white/[0.02] space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-sm md:text-base text-foreground">
                      Fokus Pengamatan #{idx + 1}
                    </span>
                  </div>

                  {formData.fokus_amatan.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFokus(idx)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus Butir Ini
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Pilihan Aspek dengan Nama Lengkap */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase text-muted">
                      Kategori Aspek Observasi:
                    </label>
                    <select
                      value={fokus.aspek}
                      onChange={(e) => {
                        const updated = [...formData.fokus_amatan];
                        updated[idx].aspek = e.target.value as AspectCode;
                        setFormData({ ...formData, fokus_amatan: updated });
                      }}
                      className="w-full h-11 px-3 text-xs md:text-sm font-semibold rounded-xl border border-border bg-surface text-foreground"
                    >
                      {(["A", "B", "C", "D", "E", "F", "G"] as const).map((a) => (
                        <option key={a} value={a}>
                          {ASPECT_DESCRIPTIONS[a].nama}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-muted leading-tight mt-1">
                      {ASPECT_DESCRIPTIONS[fokus.aspek]?.contoh}
                    </p>
                  </div>

                  {/* Indikator Keberhasilan */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-xs font-bold uppercase text-muted">
                      Hal Positif yang Diharapkan Terlihat: <span className="text-red-500">*</span>
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
                      className="w-full h-11 px-3.5 text-xs md:text-sm rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                    <p className="text-[11px] text-muted leading-tight mt-1">
                      Catatan tanda keberhasilan saat guru mengajar.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* LANGKAH 4: Karakteristik Siswa & Harapan Guru */}
      <Panel
        title="4. Kondisi Siswa di Kelas & Harapan Guru"
        subtitle="Catatan profil siswa dan masukan apa yang diharapkan guru dari Kepala Sekolah"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1 md:col-span-1">
              <label className="block text-xs md:text-sm font-bold text-foreground">
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
                className="w-full h-11 px-3.5 text-sm md:text-base font-bold font-mono rounded-xl border border-border bg-surface text-foreground"
                required
              />
              <p className="text-xs text-muted">Orang siswa hadir.</p>
            </div>

            <div className="space-y-1 md:col-span-3">
              <label className="block text-xs md:text-sm font-bold text-foreground">
                Profil & Karakteristik Siswa di Kelas Ini:
              </label>
              <textarea
                rows={2}
                value={formData.karakteristik_siswa}
                onChange={(e) => setFormData({ ...formData, karakteristik_siswa: e.target.value })}
                placeholder="Contoh: Siswa sangat aktif bertanya, namun sebagian siswa di baris belakang mudah teralihkan konsentrasinya."
                className="w-full p-3 text-xs md:text-sm rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <label className="block text-xs md:text-sm font-bold text-foreground">
                Kendala / Tantangan yang Dikhawatirkan:
              </label>
              <textarea
                rows={3}
                value={formData.tantangan_dihadapi}
                onChange={(e) => setFormData({ ...formData, tantangan_dihadapi: e.target.value })}
                placeholder="Contoh: Waktu praktik khawatir tidak cukup jika siswa bertanya terlalu lama."
                className="w-full p-3 text-xs md:text-sm rounded-xl border border-border bg-surface text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs md:text-sm font-bold text-foreground">
                Bantuan untuk Siswa Tertinggal (Diferensiasi):
              </label>
              <textarea
                rows={3}
                value={formData.rencana_diferensiasi}
                onChange={(e) => setFormData({ ...formData, rencana_diferensiasi: e.target.value })}
                placeholder="Contoh: Menyiapkan teman sebaya sebagai tutor dan memberikan lembar panduan bergambar."
                className="w-full p-3 text-xs md:text-sm rounded-xl border border-border bg-surface text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs md:text-sm font-bold text-foreground">
                Harapan Guru Terhadap Supervisi Ini:
              </label>
              <textarea
                rows={3}
                value={formData.harapan_guru}
                onChange={(e) => setFormData({ ...formData, harapan_guru: e.target.value })}
                placeholder="Contoh: Memperoleh masukan bagaimana cara mengajak seluruh siswa ikut aktif berpendapat."
                className="w-full p-3 text-xs md:text-sm rounded-xl border border-border bg-surface text-foreground"
              />
            </div>
          </div>
        </div>
      </Panel>

      {/* BILAH TOMBOL AKSI BAWAH YANG SANGAT JELAS & MUDAH DIKLIK */}
      <div className="p-5 md:p-6 rounded-2xl bg-surface border-2 border-primary/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-base text-foreground">
              Apakah seluruh kesepakatan sudah selesai dibahas?
            </p>
            <p className="text-xs md:text-sm text-muted">
              Klik tombol simpan di sebelah kanan agar hasil diskusi tersimpan dan siap dicetak sebagai Berita Acara A4.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="h-12 px-5 font-bold text-sm md:text-base"
            onClick={() => setIsPrintModalOpen(true)}
          >
            <Printer className="w-5 h-5 mr-2 text-pine-600" />
            Cetak Berita Acara (A4)
          </Button>

          <Button
            type="button"
            variant="primary"
            size="lg"
            className="h-12 px-7 font-bold text-sm md:text-base shadow-md"
            onClick={() => handleSave()}
          >
            <Save className="w-5 h-5 mr-2" />
            Simpan Hasil Diskusi
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

"use client";

import React, { useState, useEffect } from "react";
import {
  FileBarChart2,
  Printer,
  Download,
  BookOpen,
  Award,
  CheckCircle2,
  FileCheck,
  ChevronRight,
  Info,
} from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import { downloadAsExcel, downloadAsCSV } from "@/lib/export-service";
import { MonitoringService, TeacherMonitoringSummary } from "../monitoring/monitoring-service";
import { SettingsService } from "../settings/settings-service";
import { SupervisorRecapModal } from "./SupervisorRecapModal";
import { OfficialReportModal } from "./OfficialReportModal";

export function ReportsManager() {
  const [summaries, setSummaries] = useState<TeacherMonitoringSummary[]>([]);
  const [isSupervisorModalOpen, setIsSupervisorModalOpen] = useState(false);
  const [isOfficialModalOpen, setIsOfficialModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ringkasan" | "aspek" | "bab">("ringkasan");

  useEffect(() => {
    setSummaries(MonitoringService.getAllTeacherSummaries());
  }, []);

  const school = SettingsService.getSchoolSettings();

  const totalGuru = summaries.length;
  const guruSelesai = summaries.filter((s) => s.status_supervisi === "Selesai").length;
  const guruDenganNilai = summaries.filter((s) => s.persentase_terbaru !== null);
  const rataRataSekolah =
    guruDenganNilai.length > 0
      ? Number(
          (
            guruDenganNilai.reduce((sum, curr) => sum + (curr.persentase_terbaru || 0), 0) /
            guruDenganNilai.length
          ).toFixed(1)
        )
      : 0;

  const countAmatBaik = summaries.filter((s) => s.predikat_terbaru === "Amat Baik").length;
  const countBaik = summaries.filter((s) => s.predikat_terbaru === "Baik").length;
  const countCukup = summaries.filter((s) => s.predikat_terbaru === "Cukup").length;
  const countPerlu = summaries.filter((s) => s.predikat_terbaru === "Perlu Pembinaan").length;

  // Header terstandarisasi untuk ekspor rekapitulasi lengkap
  const exportHeaders = [
    "No",
    "Nama Guru",
    "NIP / NUPTK",
    "Mata Pelajaran",
    "Fase",
    "Kelas Diampu",
    "Target Sesi",
    "Sesi 1 (%)",
    "Sesi 2 (%)",
    "Sesi 3 (%)",
    "Skor Akhir (Max 112)",
    "Persentase (%)",
    "Predikat Mutu",
    "Target Sekolah (%)",
    "Status Target",
    "Tren Mutu",
    "Rata Aspek A (Perencanaan)",
    "Rata Aspek B (Pelaksanaan)",
    "Rata Aspek C (Penilaian)",
    "Rata Aspek D (Karakter)",
    "Rata Aspek E (Iklim)",
    "Aspek Prioritas Perbaikan",
    "Total RTL",
    "RTL Disahkan",
  ];

  // Baris data bersih tanpa tanda kutip berlebih
  const getExportRows = () =>
    summaries.map((s, idx) => [
      idx + 1,
      s.teacher.nama_lengkap,
      s.teacher.nip_nuptk || "-",
      s.teacher.mata_pelajaran,
      s.teacher.fase,
      s.teacher.kelas_diampu,
      `${s.min_sesi_wajib} Sesi`,
      s.sesi_1 ? s.sesi_1.persentase : "-",
      s.sesi_2 ? s.sesi_2.persentase : s.min_sesi_wajib < 2 ? "-" : "-",
      s.sesi_3 ? s.sesi_3.persentase : s.min_sesi_wajib < 3 ? "-" : "-",
      s.skor_terbaru !== null ? s.skor_terbaru : "-",
      s.persentase_terbaru !== null ? s.persentase_terbaru : "-",
      s.predikat_terbaru || "Belum Selesai",
      s.target_skor,
      s.status_target,
      s.total_sesi < 2 ? (s.total_sesi === 1 ? "Evaluasi Awal" : "-") : s.tren,
      s.rata_aspek?.A != null ? Number(s.rata_aspek.A.toFixed(2)) : "-",
      s.rata_aspek?.B != null ? Number(s.rata_aspek.B.toFixed(2)) : "-",
      s.rata_aspek?.C != null ? Number(s.rata_aspek.C.toFixed(2)) : "-",
      s.rata_aspek?.D != null ? Number(s.rata_aspek.D.toFixed(2)) : "-",
      s.rata_aspek?.E != null ? Number(s.rata_aspek.E.toFixed(2)) : "-",
      s.aspek_prioritas.length > 0 ? s.aspek_prioritas.join(", ") : "Tuntas (≥ 3.0)",
      s.total_rtl,
      s.rtl_selesai,
    ]);

  // Handler ekspor Excel (.xlsx) resmi
  const handleExportExcel = () => {
    downloadAsExcel({
      filename: `Laporan_Supervisi_Akademik_${school.npsn}_${school.semester_aktif}`,
      sheetName: "Rekap Sheet 10-13",
      title: `REKAPITULASI LAPORAN HASIL SUPERVISI AKADEMIK & COACHING GURU — ${school.nama_sekolah}`,
      metadata: [
        { label: "Nama Sekolah", value: school.nama_sekolah },
        { label: "NPSN", value: school.npsn },
        { label: "Semester Aktif", value: school.semester_aktif },
        { label: "Kepala Sekolah", value: school.nama_kepala_sekolah },
        { label: "Pengawas Pembina", value: school.nama_pengawas || "-" },
        { label: "Tanggal Dokumen", value: new Date().toLocaleDateString("id-ID", { dateStyle: "long" }) },
      ],
      headers: exportHeaders,
      rows: getExportRows(),
    });
  };

  // Handler ekspor CSV (.csv) titik koma ramah regional
  const handleExportCSV = () => {
    downloadAsCSV({
      filename: `Laporan_Supervisi_Akademik_${school.npsn}_${school.semester_aktif}`,
      headers: exportHeaders,
      rows: getExportRows(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <FileBarChart2 className="w-7 h-7 text-pine-600 dark:text-pine-400" />
            Rekapitulasi & Laporan Supervisi Guru
          </h1>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Format laporan resmi untuk Kepala Sekolah, Dewan Guru, dan Pengawas Pembina Dinas Pendidikan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <ExportDropdown
            label="Ekspor Data"
            onExportExcel={handleExportExcel}
            onExportCSV={handleExportCSV}
          />
          <Button variant="secondary" size="md" onClick={() => setIsSupervisorModalOpen(true)}>
            <Printer className="w-4 h-4 mr-2" />
            Rekap Pengawas (Sheet 10-11)
          </Button>
          <Button variant="primary" size="md" onClick={() => setIsOfficialModalOpen(true)}>
            <BookOpen className="w-4 h-4 mr-2" />
            Cetak Laporan Lengkap (Bab I–IV)
          </Button>
        </div>
      </div>

      {/* 3 Kartu Ringkasan Status Laporan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Panel title="Capaian Pelaksanaan Supervisi" subtitle="Statistik kumulatif semester aktif">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted">Total Sasaran Guru:</span>
              <span className="font-bold text-foreground font-mono">{totalGuru} Guru</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted">Sudah Diobservasi:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {guruDenganNilai.length} Guru ({totalGuru > 0 ? Math.round((guruDenganNilai.length / totalGuru) * 100) : 0}%)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted">Selesai 3 Tahap Lengkap:</span>
              <span className="font-bold text-pine-600 dark:text-pine-400 font-mono">
                {guruSelesai} Guru ({totalGuru > 0 ? Math.round((guruSelesai / totalGuru) * 100) : 0}%)
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted">Rata-Rata Nilai Sekolah:</span>
              <span className="font-bold text-foreground font-mono">{rataRataSekolah}%</span>
            </div>
          </div>
        </Panel>

        <Panel title="Struktur Laporan Resmi Dinas" subtitle="Standar laporan akreditasi & pengawas">
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded bg-black/5 dark:bg-white/5 flex items-center justify-between">
              <span className="font-semibold text-foreground">Halaman Judul & Pengesahan</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="p-2 rounded bg-black/5 dark:bg-white/5 flex items-center justify-between">
              <span className="font-semibold text-foreground">Bab I: Pendahuluan & Dasar Hukum</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="p-2 rounded bg-black/5 dark:bg-white/5 flex items-center justify-between">
              <span className="font-semibold text-foreground">Bab II: Metodologi & Instrumen 28 Butir</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="p-2 rounded bg-black/5 dark:bg-white/5 flex items-center justify-between">
              <span className="font-semibold text-foreground">Bab III: Hasil Evaluasi & Rekapitulasi</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="p-2 rounded bg-black/5 dark:bg-white/5 flex items-center justify-between">
              <span className="font-semibold text-foreground">Bab IV: Kesimpulan & Rekomendasi</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </Panel>

        <Panel title="Distribusi Predikat Mutu" subtitle="Sebaran hasil penilaian guru">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Amat Baik (&ge; 90%):
              </span>
              <span className="font-bold text-foreground font-mono">{countAmatBaik} Guru</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pine-500" />
                Baik (75 - 89%):
              </span>
              <span className="font-bold text-foreground font-mono">{countBaik} Guru</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Cukup (60 - 74%):
              </span>
              <span className="font-bold text-foreground font-mono">{countCukup} Guru</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Perlu Pembinaan (&lt; 60%):
              </span>
              <span className="font-bold text-foreground font-mono">{countPerlu} Guru</span>
            </div>
          </div>
        </Panel>
      </div>

      {/* Tab Switcher Pratinjau Rekap */}
      <div className="flex border-b border-border gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("ringkasan")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "ringkasan"
              ? "border-pine-600 text-pine-700 dark:border-pine-400 dark:text-pine-300"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Rekapitulasi Nilai Seluruh Guru (Sheet 10)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("aspek")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "aspek"
              ? "border-pine-600 text-pine-700 dark:border-pine-400 dark:text-pine-300"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <Award className="w-4 h-4" />
          Analisis 5 Aspek Rubrik (Sheet 11)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bab")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "bab"
              ? "border-pine-600 text-pine-700 dark:border-pine-400 dark:text-pine-300"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Narasi Laporan Resmi (Bab I - IV)
        </button>
      </div>

      {/* Konten Tab Aktif */}
      {activeTab === "ringkasan" && (
        <Panel title="Rekapitulasi Capaian Supervisi Akademik Seluruh Guru (Sheet 10)">
          <div className="overflow-x-auto -mx-4 md:-mx-6">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-border text-xs uppercase text-muted tracking-wider">
                <tr>
                  <th className="py-3 px-4 md:px-6">No</th>
                  <th className="py-3 px-4">Nama Guru</th>
                  <th className="py-3 px-4">NIP / NUPTK</th>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4 text-center">Fase / Kelas</th>
                  <th className="py-3 px-4 text-right">Skor (Max 112)</th>
                  <th className="py-3 px-4 text-right">Nilai (%)</th>
                  <th className="py-3 px-4 text-center">Predikat</th>
                  <th className="py-3 px-4 text-center">Status RTL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summaries.map((s, idx) => (
                  <tr key={s.teacher.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 md:px-6 font-mono text-xs text-muted">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">{s.teacher.nama_lengkap}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-muted">{s.teacher.nip_nuptk}</td>
                    <td className="py-3.5 px-4 text-xs">{s.teacher.mata_pelajaran}</td>
                    <td className="py-3.5 px-4 text-center text-xs text-muted">
                      Fase {s.teacher.fase} ({s.teacher.kelas_diampu})
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-xs">
                      {s.skor_terbaru !== null ? s.skor_terbaru : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-xs">
                      {s.persentase_terbaru !== null ? `${s.persentase_terbaru}%` : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {s.predikat_terbaru ? (
                        <Badge predikat={s.predikat_terbaru as any} />
                      ) : (
                        <span className="text-xs text-muted">Belum Selesai</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs font-mono">
                      {s.rtl_selesai}/{s.total_rtl} Selesai
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {activeTab === "aspek" && (
        <Panel title="Analisis Rata-Rata 5 Aspek Rubrik Pembelajaran (Sheet 11)">
          <div className="overflow-x-auto -mx-4 md:-mx-6">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-border text-xs uppercase text-muted tracking-wider text-center">
                <tr>
                  <th className="py-3 px-4 md:px-6 text-left">Nama Guru</th>
                  <th className="py-3 px-3">A. Perencanaan</th>
                  <th className="py-3 px-3">B. Pelaksanaan</th>
                  <th className="py-3 px-3">C. Penilaian</th>
                  <th className="py-3 px-3">D. Karakter</th>
                  <th className="py-3 px-3">E. Iklim Kelas</th>
                  <th className="py-3 px-4 text-left">Aspek Prioritas (&lt; 3.0)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summaries.map((s) => (
                  <tr key={s.teacher.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-center">
                    <td className="py-3.5 px-4 md:px-6 text-left font-semibold text-foreground">
                      {s.teacher.nama_lengkap}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs">
                      {s.rata_aspek?.A != null ? s.rata_aspek.A.toFixed(2) : "-"}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs">
                      {s.rata_aspek?.B != null ? s.rata_aspek.B.toFixed(2) : "-"}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs">
                      {s.rata_aspek?.C != null ? s.rata_aspek.C.toFixed(2) : "-"}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs">
                      {s.rata_aspek?.D != null ? s.rata_aspek.D.toFixed(2) : "-"}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs">
                      {s.rata_aspek?.E != null ? s.rata_aspek.E.toFixed(2) : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-left text-xs">
                      {s.aspek_prioritas.length > 0 ? (
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          {s.aspek_prioritas.join(", ")}
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">Tuntas (&ge; 3.0)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {activeTab === "bab" && (
        <div className="space-y-4">
          <Panel title="Pratinjau Ringkas Narasi Laporan Supervisi Akademik">
            <div className="space-y-4 text-xs md:text-sm text-muted leading-relaxed">
              <div className="p-4 rounded-xl border border-border bg-card">
                <h4 className="font-bold text-foreground text-sm uppercase mb-2">
                  Bab I: Pendahuluan & Latar Belakang
                </h4>
                <p>
                  Supervisi akademik pada {school.nama_sekolah} semester {school.semester_aktif} diarahkan untuk memperkuat implementasi Kurikulum Merdeka. Dengan pendekatan coaching klinis yang berfokus pada dialog kemitraan, guru didorong melakukan refleksi mandiri atas pembelajaran di kelas.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card">
                <h4 className="font-bold text-foreground text-sm uppercase mb-2">
                  Bab II: Metodologi & Tahapan 3 Sesi
                </h4>
                <p>
                  Kegiatan supervisi dilaksanakan terstruktur melalui 3 tahapan baku: Pra-Observasi (H-5) untuk menyepakati fokus, Observasi Kelas dengan instrumen 28 butir indikator rubrik 4 level, dan Pasca-Observasi (H+3) untuk coaching reflektif serta perumusan rencana tindak lanjut (RTL).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card">
                <h4 className="font-bold text-foreground text-sm uppercase mb-2">
                  Bab III: Hasil Evaluasi & Mutu Pembelajaran
                </h4>
                <p>
                  Dari {totalGuru} sasaran guru, sebanyak {guruSelesai} guru telah menyelesaikan 3 tahapan secara penuh. Rata-rata nilai capaian sekolah mencapai {rataRataSekolah}% dengan predikat mutu {rataRataSekolah >= 90 ? "Amat Baik" : rataRataSekolah >= 75 ? "Baik" : "Cukup"}.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card">
                <h4 className="font-bold text-foreground text-sm uppercase mb-2">
                  Bab IV: Kesimpulan & Rekomendasi Tindak Lanjut
                </h4>
                <p>
                  Direkomendasikan penguatan pada aspek diferensiasi instruksional dan asesmen formatif melalui forum Komunitas Belajar (Kombel) MGMP sekolah, didukung pemantauan berkala pekan ke-2, 4, 8/9 atas kesepakatan RTL guru.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* Modal Dialog Rekap Pengawas */}
      {isSupervisorModalOpen && (
        <SupervisorRecapModal
          isOpen={true}
          summaries={summaries}
          school={school}
          onClose={() => setIsSupervisorModalOpen(false)}
        />
      )}

      {/* Modal Dialog Laporan Lengkap */}
      {isOfficialModalOpen && (
        <OfficialReportModal
          isOpen={true}
          summaries={summaries}
          school={school}
          onClose={() => setIsOfficialModalOpen(false)}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  GraduationCap,
  CalendarDays,
  ArrowRight,
  ListTodo,
  MessageSquare,
  FileBarChart,
  Target,
  Sparkles,
  ClipboardList,
  Check,
  ChevronRight,
  Info,
} from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MonitoringService, TeacherMonitoringSummary } from "@/features/monitoring/monitoring-service";
import { ScheduleService } from "@/features/schedules/schedule-service";
import { FollowupService } from "@/features/followup/followup-service";
import { SettingsService } from "@/features/settings/settings-service";

// Komponen 5 Grafik Native SVG Zero-Dependency
import { DonutChart } from "@/components/charts/DonutChart";
import { PredicateBarChart } from "@/components/charts/PredicateBarChart";
import { AspectHorizontalBarChart } from "@/components/charts/AspectHorizontalBarChart";
import { ComparisonBarChart } from "@/components/charts/ComparisonBarChart";
import { RtlGaugeChart } from "@/components/charts/RtlGaugeChart";

export default function BerandaPage() {
  const [summaries, setSummaries] = useState<TeacherMonitoringSummary[]>([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [missedScheduleCount, setMissedScheduleCount] = useState(0);

  useEffect(() => {
    const list = MonitoringService.getAllTeacherSummaries();
    setSummaries(list);

    // Hitung jadwal terlewat
    const schedules = ScheduleService.getSchedulesWithDetails();
    const missed = schedules.filter((s) => s.isMissed).length;
    setMissedScheduleCount(missed);

    // Hitung RTL overdue
    const followups = FollowupService.getFollowups();
    const ovd = followups.filter((f) => FollowupService.isOverdue(f)).length;
    setOverdueCount(ovd);
  }, []);

  // Metrik KPI Sekolah
  const totalGuru = summaries.length;
  const guruSelesai = summaries.filter((s) => s.status_supervisi === "Selesai").length;
  const guruDalamProses = summaries.filter((s) => s.status_supervisi === "Dalam Proses").length;
  const guruBelumMulai = summaries.filter((s) => s.status_supervisi === "Belum Mulai").length;

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

  // Data Grafik 1: Donut Status Supervisi
  const donutData = [
    { label: "Selesai Dinilai", value: guruSelesai, color: "#166534" },
    { label: "Sedang Berjalan", value: guruDalamProses, color: "#D97706" },
    { label: "Belum Dimulai", value: guruBelumMulai, color: "#9CA3AF" },
  ];

  // Data Grafik 2: Distribusi Predikat Guru
  const countAmatBaik = summaries.filter((s) => s.predikat_terbaru === "Amat Baik").length;
  const countBaik = summaries.filter((s) => s.predikat_terbaru === "Baik").length;
  const countCukup = summaries.filter((s) => s.predikat_terbaru === "Cukup").length;
  const countPerlu = summaries.filter((s) => s.predikat_terbaru === "Perlu Pembinaan").length;

  const predicateData = [
    { label: "Amat Baik (≥90%)", count: countAmatBaik, color: "#166534" },
    { label: "Baik (75-89%)", count: countBaik, color: "#1D4ED8" },
    { label: "Cukup (60-74%)", count: countCukup, color: "#D97706" },
    { label: "Perlu Bimbingan", count: countPerlu, color: "#DC2626" },
  ];

  // Data Grafik 3: Rata-rata 5 Aspek Rubrik
  const calcAspectAverage = (aspectKey: "A" | "B" | "C" | "D" | "E") => {
    const valid = summaries
      .map((s) => s.rata_aspek?.[aspectKey])
      .filter((v): v is number => typeof v === "number");
    if (valid.length === 0) return 0;
    return Number((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2));
  };

  const aspectData = [
    { kode: "A", nama: "Perencanaan Pembelajaran (Modul Ajar)", average: calcAspectAverage("A") },
    { kode: "B", nama: "Pelaksanaan Pembelajaran (Metode Kelas)", average: calcAspectAverage("B") },
    { kode: "C", nama: "Penilaian & Asesmen Siswa", average: calcAspectAverage("C") },
    { kode: "D", nama: "Interaksi & Karakter Siswa", average: calcAspectAverage("D") },
    { kode: "E", nama: "Iklim Kelas & Kolaborasi", average: calcAspectAverage("E") },
  ];

  // Data Grafik 4: Grouped Bar Obs-1 vs Obs-Terbaru
  const sampleComparison = summaries
    .filter((s) => s.sesi_1 !== null && s.persentase_terbaru !== null)
    .slice(0, 5)
    .map((s) => ({
      guruNama: s.teacher.nama_lengkap,
      skorAwal: s.sesi_1!.persentase,
      skorTerbaru: s.persentase_terbaru!,
    }));

  // Data Grafik 5: RTL Gauge
  const allFollowups = FollowupService.getFollowups();
  const rtlSelesaiCount = allFollowups.filter((f) => f.status === "Selesai").length;
  const rtlBerjalanCount = allFollowups.filter((f) => f.status === "Berjalan").length;

  return (
    <div className="space-y-6">
      {/* Sapaan Editorial & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-pine-600 dark:text-pine-400" />
            Dashboard Supervisi & Coaching Guru
          </h1>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Pantau kemajuan mengajar guru, hasil observasi kelas, dan rencana perbaikan pembelajaran semester ini dengan mudah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/observasi">
            <Button variant="primary" size="md">
              <GraduationCap className="w-4 h-4 mr-2" />
              Mulai Observasi Baru
            </Button>
          </Link>
          <Link href="/jadwal">
            <Button variant="secondary" size="md">
              <CalendarDays className="w-4 h-4 mr-2" />
              Atur Jadwal Guru
            </Button>
          </Link>
        </div>
      </div>

      {/* PANDUAN CEPAT: 4 Langkah Alur Supervisi Sekolah (Mudah Dipahami) */}
      <div className="p-4 md:p-5 rounded-2xl bg-surface border border-border shadow-subtle">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-pine-700 dark:text-pine-300 bg-pine-50 dark:bg-pine-950/40 px-2.5 py-0.5 rounded-full border border-pine-200 dark:border-pine-800">
            Panduan Alur Kerja
          </span>
          <span className="text-xs text-muted">Ikuti 4 langkah berurutan untuk menyelesaikan supervisi setiap guru:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Langkah 1 */}
          <Link
            href="/jadwal"
            className="p-3.5 rounded-xl border border-border bg-card hover:border-pine-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-muted mb-1">
              <span>Langkah 1</span>
              <CalendarDays className="w-4 h-4 text-pine-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm font-bold text-foreground">Atur Jadwal</p>
            <p className="text-xs text-muted mt-1">Tentukan tanggal pra-observasi, observasi kelas, dan coaching.</p>
          </Link>

          {/* Langkah 2 */}
          <Link
            href="/pra-observasi"
            className="p-3.5 rounded-xl border border-border bg-card hover:border-pine-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-muted mb-1">
              <span>Langkah 2</span>
              <ClipboardList className="w-4 h-4 text-pine-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm font-bold text-foreground">Pra-Observasi (H-5)</p>
            <p className="text-xs text-muted mt-1">Diskusi awal dengan guru untuk menyepakati fokus amatan kelas.</p>
          </Link>

          {/* Langkah 3 */}
          <Link
            href="/observasi"
            className="p-3.5 rounded-xl border border-border bg-card hover:border-pine-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-muted mb-1">
              <span>Langkah 3</span>
              <GraduationCap className="w-4 h-4 text-pine-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm font-bold text-foreground">Observasi di Kelas</p>
            <p className="text-xs text-muted mt-1">Amati jalannya belajar dan nilai 28 butir rubrik secara objektif.</p>
          </Link>

          {/* Langkah 4 */}
          <Link
            href="/coaching"
            className="p-3.5 rounded-xl border border-border bg-card hover:border-pine-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-muted mb-1">
              <span>Langkah 4</span>
              <MessageSquare className="w-4 h-4 text-pine-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm font-bold text-foreground">Coaching & Solusi</p>
            <p className="text-xs text-muted mt-1">Ajak guru refleksi dan sepakati rencana aksi perbaikan (RTL).</p>
          </Link>
        </div>
      </div>

      {/* Baris 4 Kartu Metrik Angka (KPI Jernih & Mudah Dibaca) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Guru */}
        <Panel className="p-4 md:p-5">
          <div className="flex items-center justify-between text-muted mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider">Total Guru</span>
            <Users className="w-4 h-4 text-pine-600 dark:text-pine-400" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-foreground">
            {totalGuru} <span className="text-sm font-normal text-muted">Guru</span>
          </p>
          <p className="text-xs text-muted mt-1">Terdaftar di semester aktif</p>
        </Panel>

        {/* Supervisi Selesai */}
        <Panel className="p-4 md:p-5">
          <div className="flex items-center justify-between text-muted mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider">Sudah Dinilai Lengkap</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-foreground">
            {guruSelesai}{" "}
            <span className="text-sm font-normal text-muted">
              ({totalGuru > 0 ? Math.round((guruSelesai / totalGuru) * 100) : 0}%)
            </span>
          </p>
          <p className="text-xs text-muted mt-1">Tuntas 3 tahap supervisi</p>
        </Panel>

        {/* Dalam Proses */}
        <Panel className="p-4 md:p-5">
          <div className="flex items-center justify-between text-muted mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider">Sedang Berjalan</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-foreground">
            {guruDalamProses} <span className="text-sm font-normal text-muted">Guru</span>
          </p>
          <p className="text-xs text-muted mt-1">Tahap pra-obs atau observasi</p>
        </Panel>

        {/* Rata-Rata Capaian Sekolah */}
        <Panel className="p-4 md:p-5">
          <div className="flex items-center justify-between text-muted mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider">Rata-Rata Nilai</span>
            <TrendingUp className="w-4 h-4 text-pine-600 dark:text-pine-400" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-foreground">
            {rataRataSekolah}%
          </p>
          <div className="mt-1.5">
            <Badge predikat={rataRataSekolah >= 90 ? "Amat Baik" : rataRataSekolah >= 75 ? "Baik" : "Cukup"} />
          </div>
        </Panel>
      </div>

      {/* Ringkasan Peringatan Segera (Alert Bar Ramah Pengguna) */}
      {(overdueCount > 0 || missedScheduleCount > 0) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs md:text-sm">
          <div className="flex items-start sm:items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-0" />
            <div>
              <strong>Perhatian Kepala Sekolah / Supervisor:</strong>
              <p className="text-xs text-amber-900/90 dark:text-amber-200/90 mt-0.5">
                {missedScheduleCount > 0 && `Ada ${missedScheduleCount} jadwal observasi yang terlewat dari tanggal rencana.`}
                {missedScheduleCount > 0 && overdueCount > 0 && " "}
                {overdueCount > 0 && `Terdapat ${overdueCount} rencana aksi guru yang melewati batas tanggal penyelesaian.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <Link
              href="/tindak-lanjut"
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-colors"
            >
              Lihat Rencana Aksi
            </Link>
          </div>
        </div>
      )}

      {/* Grid 5 Visualisasi Grafik Ringan & Mudah Dibaca */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Grafik 1: Status Supervisi Donut */}
        <Panel
          title="Status Supervisi Seluruh Guru"
          subtitle="Berapa persen guru yang sudah selesai dinilai lengkap semester ini?"
        >
          <DonutChart
            data={donutData}
            centerLabel="Tuntas"
            centerValue={`${totalGuru > 0 ? Math.round((guruSelesai / totalGuru) * 100) : 0}%`}
          />
        </Panel>

        {/* Grafik 2: Sebaran Predikat Guru */}
        <Panel
          title="Sebaran Mutu Nilai Guru"
          subtitle="Pengelompokan hasil observasi: Amat Baik, Baik, atau Cukup"
        >
          <PredicateBarChart data={predicateData} />
        </Panel>

        {/* Grafik 5: Realisasi Tindak Lanjut RTL */}
        <Panel
          title="Realisasi Rencana Perbaikan Guru"
          subtitle="Komitmen perbaikan yang sudah diselesaikan dan disahkan"
        >
          <RtlGaugeChart
            selesai={rtlSelesaiCount}
            berjalan={rtlBerjalanCount}
            overdue={overdueCount}
          />
        </Panel>

        {/* Grafik 3: Rata-Rata 5 Aspek Rubrik (Span 2 kolom) */}
        <Panel
          className="lg:col-span-2"
          title="Nilai Rata-Rata per Bidang Mengajar"
          subtitle="Garis putus-putus merah pada angka 3.00 adalah batas standar kelulusan minimal"
        >
          <AspectHorizontalBarChart data={aspectData} threshold={3.0} />
        </Panel>

        {/* Grafik 4: Perbandingan Obs-1 vs Obs-Terbaru */}
        <Panel
          title="Perkembangan Nilai Guru"
          subtitle="Perbandingan nilai observasi pertama vs observasi terbaru"
        >
          {sampleComparison.length > 0 ? (
            <ComparisonBarChart data={sampleComparison} />
          ) : (
            <div className="text-center py-8 text-muted text-xs">
              Belum cukup data observasi berulang untuk grafik perbandingan.
            </div>
          )}
        </Panel>
      </div>

      {/* Tabel Progres Guru Terkini */}
      <Panel
        title="Daftar Kemajuan Supervisi Tiap Guru"
        subtitle="Lihat status observasi, nilai terbaru, dan hal yang perlu ditingkatkan oleh masing-masing guru"
        action={
          <Link href="/guru" className="text-xs font-bold text-pine-700 dark:text-pine-300 hover:underline flex items-center">
            Lihat Semua Guru <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        }
      >
        <div className="overflow-x-auto -mx-5 md:-mx-6">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-border text-xs uppercase text-muted font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4 md:px-6">Nama Guru & Mapel</th>
                <th className="py-3 px-4">Kelas Diampu</th>
                <th className="py-3 px-4">Status Penilaian</th>
                <th className="py-3 px-4 text-right">Nilai Akhir</th>
                <th className="py-3 px-4">Predikat</th>
                <th className="py-3 px-4">Perkembangan</th>
                <th className="py-3 px-4">Fokus Perbaikan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {summaries.map((summary) => (
                <tr key={summary.teacher.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 md:px-6">
                    <p className="font-bold text-foreground leading-tight">{summary.teacher.nama_lengkap}</p>
                    <p className="text-xs text-muted mt-0.5">{summary.teacher.mata_pelajaran}</p>
                  </td>
                  <td className="py-3.5 px-4 text-muted text-xs">
                    Fase {summary.teacher.fase} ({summary.teacher.kelas_diampu})
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge statusSupervisi={summary.status_supervisi} />
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold font-mono text-sm">
                    {summary.persentase_terbaru !== null ? `${summary.persentase_terbaru}%` : "-"}
                  </td>
                  <td className="py-3.5 px-4">
                    {summary.predikat_terbaru ? (
                      <Badge predikat={summary.predikat_terbaru as any} />
                    ) : (
                      <span className="text-xs text-muted">Belum Dinilai</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold">
                    <span
                      className={
                        summary.tren === "Meningkat"
                          ? "text-emerald-700 dark:text-emerald-400"
                          : summary.tren === "Menurun"
                          ? "text-red-700 dark:text-red-400"
                          : summary.tren === "Stagnan"
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-muted"
                      }
                    >
                      {summary.tren}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-muted">
                    {summary.aspek_prioritas.length > 0 ? (
                      <span className="text-red-700 dark:text-red-400 font-semibold">
                        {summary.aspek_prioritas.join(", ")}
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400">Sudah Tuntas (≥ 3.0)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

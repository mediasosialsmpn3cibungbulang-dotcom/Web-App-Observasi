"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
} from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MonitoringService, TeacherMonitoringSummary } from "@/features/monitoring/monitoring-service";
import { ScheduleService } from "@/features/schedules/schedule-service";
import { FollowupService } from "@/features/followup/followup-service";
import { AspectCode } from "@/contracts/enums";

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

  // State Filter & Pencarian Tabel Kemajuan Guru
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"semua" | "selesai" | "belum">("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllRows, setShowAllRows] = useState(false);
  const itemsPerPage = 8;

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

  // Metrik KPI Utama Sekolah
  const totalGuru = summaries.length;
  const guruSelesai = summaries.filter((s) => s.status_supervisi === "Selesai").length;
  const guruDalamProses = summaries.filter((s) => s.status_supervisi === "Dalam Proses").length;
  const guruBelumMulai = summaries.filter((s) => s.status_supervisi === "Belum Mulai").length;
  const guruBelumSelesai = totalGuru - guruSelesai;

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

  // Data Grafik 2: Distribusi Predikat Mutu Guru
  const countAmatBaik = summaries.filter((s) => s.predikat_terbaru === "Amat Baik").length;
  const countBaik = summaries.filter((s) => s.predikat_terbaru === "Baik").length;
  const countCukup = summaries.filter((s) => s.predikat_terbaru === "Cukup").length;
  const countPerlu = summaries.filter((s) => s.predikat_terbaru === "Perlu Pembinaan").length;

  const predicateData = [
    { label: "Amat Baik (≥ 90%)", count: countAmatBaik, color: "#166534" },
    { label: "Baik (75 - 89%)", count: countBaik, color: "#1D4ED8" },
    { label: "Cukup (60 - 74%)", count: countCukup, color: "#D97706" },
    { label: "Perlu Bimbingan (< 60%)", count: countPerlu, color: "#DC2626" },
  ];

  // Data Grafik 3: Rata-rata 7 Aspek Rubrik Baku (Aspek A s.d. G)
  const calcAspectAverage = (aspectKey: AspectCode) => {
    const valid = summaries
      .map((s) => s.rata_aspek?.[aspectKey])
      .filter((v): v is number => typeof v === "number" && v > 0);
    if (valid.length === 0) return 0;
    return Number((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2));
  };

  const aspectData = [
    { kode: "A", nama: "Perencanaan & Modul Ajar", average: calcAspectAverage("A") },
    { kode: "B", nama: "Pelaksanaan & Metode Pembelajaran", average: calcAspectAverage("B") },
    { kode: "C", nama: "Penilaian & Asesmen Siswa", average: calcAspectAverage("C") },
    { kode: "D", nama: "Karakter & Interaksi Siswa", average: calcAspectAverage("D") },
    { kode: "E", nama: "Iklim Belajar & Kolaborasi", average: calcAspectAverage("E") },
    { kode: "F", nama: "Pengelolaan Kelas & Refleksi", average: calcAspectAverage("F") },
    { kode: "G", nama: "Tindak Lanjut & Pendampingan", average: calcAspectAverage("G") },
  ];

  // Data Grafik 4: Grouped Bar Obs-1 vs Obs-Terbaru (Hanya jika ada sesi berulang)
  const sampleComparison = summaries
    .filter((s) => s.sesi_1 !== null && s.persentase_terbaru !== null && s.sesi_2 !== null)
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

  // Logika Filter & Pencarian Tabel Kemajuan Guru
  const filteredSummaries = useMemo(() => {
    return summaries.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === "" ||
        s.teacher.nama_lengkap.toLowerCase().includes(q) ||
        s.teacher.mata_pelajaran.toLowerCase().includes(q) ||
        s.teacher.nip_nuptk.includes(q);

      if (!matchSearch) return false;

      if (statusFilter === "selesai") return s.status_supervisi === "Selesai";
      if (statusFilter === "belum") return s.status_supervisi !== "Selesai";
      return true;
    });
  }, [summaries, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredSummaries.length / itemsPerPage);
  const displayedSummaries = showAllRows
    ? filteredSummaries
    : filteredSummaries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Sapaan Editorial & Action Bar Responsif */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-pine-600 dark:text-pine-400 shrink-0" />
            Dashboard Supervisi & Coaching Guru
          </h1>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Pantau kemajuan mengajar 25 guru SMP (Fase D), hasil observasi kelas, dan rencana perbaikan pembelajaran semester ini.
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
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-pine-700 dark:text-pine-300 bg-pine-50 dark:bg-pine-950/40 px-2.5 py-0.5 rounded-full border border-pine-200 dark:border-pine-800">
              Panduan Alur Kerja
            </span>
            <span className="text-xs text-muted">SOP 4 Tahapan Berurutan Supervisi & Coaching Guru:</span>
          </div>
          <Link href="/bantuan" className="text-xs font-semibold text-pine-700 dark:text-pine-300 hover:underline">
            Pelajari Panduan Lengkap →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Langkah 1 */}
          <Link
            href="/jadwal"
            className="p-3.5 rounded-xl border border-border bg-card hover:border-pine-400 hover:shadow-sm transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs font-bold text-muted mb-1.5">
              <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-foreground font-mono">
                Langkah 1
              </span>
              <CalendarDays className="w-4 h-4 text-pine-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm font-bold text-foreground">1. Atur Jadwal Guru</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Tentukan tanggal pra-observasi, observasi kelas, dan sesi coaching untuk tiap guru.
            </p>
          </Link>

          {/* Langkah 2 */}
          <Link
            href="/pra-observasi"
            className="p-3.5 rounded-xl border border-border bg-card hover:border-pine-400 hover:shadow-sm transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs font-bold text-muted mb-1.5">
              <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-foreground font-mono">
                Langkah 2
              </span>
              <ClipboardList className="w-4 h-4 text-pine-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm font-bold text-foreground">2. Pra-Observasi (H-5)</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Wawancara awal kesiapan modul ajar dan sepakati 2-3 fokus indikator yang akan diamati.
            </p>
          </Link>

          {/* Langkah 3 */}
          <Link
            href="/observasi"
            className="p-3.5 rounded-xl border border-border bg-card hover:border-pine-400 hover:shadow-sm transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs font-bold text-muted mb-1.5">
              <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-foreground font-mono">
                Langkah 3
              </span>
              <GraduationCap className="w-4 h-4 text-pine-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm font-bold text-foreground">3. Observasi di Kelas</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Amati jalannya belajar mengajar dan beri skor objektif (1-4) pada 28 butir indikator.
            </p>
          </Link>

          {/* Langkah 4 */}
          <Link
            href="/coaching"
            className="p-3.5 rounded-xl border border-border bg-card hover:border-pine-400 hover:shadow-sm transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs font-bold text-muted mb-1.5">
              <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-foreground font-mono">
                Langkah 4
              </span>
              <MessageSquare className="w-4 h-4 text-pine-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm font-bold text-foreground">4. Coaching & RTL (H+3)</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Ajak guru berefleksi mandiri dan rumuskan rencana tindak lanjut (RTL) perbaikan.
            </p>
          </Link>
        </div>
      </div>

      {/* Baris 4 Kartu Metrik Angka (KPI Jernih & Transparan: 1 + 24 = 25) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Guru Sasaran */}
        <Panel className="p-4 md:p-5">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Guru Sasaran</span>
            <Users className="w-4 h-4 text-pine-600 dark:text-pine-400" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-foreground">
            {totalGuru} <span className="text-sm font-normal text-muted">Guru</span>
          </p>
          <p className="text-xs text-muted mt-1.5">25 Guru aktif tingkat SMP (Fase D)</p>
        </Panel>

        {/* Sudah Disupervisi Lengkap */}
        <Panel className="p-4 md:p-5">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Sudah Disupervisi</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-foreground">
            {guruSelesai}{" "}
            <span className="text-sm font-normal text-muted">
              ({totalGuru > 0 ? Math.round((guruSelesai / totalGuru) * 100) : 0}%)
            </span>
          </p>
          <div className="mt-2 w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${totalGuru > 0 ? (guruSelesai / totalGuru) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1.5 font-medium">
            Tuntas 3 tahapan supervisi
          </p>
        </Panel>

        {/* Belum Disupervisi */}
        <Panel className="p-4 md:p-5">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Belum Disupervisi</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-foreground">
            {guruBelumSelesai}{" "}
            <span className="text-sm font-normal text-muted">
              ({totalGuru > 0 ? Math.round((guruBelumSelesai / totalGuru) * 100) : 0}%)
            </span>
          </p>
          <div className="mt-2 w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${totalGuru > 0 ? (guruBelumSelesai / totalGuru) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-1.5">
            Menunggu jadwal dan penilaian kelas
          </p>
        </Panel>

        {/* Rata-Rata Capaian Sekolah */}
        <Panel className="p-4 md:p-5">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Rata-Rata Nilai</span>
            <TrendingUp className="w-4 h-4 text-pine-600 dark:text-pine-400" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-foreground">
            {rataRataSekolah}%
          </p>
          <div className="mt-2 flex items-center justify-between">
            <Badge predikat={rataRataSekolah >= 90 ? "Amat Baik" : rataRataSekolah >= 75 ? "Baik" : "Cukup"} />
            <span className="text-[11px] text-muted">Target Minimal: 75%</span>
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

      {/* Grid 5 Visualisasi Grafik Ringan & Responsif */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Grafik 1: Status Supervisi Donut */}
        <Panel
          title="Status Supervisi Seluruh Guru"
          subtitle="Berapa persen guru yang sudah tuntas dinilai semester ini?"
        >
          <DonutChart
            data={donutData}
            centerLabel="Tuntas"
            centerValue={`${totalGuru > 0 ? Math.round((guruSelesai / totalGuru) * 100) : 0}%`}
          />
        </Panel>

        {/* Grafik 2: Sebaran Mutu Guru */}
        <Panel
          title="Sebaran Mutu Nilai Guru"
          subtitle="Distribusi predikat capaian hasil observasi pembelajaran"
        >
          <PredicateBarChart data={predicateData} />
        </Panel>

        {/* Grafik 5: Realisasi Tindak Lanjut RTL */}
        <Panel
          title="Realisasi Rencana Perbaikan (RTL)"
          subtitle="Komitmen guru memperbaiki proses belajar setelah coaching"
        >
          <RtlGaugeChart
            selesai={rtlSelesaiCount}
            berjalan={rtlBerjalanCount}
            overdue={overdueCount}
          />
        </Panel>

        {/* Grafik 3: Rata-Rata 7 Aspek Rubrik (Span 2 kolom pada desktop) */}
        <Panel
          className="lg:col-span-2"
          title="Nilai Rata-Rata 7 Aspek Observasi Kelas"
          subtitle="Skor skala 1.00 - 4.00. Garis merah tegak (3.00) adalah batas standar tuntas minimal"
        >
          <AspectHorizontalBarChart data={aspectData} threshold={3.0} />
        </Panel>

        {/* Grafik 4: Perbandingan Obs-1 vs Obs-Terbaru */}
        <Panel
          title="Perkembangan Nilai Antar Sesi"
          subtitle="Perbandingan kenaikan kompetensi guru antara Sesi 1 dan Sesi lanjutan"
        >
          <ComparisonBarChart data={sampleComparison} />
        </Panel>
      </div>

      {/* Tabel Progres Guru Terkini dengan Pencarian & Pagination */}
      <Panel
        title="Daftar Kemajuan Supervisi Tiap Guru"
        subtitle={`Menampilkan ${filteredSummaries.length} dari ${totalGuru} guru terdaftar`}
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/guru"
              className="text-xs font-bold text-pine-700 dark:text-pine-300 hover:underline flex items-center"
            >
              Kelola Database Guru <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        }
      >
        {/* Kontrol Filter & Pencarian Cepat */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pt-1">
          {/* Kolom Pencarian */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama guru atau mapel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500"
            />
          </div>

          {/* Filter Status Tabs */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter("semua")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "semua"
                  ? "bg-pine-600 text-white shadow-xs"
                  : "bg-surface text-muted hover:text-foreground border border-border/60"
              }`}
            >
              Semua ({summaries.length})
            </button>
            <button
              onClick={() => setStatusFilter("selesai")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "selesai"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-surface text-muted hover:text-foreground border border-border/60"
              }`}
            >
              Sudah Dinilai ({guruSelesai})
            </button>
            <button
              onClick={() => setStatusFilter("belum")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "belum"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-surface text-muted hover:text-foreground border border-border/60"
              }`}
            >
              Belum Dinilai ({guruBelumSelesai})
            </button>
          </div>
        </div>

        {/* Tampilan Desktop: Tabel Lengkap */}
        <div className="hidden md:block overflow-x-auto -mx-5 md:-mx-6">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-border text-xs uppercase text-muted font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4 md:px-6">Nama Guru & Mapel</th>
                <th className="py-3 px-4">Kelas Diampu</th>
                <th className="py-3 px-4">Status Penilaian</th>
                <th className="py-3 px-4 text-right">Nilai Akhir</th>
                <th className="py-3 px-4">Predikat</th>
                <th className="py-3 px-4">Perkembangan</th>
                <th className="py-3 px-4">Fokus Peningkatan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayedSummaries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted text-xs">
                    Tidak ditemukan data guru yang cocok dengan kata kunci atau filter yang dipilih.
                  </td>
                </tr>
              ) : (
                displayedSummaries.map((summary) => (
                  <tr key={summary.teacher.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 md:px-6">
                      <p className="font-bold text-foreground leading-tight">{summary.teacher.nama_lengkap}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted">{summary.teacher.mata_pelajaran}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/5 text-muted font-semibold">
                          {summary.teacher.status_kepegawaian}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted text-xs">
                      Fase {summary.teacher.fase} ({summary.teacher.kelas_diampu})
                    </td>
                    <td className="py-3 px-4">
                      <Badge statusSupervisi={summary.status_supervisi} />
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-sm">
                      {summary.persentase_terbaru !== null ? `${summary.persentase_terbaru}%` : "-"}
                    </td>
                    <td className="py-3 px-4">
                      {summary.predikat_terbaru ? (
                        <Badge predikat={summary.predikat_terbaru as any} />
                      ) : (
                        <span className="text-xs text-muted italic">Belum Dinilai</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold">
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
                        {summary.persentase_terbaru !== null ? summary.tren : "-"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {summary.persentase_terbaru === null ? (
                        <span className="text-muted italic">Belum Ada Observasi</span>
                      ) : summary.aspek_prioritas.length > 0 ? (
                        <span className="text-amber-700 dark:text-amber-400 font-semibold">
                          {summary.aspek_prioritas.join(", ")} (&lt; 3.0)
                        </span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                          Tuntas (Semua Aspek ≥ 3.0)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {summary.status_supervisi === "Selesai" ? (
                        <Link
                          href="/laporan"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-pine-700 dark:text-pine-300 hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Hasil
                        </Link>
                      ) : (
                        <Link
                          href="/observasi"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-pine-700 dark:text-pine-300 hover:underline"
                        >
                          Nilai
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tampilan Mobile: Daftar Kartu Guru yang Ramah Sentuhan */}
        <div className="block md:hidden space-y-3 pt-1">
          {displayedSummaries.length === 0 ? (
            <div className="py-6 text-center text-muted text-xs">
              Tidak ada data guru yang cocok dengan pencarian.
            </div>
          ) : (
            displayedSummaries.map((summary) => (
              <div
                key={summary.teacher.id}
                className="p-3.5 rounded-xl border border-border bg-card space-y-2.5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-foreground text-sm leading-tight">
                      {summary.teacher.nama_lengkap}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {summary.teacher.mata_pelajaran} • {summary.teacher.status_kepegawaian}
                    </p>
                  </div>
                  <Badge statusSupervisi={summary.status_supervisi} />
                </div>

                <div className="text-xs text-muted">
                  Kelas: <span className="text-foreground font-medium">{summary.teacher.kelas_diampu}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                  <div>
                    <span className="text-[11px] text-muted block">Nilai Akhir:</span>
                    <span className="font-mono font-bold text-foreground">
                      {summary.persentase_terbaru !== null ? `${summary.persentase_terbaru}%` : "Belum dinilai"}
                    </span>
                    {summary.predikat_terbaru && (
                      <div className="mt-0.5">
                        <Badge predikat={summary.predikat_terbaru as any} />
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] text-muted block">Fokus Peningkatan:</span>
                    {summary.persentase_terbaru === null ? (
                      <span className="text-muted italic text-[11px]">Menunggu Observasi</span>
                    ) : summary.aspek_prioritas.length > 0 ? (
                      <span className="text-amber-700 dark:text-amber-400 font-bold text-[11px]">
                        {summary.aspek_prioritas.join(", ")}
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                        Tuntas (≥ 3.0)
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-end">
                  {summary.status_supervisi === "Selesai" ? (
                    <Link
                      href="/laporan"
                      className="inline-flex items-center gap-1 text-xs font-bold text-pine-700 dark:text-pine-300 hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Buka Lembar Evaluasi →
                    </Link>
                  ) : (
                    <Link
                      href="/observasi"
                      className="inline-flex items-center gap-1 text-xs font-bold text-pine-700 dark:text-pine-300 hover:underline"
                    >
                      Mulai Penilaian Kelas →
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Kontrol Navigasi Pagination & Toggle Lihat Semua */}
        {filteredSummaries.length > itemsPerPage && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border text-xs text-muted mt-3">
            <div>
              Menampilkan{" "}
              <strong className="text-foreground">
                {showAllRows
                  ? filteredSummaries.length
                  : Math.min(currentPage * itemsPerPage, filteredSummaries.length)}
              </strong>{" "}
              dari <strong className="text-foreground">{filteredSummaries.length}</strong> guru
            </div>

            <div className="flex items-center gap-2 self-center sm:self-auto">
              <button
                onClick={() => setShowAllRows(!showAllRows)}
                className="px-2.5 py-1 rounded-lg border border-border bg-surface text-foreground hover:bg-black/5 font-semibold text-xs transition-colors"
              >
                {showAllRows ? "Tampilkan Per Halaman (8)" : "Tampilkan Semua (25)"}
              </button>

              {!showAllRows && totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-border bg-surface text-foreground hover:bg-black/5 disabled:opacity-40 disabled:pointer-events-none"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 font-mono font-semibold">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-border bg-surface text-foreground hover:bg-black/5 disabled:opacity-40 disabled:pointer-events-none"
                    title="Halaman Selanjutnya"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}

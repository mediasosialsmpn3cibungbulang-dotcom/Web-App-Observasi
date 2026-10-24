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
} from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TeacherService } from "@/features/teachers/teacher-service";
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
    { label: "Selesai", value: guruSelesai, color: "#1F5C45" },
    { label: "Dalam Proses", value: guruDalamProses, color: "#D97706" },
    { label: "Belum Mulai", value: guruBelumMulai, color: "#9CA3AF" },
  ];

  // Data Grafik 2: Distribusi Predikat Guru
  const countAmatBaik = summaries.filter((s) => s.predikat_terbaru === "Amat Baik").length;
  const countBaik = summaries.filter((s) => s.predikat_terbaru === "Baik").length;
  const countCukup = summaries.filter((s) => s.predikat_terbaru === "Cukup").length;
  const countPerlu = summaries.filter((s) => s.predikat_terbaru === "Perlu Pembinaan").length;

  const predicateData = [
    { label: "Amat Baik", count: countAmatBaik, color: "#1F5C45" },
    { label: "Baik", count: countBaik, color: "#2E7D5D" },
    { label: "Cukup", count: countCukup, color: "#D97706" },
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
    { kode: "A", nama: "Perencanaan Pembelajaran", average: calcAspectAverage("A") },
    { kode: "B", nama: "Pelaksanaan Pembelajaran", average: calcAspectAverage("B") },
    { kode: "C", nama: "Penilaian Pembelajaran", average: calcAspectAverage("C") },
    { kode: "D", nama: "Karakter & Interaksi", average: calcAspectAverage("D") },
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
          <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-pine-600 dark:text-pine-400" />
            Dashboard Supervisi & Coaching Guru
          </h1>
          <p className="text-sm text-muted mt-1">
            Pantauan komprehensif siklus observasi pembelajaran, evaluasi target capaian, dan aksi tindak lanjut guru.
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
              Kelola Jadwal
            </Button>
          </Link>
        </div>
      </div>

      {/* Baris 4 Kartu Metrik Utama (KPI) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Guru */}
        <Panel className="p-4">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Guru</span>
            <Users className="w-4 h-4 text-pine-600 dark:text-pine-400" />
          </div>
          <p className="text-2xl md:text-3xl font-bold font-serif text-foreground font-mono">
            {totalGuru}
          </p>
          <p className="text-xs text-muted mt-1">Terdaftar di database sekolah</p>
        </Panel>

        {/* Supervisi Selesai */}
        <Panel className="p-4">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Supervisi Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl md:text-3xl font-bold font-serif text-foreground font-mono">
            {guruSelesai}{" "}
            <span className="text-sm font-normal text-muted">
              ({totalGuru > 0 ? Math.round((guruSelesai / totalGuru) * 100) : 0}%)
            </span>
          </p>
          <p className="text-xs text-muted mt-1">Tuntas siklus pra-obs s.d. RTL</p>
        </Panel>

        {/* Dalam Proses */}
        <Panel className="p-4">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Dalam Proses</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl md:text-3xl font-bold font-serif text-foreground font-mono">
            {guruDalamProses}
          </p>
          <p className="text-xs text-muted mt-1">Sesi observasi & coaching berjalan</p>
        </Panel>

        {/* Rata-Rata Capaian Sekolah */}
        <Panel className="p-4">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Rata-Rata Sekolah</span>
            <TrendingUp className="w-4 h-4 text-pine-600 dark:text-pine-400" />
          </div>
          <p className="text-2xl md:text-3xl font-bold font-serif text-foreground font-mono">
            {rataRataSekolah}%
          </p>
          <div className="mt-1">
            <Badge predikat={rataRataSekolah >= 90 ? "Amat Baik" : rataRataSekolah >= 75 ? "Baik" : "Cukup"} />
          </div>
        </Panel>
      </div>

      {/* Ringkasan Peringatan Segera (Alert Bar) */}
      {(overdueCount > 0 || missedScheduleCount > 0) && (
        <div className="flex items-center justify-between p-3.5 rounded-control bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs md:text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Perhatian Supervisor:</strong> Terdapat{" "}
              {missedScheduleCount > 0 && `${missedScheduleCount} jadwal observasi terlewat`}
              {missedScheduleCount > 0 && overdueCount > 0 && " serta "}
              {overdueCount > 0 && `${overdueCount} kesepakatan tindak lanjut melewati tenggat (overdue)`}.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/tindak-lanjut" className="font-semibold underline hover:no-underline ml-2 shrink-0">
              Periksa RTL
            </Link>
          </div>
        </div>
      )}

      {/* Grid 5 Visualisasi Grafik Native SVG */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Grafik 1: Status Supervisi Donut */}
        <Panel
          title="Status Supervisi Sekolah"
          subtitle="Distribusi tahapan siklus supervisi guru semester ini"
        >
          <DonutChart
            data={donutData}
            centerLabel="Tuntas"
            centerValue={`${totalGuru > 0 ? Math.round((guruSelesai / totalGuru) * 100) : 0}%`}
          />
        </Panel>

        {/* Grafik 2: Sebaran Predikat Guru */}
        <Panel
          title="Sebaran Predikat Nilai Guru"
          subtitle="Klasifikasi mutu pembelajaran hasil observasi"
        >
          <PredicateBarChart data={predicateData} />
        </Panel>

        {/* Grafik 5: Realisasi Tindak Lanjut RTL */}
        <Panel
          title="Realisasi Tindak Lanjut (RTL)"
          subtitle="Persentase komitmen aksi konkret tuntas diverifikasi"
        >
          <RtlGaugeChart
            selesai={rtlSelesaiCount}
            berjalan={rtlBerjalanCount}
            overdue={overdueCount}
          />
        </Panel>

        {/* Grafik 3: Rata-Rata 5 Aspek Rubrik (Span 2 kolom pada layar besar) */}
        <Panel
          className="lg:col-span-2"
          title="Rata-Rata 5 Aspek Rubrik Pembelajaran"
          subtitle="Garis merah putus-putus menunjukkan standar ambang kompetensi tuntas (3.00)"
        >
          <AspectHorizontalBarChart data={aspectData} threshold={3.0} />
        </Panel>

        {/* Grafik 4: Perbandingan Obs-1 vs Obs-Terbaru */}
        <Panel
          title="Dinamika Progres Nilai Guru"
          subtitle="Perbandingan Observasi Awal vs Observasi Terbaru"
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
        title="Daftar Progres Supervisi Guru Terkini"
        subtitle="Status ketercapaian siklus observasi, nilai terbaru, dan tren perkembangan"
        action={
          <Link href="/guru" className="text-xs font-semibold text-primary hover:underline flex items-center">
            Buka Direktori Lengkap <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        }
      >
        <div className="overflow-x-auto -mx-4 md:-mx-6">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-border text-xs uppercase text-muted tracking-wider">
              <tr>
                <th className="py-3 px-4 md:px-6">Nama Guru & Mata Pelajaran</th>
                <th className="py-3 px-4">Fase / Kelas</th>
                <th className="py-3 px-4">Status Siklus</th>
                <th className="py-3 px-4 text-right">Nilai Akhir</th>
                <th className="py-3 px-4">Predikat</th>
                <th className="py-3 px-4">Tren</th>
                <th className="py-3 px-4">Aspek Prioritas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {summaries.map((summary) => (
                <tr key={summary.teacher.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 md:px-6">
                    <p className="font-semibold text-foreground leading-tight">{summary.teacher.nama_lengkap}</p>
                    <p className="text-xs text-muted mt-0.5">{summary.teacher.mata_pelajaran}</p>
                  </td>
                  <td className="py-3.5 px-4 text-muted text-xs">
                    Fase {summary.teacher.fase} ({summary.teacher.kelas_diampu})
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge statusSupervisi={summary.status_supervisi} />
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold font-mono">
                    {summary.persentase_terbaru !== null ? `${summary.persentase_terbaru}%` : "-"}
                  </td>
                  <td className="py-3.5 px-4">
                    {summary.predikat_terbaru ? (
                      <Badge predikat={summary.predikat_terbaru as any} />
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold">
                    <span
                      className={
                        summary.tren === "Meningkat"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : summary.tren === "Menurun"
                          ? "text-red-600 dark:text-red-400"
                          : summary.tren === "Stagnan"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-muted"
                      }
                    >
                      {summary.tren}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-muted">
                    {summary.aspek_prioritas.length > 0 ? (
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {summary.aspek_prioritas.join(", ")}
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
    </div>
  );
}

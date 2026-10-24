"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Target,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Printer,
  FileSpreadsheet,
  ChevronRight,
  ChevronDown,
  Info,
  Sparkles,
  BarChart2,
} from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MonitoringService, TeacherMonitoringSummary } from "./monitoring-service";
import { SettingsService } from "../settings/settings-service";
import { TeacherMonitoringPrintModal } from "./TeacherMonitoringPrintModal";

export function TeacherMonitoringView() {
  const [summaries, setSummaries] = useState<TeacherMonitoringSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [targetFilter, setTargetFilter] = useState("all");
  const [trendFilter, setTrendFilter] = useState("all");
  const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(null);
  const [selectedForPrint, setSelectedForPrint] = useState<TeacherMonitoringSummary | null>(null);

  const refreshData = () => {
    const list = MonitoringService.getAllTeacherSummaries();
    setSummaries(list);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filter ringkasan guru
  const filteredSummaries = summaries.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.teacher.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.teacher.mata_pelajaran.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.teacher.nip_nuptk.includes(searchQuery);

    const matchesTarget =
      targetFilter === "all" ||
      (targetFilter === "tercapai" && item.status_target === "Tercapai") ||
      (targetFilter === "belum_tercapai" && item.status_target === "Belum Tercapai") ||
      (targetFilter === "belum_ada_data" && item.status_target === "Belum Ada Data");

    const matchesTrend =
      trendFilter === "all" ||
      (trendFilter === "meningkat" && item.tren === "Meningkat") ||
      (trendFilter === "stagnan" && item.tren === "Stagnan") ||
      (trendFilter === "menurun" && item.tren === "Menurun");

    return matchesSearch && matchesTarget && matchesTrend;
  });

  // Statistik Agregat
  const totalGuru = summaries.length;
  const guruDenganData = summaries.filter((s) => s.persentase_terbaru !== null);
  const guruTercapai = summaries.filter((s) => s.status_target === "Tercapai").length;
  const guruMeningkat = summaries.filter((s) => s.tren === "Meningkat").length;
  const guruStagnan = summaries.filter((s) => s.tren === "Stagnan").length;
  const guruMenurun = summaries.filter((s) => s.tren === "Menurun").length;

  const rataRataSkorSekolah =
    guruDenganData.length > 0
      ? Number(
          (
            guruDenganData.reduce((acc, curr) => acc + (curr.persentase_terbaru || 0), 0) /
            guruDenganData.length
          ).toFixed(1)
        )
      : 0;

  const schoolSettings = SettingsService.getSchoolSettings();

  // Fungsi Ekspor CSV sederhana untuk Sheet 8 & 9
  const handleExportCSV = () => {
    const headers = [
      "Nama Guru",
      "NIP/NUPTK",
      "Mata Pelajaran",
      "Fase/Kelas",
      "Sesi 1 (%)",
      "Sesi 2 (%)",
      "Sesi 3 (%)",
      "Skor Terbaru (%)",
      "Predikat",
      "Target Sekolah (%)",
      "Status Target",
      "Tren Perkembangan",
      "Selisih Target (%)",
      "Aspek Prioritas Perbaikan",
      "Total RTL",
      "RTL Tuntas",
    ];

    const rows = summaries.map((s) => [
      `"${s.teacher.nama_lengkap}"`,
      `"${s.teacher.nip_nuptk}"`,
      `"${s.teacher.mata_pelajaran}"`,
      `"Fase ${s.teacher.fase} - ${s.teacher.kelas_diampu}"`,
      s.sesi_1 ? s.sesi_1.persentase : "-",
      s.sesi_2 ? s.sesi_2.persentase : "-",
      s.sesi_3 ? s.sesi_3.persentase : "-",
      s.persentase_terbaru !== null ? s.persentase_terbaru : "-",
      s.predikat_terbaru || "-",
      s.target_skor,
      s.status_target,
      s.tren,
      s.selisih_target !== null ? s.selisih_target : "-",
      `"${s.aspek_prioritas.join(", ") || "Tidak ada"}"`,
      s.total_rtl,
      s.rtl_selesai,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Supervisi_Sheet8_9_${schoolSettings.npsn}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Target className="w-7 h-7 text-pine-600 dark:text-pine-400" />
            Evaluasi Perkembangan Nilai & Target Guru
          </h1>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Pantau kemajuan mengajar guru dari sesi ke sesi, pencapaian target kelulusan sekolah, dan realisasi perbaikan kelas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={handleExportCSV}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Download Data (Excel/CSV)
          </Button>
        </div>
      </div>

      {/* Ringkasan KPI Sekolah */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs uppercase text-muted font-bold tracking-wider">Rata-Rata Capaian Sekolah</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-foreground">{rataRataSkorSekolah}%</span>
            <span className="text-xs text-muted">/ Target {SettingsService.getGradingSettings().target_default}%</span>
          </div>
          <p className="text-xs text-muted mt-0.5">Dari {guruDenganData.length} guru tersupervisi</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs uppercase text-muted font-bold tracking-wider">Ketercapaian Target</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {guruTercapai} <span className="text-sm font-normal text-muted">/ {totalGuru}</span>
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              ({totalGuru > 0 ? Math.round((guruTercapai / totalGuru) * 100) : 0}%)
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">Guru melampaui batas target</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs uppercase text-muted font-bold tracking-wider">Tren Meningkat</p>
          <div className="flex items-baseline gap-2 mt-1 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
            <span className="text-2xl font-bold font-mono">{guruMeningkat}</span>
            <span className="text-xs text-muted">guru</span>
          </div>
          <p className="text-xs text-muted mt-0.5">Menunjukkan progres positif</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs uppercase text-muted font-bold tracking-wider">Dinamika Perlu Pembinaan</p>
          <div className="flex items-center gap-3 mt-1 text-xs">
            <span className="flex items-center gap-1 text-amber-600 font-mono font-bold text-sm">
              <Minus className="w-3.5 h-3.5" /> {guruStagnan} Stagnan
            </span>
            <span className="flex items-center gap-1 text-red-600 font-mono font-bold text-sm">
              <TrendingDown className="w-3.5 h-3.5" /> {guruMenurun} Menurun
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">Memerlukan bimbingan coaching</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari guru, NIP, atau mata pelajaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-pine-500"
            />
          </div>

          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-pine-500"
          >
            <option value="all">Semua Status Target</option>
            <option value="tercapai">🎯 Target Tercapai</option>
            <option value="belum_tercapai">⚠️ Belum Tercapai</option>
            <option value="belum_ada_data">Belum Ada Data</option>
          </select>

          <select
            value={trendFilter}
            onChange={(e) => setTrendFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-pine-500"
          >
            <option value="all">Semua Tren</option>
            <option value="meningkat">📈 Meningkat</option>
            <option value="stagnan">➖ Stagnan</option>
            <option value="menurun">📉 Menurun</option>
          </select>
        </div>

        <p className="text-xs text-muted self-end md:self-center">
          Menampilkan {filteredSummaries.length} dari {totalGuru} guru
        </p>
      </div>

      {/* Matriks Evaluasi & Capaian Guru */}
      <Panel
        title="Daftar Evaluasi Nilai 3 Sesi Observasi & Rencana Tindak Lanjut Guru"
        subtitle="Rincian nilai observasi tiap guru, perbandingan dengan target sekolah, serta perkembangan mutu mengajar"
      >
        <div className="overflow-x-auto -mx-4 md:-mx-6">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-border text-xs uppercase text-muted tracking-wider">
              <tr>
                <th className="py-3 px-4 md:px-6">Nama Guru & Mapel</th>
                <th className="py-3 px-3 text-center" title="Observasi Sesi ke-1">Obs-1</th>
                <th className="py-3 px-3 text-center" title="Observasi Sesi ke-2">Obs-2</th>
                <th className="py-3 px-3 text-center" title="Observasi Sesi ke-3">Obs-3</th>
                <th className="py-3 px-4 text-center">Nilai Terbaru</th>
                <th className="py-3 px-4 text-center">Target Sekolah</th>
                <th className="py-3 px-4 text-center">Kemajuan Nilai</th>
                <th className="py-3 px-4">Fokus Bimbingan & Aksi</th>
                <th className="py-3 px-4 text-center">Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSummaries.map((item) => {
                const isExpanded = expandedTeacherId === item.teacher.id;

                return (
                  <React.Fragment key={item.teacher.id}>
                    <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      {/* Guru */}
                      <td className="py-3.5 px-4 md:px-6 align-middle">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedTeacherId(isExpanded ? null : item.teacher.id)}
                            className="p-1 rounded text-muted hover:text-foreground"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          <div>
                            <p className="font-semibold text-foreground">{item.teacher.nama_lengkap}</p>
                            <p className="text-xs text-muted">
                              {item.teacher.mata_pelajaran} • Fase {item.teacher.fase} ({item.teacher.kelas_diampu})
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Sesi 1 */}
                      <td className="py-3.5 px-3 text-center align-middle font-mono text-xs">
                        {item.sesi_1 ? (
                          <div>
                            <span className="font-bold">{item.sesi_1.persentase}%</span>
                            <span className="block text-[10px] text-muted">{item.sesi_1.predikat}</span>
                          </div>
                        ) : (
                          <span className="text-muted text-xs">-</span>
                        )}
                      </td>

                      {/* Sesi 2 */}
                      <td className="py-3.5 px-3 text-center align-middle font-mono text-xs">
                        {item.sesi_2 ? (
                          <div>
                            <span className="font-bold">{item.sesi_2.persentase}%</span>
                            <span className="block text-[10px] text-muted">{item.sesi_2.predikat}</span>
                          </div>
                        ) : (
                          <span className="text-muted text-xs">-</span>
                        )}
                      </td>

                      {/* Sesi 3 */}
                      <td className="py-3.5 px-3 text-center align-middle font-mono text-xs">
                        {item.sesi_3 ? (
                          <div>
                            <span className="font-bold">{item.sesi_3.persentase}%</span>
                            <span className="block text-[10px] text-muted">{item.sesi_3.predikat}</span>
                          </div>
                        ) : (
                          <span className="text-muted text-xs">-</span>
                        )}
                      </td>

                      {/* Skor Akhir & Predikat */}
                      <td className="py-3.5 px-4 text-center align-middle">
                        {item.persentase_terbaru !== null ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="font-bold font-mono text-base text-foreground">
                              {item.persentase_terbaru}%
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-primary-subtle text-primary border border-primary/20">
                              {item.predikat_terbaru}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted">Belum ada data</span>
                        )}
                      </td>

                      {/* Evaluasi Target */}
                      <td className="py-3.5 px-4 text-center align-middle">
                        <div className="flex flex-col items-center">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                              item.status_target === "Tercapai"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700"
                                : item.status_target === "Belum Tercapai"
                                ? "bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700"
                                : "bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                            }`}
                          >
                            {item.status_target}
                          </span>
                          {item.selisih_target !== null && (
                            <span className="text-[10px] font-mono text-muted mt-0.5">
                              {item.selisih_target >= 0 ? `+${item.selisih_target}%` : `${item.selisih_target}%`} dari target
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tren Progres */}
                      <td className="py-3.5 px-4 text-center align-middle">
                        <div className="flex flex-col items-center">
                          <span
                            className={`flex items-center gap-1 text-xs font-semibold ${
                              item.tren === "Meningkat"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : item.tren === "Menurun"
                                ? "text-red-600 dark:text-red-400"
                                : item.tren === "Stagnan"
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-muted"
                            }`}
                          >
                            {item.tren === "Meningkat" && <TrendingUp className="w-3.5 h-3.5" />}
                            {item.tren === "Menurun" && <TrendingDown className="w-3.5 h-3.5" />}
                            {item.tren === "Stagnan" && <Minus className="w-3.5 h-3.5" />}
                            {item.tren}
                          </span>
                          {item.perkembangan_poin !== null && (
                            <span className="text-[10px] font-mono text-muted">
                              {item.perkembangan_poin >= 0 ? `+${item.perkembangan_poin}` : item.perkembangan_poin} poin
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Prioritas & RTL */}
                      <td className="py-3.5 px-4 align-middle text-xs max-w-[200px]">
                        {item.aspek_prioritas.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.aspek_prioritas.map((asp) => (
                              <span
                                key={asp}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
                              >
                                {asp}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted">Kompetensi merata (&ge; 3.0)</span>
                        )}
                        <p className="text-[10px] text-muted mt-1">
                          RTL: <span className="font-semibold text-foreground">{item.rtl_selesai} tuntas</span> dari {item.total_rtl}
                        </p>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-center align-middle whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Cetak Lembar Rekap Capaian Guru A4"
                          onClick={() => setSelectedForPrint(item)}
                        >
                          <Printer className="w-3.5 h-3.5 mr-1" />
                          Cetak
                        </Button>
                      </td>
                    </tr>

                    {/* Baris Rincian Perkembangan (Drill-down Accordion) */}
                    {isExpanded && (
                      <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-border">
                        <td colSpan={9} className="p-4 md:p-6">
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                              <BarChart2 className="w-4 h-4 text-pine-600" />
                              Detail Capaian 5 Aspek Rubrik & Evaluasi Lanjutan — {item.teacher.nama_lengkap}
                            </h4>

                            {item.rata_aspek ? (
                              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                <div className="p-3 rounded-lg border border-border bg-card text-center">
                                  <p className="text-[10px] uppercase font-bold text-muted">A. Perencanaan</p>
                                  <p className="text-lg font-bold font-mono text-foreground mt-0.5">
                                    {item.rata_aspek?.A != null ? item.rata_aspek.A.toFixed(2) : "-"}
                                  </p>
                                  <div className="w-full bg-border h-1.5 rounded-full mt-2 overflow-hidden">
                                    <div
                                      className="bg-pine-600 h-full rounded-full"
                                      style={{ width: `${((item.rata_aspek?.A || 0) / 4) * 100}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="p-3 rounded-lg border border-border bg-card text-center">
                                  <p className="text-[10px] uppercase font-bold text-muted">B. Pelaksanaan</p>
                                  <p className="text-lg font-bold font-mono text-foreground mt-0.5">
                                    {item.rata_aspek?.B != null ? item.rata_aspek.B.toFixed(2) : "-"}
                                  </p>
                                  <div className="w-full bg-border h-1.5 rounded-full mt-2 overflow-hidden">
                                    <div
                                      className="bg-pine-600 h-full rounded-full"
                                      style={{ width: `${((item.rata_aspek?.B || 0) / 4) * 100}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="p-3 rounded-lg border border-border bg-card text-center">
                                  <p className="text-[10px] uppercase font-bold text-muted">C. Penilaian</p>
                                  <p className="text-lg font-bold font-mono text-foreground mt-0.5">
                                    {item.rata_aspek?.C != null ? item.rata_aspek.C.toFixed(2) : "-"}
                                  </p>
                                  <div className="w-full bg-border h-1.5 rounded-full mt-2 overflow-hidden">
                                    <div
                                      className="bg-pine-600 h-full rounded-full"
                                      style={{ width: `${((item.rata_aspek?.C || 0) / 4) * 100}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="p-3 rounded-lg border border-border bg-card text-center">
                                  <p className="text-[10px] uppercase font-bold text-muted">D. Karakter</p>
                                  <p className="text-lg font-bold font-mono text-foreground mt-0.5">
                                    {item.rata_aspek?.D != null ? item.rata_aspek.D.toFixed(2) : "-"}
                                  </p>
                                  <div className="w-full bg-border h-1.5 rounded-full mt-2 overflow-hidden">
                                    <div
                                      className="bg-pine-600 h-full rounded-full"
                                      style={{ width: `${((item.rata_aspek?.D || 0) / 4) * 100}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="p-3 rounded-lg border border-border bg-card text-center">
                                  <p className="text-[10px] uppercase font-bold text-muted">E. Iklim Kelas</p>
                                  <p className="text-lg font-bold font-mono text-foreground mt-0.5">
                                    {item.rata_aspek?.E != null ? item.rata_aspek.E.toFixed(2) : "-"}
                                  </p>
                                  <div className="w-full bg-border h-1.5 rounded-full mt-2 overflow-hidden">
                                    <div
                                      className="bg-pine-600 h-full rounded-full"
                                      style={{ width: `${((item.rata_aspek?.E || 0) / 4) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-muted italic">
                                Belum ada data observasi yang disahkan untuk analisis aspek guru ini.
                              </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                              <div className="p-3 rounded-lg border border-border bg-card">
                                <span className="font-bold text-foreground block mb-1">
                                  🌟 Kekuatan Pembelajaran Teridentifikasi:
                                </span>
                                <p className="text-muted leading-relaxed">
                                  {item.aspek_tertinggi || "Seluruh aspek menunjukkan konsistensi dasar."}
                                </p>
                              </div>
                              <div className="p-3 rounded-lg border border-border bg-card">
                                <span className="font-bold text-foreground block mb-1">
                                  💡 Rekomendasi Supervisi Lanjutan:
                                </span>
                                <p className="text-muted leading-relaxed">
                                  {item.aspek_prioritas.length > 0
                                    ? `Prioritaskan pendampingan coaching pada ${item.aspek_prioritas.join(", ")} untuk mencapai batas tuntas 3.00.`
                                    : "Pertahankan konsistensi mengajar dan dorong inovasi diferensiasi pembelajaran berkelanjutan."}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Modal Cetak Monitoring */}
      {selectedForPrint && (
        <TeacherMonitoringPrintModal
          isOpen={true}
          summary={selectedForPrint}
          school={schoolSettings}
          onClose={() => setSelectedForPrint(null)}
        />
      )}
    </div>
  );
}

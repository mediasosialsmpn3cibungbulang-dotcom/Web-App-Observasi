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
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import { downloadAsExcel, downloadAsCSV } from "@/lib/export-service";
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

  // Header kolom standar untuk ekspor Excel & CSV
  const exportHeaders = [
    "No",
    "Nama Guru",
    "NIP / NUPTK",
    "Mata Pelajaran",
    "Fase",
    "Kelas Diampu",
    "Target Sesi Wajib",
    "Sesi 1 (%)",
    "Sesi 2 (%)",
    "Sesi 3 (%)",
    "Skor Capaian (%)",
    "Predikat Mutu",
    "Target Sekolah (%)",
    "Status Target",
    "Tren Perkembangan",
    "Selisih Target (%)",
    "Fokus Perbaikan / Rekomendasi",
    "Total RTL",
    "RTL Selesai",
  ];

  // Baris data terstruktur bersih tanpa koma menyatu
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
      s.persentase_terbaru !== null ? s.persentase_terbaru : "-",
      s.predikat_terbaru || "Belum Dinilai",
      s.target_skor,
      s.status_target,
      s.total_sesi < 2 ? (s.total_sesi === 1 ? "Evaluasi Awal" : "-") : s.tren,
      s.selisih_target !== null ? `${s.selisih_target >= 0 ? "+" : ""}${s.selisih_target}` : "-",
      s.aspek_prioritas.length > 0
        ? s.aspek_prioritas.join(", ")
        : s.persentase_terbaru !== null
        ? "Tuntas (≥ 3.0)"
        : "Menunggu Observasi",
      s.total_rtl,
      s.rtl_selesai,
    ]);

  // Handler ekspor Excel (.xlsx) berkolom rapi
  const handleExportExcel = () => {
    downloadAsExcel({
      filename: `Evaluasi_Supervisi_Sheet8_9_${schoolSettings.npsn}`,
      sheetName: "Evaluasi Sheet 8-9",
      title: `EVALUASI CAPAIAN NILAI & TARGET SUPERVISI GURU — ${schoolSettings.nama_sekolah}`,
      metadata: [
        { label: "Nama Sekolah", value: schoolSettings.nama_sekolah },
        { label: "NPSN", value: schoolSettings.npsn },
        { label: "Semester Aktif", value: schoolSettings.semester_aktif },
        { label: "Kepala Sekolah", value: schoolSettings.nama_kepala_sekolah },
        { label: "Tanggal Unduh", value: new Date().toLocaleDateString("id-ID", { dateStyle: "long" }) },
      ],
      headers: exportHeaders,
      rows: getExportRows(),
    });
  };

  // Handler ekspor CSV (.csv) titik koma ramah regional
  const handleExportCSV = () => {
    downloadAsCSV({
      filename: `Evaluasi_Supervisi_Sheet8_9_${schoolSettings.npsn}`,
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
            <Target className="w-7 h-7 text-pine-600 dark:text-pine-400" />
            Evaluasi Perkembangan Nilai & Target Guru
          </h1>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Pantau kemajuan mengajar guru dari sesi ke sesi, pencapaian target kelulusan sekolah, dan realisasi perbaikan kelas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportDropdown
            label="Download Data"
            onExportExcel={handleExportExcel}
            onExportCSV={handleExportCSV}
          />
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
        title="Daftar Evaluasi Nilai Observasi & Rencana Tindak Lanjut Guru"
        subtitle="Rincian nilai observasi tiap guru sesuai target sesi, perbandingan dengan target sekolah, serta perkembangan mutu mengajar"
      >
        <div className="overflow-x-auto -mx-4 md:-mx-6">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-border text-xs uppercase text-muted tracking-wider">
              <tr>
                <th className="py-2.5 px-3 md:px-4">Nama Guru & Mapel</th>
                <th className="py-2.5 px-1.5 md:px-2 text-center whitespace-nowrap" title="Observasi Sesi ke-1">Sesi 1</th>
                <th className="py-2.5 px-1.5 md:px-2 text-center whitespace-nowrap" title="Observasi Sesi ke-2">Sesi 2</th>
                <th className="py-2.5 px-1.5 md:px-2 text-center whitespace-nowrap" title="Observasi Sesi ke-3">Sesi 3</th>
                <th className="py-2.5 px-2 md:px-3 text-center whitespace-nowrap">Capaian & Target</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">Tren Mutu</th>
                <th className="py-2.5 px-2 md:px-3">Fokus & RTL</th>
                <th className="py-2.5 px-2 md:px-3 text-center whitespace-nowrap">Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSummaries.map((item) => {
                const isExpanded = expandedTeacherId === item.teacher.id;
                const hasObs = item.persentase_terbaru !== null;

                return (
                  <React.Fragment key={item.teacher.id}>
                    <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      {/* Guru & Target Sesi */}
                      <td className="py-2.5 px-3 md:px-4 align-middle">
                        <div className="flex items-start gap-1.5 md:gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedTeacherId(isExpanded ? null : item.teacher.id)}
                            className="p-1 rounded text-muted hover:text-foreground shrink-0 mt-0.5"
                            title={isExpanded ? "Tutup rincian aspek" : "Buka rincian 5 aspek"}
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-foreground leading-snug text-xs md:text-sm">
                                {item.teacher.nama_lengkap}
                              </span>
                              <span
                                className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary-subtle text-primary border border-primary/20 shrink-0"
                                title={`Target wajib supervisi: ${item.min_sesi_wajib} sesi`}
                              >
                                {item.min_sesi_wajib}x Sesi
                                {item.teacher.target_sesi && (
                                  <span className="ml-1 text-[9px] text-pine-700 dark:text-pine-300 font-semibold">(Kustom)</span>
                                )}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted mt-0.5 leading-tight">
                              {item.teacher.mata_pelajaran} • Fase {item.teacher.fase} ({item.teacher.kelas_diampu})
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Sesi 1 */}
                      <td className="py-2.5 px-1.5 md:px-2 text-center align-middle font-mono text-xs whitespace-nowrap">
                        {item.sesi_1 ? (
                          <div>
                            <span className="font-bold text-foreground">{item.sesi_1.persentase}%</span>
                            <span className="block text-[10px] text-muted font-sans">{item.sesi_1.predikat}</span>
                          </div>
                        ) : (
                          <span className="text-muted/50 text-xs">-</span>
                        )}
                      </td>

                      {/* Sesi 2 */}
                      <td className="py-2.5 px-1.5 md:px-2 text-center align-middle font-mono text-xs whitespace-nowrap">
                        {item.sesi_2 ? (
                          <div>
                            <span className="font-bold text-foreground">{item.sesi_2.persentase}%</span>
                            <span className="block text-[10px] text-muted font-sans">{item.sesi_2.predikat}</span>
                          </div>
                        ) : item.min_sesi_wajib < 2 ? (
                          <span className="text-muted/30 text-xs" title="Bukan target supervisi guru ini (Target: 1 Sesi)">
                            -
                          </span>
                        ) : (
                          <span className="text-muted/50 text-xs">-</span>
                        )}
                      </td>

                      {/* Sesi 3 */}
                      <td className="py-2.5 px-1.5 md:px-2 text-center align-middle font-mono text-xs whitespace-nowrap">
                        {item.sesi_3 ? (
                          <div>
                            <span className="font-bold text-foreground">{item.sesi_3.persentase}%</span>
                            <span className="block text-[10px] text-muted font-sans">{item.sesi_3.predikat}</span>
                          </div>
                        ) : item.min_sesi_wajib < 3 ? (
                          <span className="text-muted/30 text-xs" title="Bukan target supervisi guru ini">
                            -
                          </span>
                        ) : (
                          <span className="text-muted/50 text-xs">-</span>
                        )}
                      </td>

                      {/* Capaian Nilai & Evaluasi Target Sekolah (Digabung) */}
                      <td className="py-2.5 px-2 md:px-3 text-center align-middle whitespace-nowrap">
                        {hasObs ? (
                          <div className="inline-flex flex-col items-center">
                            <div className="flex items-baseline gap-1">
                              <span className="font-extrabold font-mono text-sm text-foreground">
                                {item.persentase_terbaru}%
                              </span>
                              <span className="text-[10px] text-muted font-medium">({item.predikat_terbaru})</span>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                                item.status_target === "Tercapai"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700"
                                  : "bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700"
                              }`}
                            >
                              {item.status_target} {item.selisih_target !== null && `(${item.selisih_target >= 0 ? `+${item.selisih_target}%` : `${item.selisih_target}%`})`}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <span className="text-xs text-muted italic">Belum Dinilai</span>
                            <span className="text-[10px] font-mono text-muted/70 mt-0.5">Target: {item.target_skor}%</span>
                          </div>
                        )}
                      </td>

                      {/* Tren Mutu */}
                      <td className="py-2.5 px-2 text-center align-middle whitespace-nowrap">
                        {!hasObs ? (
                          <span className="text-muted/50 text-xs">-</span>
                        ) : item.total_sesi < 2 ? (
                          <span className="text-xs text-muted font-medium">Evaluasi Awal</span>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span
                              className={`flex items-center gap-1 text-xs font-semibold ${
                                item.tren === "Meningkat"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : item.tren === "Menurun"
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-amber-600 dark:text-amber-400"
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
                        )}
                      </td>

                      {/* Fokus Bimbingan & RTL */}
                      <td className="py-2.5 px-2 md:px-3 align-middle text-xs">
                        {!hasObs ? (
                          <span className="text-muted italic text-[11px]">Menunggu Observasi</span>
                        ) : (
                          <div>
                            {item.aspek_prioritas.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {item.aspek_prioritas.map((asp) => (
                                  <span
                                    key={asp}
                                    className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
                                  >
                                    {asp}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                                Tuntas (≥ 3.0)
                              </span>
                            )}
                            <p className="text-[10px] text-muted mt-0.5 whitespace-nowrap">
                              RTL: <span className="font-semibold text-foreground">{item.rtl_selesai} selesai</span> dari {item.total_rtl}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Aksi Dokumen */}
                      <td className="py-2.5 px-2 md:px-3 text-center align-middle whitespace-nowrap">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7 px-2.5 text-xs"
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
                        <td colSpan={8} className="p-4 md:p-6">
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

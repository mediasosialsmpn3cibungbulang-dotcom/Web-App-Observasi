"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ListTodo,
  Plus,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Search,
  Filter,
  Eye,
  CalendarCheck2,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  Trash2,
  UserCheck,
  GraduationCap,
  Calendar,
  Building,
  Target,
  ArrowRight,
  ShieldCheck,
  Info,
} from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import { FollowupItem, Teacher, SchoolSettings } from "@/contracts/schemas";
import { FollowupService } from "./followup-service";
import { TeacherService } from "../teachers/teacher-service";
import { FollowupCheckModal } from "./FollowupCheckModal";
import { FollowupPrintModal } from "./FollowupPrintModal";
import { SettingsService } from "../settings/settings-service";
import { downloadAsExcel, downloadAsCSV } from "@/lib/export-service";
import { formatTanggalIndonesia } from "@/lib/utils";

export function FollowupManager() {
  const [followups, setFollowups] = useState<FollowupItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);

  // Filter & Pencarian
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "Berjalan" | "Selesai" | "overdue">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  // Modal State
  const [selectedFollowupForCheck, setSelectedFollowupForCheck] = useState<FollowupItem | null>(null);
  const [selectedFollowupForPrint, setSelectedFollowupForPrint] = useState<FollowupItem | null>(null);
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);

  // Form tambah RTL baru
  const [formTeacherId, setFormTeacherId] = useState("");
  const [formMasalah, setFormMasalah] = useState("");
  const [formSolusi, setFormSolusi] = useState("");
  const [formAksi, setFormAksi] = useState("");
  const [formDukungan, setFormDukungan] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formJenisDukungan, setFormJenisDukungan] = useState<FollowupItem["jenis_dukungan"]>("Sarana dan Prasarana");
  const [formTarget, setFormTarget] = useState("");

  const refreshData = () => {
    const list = FollowupService.getFollowups();
    setFollowups(list);
    const tList = TeacherService.getTeachers().filter((t) => t.aktif);
    setTeachers(tList);
    const school = SettingsService.getSchoolSettings();
    setSchoolSettings(school);

    if (tList.length > 0 && !formTeacherId) {
      setFormTeacherId(tList[0].id);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleStatusChange = (item: FollowupItem, newStatus: FollowupItem["status"]) => {
    try {
      FollowupService.updateStatus(item.id, newStatus, true);
      refreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui status";
      alert(msg);
    }
  };

  const handleDeleteFollowup = (item: FollowupItem) => {
    const teacher = teachers.find((t) => t.id === item.teacher_id);
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus kesepakatan tindak lanjut untuk ${
          teacher?.nama_lengkap || "guru ini"
        }?`
      )
    ) {
      FollowupService.deleteFollowupItem(item.id);
      refreshData();
    }
  };

  const handleCreateFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeacherId || !formMasalah || !formSolusi || !formAksi || !formDeadline) {
      alert("Harap lengkapi semua kolom wajib RTL.");
      return;
    }

    const newItem: FollowupItem = {
      id: crypto.randomUUID(),
      coaching_session_id: "manual-entry",
      teacher_id: formTeacherId,
      semester: schoolSettings?.semester_aktif || "2026/2027 Ganjil",
      masalah_utama: formMasalah,
      solusi_disepakati: formSolusi,
      aksi_konkret_guru: formAksi,
      dukungan_kepala_sekolah: formDukungan || "Pendampingan dan pemantauan berkala",
      deadline: formDeadline,
      bukti_tindak_lanjut: "Modul ajar dan hasil kerja siswa",
      foto_bukti_url: null,
      status: "Berjalan",
      kode_pertanyaan_pemicu: "D-01",
      target_indikator_sukses: formTarget || "Peningkatan keterlibatan dan pemahaman siswa di kelas.",
      sumber_daya_dibutuhkan: "Materi penunjang pembelajaran",
      jenis_dukungan: formJenisDukungan,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
    };

    FollowupService.saveFollowupItem(newItem);
    setIsModalCreateOpen(false);

    // Reset form
    setFormMasalah("");
    setFormSolusi("");
    setFormAksi("");
    setFormDukungan("");
    setFormDeadline("");
    setFormTarget("");
    refreshData();
  };

  // Filter daftar RTL
  const filteredList = useMemo(() => {
    return followups.filter((item) => {
      const teacher = teachers.find((t) => t.id === item.teacher_id);
      const matchesTeacher = selectedTeacherId === "all" || item.teacher_id === selectedTeacherId;

      let matchesStatus = true;
      const isOverdue = FollowupService.isOverdue(item);

      if (activeTab === "overdue") {
        matchesStatus = isOverdue;
      } else if (activeTab !== "all") {
        matchesStatus = item.status === activeTab;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.masalah_utama.toLowerCase().includes(q) ||
        item.solusi_disepakati.toLowerCase().includes(q) ||
        item.aksi_konkret_guru.toLowerCase().includes(q) ||
        (teacher && teacher.nama_lengkap.toLowerCase().includes(q));

      return matchesTeacher && matchesStatus && matchesSearch;
    });
  }, [followups, teachers, selectedTeacherId, activeTab, searchQuery]);

  // Statistik Ringkas
  const totalRTL = followups.length;
  const countSelesai = followups.filter((f) => f.status === "Selesai").length;
  const countBerjalan = followups.filter((f) => f.status === "Berjalan").length;
  const countOverdue = followups.filter((f) => FollowupService.isOverdue(f)).length;

  // Ekspor Excel & CSV
  const exportHeaders = [
    "No",
    "Nama Guru",
    "Mata Pelajaran",
    "Kelas",
    "Masalah Pembelajaran",
    "Solusi Disepakati",
    "Aksi Konkret Guru",
    "Dukungan Sekolah",
    "Jenis Dukungan",
    "Tenggat Waktu",
    "Status",
    "Jumlah Cek-in",
  ];

  const getExportRows = () =>
    filteredList.map((item, idx) => {
      const t = teachers.find((tc) => tc.id === item.teacher_id);
      const checks = FollowupService.getFollowupChecks(item.id);
      const isOverdue = FollowupService.isOverdue(item);
      return [
        idx + 1,
        t?.nama_lengkap || "-",
        t?.mata_pelajaran || "-",
        t?.kelas_diampu || "-",
        item.masalah_utama,
        item.solusi_disepakati,
        item.aksi_konkret_guru,
        item.dukungan_kepala_sekolah || "-",
        item.jenis_dukungan || "-",
        item.deadline,
        isOverdue ? "Lewat Tenggat (Overdue)" : item.status,
        `${checks.length} Kali`,
      ];
    });

  const handleExportExcel = () => {
    downloadAsExcel({
      filename: `RTL_Tindak_Lanjut_${schoolSettings?.npsn || "Sekolah"}`,
      sheetName: "RTL Dokumen 7",
      title: `RENCANA TINDAK LANJUT SUPERVISI GURU (DOKUMEN 7) — ${schoolSettings?.nama_sekolah || "SEKOLAH"}`,
      metadata: [
        { label: "Nama Sekolah", value: schoolSettings?.nama_sekolah || "-" },
        { label: "NPSN", value: schoolSettings?.npsn || "-" },
        { label: "Semester", value: schoolSettings?.semester_aktif || "-" },
        { label: "Tanggal Unduh", value: new Date().toLocaleDateString("id-ID", { dateStyle: "long" }) },
      ],
      headers: exportHeaders,
      rows: getExportRows(),
    });
  };

  const handleExportCSV = () => {
    downloadAsCSV({
      filename: `RTL_Tindak_Lanjut_${schoolSettings?.npsn || "Sekolah"}`,
      headers: exportHeaders,
      rows: getExportRows(),
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Halaman */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground font-serif flex items-center gap-2">
              <ListTodo className="w-7 h-7 text-primary shrink-0" />
              Rencana Aksi & Tindak Lanjut Guru (RTL)
            </h1>
          </div>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Pantau realisasi komitmen mengajar guru, lakukan cek-in berkala (Pekan 2, 4, 8/9),
            dan sahkan dokumen bukti yang telah tuntas.
          </p>
        </div>

        {/* Tombol Aksi Dokumen */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <ExportDropdown onExportExcel={handleExportExcel} onExportCSV={handleExportCSV} />

          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => {
              if (followups.length > 0) {
                setSelectedFollowupForPrint(followups[0]);
              } else {
                alert("Belum ada data kesepakatan tindak lanjut untuk dicetak.");
              }
            }}
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Cetak Format RTL (Doc 7)
          </Button>

          <Button type="button" variant="primary" size="md" onClick={() => setIsModalCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Kesepakatan RTL
          </Button>
        </div>
      </div>

      {/* Ringkasan Status & KPI (4 Kartu Bersih & Proporsional) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Kesepakatan */}
        <div className="p-4 rounded-panel border border-border bg-surface shadow-xs">
          <span className="text-[11px] uppercase text-muted font-bold tracking-wider block">
            Total Kesepakatan
          </span>
          <p className="text-2xl font-black font-mono text-foreground mt-1">{totalRTL}</p>
          <p className="text-xs text-muted mt-1">Komitmen perbaikan guru</p>
        </div>

        {/* Sedang Berjalan */}
        <div className="p-4 rounded-panel border border-primary/30 bg-primary/5 shadow-xs">
          <span className="text-[11px] uppercase text-primary font-bold tracking-wider block">
            Sedang Berjalan
          </span>
          <p className="text-2xl font-black font-mono text-primary mt-1">{countBerjalan}</p>
          <p className="text-xs text-muted mt-1">Dalam tahap praktik kelas</p>
        </div>

        {/* Tuntas & Diverifikasi */}
        <div className="p-4 rounded-panel border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs">
          <span className="text-[11px] uppercase text-emerald-700 dark:text-emerald-300 font-bold tracking-wider block">
            Tuntas & Diverifikasi
          </span>
          <p className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300 mt-1">
            {countSelesai}
          </p>
          <p className="text-xs text-muted mt-1">Disahkan kepala sekolah</p>
        </div>

        {/* Lewat Tenggat / Overdue */}
        <div className="p-4 rounded-panel border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 shadow-xs">
          <span className="text-[11px] uppercase text-rose-700 dark:text-rose-400 font-bold tracking-wider block">
            Lewat Tenggat Waktu
          </span>
          <p className="text-2xl font-black font-mono text-rose-700 dark:text-rose-400 mt-1">
            {countOverdue}
          </p>
          <p className="text-xs text-muted mt-1">Perlu pendampingan segera</p>
        </div>
      </div>

      {/* Bar Filter Status Cepat & Pencarian Guru (Sangat Mudah Dipahami) */}
      <div className="space-y-3">
        {/* Tab Status Cepat (1-Klik Filter) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-panel bg-surface border border-border select-none">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2 rounded-control text-xs font-bold transition-smooth flex items-center gap-1.5 ${
              activeTab === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <span>📋 Semua RTL</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                activeTab === "all" ? "bg-white/20 text-white" : "bg-black/10 dark:bg-white/10 text-muted"
              }`}
            >
              {totalRTL}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("Berjalan")}
            className={`px-3.5 py-2 rounded-control text-xs font-bold transition-smooth flex items-center gap-1.5 ${
              activeTab === "Berjalan"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <span>⏳ Sedang Berjalan</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                activeTab === "Berjalan"
                  ? "bg-white/20 text-white"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
              }`}
            >
              {countBerjalan}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("Selesai")}
            className={`px-3.5 py-2 rounded-control text-xs font-bold transition-smooth flex items-center gap-1.5 ${
              activeTab === "Selesai"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <span>✅ Tuntas Disahkan</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                activeTab === "Selesai"
                  ? "bg-white/20 text-white"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              }`}
            >
              {countSelesai}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("overdue")}
            className={`px-3.5 py-2 rounded-control text-xs font-bold transition-smooth flex items-center gap-1.5 ${
              activeTab === "overdue"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            }`}
          >
            <span>🚨 Lewat Tenggat</span>
            {countOverdue > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  activeTab === "overdue"
                    ? "bg-white/20 text-white"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                }`}
              >
                {countOverdue}
              </span>
            )}
          </button>

          {/* Pengalih Mode Tampilan (Card vs Table) */}
          <div className="ml-auto hidden sm:flex items-center gap-1 pl-2 border-l border-border">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded-control transition-smooth ${
                viewMode === "card"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              title="Tampilan Kartu Ramah Mata"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-control transition-smooth ${
                viewMode === "table"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              title="Tampilan Tabel Data"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Input Pencarian & Dropdown Guru */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-control bg-surface border border-border">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama guru, masalah, atau aksi nyata..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs md:text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="px-3.5 py-2 text-xs md:text-sm rounded-control border border-border bg-surface text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Semua Rekan Guru ({teachers.length})</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nama_lengkap} ({t.mata_pelajaran})
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-muted font-medium self-end sm:self-center shrink-0">
            Menampilkan <strong>{filteredList.length}</strong> dari {totalRTL} kesepakatan
          </span>
        </div>
      </div>

      {/* KONTEN UTAMA: MODE KARTU INTERAKTIF (SANGAT RAMAH MATA & TIDAK BERDESAKAN) */}
      {viewMode === "card" ? (
        filteredList.length === 0 ? (
          <div className="text-center py-16 text-muted border border-dashed border-border rounded-panel bg-surface p-8 space-y-3">
            <ListTodo className="w-12 h-12 mx-auto stroke-1 text-muted opacity-40" />
            <p className="text-base font-bold text-foreground">Tidak Ada Kesepakatan RTL</p>
            <p className="text-xs text-muted max-w-md mx-auto">
              Tidak ada data kesepakatan tindak lanjut yang cocok dengan filter yang dipilih. Tambahkan
              kesepakatan baru setelah sesi coaching selesai.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredList.map((item) => {
              const teacher = teachers.find((t) => t.id === item.teacher_id);
              const isOverdue = FollowupService.isOverdue(item);
              const checks = FollowupService.getFollowupChecks(item.id);

              return (
                <Panel
                  key={item.id}
                  className={`p-5 md:p-6 shadow-xs border-border space-y-4 transition-smooth hover:border-primary/50 ${
                    isOverdue ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/10" : ""
                  }`}
                >
                  {/* Header Kartu: Identitas Guru & Status */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0 font-serif">
                        {teacher?.nama_lengkap.charAt(0) || "G"}
                      </div>
                      <div>
                        <h3 className="text-sm md:text-base font-bold text-foreground leading-snug">
                          {teacher?.nama_lengkap || "Nama Guru"}
                        </h3>
                        <p className="text-xs text-muted mt-0.5">
                          {teacher?.mata_pelajaran} • Kelas {teacher?.kelas_diampu}
                        </p>
                      </div>
                    </div>

                    {/* Status RTL Chip */}
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item, e.target.value as FollowupItem["status"])}
                      className={`text-xs font-bold px-3 py-1.5 rounded-control border focus:outline-none focus:ring-1 focus:ring-primary ${
                        item.status === "Selesai"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700"
                          : item.status === "Berjalan"
                          ? "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-700"
                          : item.status === "Pending"
                          ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700"
                          : "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                      }`}
                    >
                      <option value="Belum Dimulai">○ Belum Dimulai</option>
                      <option value="Berjalan">⏳ Sedang Berjalan</option>
                      <option value="Pending">⏸️ Pending</option>
                      <option value="Selesai">✅ Selesai (Disahkan)</option>
                    </select>
                  </div>

                  {/* Isi Utama: Masalah Pembelajaran & Aksi Nyata */}
                  <div className="space-y-3 text-xs md:text-sm">
                    {/* Masalah yang Dihadapi */}
                    <div className="p-3 rounded-control bg-black/5 dark:bg-white/5 border border-border/80 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
                        Masalah Pembelajaran di Kelas:
                      </span>
                      <p className="font-semibold text-foreground leading-relaxed">
                        {item.masalah_utama}
                      </p>
                    </div>

                    {/* Aksi Konkret Guru */}
                    <div className="p-3 rounded-control bg-primary/5 border border-primary/20 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                        Aksi Konkret yang Dilakukan Guru:
                      </span>
                      <p className="font-semibold text-foreground leading-relaxed">
                        {item.aksi_konkret_guru}
                      </p>
                      {item.solusi_disepakati && (
                        <p className="text-xs text-muted mt-1 italic">
                          Solusi: {item.solusi_disepakati}
                        </p>
                      )}
                    </div>

                    {/* Dukungan Sekolah & Tenggat Waktu */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-muted block font-medium">Dukungan Pihak Sekolah:</span>
                        <p className="font-semibold text-foreground">
                          {item.dukungan_kepala_sekolah || "Pendampingan berkala"}
                        </p>
                        <span className="inline-block text-[10px] text-muted">
                          Jenis: {item.jenis_dukungan || "Sarana Prasarana"}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-muted block font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          Tenggat Target (Deadline):
                        </span>
                        <p
                          className={`font-mono font-bold ${
                            isOverdue ? "text-rose-600 underline text-sm" : "text-foreground text-sm"
                          }`}
                        >
                          {formatTanggalIndonesia(item.deadline)}
                        </p>
                        {isOverdue && (
                          <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Melewati batas tenggat
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Riwayat Cek-in Berkala */}
                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-muted">
                      <CalendarCheck2 className="w-4 h-4 text-primary shrink-0" />
                      <span>
                        <strong>{checks.length}</strong> kali cek-in berkala tercatat
                      </span>
                    </div>

                    {/* Tombol Tindakan */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedFollowupForCheck(item)}
                        title="Catat Cek-in Berkala (Pekan 2, 4, 8/9)"
                      >
                        <CalendarCheck2 className="w-3.5 h-3.5 mr-1" />
                        Catat Cek-in
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFollowupForPrint(item)}
                        title="Cetak Format Dokumen 7 RTL"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </Button>

                      <button
                        type="button"
                        onClick={() => handleDeleteFollowup(item)}
                        className="p-2 rounded text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-smooth"
                        title="Hapus Kesepakatan RTL Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>
        )
      ) : (
        /* KONTEN MODE TABEL: TABEL DATA BERSIH */
        <Panel className="p-0 overflow-hidden shadow-xs border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm border-collapse">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-border uppercase text-[11px] text-muted tracking-wider">
                <tr>
                  <th className="py-3 px-4">Guru & Masalah</th>
                  <th className="py-3 px-4">Aksi Konkret Guru</th>
                  <th className="py-3 px-4">Dukungan Sekolah</th>
                  <th className="py-3 px-4">Tenggat Target</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredList.map((item) => {
                  const teacher = teachers.find((t) => t.id === item.teacher_id);
                  const isOverdue = FollowupService.isOverdue(item);
                  const checks = FollowupService.getFollowupChecks(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                        isOverdue ? "bg-rose-50/20 dark:bg-rose-950/10" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 align-top max-w-[220px]">
                        <p className="font-bold text-foreground">{teacher?.nama_lengkap || "Guru"}</p>
                        <p className="text-xs text-muted mt-0.5 line-clamp-2">{item.masalah_utama}</p>
                      </td>

                      <td className="py-3.5 px-4 align-top max-w-[260px]">
                        <p className="font-medium text-foreground text-xs leading-relaxed">
                          {item.aksi_konkret_guru}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 align-top max-w-[200px]">
                        <p className="text-xs text-muted leading-relaxed">
                          {item.dukungan_kepala_sekolah || "-"}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <span
                          className={`font-mono text-xs font-semibold ${
                            isOverdue ? "text-rose-600 font-bold underline" : "text-foreground"
                          }`}
                        >
                          {item.deadline}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
                            🚨 Lewat Tenggat
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item, e.target.value as FollowupItem["status"])}
                          className="text-xs font-bold px-2 py-1 rounded border focus:outline-none"
                        >
                          <option value="Belum Dimulai">Belum Dimulai</option>
                          <option value="Berjalan">Berjalan</option>
                          <option value="Pending">Pending</option>
                          <option value="Selesai">Selesai</option>
                        </select>
                        <span className="text-[10px] text-muted block mt-1">
                          {checks.length} kali cek
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedFollowupForCheck(item)}
                            title="Catat Cek-in"
                          >
                            <CalendarCheck2 className="w-3.5 h-3.5 mr-1" />
                            Cek
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedFollowupForPrint(item)}
                            title="Cetak Doc 7"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Modal Dialog Form Tambah Kesepakatan RTL Baru (Lega & Jelas) */}
      {isModalCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-surface border border-border rounded-panel shadow-2xl max-w-2xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold font-serif text-foreground">
                  Tambah Kesepakatan Tindak Lanjut Guru (RTL)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalCreateOpen(false)}
                className="text-muted hover:text-foreground text-base font-bold p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFollowup} className="space-y-4 text-xs md:text-sm">
              {/* Pilih Guru */}
              <div className="space-y-1">
                <label className="font-bold text-foreground">
                  Rekan Guru Sasaran <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-control border border-border bg-surface text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama_lengkap} — {t.mata_pelajaran} (Kelas {t.kelas_diampu})
                    </option>
                  ))}
                </select>
              </div>

              {/* Masalah Pembelajaran */}
              <div className="space-y-1">
                <label className="font-bold text-foreground">
                  Masalah Utama Pembelajaran di Kelas <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formMasalah}
                  onChange={(e) => setFormMasalah(e.target.value)}
                  placeholder="Contoh: Siswa di kelompok 4 pasif saat transisi latihan mandiri..."
                  className="w-full px-3.5 py-2.5 rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                  required
                />
              </div>

              {/* Solusi & Aksi Konkret Guru */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">
                    Solusi yang Disepakati <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formSolusi}
                    onChange={(e) => setFormSolusi(e.target.value)}
                    placeholder="Contoh: Penggunaan rubrik scaffolding bertingkat..."
                    className="w-full px-3.5 py-2.5 rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">
                    Aksi Konkret Guru <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formAksi}
                    onChange={(e) => setFormAksi(e.target.value)}
                    placeholder="Contoh: Menyusun 2 set LKPD dan membagikannya ke siswa..."
                    className="w-full px-3.5 py-2.5 rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                    required
                  />
                </div>
              </div>

              {/* Dukungan & Jenis Dukungan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">
                    Bentuk Dukungan dari Sekolah:
                  </label>
                  <input
                    type="text"
                    value={formDukungan}
                    onChange={(e) => setFormDukungan(e.target.value)}
                    placeholder="Contoh: Fasilitasi modul ajar MGMP..."
                    className="w-full h-10 px-3.5 rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Jenis Dukungan:</label>
                  <select
                    value={formJenisDukungan}
                    onChange={(e) => setFormJenisDukungan(e.target.value as FollowupItem["jenis_dukungan"])}
                    className="w-full h-10 px-3 rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Sarana dan Prasarana">Sarana dan Prasarana</option>
                    <option value="Pelatihan atau Workshop">Pelatihan atau Workshop</option>
                    <option value="Pendampingan Sejawat">Pendampingan Sejawat</option>
                    <option value="Akses Sumber Belajar">Akses Sumber Belajar</option>
                    <option value="Dukungan Moral">Dukungan Moral</option>
                  </select>
                </div>
              </div>

              {/* Tenggat Waktu & Target Keberhasilan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">
                    Tenggat Waktu Realisasi (Deadline) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-control border border-border bg-surface text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Target Indikator Keberhasilan:</label>
                  <input
                    type="text"
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    placeholder="Contoh: 85% siswa mencapai ketuntasan belajar..."
                    className="w-full h-10 px-3.5 rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
                <Button type="button" variant="secondary" onClick={() => setIsModalCreateOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary">
                  Simpan Kesepakatan RTL
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog Cek-in Berkala (Pekan 2, 4, 8/9) */}
      {selectedFollowupForCheck && (
        <FollowupCheckModal
          isOpen={true}
          followup={selectedFollowupForCheck}
          checks={FollowupService.getFollowupChecks(selectedFollowupForCheck.id)}
          onAddCheck={(newCheck) => {
            FollowupService.saveFollowupCheck(newCheck);
            refreshData();
          }}
          onClose={() => setSelectedFollowupForCheck(null)}
        />
      )}

      {/* Modal Dialog Cetak Format RTL Dokumen 7 */}
      {selectedFollowupForPrint && teachers.find((t) => t.id === selectedFollowupForPrint.teacher_id) && (
        <FollowupPrintModal
          isOpen={true}
          followups={FollowupService.getFollowupsByTeacherId(selectedFollowupForPrint.teacher_id)}
          teacher={teachers.find((t) => t.id === selectedFollowupForPrint.teacher_id)!}
          school={schoolSettings || SettingsService.getSchoolSettings()}
          onClose={() => setSelectedFollowupForPrint(null)}
        />
      )}
    </div>
  );
}

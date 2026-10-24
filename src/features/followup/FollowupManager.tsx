"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FollowupItem, Teacher } from "@/contracts/schemas";
import { FollowupService } from "./followup-service";
import { TeacherService } from "../teachers/teacher-service";
import { FollowupCheckModal } from "./FollowupCheckModal";
import { FollowupPrintModal } from "./FollowupPrintModal";
import { SettingsService } from "../settings/settings-service";

export function FollowupManager() {
  const [followups, setFollowups] = useState<FollowupItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

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
    const tList = TeacherService.getTeachers();
    setTeachers(tList);
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
      semester: "2026/2027 Ganjil",
      masalah_utama: formMasalah,
      solusi_disepakati: formSolusi,
      aksi_konkret_guru: formAksi,
      dukungan_kepala_sekolah: formDukungan,
      deadline: formDeadline,
      bukti_tindak_lanjut: "",
      foto_bukti_url: null,
      status: "Belum Dimulai",
      kode_pertanyaan_pemicu: "D-01",
      target_indikator_sukses: formTarget || "Peningkatan keterlibatan siswa pada target pembelajaran.",
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
  const filteredList = followups.filter((item) => {
    const teacher = teachers.find((t) => t.id === item.teacher_id);
    const matchesTeacher = selectedTeacherId === "all" || item.teacher_id === selectedTeacherId;

    let matchesStatus = true;
    const isOverdue = FollowupService.isOverdue(item);

    if (statusFilter === "overdue") {
      matchesStatus = isOverdue;
    } else if (statusFilter !== "all") {
      matchesStatus = item.status === statusFilter;
    }

    const matchesSearch =
      !searchQuery ||
      item.masalah_utama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.solusi_disepakati.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher && teacher.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTeacher && matchesStatus && matchesSearch;
  });

  // Statistik Ringkas
  const totalRTL = followups.length;
  const countSelesai = followups.filter((f) => f.status === "Selesai").length;
  const countBerjalan = followups.filter((f) => f.status === "Berjalan").length;
  const countOverdue = followups.filter((f) => FollowupService.isOverdue(f)).length;

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <ListTodo className="w-7 h-7 text-pine-600 dark:text-pine-400" />
            Rencana Aksi & Tindak Lanjut Guru
          </h1>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Pantau realisasi komitmen mengajar guru, lakukan cek-in berkala (pekan 2, 4, 8/9), dan sahkan dokumen bukti yang tuntas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
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
            <Printer className="w-4 h-4 mr-2" />
            Cetak Format RTL (Doc 7)
          </Button>
          <Button variant="primary" size="md" onClick={() => setIsModalCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kesepakatan
          </Button>
        </div>
      </div>

      {/* Ringkasan Status & Indikator */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs uppercase text-muted font-bold tracking-wider">Total Kesepakatan</p>
          <p className="text-2xl font-bold font-mono mt-1 text-foreground">{totalRTL}</p>
          <p className="text-xs text-muted mt-0.5">Komitmen perbaikan guru</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs uppercase text-muted font-bold tracking-wider">Sedang Berjalan</p>
          <p className="text-2xl font-bold font-mono mt-1 text-pine-600 dark:text-pine-400">{countBerjalan}</p>
          <p className="text-xs text-muted mt-0.5">Dalam fase aksi kelas</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs uppercase text-muted font-bold tracking-wider">Tuntas & Diverifikasi</p>
          <p className="text-2xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">{countSelesai}</p>
          <p className="text-xs text-muted mt-0.5">Disahkan supervisor</p>
        </div>
        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20">
          <p className="text-xs uppercase text-red-600 dark:text-red-400 font-bold tracking-wider">Perlu Perhatian / Lewat</p>
          <p className="text-2xl font-bold font-mono mt-1 text-red-600 dark:text-red-400">{countOverdue}</p>
          <p className="text-xs text-red-700/80 dark:text-red-300/80 mt-0.5">Melewati tenggat target</p>
        </div>
      </div>

      {/* Bar Filter & Pencarian */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari guru, masalah, atau aksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-pine-500"
            />
          </div>

          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-pine-500"
          >
            <option value="all">Semua Guru</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nama_lengkap}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-pine-500"
          >
            <option value="all">Semua Status</option>
            <option value="Belum Dimulai">Belum Dimulai</option>
            <option value="Berjalan">Berjalan</option>
            <option value="Pending">Pending</option>
            <option value="Selesai">Selesai</option>
            <option value="overdue">🚨 Lewat Tenggat (Overdue)</option>
          </select>
        </div>

        <p className="text-xs text-muted self-end md:self-center">
          Menampilkan {filteredList.length} dari {totalRTL} kesepakatan
        </p>
      </div>

      {/* Tabel Utama Rencana Tindak Lanjut */}
      <Panel title="Daftar Komitmen & Kesepakatan Tindak Lanjut Guru">
        {filteredList.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <ListTodo className="w-12 h-12 mx-auto stroke-1 text-muted mb-3 opacity-50" />
            <p className="text-base font-medium text-foreground">Tidak Ada Kesepakatan Tindak Lanjut</p>
            <p className="text-xs mt-1 max-w-sm mx-auto">
              Tidak ada data RTL yang cocok dengan filter. Tambahkan kesepakatan baru setelah sesi coaching selesai.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
            <table className="w-full table-fixed text-left text-sm border-collapse">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[26%]" />
                <col className="w-[18%]" />
                <col className="w-[11%]" />
                <col className="w-[12%]" />
                <col className="w-[11%]" />
              </colgroup>
              <thead className="bg-muted/30 border-b border-border text-[11px] uppercase font-bold text-muted tracking-wider">
                <tr>
                  <th className="py-3 px-3.5">Guru & Masalah</th>
                  <th className="py-3 px-3">Aksi Konkret & Target</th>
                  <th className="py-3 px-3">Dukungan Kepala Sekolah</th>
                  <th className="py-3 px-2 text-center">Tenggat Target</th>
                  <th className="py-3 px-2 text-center">Status & Progres</th>
                  <th className="py-3 px-2 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {filteredList.map((item) => {
                  const teacher = teachers.find((t) => t.id === item.teacher_id);
                  const isOverdue = FollowupService.isOverdue(item);
                  const checks = FollowupService.getFollowupChecks(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-muted/10 transition-colors ${
                        isOverdue ? "bg-red-50/30 dark:bg-red-950/10" : ""
                      }`}
                    >
                      {/* Guru & Masalah */}
                      <td className="py-3.5 px-3.5 align-top">
                        <p className="font-bold text-foreground text-sm leading-snug truncate" title={teacher?.nama_lengkap}>
                          {teacher?.nama_lengkap || "Guru"}
                        </p>
                        <p className="text-[11px] font-mono text-muted">
                          {teacher?.nip_nuptk ? `NIP/NUPTK: ${teacher.nip_nuptk}` : "Guru Mata Pelajaran"}
                        </p>
                        <p className="text-xs text-muted/90 mt-1.5 leading-relaxed line-clamp-2 break-words" title={item.masalah_utama}>
                          {item.masalah_utama}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/10 text-muted border border-border">
                            {item.semester}
                          </span>
                          {item.kode_pertanyaan_pemicu && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pine-50 dark:bg-pine-950/40 text-pine-700 dark:text-pine-300 border border-pine-200 dark:border-pine-800">
                              Ref {item.kode_pertanyaan_pemicu}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Aksi & Solusi */}
                      <td className="py-3.5 px-3 align-top">
                        <p className="font-semibold text-foreground text-xs leading-relaxed line-clamp-2 break-words" title={item.aksi_konkret_guru}>
                          {item.aksi_konkret_guru}
                        </p>
                        <div className="mt-1.5 p-2 rounded-lg bg-muted/10 border border-border/50">
                          <span className="text-[10px] font-bold text-pine-700 dark:text-pine-400 block uppercase tracking-wider">
                            Target Indikator:
                          </span>
                          <p className="text-[11px] text-muted italic leading-snug line-clamp-2 break-words" title={item.target_indikator_sukses}>
                            {item.target_indikator_sukses || "Meningkatnya hasil belajar dan keaktifan siswa"}
                          </p>
                        </div>
                        {item.bukti_tindak_lanjut && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-pine-700 dark:text-pine-300">
                            <FileCheck className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate" title={item.bukti_tindak_lanjut}>{item.bukti_tindak_lanjut}</span>
                          </div>
                        )}
                      </td>

                      {/* Dukungan Kepsek */}
                      <td className="py-3.5 px-3 align-top">
                        <p className="text-xs text-muted leading-relaxed line-clamp-3 break-words" title={item.dukungan_kepala_sekolah}>
                          {item.dukungan_kepala_sekolah || "Pendampingan dan pemantauan berkala."}
                        </p>
                        <div className="mt-2">
                          <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 truncate max-w-full">
                            {item.jenis_dukungan || "Sarana dan Prasarana"}
                          </span>
                        </div>
                      </td>

                      {/* Tenggat Waktu */}
                      <td className="py-3.5 px-2 align-top text-center">
                        <div className="flex items-center justify-center gap-1 font-mono text-xs font-semibold">
                          <Clock className={`w-3.5 h-3.5 shrink-0 ${isOverdue ? "text-red-600 dark:text-red-400" : "text-muted"}`} />
                          <span className={isOverdue ? "text-red-600 dark:text-red-400 font-bold" : "text-foreground"}>
                            {item.deadline}
                          </span>
                        </div>
                        {isOverdue && (
                          <div className="mt-1.5 inline-flex items-center justify-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800/50">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>Lewat batas</span>
                          </div>
                        )}
                      </td>

                      {/* Status & Kontrol */}
                      <td className="py-3.5 px-2 align-top text-center">
                        <div className="flex flex-col items-center gap-1">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item, e.target.value as FollowupItem["status"])}
                            className={`w-full text-xs font-semibold px-2 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-pine-500 transition-colors ${
                              item.status === "Selesai"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700"
                                : item.status === "Berjalan"
                                ? "bg-pine-50 text-pine-800 border-pine-300 dark:bg-pine-950/40 dark:text-pine-300 dark:border-pine-700"
                                : item.status === "Pending"
                                ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700"
                                : "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                            }`}
                          >
                            <option value="Belum Dimulai">Belum Dimulai</option>
                            <option value="Berjalan">Berjalan</option>
                            <option value="Pending">Pending</option>
                            <option value="Selesai">Selesai</option>
                          </select>

                          {checks.length > 0 && (
                            <span className="text-[10px] text-muted font-medium">
                              {checks.length}x cek-in tercatat
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-2 align-top text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            title="Lakukan Cek-in Berkala (Pekan 2/4/8/9)"
                            onClick={() => setSelectedFollowupForCheck(item)}
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted/10 text-foreground transition-colors shadow-2xs cursor-pointer"
                          >
                            <CalendarCheck2 className="w-3.5 h-3.5 text-pine-600 shrink-0" />
                            <span>Cek-in</span>
                          </button>
                          <button
                            type="button"
                            title="Cetak Format Dokumen 7 RTL"
                            onClick={() => setSelectedFollowupForPrint(item)}
                            className="inline-flex items-center justify-center p-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted/10 text-muted hover:text-foreground transition-colors shadow-2xs cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Modal Dialog Form Tambah Kesepakatan RTL */}
      {isModalCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-lg font-bold font-serif text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pine-600" />
                Tambah Rencana Tindak Lanjut Guru
              </h3>
              <button
                type="button"
                onClick={() => setIsModalCreateOpen(false)}
                className="text-muted hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFollowup} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Guru Sasaran <span className="text-red-500">*</span>
                </label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground"
                  required
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama_lengkap} — {t.mata_pelajaran}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Masalah Utama Pembelajaran <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formMasalah}
                  onChange={(e) => setFormMasalah(e.target.value)}
                  placeholder="Contoh: Siswa di kelompok 4 pasif saat transisi latihan mandiri..."
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Solusi yang Disepakati <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formSolusi}
                    onChange={(e) => setFormSolusi(e.target.value)}
                    placeholder="Contoh: Penggunaan rubrik scaffolding bertingkat..."
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Aksi Konkret Guru <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formAksi}
                    onChange={(e) => setFormAksi(e.target.value)}
                    placeholder="Contoh: Menyusun 2 set LKPD dan membagikannya..."
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Dukungan Kepala Sekolah / Supervisor
                  </label>
                  <input
                    type="text"
                    value={formDukungan}
                    onChange={(e) => setFormDukungan(e.target.value)}
                    placeholder="Contoh: Fasilitasi modul ajar MGMP..."
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Jenis Dukungan
                  </label>
                  <select
                    value={formJenisDukungan}
                    onChange={(e) => setFormJenisDukungan(e.target.value as FollowupItem["jenis_dukungan"])}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground"
                  >
                    <option value="Sarana dan Prasarana">Sarana dan Prasarana</option>
                    <option value="Pelatihan atau Workshop">Pelatihan atau Workshop</option>
                    <option value="Pendampingan Sejawat">Pendampingan Sejawat</option>
                    <option value="Akses Sumber Belajar">Akses Sumber Belajar</option>
                    <option value="Dukungan Moral">Dukungan Moral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Tenggat Waktu Realisasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Target Indikator Keberhasilan
                  </label>
                  <input
                    type="text"
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    placeholder="Contoh: 85% siswa mencapai KKM..."
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="secondary" onClick={() => setIsModalCreateOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary">
                  Simpan Kesepakatan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cek-in Berkala */}
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

      {/* Modal Cetak Format RTL Doc 7 */}
      {selectedFollowupForPrint && teachers.find((t) => t.id === selectedFollowupForPrint.teacher_id) && (
        <FollowupPrintModal
          isOpen={true}
          followups={FollowupService.getFollowupsByTeacherId(selectedFollowupForPrint.teacher_id)}
          teacher={teachers.find((t) => t.id === selectedFollowupForPrint.teacher_id)!}
          school={SettingsService.getSchoolSettings()}
          onClose={() => setSelectedFollowupForPrint(null)}
        />
      )}
    </div>
  );
}

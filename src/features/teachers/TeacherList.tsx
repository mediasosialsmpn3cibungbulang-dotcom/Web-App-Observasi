"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Users, UserPlus, Upload, Search, Filter, ShieldAlert, Award, Trash2, Edit } from "lucide-react";
import { Teacher } from "@/contracts/schemas";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import { downloadAsExcel, downloadAsCSV } from "@/lib/export-service";
import { SettingsService } from "../settings/settings-service";
import { TeacherService } from "./teacher-service";
import { TeacherFormModal } from "./TeacherFormModal";
import { TeacherImportModal } from "./TeacherImportModal";
import { TeacherProfileModal } from "./TeacherProfileModal";

export const TeacherList: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("Semua");

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedTeacherForProfile, setSelectedTeacherForProfile] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const loadData = () => {
    setTeachers(TeacherService.getTeachers().filter((t) => t.aktif));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter & Search dengan debounce
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        t.nama_lengkap.toLowerCase().includes(q) ||
        t.mata_pelajaran.toLowerCase().includes(q) ||
        t.nip_nuptk.includes(q);

      if (!matchSearch) return false;

      if (filterCategory === "Guru Baru") {
        return 2026 - t.tahun_masuk < 3;
      }
      if (filterCategory === "Senior/Mentor") {
        return t.is_senior_mentor;
      }
      if (filterCategory !== "Semua") {
        return t.status_kepegawaian === filterCategory;
      }
      return true;
    });
  }, [teachers, searchQuery, filterCategory]);

  const handleCreateOrUpdate = (data: Omit<Teacher, "id" | "created_at">) => {
    if (editingTeacher) {
      TeacherService.updateTeacher(editingTeacher.id, data);
    } else {
      TeacherService.createTeacher(data);
    }
    loadData();
  };

  const handleDeactivate = (teacher: Teacher) => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menonaktifkan data ${teacher.nama_lengkap}? Riwayat supervisi sebelumnya akan tetap tersimpan.`
      )
    ) {
      TeacherService.deactivateTeacher(teacher.id);
      loadData();
    }
  };

  const schoolSettings = SettingsService.getSchoolSettings();

  const exportHeaders = [
    "No",
    "Nama Lengkap",
    "NIP / NUPTK",
    "Status Kepegawaian",
    "Mata Pelajaran",
    "Fase",
    "Kelas Diampu",
    "Tahun Masuk",
    "Target Sesi Observasi",
    "Nomor HP",
    "Email",
  ];

  const getExportRows = () =>
    teachers.map((t, idx) => [
      idx + 1,
      t.nama_lengkap,
      t.nip_nuptk || "-",
      t.status_kepegawaian,
      t.mata_pelajaran,
      t.fase,
      t.kelas_diampu,
      t.tahun_masuk,
      t.target_sesi
        ? `${t.target_sesi} Sesi (Kustom)`
        : `${TeacherService.getRequiredFrequency(t)} Sesi (SOP)`,
      t.nomor_hp,
      t.email,
    ]);

  const handleExportExcel = () => {
    downloadAsExcel({
      filename: `Database_Guru_${schoolSettings.npsn}`,
      sheetName: "Data Guru Sheet 2",
      title: `DATABASE TENAGA PENDIDIK & TARGET SUPERVISI — ${schoolSettings.nama_sekolah}`,
      metadata: [
        { label: "Nama Sekolah", value: schoolSettings.nama_sekolah },
        { label: "NPSN", value: schoolSettings.npsn },
        { label: "Total Guru", value: `${teachers.length} Guru Aktif` },
        { label: "Tanggal Unduh", value: new Date().toLocaleDateString("id-ID", { dateStyle: "long" }) },
      ],
      headers: exportHeaders,
      rows: getExportRows(),
    });
  };

  const handleExportCSV = () => {
    downloadAsCSV({
      filename: `Database_Guru_${schoolSettings.npsn}`,
      headers: exportHeaders,
      rows: getExportRows(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Daftar Data Guru
          </h1>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Data lengkap tenaga pendidik sekolah, target frekuensi observasi kelas, dan impor dari file Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <ExportDropdown
            label="Ekspor Data"
            onExportExcel={handleExportExcel}
            onExportCSV={handleExportCSV}
          />
          <Button variant="secondary" size="md" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Impor Excel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setEditingTeacher(null);
              setIsFormModalOpen(true);
            }}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Tambah Guru
          </Button>
        </div>
      </div>

      {/* Filter & Kontrol Pencarian */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NIP, atau mata pelajaran..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filter Kategori / Status */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {["Semua", "ASN", "PPPK", "GTY", "Guru Baru", "Senior/Mentor"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-control font-medium border transition-smooth whitespace-nowrap ${
                filterCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-surface text-foreground border-border hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Data Guru */}
      <Panel>
        <div className="overflow-x-auto -mx-4 md:-mx-6">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-border text-xs uppercase text-muted tracking-wider">
              <tr>
                <th className="py-3 px-4 md:px-6">Nama Guru & NIP/NUPTK</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4">Status & Kategori</th>
                <th className="py-3 px-4">Kelas Diampu</th>
                <th className="py-3 px-4 text-center">Target Sesi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">
                    Tidak ditemukan data guru yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => {
                  const isGuruBaru = 2026 - teacher.tahun_masuk < 3;
                  const reqFreq = TeacherService.getRequiredFrequency(teacher);

                  // Penyamaran NIP untuk privasi data (PRD Seksi 7)
                  const maskedNip =
                    teacher.nip_nuptk.length >= 8
                      ? `${teacher.nip_nuptk.slice(0, 4)}xxxx${teacher.nip_nuptk.slice(-4)}`
                      : teacher.nip_nuptk;

                  return (
                    <tr key={teacher.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 md:px-6">
                        <button
                          onClick={() => setSelectedTeacherForProfile(teacher)}
                          className="font-semibold text-foreground text-left hover:text-primary transition-colors leading-tight"
                        >
                          {teacher.nama_lengkap}
                        </button>
                        <p className="text-xs font-mono text-muted mt-0.5" title="Disamarkan untuk privasi">
                          {maskedNip}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground">{teacher.mata_pelajaran}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-xs bg-black/5 dark:bg-white/5 border border-border">
                            {teacher.status_kepegawaian}
                          </span>
                          {isGuruBaru && (
                            <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-300 font-medium">
                              Guru Baru
                            </span>
                          )}
                          {teacher.is_senior_mentor && (
                            <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 border border-emerald-300 font-medium">
                              Senior
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted">{teacher.kelas_diampu}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-primary-subtle text-primary border border-primary/20">
                            {reqFreq}x Sesi
                          </span>
                          {teacher.target_sesi && (
                            <span className="text-[10px] text-pine-700 dark:text-pine-300 font-semibold mt-0.5">
                              (Kustom)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTeacherForProfile(teacher)}
                            title="Lihat Profil"
                          >
                            Profil
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTeacher(teacher);
                              setIsFormModalOpen(true);
                            }}
                            title="Ubah Data"
                          >
                            <Edit className="w-3.5 h-3.5 text-muted hover:text-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivate(teacher)}
                            title="Nonaktifkan Guru"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500 hover:text-rose-700" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Modals */}
      <TeacherFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingTeacher}
      />

      <TeacherImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={loadData}
      />

      <TeacherProfileModal
        teacher={selectedTeacherForProfile}
        onClose={() => setSelectedTeacherForProfile(null)}
        onEdit={(teacher) => {
          setEditingTeacher(teacher);
          setIsFormModalOpen(true);
        }}
      />
    </div>
  );
};

"use client";

import React from "react";
import { X, User, BookOpen, Calendar, Phone, Mail, Award, CheckCircle } from "lucide-react";
import { Teacher } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
import { TeacherService } from "./teacher-service";
import { OFFICIAL_TEACHER_JP } from "@/contracts/teaching-schedules";

interface TeacherProfileModalProps {
  teacher: Teacher | null;
  onClose: () => void;
  onEdit: (teacher: Teacher) => void;
}

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  teacher,
  onClose,
  onEdit,
}) => {
  if (!teacher) return null;

  const minFrequency = TeacherService.getRequiredFrequency(teacher);
  const isGuruBaru = 2026 - teacher.tahun_masuk < 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-surface border border-border rounded-panel max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Profil */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-black/5 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pine-600/10 text-pine-700 dark:text-pine-300 flex items-center justify-center font-bold text-lg font-sans">
              {teacher.nama_lengkap.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight">
                {teacher.nama_lengkap}
              </h3>
              <p className="text-xs font-mono text-muted mt-0.5">NIP/NUPTK: {teacher.nip_nuptk}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 md:p-6 space-y-4 overflow-y-auto text-xs md:text-sm">
          {/* Target Frekuensi Supervisi (BR-13) */}
          <div className="p-3.5 rounded-control bg-primary-subtle text-primary border border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold text-xs">Target Frekuensi Supervisi Semester Ini</p>
                <p className="text-[11px] opacity-80">
                  {teacher.target_sesi
                    ? "Kustom Supervisor: Ditentukan secara khusus oleh Kepala Sekolah/Pengawas"
                    : isGuruBaru
                    ? "Kategori Guru Baru: Pembinaan intensif adaptasi pembelajaran"
                    : teacher.is_senior_mentor
                    ? "Kategori Senior/Mentor: Observasi reflektif & keteladanan"
                    : "Kategori Reguler: Evaluasi kompetensi berkelanjutan"}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xl font-bold font-mono px-2 py-1 rounded bg-surface border border-primary/30">
                {minFrequency}x Sesi
              </span>
              {teacher.target_sesi && (
                <span className="text-[10px] text-primary/80 font-semibold mt-0.5">
                  (Kustom)
                </span>
              )}
            </div>
          </div>

          {/* Rincian Data Pokok */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-control border border-border bg-surface">
              <span className="text-[10px] uppercase font-semibold text-muted block">Mata Pelajaran</span>
              <p className="font-semibold text-foreground mt-0.5">{teacher.mata_pelajaran}</p>
            </div>
            <div className="p-3 rounded-control border border-border bg-surface">
              <span className="text-[10px] uppercase font-semibold text-muted block">Kelas Diampu</span>
              <p className="font-semibold text-foreground mt-0.5">{teacher.kelas_diampu}</p>
            </div>
            <div className="p-3 rounded-control border border-border bg-surface">
              <span className="text-[10px] uppercase font-semibold text-muted block">Beban Mengajar</span>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                {OFFICIAL_TEACHER_JP[teacher.id] ? `${OFFICIAL_TEACHER_JP[teacher.id]} JP / Minggu` : "-"}
              </p>
            </div>
            <div className="p-3 rounded-control border border-border bg-surface">
              <span className="text-[10px] uppercase font-semibold text-muted block">Status Kepegawaian</span>
              <p className="font-semibold text-foreground mt-0.5">{teacher.status_kepegawaian}</p>
            </div>
            <div className="p-3 rounded-control border border-border bg-surface">
              <span className="text-[10px] uppercase font-semibold text-muted block">Fase Kurikulum</span>
              <p className="font-semibold text-foreground mt-0.5">Fase {teacher.fase}</p>
            </div>
          </div>

          {/* Kontak & Informasi Tambahan */}
          <div className="space-y-2 pt-2 border-t border-border text-xs text-muted">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>{teacher.nomor_hp}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>{teacher.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Tahun Masuk Sekolah: {teacher.tahun_masuk} (Masa Kerja: {2026 - teacher.tahun_masuk} Tahun)</span>
            </div>
            {teacher.jabatan_tambahan && (
              <p className="text-foreground pt-1">
                <strong>Jabatan Tambahan:</strong> {teacher.jabatan_tambahan}
              </p>
            )}
            {teacher.wali_kelas && (
              <p className="text-foreground">
                <strong>Wali Kelas:</strong> {teacher.wali_kelas}
              </p>
            )}
            {teacher.catatan_khusus && (
              <p className="text-muted italic pt-1 border-t border-border">
                &ldquo;{teacher.catatan_khusus}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-2 bg-black/5 dark:bg-white/5">
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              onEdit(teacher);
            }}
          >
            Ubah Data Guru
          </Button>
        </div>
      </div>
    </div>
  );
};

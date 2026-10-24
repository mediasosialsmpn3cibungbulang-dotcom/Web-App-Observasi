"use client";

import React from "react";
import { X, Printer, Shield } from "lucide-react";
import { CoachingSession, Teacher, SchoolSettings, FollowupItem } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
import { formatTanggalIndonesia } from "@/lib/utils";

interface CoachingPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: CoachingSession;
  teacher: Teacher;
  school: SchoolSettings;
  followups: FollowupItem[];
}

export const CoachingPrintModal: React.FC<CoachingPrintModalProps> = ({
  isOpen,
  onClose,
  session,
  teacher,
  school,
  followups,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white text-black border border-border rounded-panel max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal Bar */}
        <div className="no-print flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-primary" />
            <span className="font-bold font-serif text-sm">
              Pratinjau Dokumen Sesi Coaching & Notulen Konfidensial (A4)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-1.5" />
              Cetak Dokumen
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-500 hover:text-black hover:bg-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lembar Dokumen A4 */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-6 font-serif text-black leading-relaxed print:p-0">
          {/* Label Konfidensial */}
          <div className="flex justify-between items-center text-xs font-sans border-b border-gray-300 pb-2">
            <span className="font-mono text-gray-600">Nomor Dokumen: {session.nomor_dokumen}</span>
            <span className="px-2 py-0.5 rounded border border-red-400 bg-red-50 text-red-800 font-bold tracking-wider text-[10px] uppercase">
              KONFIDENSIAL - ARSIP TERBATAS
            </span>
          </div>

          {/* Kop Surat */}
          <div className="text-center border-b-2 border-black pb-3 space-y-1">
            <h2 className="text-base font-bold uppercase tracking-wide">
              PEMERINTAH DAERAH PROVINSI / DINAS PENDIDIKAN
            </h2>
            <h1 className="text-lg font-bold uppercase tracking-wider">{school.nama_sekolah}</h1>
            <p className="text-xs font-sans text-gray-700">
              {school.alamat} | NPSN: {school.npsn}
            </p>
          </div>

          {/* Judul Dokumen */}
          <div className="text-center space-y-0.5">
            <h3 className="text-base font-bold uppercase tracking-wide underline">
              BERITA ACARA & NOTULEN PERCAKAPAN COACHING AKADEMIK
            </h3>
            <p className="text-xs font-sans text-gray-600">
              Tahun Ajaran / Semester: {school.semester_aktif}
            </p>
          </div>

          {/* Pengantar & Identitas */}
          <div className="font-sans text-xs grid grid-cols-2 gap-4 border border-gray-300 p-3 rounded">
            <div className="space-y-1">
              <p><strong>Nama Guru:</strong> {teacher.nama_lengkap}</p>
              <p><strong>NIP / NUPTK:</strong> {teacher.nip_nuptk}</p>
              <p><strong>Mata Pelajaran:</strong> {teacher.mata_pelajaran} (Kelas {teacher.kelas_diampu})</p>
            </div>
            <div className="space-y-1">
              <p><strong>Supervisor:</strong> {school.nama_kepala_sekolah}</p>
              <p><strong>Hari / Tanggal:</strong> {formatTanggalIndonesia(session.tanggal_coaching)} (Pukul {session.waktu_mulai} WIB)</p>
              <p><strong>Tempat:</strong> {session.tempat}</p>
            </div>
          </div>

          {/* Bagian A: Refleksi Guru */}
          {session.refleksi_guru && (
            <div className="font-sans text-xs space-y-2">
              <h4 className="font-bold text-sm uppercase border-b border-gray-300 pb-1">
                A. Refleksi Mandiri Guru
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-3 rounded border border-gray-200">
                <div>
                  <p className="font-semibold text-gray-700">Hal yang Sudah Berjalan Baik:</p>
                  <p className="text-gray-900 mt-0.5">{session.refleksi_guru.hal_sudah_baik || "-"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Hal yang Perlu Ditingkatkan:</p>
                  <p className="text-gray-900 mt-0.5">{session.refleksi_guru.hal_perlu_ditingkatkan || "-"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Bagian B: Inti Percakapan & Insight */}
          <div className="font-sans text-xs space-y-2">
            <h4 className="font-bold text-sm uppercase border-b border-gray-300 pb-1">
              B. Intisari Percakapan Kemitraan (Coaching)
            </h4>
            <div className="space-y-2">
              <p><strong>Poin Kunci Dialog:</strong> {session.poin_kunci_dialog}</p>
              <p><strong>Kesadaran / Insight Utama Guru:</strong> {session.insight_utama_guru}</p>
              <p><strong>Komitmen Pribadi Guru:</strong> {session.komitmen_utama_guru}</p>
            </div>
          </div>

          {/* Bagian C: Kesepakatan Rencana Tindak Lanjut (RTL) */}
          <div className="font-sans text-xs space-y-2">
            <h4 className="font-bold text-sm uppercase border-b border-gray-300 pb-1">
              C. Kesepakatan Rencana Tindak Lanjut (RTL)
            </h4>
            <table className="w-full border-collapse border border-gray-300 text-left">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="border border-gray-300 p-1.5 w-10 text-center">No</th>
                  <th className="border border-gray-300 p-1.5 w-44">Tantangan Kunci</th>
                  <th className="border border-gray-300 p-1.5">Aksi Konkret Perbaikan</th>
                  <th className="border border-gray-300 p-1.5 w-40">Dukungan Sekolah</th>
                  <th className="border border-gray-300 p-1.5 w-24">Tenggat</th>
                </tr>
              </thead>
              <tbody>
                {followups.map((f, idx) => (
                  <tr key={f.id}>
                    <td className="border border-gray-300 p-1.5 text-center font-bold">{idx + 1}</td>
                    <td className="border border-gray-300 p-1.5 font-medium">{f.masalah_utama}</td>
                    <td className="border border-gray-300 p-1.5">{f.aksi_konkret_guru}</td>
                    <td className="border border-gray-300 p-1.5 text-gray-700">{f.dukungan_kepala_sekolah}</td>
                    <td className="border border-gray-300 p-1.5 font-mono text-[10px]">
                      {formatTanggalIndonesia(f.deadline)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-gray-600 pt-1">
              Jadwal Cek Monitoring Berikutnya: <strong>{formatTanggalIndonesia(session.rencana_monitoring_berikutnya)}</strong> (Pekan ke-2 pasca coaching).
            </p>
          </div>

          {/* Tanda Tangan */}
          <div className="font-sans text-xs pt-8 grid grid-cols-2 gap-8 text-center break-inside-avoid">
            <div>
              <p className="text-gray-600 mb-16">Guru yang Dicoaching,</p>
              <p className="font-bold underline">{teacher.nama_lengkap}</p>
              <p className="font-mono text-gray-600">NIP. {teacher.nip_nuptk}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-16">Supervisor / Kepala Sekolah,</p>
              <p className="font-bold underline">{school.nama_kepala_sekolah}</p>
              <p className="font-mono text-gray-600">NIP. {school.nip_kepala_sekolah}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

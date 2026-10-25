"use client";

import React, { useEffect } from "react";
import { X, Printer, Shield } from "lucide-react";
import { CoachingSession, Teacher, SchoolSettings, FollowupItem } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
import { PrintPortal } from "@/components/ui/PrintPortal";
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
  // Tutup modal dengan tombol Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <PrintPortal>
      {/* Backdrop gelap: klik area gelap untuk menutup */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs select-none"
        onClick={onClose}
      >
        <div
          className="bg-gray-100 rounded-2xl w-full max-w-[860px] max-h-[94vh] flex flex-col shadow-2xl overflow-hidden print:block print:bg-white print:rounded-none print:shadow-none print:max-w-none"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau Dokumen Sesi Coaching"
        >
          {/* Header Modal Bar */}
          <div className="no-print flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Printer className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">
                  Pratinjau Dokumen Sesi Coaching & Notulen Konfidensial
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  Format A4 · Tekan Esc atau klik area gelap untuk menutup
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="primary" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1.5" />
                Cetak Dokumen
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors"
                aria-label="Tutup pratinjau"
              >
                <X className="w-4 h-4" />
                Tutup
              </button>
            </div>
          </div>

          {/* Area Dokumen Kertas A4 */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 print:p-0">
            <div className="print-document mx-auto bg-white text-black shadow-md print:shadow-none w-full max-w-[794px] min-h-[1050px] p-8 sm:p-12 font-sans text-[11px] leading-relaxed flex flex-col justify-between">
              <div className="space-y-4">
                {/* Kop Surat */}
                <div className="text-center border-b-[3px] border-double border-black pb-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-800">
                    Pemerintah Daerah Provinsi Jawa Barat / Dinas Pendidikan
                  </p>
                  <p className="font-serif text-[17px] font-bold uppercase tracking-wide leading-tight text-black mt-0.5">
                    {school.nama_sekolah}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    {school.alamat} &nbsp;|&nbsp; NPSN: {school.npsn}
                  </p>
                </div>

                {/* Judul & Status Rahasia */}
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-amber-400 bg-amber-50 text-amber-900 font-sans text-[10px] font-bold uppercase tracking-wider">
                    <Shield className="w-3 h-3 text-amber-700" />
                    Dokumen Supervisi Akademik & Coaching Reflektif
                  </div>
                  <h1 className="font-serif text-sm font-bold uppercase tracking-wide underline text-black">
                    NOTULEN PERCAKAPAN COACHING PASCA OBSERVASI
                  </h1>
                  <p className="text-[10px] text-gray-600">
                    Nomor Dokumen: <strong>{session.nomor_dokumen}</strong> | Semester: {session.semester}
                  </p>
                </div>

                {/* Identitas Sesi */}
                <div className="grid grid-cols-2 gap-3 border border-black p-2.5 rounded bg-gray-50 text-[10.5px]">
                  <div className="space-y-0.5">
                    <p><strong>Nama Guru Sasaran:</strong> {teacher.nama_lengkap}</p>
                    <p><strong>NIP / NUPTK:</strong> {teacher.nip_nuptk}</p>
                    <p><strong>Mata Pelajaran:</strong> {teacher.mata_pelajaran}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p><strong>Nama Supervisor:</strong> {school.nama_kepala_sekolah}</p>
                    <p><strong>Waktu & Tempat:</strong> {formatTanggalIndonesia(session.tanggal_coaching)} ({session.waktu_mulai} WIB) di {session.tempat}</p>
                    <p><strong>Status Sesi:</strong> {session.status === "Final" ? "Final (Disepakati Bersama)" : "Draf Kerja"}</p>
                  </div>
                </div>

                {/* Bagian A: Refleksi Mandiri Guru */}
                {session.refleksi_guru && (
                  <div className="space-y-1.5 border border-gray-300 p-2.5 rounded bg-white">
                    <h2 className="font-bold text-[11px] uppercase tracking-wider border-b border-gray-200 pb-1 text-gray-900">
                      Bagian A: Refleksi Mandiri Guru Pasca Mengajar
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <strong className="text-emerald-800">1. Hal yang Sudah Berjalan Sangat Baik:</strong>
                        <p className="text-gray-700 mt-0.5 pl-2 border-l-2 border-emerald-500">
                          {session.refleksi_guru.hal_sudah_baik || "Belum dicatat."}
                        </p>
                      </div>
                      <div>
                        <strong className="text-amber-800">2. Hal yang Masih Perlu Ditingkatkan:</strong>
                        <p className="text-gray-700 mt-0.5 pl-2 border-l-2 border-amber-500">
                          {session.refleksi_guru.hal_perlu_ditingkatkan || "Belum dicatat."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bagian B: Inti Percakapan Coaching */}
                <div className="space-y-2 border border-black p-2.5 rounded bg-white text-[10.5px]">
                  <h2 className="font-bold text-[11px] uppercase tracking-wider border-b border-gray-200 pb-1 text-gray-900">
                    Bagian B: Inti Percakapan Coaching & Kesadaran Reflektif
                  </h2>
                  <div className="space-y-1.5">
                    <div>
                      <strong>1. Poin Kunci Dialog & Eksplorasi Realitas:</strong>
                      <p className="text-gray-800 mt-0.5 pl-2 border-l-2 border-primary">
                        {session.poin_kunci_dialog || "-"}
                      </p>
                    </div>
                    <div>
                      <strong>2. Insight / Kesadaran Baru yang Ditemukan Guru:</strong>
                      <p className="text-gray-800 mt-0.5 pl-2 border-l-2 border-emerald-500 font-medium">
                        &quot;{session.insight_utama_guru || "-"}&quot;
                      </p>
                    </div>
                    <div>
                      <strong>3. Komitmen Utama Guru dalam Aksi Pembelajaran:</strong>
                      <p className="text-gray-800 mt-0.5 pl-2 border-l-2 border-blue-500">
                        {session.komitmen_utama_guru || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bagian C: Rencana Tindak Lanjut (RTL) */}
                <div className="space-y-1.5">
                  <h2 className="font-bold text-[11px] uppercase tracking-wider text-gray-900">
                    Bagian C: Kesepakatan Rencana Tindak Lanjut (RTL)
                  </h2>
                  <table className="w-full border-collapse border border-black text-[9.5px]">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-black p-1 w-8 text-center">No</th>
                        <th className="border border-black p-1">Fokus Tantangan / Masalah</th>
                        <th className="border border-black p-1">Solusi yang Disepakati</th>
                        <th className="border border-black p-1">Aksi Konkret Guru</th>
                        <th className="border border-black p-1">Dukungan Sekolah</th>
                        <th className="border border-black p-1 w-20 text-center">Batas Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {followups.map((f, idx) => (
                        <tr key={f.id} className="border-b border-gray-300">
                          <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                          <td className="border border-black p-1">{f.masalah_utama}</td>
                          <td className="border border-black p-1">{f.solusi_disepakati}</td>
                          <td className="border border-black p-1">{f.aksi_konkret_guru}</td>
                          <td className="border border-black p-1 text-gray-700">{f.dukungan_kepala_sekolah}</td>
                          <td className="border border-black p-1 font-mono text-center">
                            {formatTanggalIndonesia(f.deadline)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-[10px] text-gray-600 pt-0.5">
                    Jadwal Cek Monitoring Berikutnya: <strong>{formatTanggalIndonesia(session.rencana_monitoring_berikutnya)}</strong> (Pekan ke-2 pasca coaching).
                  </p>
                </div>
              </div>

              {/* Tanda Tangan */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-center text-[10.5px] break-inside-avoid">
                <div>
                  <p className="text-gray-700 mb-14">Guru yang Dicoaching,</p>
                  <p className="font-bold underline text-black">{teacher.nama_lengkap}</p>
                  <p className="font-mono text-gray-700 text-[10px]">NIP. {teacher.nip_nuptk}</p>
                </div>
                <div>
                  <p className="text-gray-700 mb-14">Supervisor / Kepala Sekolah,</p>
                  <p className="font-bold underline text-black">{school.nama_kepala_sekolah}</p>
                  <p className="font-mono text-gray-700 text-[10px]">NIP. {school.nip_kepala_sekolah}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrintPortal>
  );
};

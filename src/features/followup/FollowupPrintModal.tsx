"use client";

import React from "react";
import { X, Printer } from "lucide-react";
import { FollowupItem, Teacher, SchoolSettings } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
import { formatTanggalIndonesia } from "@/lib/utils";

interface FollowupPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  followups: FollowupItem[];
  teacher: Teacher;
  school: SchoolSettings;
}

export const FollowupPrintModal: React.FC<FollowupPrintModalProps> = ({
  isOpen,
  onClose,
  followups,
  teacher,
  school,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:z-auto print:block print:overflow-visible">
      <div className="bg-white text-black border border-border rounded-panel max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:rounded-none print:max-w-none print:w-full print:max-h-none print:h-auto print:overflow-visible print:m-0 print:p-0">
        {/* Header Modal Bar */}
        <div className="no-print flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-primary" />
            <span className="font-bold font-serif text-sm">
              Pratinjau Format Rencana Tindak Lanjut (RTL) Guru (A4 Siap Cetak)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-1.5" />
              Cetak RTL
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

        {/* Lembar RTL A4 */}
        <div
          id="printable-area"
          className="print-document flex-1 overflow-y-auto p-8 md:p-12 space-y-6 font-serif text-black leading-relaxed print:p-0 print:m-0 print:overflow-visible print:h-auto print:max-h-none"
        >
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
              RENCANA TINDAK LANJUT (RTL) SUPERVISI AKADEMIK GURU
            </h3>
            <p className="text-xs font-sans text-gray-600">
              Semester: {school.semester_aktif}
            </p>
          </div>

          {/* Identitas Guru */}
          <div className="font-sans text-xs border border-gray-300 p-3 rounded grid grid-cols-2 gap-4">
            <div>
              <p><strong>Nama Guru:</strong> {teacher.nama_lengkap}</p>
              <p><strong>NIP / NUPTK:</strong> {teacher.nip_nuptk}</p>
            </div>
            <div>
              <p><strong>Mata Pelajaran:</strong> {teacher.mata_pelajaran}</p>
              <p><strong>Kelas Diampu:</strong> {teacher.kelas_diampu}</p>
            </div>
          </div>

          {/* Tabel Komitmen Aksi Tindak Lanjut (Dokumen 7 Word) */}
          <div className="font-sans text-xs space-y-2">
            <table className="w-full border-collapse border border-gray-300 text-left">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="border border-gray-300 p-2 w-10 text-center">No</th>
                  <th className="border border-gray-300 p-2 w-48">Tantangan Kunci</th>
                  <th className="border border-gray-300 p-2">Rencana Aksi Konkret</th>
                  <th className="border border-gray-300 p-2 w-44">Target / Indikator Sukses</th>
                  <th className="border border-gray-300 p-2 w-40">Dukungan Kepala Sekolah</th>
                  <th className="border border-gray-300 p-2 w-24 text-center">Batas Waktu</th>
                </tr>
              </thead>
              <tbody>
                {followups.map((f, idx) => (
                  <tr key={f.id}>
                    <td className="border border-gray-300 p-2 text-center font-bold">{idx + 1}</td>
                    <td className="border border-gray-300 p-2 font-medium">{f.masalah_utama}</td>
                    <td className="border border-gray-300 p-2">{f.aksi_konkret_guru}</td>
                    <td className="border border-gray-300 p-2 text-gray-700">
                      {f.target_indikator_sukses || "-"}
                    </td>
                    <td className="border border-gray-300 p-2 text-gray-700">{f.dukungan_kepala_sekolah}</td>
                    <td className="border border-gray-300 p-2 font-mono text-center text-[10px]">
                      {formatTanggalIndonesia(f.deadline)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Komitmen Pribadi Guru */}
          <div className="font-sans text-xs p-3 rounded border border-gray-300 bg-gray-50 space-y-1">
            <p className="font-bold">Komitmen Pendidik:</p>
            <p className="text-gray-700 italic">
              &ldquo;Saya berkomitmen untuk melaksanakan rencana perbaikan pembelajaran ini secara konsisten demi peningkatan kualitas belajar peserta didik.&rdquo;
            </p>
          </div>

          {/* Blok Tanda Tangan */}
          <div className="font-sans text-xs pt-8 grid grid-cols-2 gap-8 text-center break-inside-avoid">
            <div>
              <p className="text-gray-600 mb-16">Guru Mata Pelajaran,</p>
              <p className="font-bold underline">{teacher.nama_lengkap}</p>
              <p className="font-mono text-gray-600">NIP. {teacher.nip_nuptk}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-16">Mengetahui,<br />Kepala Sekolah</p>
              <p className="font-bold underline">{school.nama_kepala_sekolah}</p>
              <p className="font-mono text-gray-600">NIP. {school.nip_kepala_sekolah}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

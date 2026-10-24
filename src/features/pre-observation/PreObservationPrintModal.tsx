"use client";

import React from "react";
import { X, Printer } from "lucide-react";
import { PreObservation, Teacher, SchoolSettings } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
import { formatTanggalIndonesia } from "@/lib/utils";
import { ASPECT_NAMES } from "@/contracts/enums";

interface PreObservationPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PreObservation;
  teacher: Teacher;
  school: SchoolSettings;
}

export const PreObservationPrintModal: React.FC<PreObservationPrintModalProps> = ({
  isOpen,
  onClose,
  data,
  teacher,
  school,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white text-black border border-border rounded-panel max-w-3xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal Bar (Tidak ikut tercetak) */}
        <div className="no-print flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-primary" />
            <span className="font-bold font-serif text-sm">
              Pratinjau Dokumen Siap Cetak (A4) - Berita Acara Pra-Observasi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1.5" />
              Cetak Sekarang
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

        {/* Lembar Dokumen A4 Resmi */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-6 font-serif text-black leading-relaxed print:p-0">
          {/* Kop Surat Resmi */}
          <div className="text-center border-b-2 border-black pb-4 space-y-1">
            <h2 className="text-lg font-bold uppercase tracking-wide">
              PEMERINTAH DAERAH PROVINSI / DINAS PENDIDIKAN
            </h2>
            <h1 className="text-xl font-bold uppercase tracking-wider">{school.nama_sekolah}</h1>
            <p className="text-xs font-sans text-gray-700">
              {school.alamat} | NPSN: {school.npsn}
            </p>
          </div>

          {/* Judul Dokumen */}
          <div className="text-center pt-2 space-y-1">
            <h3 className="text-base font-bold uppercase tracking-wide underline">
              BERITA ACARA PERTEMUAN PRA-OBSERVASI PEMBELAJARAN
            </h3>
            <p className="text-xs font-sans text-gray-600">
              Tahun Ajaran / Semester: {school.semester_aktif}
            </p>
          </div>

          {/* Pernyataan Pengantar */}
          <p className="text-xs font-sans text-justify">
            Pada hari ini, tanggal <strong>{formatTanggalIndonesia(data.tanggal_pelaksanaan)}</strong>, telah diselenggarakan pertemuan dialog telaah perencanaan pembelajaran (Pra-Observasi) antara Guru yang bersangkutan dengan Supervisor akademik:
          </p>

          {/* Tabel Identitas Para Pihak */}
          <div className="font-sans text-xs space-y-2 border border-gray-300 p-3 rounded">
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-gray-600">Nama Guru Teramati:</span>
              <span className="col-span-2 font-bold">{teacher.nama_lengkap}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-gray-600">NIP / NUPTK:</span>
              <span className="col-span-2 font-mono">{teacher.nip_nuptk}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-gray-600">Mata Pelajaran / Kelas:</span>
              <span className="col-span-2">{teacher.mata_pelajaran} / {teacher.kelas_diampu} (Fase {teacher.fase})</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-gray-600">Nama Supervisor:</span>
              <span className="col-span-2 font-bold">{school.nama_kepala_sekolah}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-gray-600">NIP Supervisor:</span>
              <span className="col-span-2 font-mono">{school.nip_kepala_sekolah}</span>
            </div>
          </div>

          {/* Rencana Pembelajaran */}
          <div className="font-sans text-xs space-y-1.5">
            <h4 className="font-bold text-sm uppercase border-b border-gray-300 pb-1">
              A. Rencana Pelaksanaan Pembelajaran
            </h4>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <span className="font-semibold text-gray-600">Topik / Materi:</span>
              <span className="col-span-2">{data.topik_pembelajaran}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-gray-600">Tujuan Pembelajaran:</span>
              <span className="col-span-2">{data.tujuan_pembelajaran}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-gray-600">Metode & Media:</span>
              <span className="col-span-2">{data.metode_pembelajaran} | Media: {data.media_alat}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-gray-600">Teknik Asesmen:</span>
              <span className="col-span-2">{data.teknik_asesmen} (Alokasi: {data.alokasi_waktu})</span>
            </div>
          </div>

          {/* Tabel Fokus Pengamatan Bersama */}
          <div className="font-sans text-xs space-y-2">
            <h4 className="font-bold text-sm uppercase border-b border-gray-300 pb-1">
              B. Kesepakatan Fokus Pengamatan (Maksimal 5 Butir)
            </h4>
            <table className="w-full border-collapse border border-gray-300 text-left">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="border border-gray-300 p-2 w-10 text-center">No</th>
                  <th className="border border-gray-300 p-2 w-48">Aspek Pengamatan</th>
                  <th className="border border-gray-300 p-2">Indikator Keberhasilan yang Diharapkan</th>
                  <th className="border border-gray-300 p-2 w-40">Catatan Khusus</th>
                </tr>
              </thead>
              <tbody>
                {data.fokus_amatan.map((f, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-300 p-2 text-center font-bold">{idx + 1}</td>
                    <td className="border border-gray-300 p-2 font-medium">
                      Aspek {f.aspek}: {ASPECT_NAMES[f.aspek]}
                    </td>
                    <td className="border border-gray-300 p-2">{f.indikator_sukses}</td>
                    <td className="border border-gray-300 p-2 text-gray-600">{f.catatan_khusus || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Blok Tanda Tangan */}
          <div className="font-sans text-xs pt-8 grid grid-cols-2 gap-8 text-center break-inside-avoid">
            <div>
              <p className="text-gray-600 mb-16">Guru Mata Pelajaran,</p>
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

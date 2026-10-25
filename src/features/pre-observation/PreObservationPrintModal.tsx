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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:z-auto print:block print:overflow-visible">
      <div className="bg-white text-black border border-border rounded-panel max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:rounded-none print:max-w-none print:w-full print:max-h-none print:h-auto print:overflow-visible print:m-0 print:p-0">
        {/* Header Modal Bar (Hanya tampil di layar, tidak ikut tercetak) */}
        <div className="no-print flex items-center justify-between p-3.5 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-pine-600" />
            <div>
              <span className="font-bold font-serif text-sm block leading-tight text-gray-900">
                Pratinjau Dokumen Siap Cetak (A4) - Berita Acara Pra-Observasi
              </span>
              <span className="text-[11px] text-gray-500 block leading-tight mt-0.5">
                Format resmi terstandar 1 Lembar A4 tanpa scrollbar
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1.5" />
              Cetak Sekarang
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-500 hover:text-black hover:bg-gray-200 transition-colors"
              title="Tutup Pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lembar Dokumen A4 Resmi (Proporsi 1 Lembar Pas & Bersih Tanpa Scrollbar) */}
        <div
          id="printable-area"
          className="print-document flex-1 overflow-y-auto p-6 md:p-8 space-y-3 font-serif text-black leading-snug print:p-0 print:m-0 print:overflow-visible print:h-auto print:max-h-none print:space-y-2.5 print:text-[10pt]"
        >
          {/* Kop Surat Resmi */}
          <div className="text-center border-b-2 border-black pb-2 space-y-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">
              PEMERINTAH DAERAH PROVINSI / DINAS PENDIDIKAN
            </h2>
            <h1 className="text-base md:text-lg font-bold uppercase tracking-wide text-black">
              {school.nama_sekolah}
            </h1>
            <p className="text-[10px] font-sans text-gray-600">
              {school.alamat} | NPSN: {school.npsn}
            </p>
          </div>

          {/* Judul Dokumen */}
          <div className="text-center pt-0.5 space-y-0.5">
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider underline">
              BERITA ACARA PERTEMUAN PRA-OBSERVASI PEMBELAJARAN
            </h3>
            <p className="text-[10px] font-sans text-gray-600">
              Tahun Ajaran / Semester: {school.semester_aktif}
            </p>
          </div>

          {/* Pernyataan Pengantar */}
          <p className="text-[10.5px] font-sans text-justify leading-relaxed">
            Pada hari ini, tanggal <strong>{formatTanggalIndonesia(data.tanggal_pelaksanaan)}</strong>, telah diselenggarakan pertemuan dialog telaah perencanaan pembelajaran (Pra-Observasi) antara Guru yang bersangkutan dengan Supervisor akademik:
          </p>

          {/* Tabel Identitas Para Pihak */}
          <div className="font-sans text-[10.5px] border border-gray-400 p-2.5 rounded space-y-1 bg-gray-50/50 print:bg-transparent">
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
          <div className="font-sans text-[10.5px] space-y-1">
            <h4 className="font-bold text-xs uppercase border-b border-gray-400 pb-0.5 tracking-wide">
              A. Rencana Pelaksanaan Pembelajaran
            </h4>
            <div className="grid grid-cols-3 gap-2 pt-0.5">
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
          <div className="font-sans text-[10px] space-y-1">
            <h4 className="font-bold text-xs uppercase border-b border-gray-400 pb-0.5 tracking-wide">
              B. Kesepakatan Fokus Pengamatan (Maksimal 5 Butir)
            </h4>
            <table className="w-full border-collapse border border-gray-400 text-left">
              <thead className="bg-gray-100 border-b border-gray-400 print:bg-gray-100">
                <tr>
                  <th className="border border-gray-400 p-1.5 w-8 text-center font-bold">No</th>
                  <th className="border border-gray-400 p-1.5 w-44 font-bold">Aspek Pengamatan</th>
                  <th className="border border-gray-400 p-1.5 font-bold">Indikator Keberhasilan yang Diharapkan</th>
                  <th className="border border-gray-400 p-1.5 w-36 font-bold">Catatan Khusus</th>
                </tr>
              </thead>
              <tbody>
                {data.fokus_amatan.map((f, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-400 p-1.5 text-center font-bold">{idx + 1}</td>
                    <td className="border border-gray-400 p-1.5 font-medium">
                      Aspek {f.aspek}: {ASPECT_NAMES[f.aspek]}
                    </td>
                    <td className="border border-gray-400 p-1.5 leading-snug">{f.indikator_sukses}</td>
                    <td className="border border-gray-400 p-1.5 text-gray-700 leading-snug">{f.catatan_khusus || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Blok Tanda Tangan */}
          <div className="font-sans text-[10.5px] pt-3 grid grid-cols-2 gap-8 text-center break-inside-avoid">
            <div>
              <p className="text-gray-600 mb-10">Guru Mata Pelajaran,</p>
              <p className="font-bold underline text-black">{teacher.nama_lengkap}</p>
              <p className="font-mono text-gray-600 text-[10px]">NIP. {teacher.nip_nuptk}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-10">Supervisor / Kepala Sekolah,</p>
              <p className="font-bold underline text-black">{school.nama_kepala_sekolah}</p>
              <p className="font-mono text-gray-600 text-[10px]">NIP. {school.nip_kepala_sekolah}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

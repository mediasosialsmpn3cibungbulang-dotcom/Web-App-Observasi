"use client";

import React, { useEffect } from "react";
import { X, Printer } from "lucide-react";
import { Observation, ObservationScoreItem, Teacher, SchoolSettings } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
import { PrintPortal } from "@/components/ui/PrintPortal";
import { SEED_INDICATORS } from "@/contracts/seed-data";
import { formatTanggalIndonesia } from "@/lib/utils";
import { ObservationCalculationResult } from "./observation-service";
import { ASPECT_NAMES } from "@/contracts/enums";

interface ObservationPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  observation: Observation;
  scores: ObservationScoreItem[];
  metrics: ObservationCalculationResult;
  teacher: Teacher;
  school: SchoolSettings;
}

export const ObservationPrintModal: React.FC<ObservationPrintModalProps> = ({
  isOpen,
  onClose,
  observation,
  scores,
  metrics,
  teacher,
  school,
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

  const scoreMap = new Map(scores.map((s) => [s.kode_indikator, s]));

  // Pembagian 7 aspek ke dalam 2 lembar A4 proporsional:
  // Lembar 1: Aspek A, B, C, D (16 indikator) + Kop & Identitas
  // Lembar 2: Aspek E, F, G (12 indikator) + Rekap Skor, Catatan & Tanda Tangan
  const aspekLembar1 = ["A", "B", "C", "D"] as const;
  const aspekLembar2 = ["E", "F", "G"] as const;

  const renderTableAspek = (aspekList: readonly ("A" | "B" | "C" | "D" | "E" | "F" | "G")[]) => (
    <table className="w-full border-collapse border border-black text-left text-[10px] my-1">
      <thead className="bg-gray-100 border-b border-black">
        <tr>
          <th className="border border-black p-1 w-9 text-center font-bold">Kode</th>
          <th className="border border-black p-1 font-bold">Indikator Pembelajaran yang Diamati</th>
          <th className="border border-black p-1 w-12 text-center font-bold">Skor (1-4)</th>
          <th className="border border-black p-1 w-52 font-bold">Bukti Teramati / Catatan Lapangan</th>
        </tr>
      </thead>
      <tbody>
        {aspekList.map((aspek) => {
          const indicators = SEED_INDICATORS.filter((ind) => ind.aspek === aspek);
          const avg = metrics.aspectAverages[aspek];

          return (
            <React.Fragment key={aspek}>
              <tr className="bg-gray-100/90 font-bold border-y border-black">
                <td colSpan={2} className="border border-black p-1 pl-2">
                  Aspek {aspek}: {ASPECT_NAMES[aspek]}
                </td>
                <td className="border border-black p-1 text-center font-mono font-bold text-[10.5px]">
                  {avg !== null && avg !== undefined ? avg.toFixed(2) : "-"}
                </td>
                <td className="border border-black p-1 text-gray-700 text-[9px] font-normal">
                  Rata-rata Aspek {aspek}
                </td>
              </tr>
              {indicators.map((ind) => {
                const item = scoreMap.get(ind.kode);
                return (
                  <tr key={ind.kode} className="border-b border-gray-300">
                    <td className="border border-black p-1 text-center font-mono font-bold">
                      {ind.kode}
                    </td>
                    <td className="border border-black p-1 leading-snug">
                      {ind.pernyataan}
                    </td>
                    <td className="border border-black p-1 text-center font-bold font-mono text-[11px]">
                      {item?.skor || "-"}
                    </td>
                    <td className="border border-black p-1 text-gray-800 text-[9px] leading-tight">
                      {item?.bukti_nyata || "-"}
                    </td>
                  </tr>
                );
              })}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <PrintPortal>
      {/* Backdrop gelap: klik area luar untuk menutup */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs select-none"
        onClick={onClose}
      >
        <div
          className="bg-gray-100 rounded-2xl w-full max-w-[880px] max-h-[94vh] flex flex-col shadow-2xl overflow-hidden print:block print:bg-white print:rounded-none print:shadow-none print:max-w-none"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau Lembar Observasi Kelas"
        >
          {/* Header Modal Bar (Tidak ikut tercetak) */}
          <div className="no-print flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Printer className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">
                  Pratinjau Lembar Observasi Pembelajaran Kelas
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  Format A4 · 2 Halaman Rapi · Tekan Esc atau klik area gelap untuk menutup
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

          {/* Area Dokumen Kertas A4 (Di layar: tersusun 2 lembar bergaya dokumen Word) */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6 print:space-y-0 print:p-0">
            
            {/* ======================================================== */}
            {/* LEMBAR 1 (HALAMAN 1 DARI 2): KOP + IDENTITAS + ASPEK A-D */}
            {/* ======================================================== */}
            <div className="print-document mx-auto bg-white text-black shadow-md print:shadow-none w-full max-w-[794px] min-h-[1050px] p-8 sm:p-12 font-sans text-[11px] leading-relaxed flex flex-col justify-between">
              <div className="space-y-2">
                {/* Kop Surat Resmi */}
                <div className="text-center border-b-[3px] border-double border-black pb-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-800">
                    Pemerintah Daerah Provinsi Jawa Barat / Dinas Pendidikan
                  </p>
                  <p className="font-serif text-[17px] font-bold uppercase tracking-wide leading-tight text-black mt-0.5">
                    {school.nama_sekolah}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5 font-sans">
                    {school.alamat} &nbsp;|&nbsp; NPSN: {school.npsn}
                  </p>
                </div>

                {/* Judul Dokumen */}
                <div className="text-center space-y-0.5 pt-1">
                  <h1 className="font-serif text-sm font-bold uppercase tracking-wide underline text-black">
                    LEMBAR OBSERVASI PEMBELAJARAN DI KELAS
                  </h1>
                  <p className="text-[10px] text-gray-600 font-sans">
                    Semester: {observation.semester} &nbsp;|&nbsp; Sesi Observasi ke-{observation.sesi_ke}
                  </p>
                </div>

                {/* Tabel Identitas Observasi */}
                <table className="w-full border-collapse border border-black text-[10px] my-1">
                  <tbody>
                    <tr>
                      <td className="p-1 border border-black font-semibold bg-gray-50 w-[20%]">Nama Guru</td>
                      <td className="p-1 border border-black w-[30%]">{teacher.nama_lengkap}</td>
                      <td className="p-1 border border-black font-semibold bg-gray-50 w-[20%]">Nama Supervisor</td>
                      <td className="p-1 border border-black w-[30%]">{school.nama_kepala_sekolah}</td>
                    </tr>
                    <tr>
                      <td className="p-1 border border-black font-semibold bg-gray-50">NIP / NUPTK</td>
                      <td className="p-1 border border-black font-mono">{teacher.nip_nuptk}</td>
                      <td className="p-1 border border-black font-semibold bg-gray-50">Tanggal Observasi</td>
                      <td className="p-1 border border-black">{formatTanggalIndonesia(observation.tanggal_observasi)}</td>
                    </tr>
                    <tr>
                      <td className="p-1 border border-black font-semibold bg-gray-50">Mata Pelajaran & Kelas</td>
                      <td className="p-1 border border-black">{teacher.mata_pelajaran} (Kelas {observation.kelas})</td>
                      <td className="p-1 border border-black font-semibold bg-gray-50">Waktu & Kehadiran</td>
                      <td className="p-1 border border-black">{observation.jam_mulai} - {observation.jam_selesai} WIB ({observation.jumlah_siswa_hadir} Siswa)</td>
                    </tr>
                  </tbody>
                </table>

                {/* Tabel 16 Indikator (Aspek A s.d. D) */}
                {renderTableAspek(aspekLembar1)}
              </div>

              {/* Catatan Kaki Lembar 1 */}
              <div className="pt-2 border-t border-gray-300 flex items-center justify-between text-[9px] text-gray-500 font-mono">
                <span>Instrumen Supervisi Pembelajaran Kelas — {school.nama_sekolah}</span>
                <span>Halaman 1 dari 2</span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* LEMBAR 2 (HALAMAN 2 DARI 2): ASPEK E-G + REKAP + TTD    */}
            {/* ======================================================== */}
            <div className="print-document mx-auto bg-white text-black shadow-md print:shadow-none w-full max-w-[794px] min-h-[1050px] p-8 sm:p-12 font-sans text-[11px] leading-relaxed flex flex-col justify-between">
              <div className="space-y-2.5">
                {/* Header Ringkas Lembar Lanjutan */}
                <div className="border-b-2 border-black pb-1.5 flex items-center justify-between text-[10px]">
                  <div>
                    <p className="font-bold uppercase tracking-wide text-black font-serif text-[11px]">
                      LEMBAR OBSERVASI PEMBELAJARAN (LANJUTAN)
                    </p>
                    <p className="text-gray-600 text-[9.5px]">
                      {school.nama_sekolah} &nbsp;|&nbsp; Semester: {observation.semester}
                    </p>
                  </div>
                  <div className="text-right text-gray-700 text-[9.5px]">
                    <p><strong>Guru:</strong> {teacher.nama_lengkap}</p>
                    <p><strong>Kelas / Sesi:</strong> {observation.kelas} / Sesi ke-{observation.sesi_ke}</p>
                  </div>
                </div>

                {/* Tabel 12 Indikator (Aspek E s.d. G) */}
                {renderTableAspek(aspekLembar2)}

                {/* Rekap Nilai Akhir & Predikat Kelulusan */}
                <div className="border border-black p-2 bg-gray-50 grid grid-cols-3 gap-2 text-center text-[10px] my-2">
                  <div>
                    <span className="text-gray-600 uppercase text-[9px] block font-semibold">Total Skor Observasi</span>
                    <span className="text-base font-bold font-mono text-black">{metrics.totalScore || "-"} / 112</span>
                  </div>
                  <div>
                    <span className="text-gray-600 uppercase text-[9px] block font-semibold">Nilai Ketercapaian</span>
                    <span className="text-base font-bold font-mono text-black">
                      {metrics.percentage !== null ? `${metrics.percentage.toFixed(1)}%` : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 uppercase text-[9px] block font-semibold">Predikat Supervisi</span>
                    <span className="text-base font-bold text-black">{metrics.predikat || "-"}</span>
                  </div>
                </div>

                {/* Aspek Prioritas & Catatan Supervisor */}
                <div className="text-[10px] space-y-1 bg-white border border-gray-300 p-2 rounded">
                  <p>
                    <strong>Aspek Prioritas Pengembangan:</strong>{" "}
                    {metrics.priorityAspect
                      ? `Aspek ${metrics.priorityAspect} (${ASPECT_NAMES[metrics.priorityAspect]})`
                      : "Seluruh aspek telah memenuhi standar kompetensi minimal."}
                  </p>
                  {observation.catatan_umum && (
                    <p>
                      <strong>Catatan Umum Supervisor:</strong> {observation.catatan_umum}
                    </p>
                  )}
                </div>

                {/* Tanda Tangan Pengesahan Resmi */}
                <div className="pt-3 grid grid-cols-2 gap-8 text-center text-[10.5px] break-inside-avoid">
                  <div>
                    <p className="text-gray-700 mb-14">Guru yang Diobservasi,</p>
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

              {/* Catatan Kaki Lembar 2 */}
              <div className="pt-2 border-t border-gray-300 flex items-center justify-between text-[9px] text-gray-500 font-mono">
                <span>Instrumen Supervisi Pembelajaran Kelas — {school.nama_sekolah}</span>
                <span>Halaman 2 dari 2</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PrintPortal>
  );
};

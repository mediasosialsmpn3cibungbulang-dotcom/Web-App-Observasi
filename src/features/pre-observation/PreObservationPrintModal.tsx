"use client";

import React, { useEffect } from "react";
import { X, Printer } from "lucide-react";
import { PreObservation, Teacher, SchoolSettings } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
import { PrintPortal } from "@/components/ui/PrintPortal";
import { formatTanggalIndonesia } from "@/lib/utils";
import { ASPECT_NAMES } from "@/contracts/enums";

interface PreObservationPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PreObservation;
  teacher: Teacher;
  school: SchoolSettings;
}

// Gaya baris label : isi pada tabel identitas & RPP
const LABEL = "py-1 pr-2 align-top w-[32%] text-gray-700 font-medium";
const SEP = "py-1 px-1 align-top w-[2%]";
const VALUE = "py-1 align-top text-gray-900";

export const PreObservationPrintModal: React.FC<PreObservationPrintModalProps> = ({
  isOpen,
  onClose,
  data,
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

  return (
    <PrintPortal>
      {/* Backdrop: klik area gelap untuk menutup */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      >
        <div
          className="bg-gray-100 rounded-2xl w-full max-w-[860px] max-h-[94vh] flex flex-col shadow-2xl overflow-hidden print:block print:bg-white print:rounded-none print:shadow-none print:max-w-none"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau Berita Acara Pra-Observasi"
        >
          {/* Header Modal (tidak ikut tercetak) */}
          <div className="no-print flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Printer className="w-4 h-4 text-pine-600 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">
                  Pratinjau Berita Acara Pra-Observasi
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  Kertas A4 · 1 lembar · Tekan Esc atau klik area gelap untuk menutup
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="primary" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1.5" />
                Cetak Sekarang
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

          {/* Area pratinjau di layar: kertas A4 di atas latar abu-abu (scroll hanya di layar) */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 print:p-0">
            <div
              id="printable-area"
              className="print-document mx-auto bg-white text-black shadow-md print:shadow-none w-full max-w-[794px] min-h-[1050px] p-8 sm:p-12 font-sans text-[11px] leading-relaxed flex flex-col justify-between"
            >
              {/* Bagian Atas: Kop, Judul, Identitas, RPP, dan Tabel Fokus Pengamatan */}
              <div className="space-y-3.5">
                {/* Kop Surat */}
                <div className="text-center border-b-[3px] border-double border-black pb-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-800">
                    Pemerintah Daerah Provinsi Jawa Barat / Dinas Pendidikan
                  </p>
                  <p className="font-serif text-[17px] font-bold uppercase tracking-wide leading-tight text-black mt-0.5">
                    {school.nama_sekolah}
                  </p>
                  <p className="text-[10px] text-gray-700 mt-0.5">
                    {school.alamat} | NPSN: {school.npsn}
                  </p>
                </div>

                {/* Judul */}
                <div className="text-center my-2.5">
                  <p className="font-serif text-[13px] font-bold uppercase underline underline-offset-4 tracking-wider">
                    Berita Acara Pertemuan Pra-Observasi Pembelajaran
                  </p>
                  <p className="text-[10px] text-gray-700 mt-1">
                    Tahun Ajaran / Semester: {school.semester_aktif}
                  </p>
                </div>

                <p className="text-justify text-[11px] leading-relaxed mb-2">
                  Pada hari ini, tanggal <strong>{formatTanggalIndonesia(data.tanggal_pelaksanaan)}</strong>, telah
                  diselenggarakan pertemuan dialog telaah perencanaan pembelajaran (Pra-Observasi) antara Guru dengan
                  Supervisor akademik sebagai berikut:
                </p>

                {/* Identitas */}
                <table className="w-full mb-3">
                  <tbody>
                    <tr><td className={LABEL}>Nama Guru</td><td className={SEP}>:</td><td className={`${VALUE} font-bold`}>{teacher.nama_lengkap}</td></tr>
                    <tr><td className={LABEL}>NIP / NUPTK</td><td className={SEP}>:</td><td className={VALUE}>{teacher.nip_nuptk}</td></tr>
                    <tr><td className={LABEL}>Mata Pelajaran / Kelas</td><td className={SEP}>:</td><td className={VALUE}>{teacher.mata_pelajaran} / {teacher.kelas_diampu} (Fase {teacher.fase})</td></tr>
                    <tr><td className={LABEL}>Supervisor</td><td className={SEP}>:</td><td className={`${VALUE} font-bold`}>{school.nama_kepala_sekolah}</td></tr>
                    <tr><td className={LABEL}>NIP Supervisor</td><td className={SEP}>:</td><td className={VALUE}>{school.nip_kepala_sekolah}</td></tr>
                  </tbody>
                </table>

                {/* A. RPP */}
                <div>
                  <p className="font-bold uppercase text-[11px] border-b border-black pb-0.5 mb-1.5">
                    A. Rencana Pelaksanaan Pembelajaran
                  </p>
                  <table className="w-full mb-3">
                    <tbody>
                      <tr><td className={LABEL}>Topik / Materi</td><td className={SEP}>:</td><td className={VALUE}>{data.topik_pembelajaran}</td></tr>
                      <tr><td className={LABEL}>Tujuan Pembelajaran</td><td className={SEP}>:</td><td className={VALUE}>{data.tujuan_pembelajaran}</td></tr>
                      <tr><td className={LABEL}>Metode Pembelajaran</td><td className={SEP}>:</td><td className={VALUE}>{data.metode_pembelajaran}</td></tr>
                      <tr><td className={LABEL}>Media / Alat</td><td className={SEP}>:</td><td className={VALUE}>{data.media_alat}</td></tr>
                      <tr><td className={LABEL}>Teknik Asesmen</td><td className={SEP}>:</td><td className={VALUE}>{data.teknik_asesmen}</td></tr>
                      <tr><td className={LABEL}>Alokasi Waktu</td><td className={SEP}>:</td><td className={VALUE}>{data.alokasi_waktu}</td></tr>
                    </tbody>
                  </table>
                </div>

                {/* B. Fokus Pengamatan */}
                <div>
                  <p className="font-bold uppercase text-[11px] border-b border-black pb-0.5 mb-1.5">
                    B. Kesepakatan Fokus Pengamatan
                  </p>
                  <table className="w-full border-collapse text-[10.5px] table-fixed">
                    <colgroup>
                      <col className="w-[6%]" />
                      <col className="w-[26%]" />
                      <col className="w-[40%]" />
                      <col className="w-[28%]" />
                    </colgroup>
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black px-2 py-1 text-center font-bold">No</th>
                        <th className="border border-black px-2 py-1 text-left font-bold">Aspek Pengamatan</th>
                        <th className="border border-black px-2 py-1 text-left font-bold">Indikator Keberhasilan</th>
                        <th className="border border-black px-2 py-1 text-left font-bold">Catatan Khusus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.fokus_amatan.map((f, idx) => (
                        <tr key={idx} className="break-inside-avoid">
                          <td className="border border-black px-2 py-1.5 text-center align-top">{idx + 1}</td>
                          <td className="border border-black px-2 py-1.5 align-top font-medium">Aspek {f.aspek}: {ASPECT_NAMES[f.aspek]}</td>
                          <td className="border border-black px-2 py-1.5 align-top leading-relaxed">{f.indikator_sukses}</td>
                          <td className="border border-black px-2 py-1.5 align-top leading-relaxed">{f.catatan_khusus || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bagian Bawah: Tanda Tangan Pas & Seimbang */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-center break-inside-avoid">
                <div>
                  <p className="text-gray-800">Guru Mata Pelajaran,</p>
                  <div className="h-20" />
                  <p className="font-bold underline text-sm text-black">{teacher.nama_lengkap}</p>
                  <p className="text-[11px] text-gray-700 font-mono mt-0.5">NIP. {teacher.nip_nuptk}</p>
                </div>
                <div>
                  <p className="text-gray-800">Supervisor / Kepala Sekolah,</p>
                  <div className="h-20" />
                  <p className="font-bold underline text-sm text-black">{school.nama_kepala_sekolah}</p>
                  <p className="text-[11px] text-gray-700 font-mono mt-0.5">NIP. {school.nip_kepala_sekolah}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrintPortal>
  );
};

"use client";

import React, { useEffect } from "react";
import { X, Printer, CheckSquare } from "lucide-react";
import { ChecklistItem, SchoolSettings } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
import { PrintPortal } from "@/components/ui/PrintPortal";
import { formatTanggalIndonesia } from "@/lib/utils";
import { calculateChecklistProgress } from "@/domain/scoring";

interface ChecklistPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ChecklistItem[];
  school: SchoolSettings;
}

export const ChecklistPrintModal: React.FC<ChecklistPrintModalProps> = ({
  isOpen,
  onClose,
  items,
  school,
}) => {
  // Listener tombol Escape untuk menutup modal secara instan
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const progress = calculateChecklistProgress(items.map((i) => i.status));
  const tanggalHariIni = formatTanggalIndonesia(new Date().toISOString().split("T")[0]);

  // Pisahkan butir kegiatan menjadi 2 lembar terstruktur:
  // Lembar 1: Fase 1 (Persiapan), Fase 2 (Pra-Observasi), Fase 3 (Observasi Kelas) -> Total 15 kegiatan
  const itemsLembar1 = items.filter((item) =>
    ["Fase 1: Persiapan Awal Semester", "Fase 2: Pra-Observasi", "Fase 3: Observasi Kelas"].includes(
      item.fase_nama
    )
  );

  // Lembar 2: Fase 4 (Coaching), Fase 5 (Monitoring Tindak Lanjut), Fase 6 (Evaluasi & Pelaporan) -> Total 14 kegiatan
  const itemsLembar2 = items.filter((item) =>
    [
      "Fase 4: Sesi Coaching Pasca-Observasi",
      "Fase 5: Monitoring Tindak Lanjut",
      "Fase 6: Evaluasi dan Pelaporan Akhir Semester",
    ].includes(item.fase_nama)
  );

  // Kelompokkan item berdasarkan fase untuk rendering sub-header tabel yang rapi
  const groupItemsByFase = (itemList: ChecklistItem[]) => {
    const groups: { fase: string; items: ChecklistItem[] }[] = [];
    itemList.forEach((item) => {
      const existing = groups.find((g) => g.fase === item.fase_nama);
      if (existing) {
        existing.items.push(item);
      } else {
        groups.push({ fase: item.fase_nama, items: [item] });
      }
    });
    return groups;
  };

  const renderTableSection = (itemList: ChecklistItem[]) => {
    const groups = groupItemsByFase(itemList);

    return (
      <table className="w-full text-[8.5px] border border-black border-collapse text-left">
        <thead>
          <tr className="bg-gray-100 border-b border-black text-center font-bold">
            <th className="border border-black py-0.5 px-1 w-6">No</th>
            <th className="border border-black py-0.5 px-1.5 text-left">Uraian Kegiatan Supervisi Akademik</th>
            <th className="border border-black py-0.5 px-1.5 text-left w-36">Output / Dokumen Bukti Fisik</th>
            <th className="border border-black py-0.5 px-1 text-center w-24">PIC Peran</th>
            <th className="border border-black py-0.5 px-1 text-center w-16">Status</th>
            <th className="border border-black py-0.5 px-1 text-center w-20">Tgl Aktual</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <React.Fragment key={group.fase}>
              {/* Baris Subheader Fase */}
              <tr className="bg-gray-200/80 font-bold border-y border-black">
                <td colSpan={6} className="border border-black py-0.5 px-2 text-[9px] uppercase tracking-wide">
                  &bull; {group.fase}
                </td>
              </tr>
              {/* Butir-butir Kegiatan */}
              {group.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="border border-black py-0.5 px-1 text-center font-mono font-bold">
                    {item.nomor_kode}
                  </td>
                  <td className="border border-black py-0.5 px-1.5 leading-tight">
                    <p className="font-semibold text-black">{item.kegiatan}</p>
                    <p className="text-[7.5px] text-gray-600 font-mono">Target: {item.deadline_deskripsi}</p>
                  </td>
                  <td className="border border-black py-0.5 px-1.5 text-[8px] leading-tight text-gray-800">
                    {item.dokumen_dihasilkan}
                  </td>
                  <td className="border border-black py-0.5 px-1 text-center text-[8px]">
                    {item.pic_peran}
                  </td>
                  <td className="border border-black py-0.5 px-1 text-center font-mono text-[8px]">
                    {item.status === "Selesai" ? (
                      <span className="font-bold underline text-black">SELESAI</span>
                    ) : item.status === "Berjalan" ? (
                      <span className="font-medium text-black">BERJALAN</span>
                    ) : (
                      <span className="text-gray-500">BELUM</span>
                    )}
                  </td>
                  <td className="border border-black py-0.5 px-1 text-center font-mono text-[8px]">
                    {item.tanggal_deadline_aktual ? formatTanggalIndonesia(item.tanggal_deadline_aktual) : "-"}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <PrintPortal>
      {/* Backdrop Gelap */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs select-none"
        onClick={onClose}
      >
        <div
          className="bg-gray-100 rounded-2xl w-full max-w-[880px] max-h-[96vh] flex flex-col shadow-2xl overflow-hidden print:block print:bg-white print:rounded-none print:shadow-none print:max-w-none"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau Checklist Monitoring 29 Kegiatan"
        >
          {/* Header Modal Bar (Tidak ikut tercetak) */}
          <div className="no-print flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <CheckSquare className="w-5 h-5 text-pine-600 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">
                  Checklist Monitoring 29 Kegiatan Supervisi Semester
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  Format A4 Resmi (Tepat 2 Lembar Terpisah) &middot; Logo Resmi SMPN 3 Cibungbulang &middot; Tekan Esc untuk menutup
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="primary" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1.5" />
                Cetak Dokumen (2 Lembar A4)
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4" />
                Tutup
              </button>
            </div>
          </div>

          {/* Area Dokumen Kertas A4 (Tersusun 2 Lembar Mandiri) */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-6 print:space-y-0 print:p-0">

            {/* ======================================================== */}
            {/* LEMBAR 1 DARI 2: KOP, STATISTIK, & FASE 1 S.D. FASE 3    */}
            {/* ======================================================== */}
            <div className="print-document mx-auto bg-white text-black shadow-md print:shadow-none w-full max-w-[794px] h-[297mm] p-8 sm:p-10 font-sans leading-tight flex flex-col justify-between border print:border-none border-gray-300 box-border overflow-hidden">
              <div className="space-y-2">
                {/* Kop Surat Resmi Kedinasan dengan Logo Sekolah */}
                <div className="flex items-center gap-3 border-b-[3px] border-double border-black pb-2 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/logo-smpn3cibungbulang.png"
                    alt="Logo"
                    className="w-12 h-14 object-contain shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-black">
                      Pemerintah Daerah Kabupaten Bogor &nbsp;&bull;&nbsp; Dinas Pendidikan
                    </p>
                    <p className="font-serif text-[15px] font-bold uppercase tracking-wide leading-tight text-black mt-0.5">
                      {school.nama_sekolah}
                    </p>
                    <p className="text-[9.5px] text-gray-700 mt-0.5 font-sans">
                      {school.alamat} &nbsp;|&nbsp; NPSN: {school.npsn}
                    </p>
                  </div>
                  <div className="w-12 shrink-0" />
                </div>

                {/* Judul Dokumen */}
                <div className="text-center space-y-0.5 pt-0.5">
                  <h3 className="font-serif text-xs font-bold uppercase tracking-wide underline text-black">
                    CHECKLIST MONITORING PELAKSANAAN SUPERVISI AKADEMIK GURU
                  </h3>
                  <p className="text-[10px] text-gray-800 font-sans">
                    Instrumen Pengendalian 29 Tahapan Siklus Penjaminan Mutu Pembelajaran
                  </p>
                  <p className="text-[9px] font-mono text-gray-700">
                    Semester: {school.semester_aktif} &nbsp;&mdash;&nbsp; Tahun Ajaran 2026/2027
                  </p>
                </div>

                {/* Statistik Ringkas Ketercapaian */}
                <div className="grid grid-cols-4 gap-2 py-1 px-1.5 border border-black text-center text-[9px]">
                  <div>
                    <span className="text-[8px] uppercase font-bold text-gray-600">Total Kegiatan</span>
                    <p className="font-bold font-mono text-[11px] mt-0.5 text-black">{progress.total} Tahapan</p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-bold text-gray-600">Selesai Realisasi</span>
                    <p className="font-bold font-mono text-[11px] mt-0.5 text-black">
                      {progress.selesai} Kegiatan
                    </p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-bold text-gray-600">Sedang Berjalan</span>
                    <p className="font-bold font-mono text-[11px] mt-0.5 text-black">{progress.berjalan} Kegiatan</p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-bold text-gray-600">Persentase Capaian</span>
                    <p className="font-bold font-mono text-[11px] mt-0.5 text-black">{progress.percentage}%</p>
                  </div>
                </div>

                {/* Tabel Bagian 1: Fase 1 s.d. Fase 3 */}
                <div className="space-y-0.5">
                  <h4 className="font-serif font-bold text-[9px] uppercase text-black">
                    Bagian I: Persiapan, Pra-Observasi, &amp; Observasi Kelas (15 Kegiatan)
                  </h4>
                  {renderTableSection(itemsLembar1)}
                </div>
              </div>

              {/* Catatan Kaki Lembar 1 */}
              <div className="pt-1 border-t border-black/30 flex justify-between text-[8.5px] text-gray-600 font-sans">
                <span>Checklist Monitoring Supervisi Akademik 29 Kegiatan</span>
                <span>Lembar 1 dari 2 &middot; {school.nama_sekolah}</span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* LEMBAR 2 DARI 2: FASE 4 S.D. FASE 6 & PENGESAHAN RESMI    */}
            {/* ======================================================== */}
            <div className="print-document mx-auto bg-white text-black shadow-md print:shadow-none w-full max-w-[794px] h-[297mm] p-8 sm:p-10 font-sans leading-tight flex flex-col justify-between border print:border-none border-gray-300 box-border overflow-hidden">
              <div className="space-y-2">
                {/* Header Atas Lembar 2 */}
                <div className="border-b border-black pb-1 flex justify-between items-center text-[9.5px] text-gray-700">
                  <span className="font-semibold uppercase tracking-wider">
                    {school.nama_sekolah} &nbsp;&bull;&nbsp; SEMESTER {school.semester_aktif.toUpperCase()}
                  </span>
                  <span className="font-mono text-[9px]">Instrumen Monitoring Supervisi &mdash; Lembar 2</span>
                </div>

                {/* Tabel Bagian 2: Fase 4 s.d. Fase 6 */}
                <div className="space-y-0.5">
                  <h4 className="font-serif font-bold text-[9px] uppercase text-black">
                    Bagian II: Coaching Klinis, Tindak Lanjut, &amp; Pelaporan Akhir (14 Kegiatan)
                  </h4>
                  {renderTableSection(itemsLembar2)}
                </div>

                {/* Catatan Evaluasi & Rekomendasi */}
                <div className="p-1.5 border border-black text-[8.5px] space-y-0.5 bg-gray-50/50">
                  <p className="font-bold text-black uppercase text-[8.5px]">
                    Catatan Verifikasi &amp; Rekomendasi Pengendalian Mutu:
                  </p>
                  <p className="text-gray-800 leading-tight">
                    Seluruh tahapan kegiatan wajib divalidasi ketersediaan dokumen fisik/digitalnya sebelum ditandatangani. Tahap observasi dan coaching klinis wajib diselesaikan tepat waktu sesuai kalender supervisi akademik satuan pendidikan.
                  </p>
                </div>
              </div>

              {/* Tanda Tangan Pengesahan Lembar 2 */}
              <div className="space-y-1.5 pt-1.5">
                <div className="grid grid-cols-2 text-[9.5px]">
                  <div className="text-center">
                    <p>Mengetahui,</p>
                    <p className="font-semibold">Koordinator Tim Supervisor,</p>
                    <div className="h-10" />
                    <p className="font-bold underline text-black">Asep Saepuloh, M.Pd.</p>
                    <p className="font-mono text-[8.5px]">NIP. 198204152008011005</p>
                  </div>
                  <div className="text-center">
                    <p>Kabupaten Bogor, {tanggalHariIni}</p>
                    <p className="font-semibold">Kepala {school.nama_sekolah},</p>
                    <div className="h-10" />
                    <p className="font-bold underline text-black">{school.nama_kepala_sekolah}</p>
                    <p className="font-mono text-[8.5px]">NIP. {school.nip_kepala_sekolah}</p>
                  </div>
                </div>

                {/* Catatan Kaki Lembar 2 */}
                <div className="pt-1 border-t border-black/30 flex justify-between text-[8.5px] text-gray-600 font-sans">
                  <span>Checklist Monitoring Supervisi Akademik 29 Kegiatan</span>
                  <span>Lembar 2 dari 2 &middot; {school.nama_sekolah}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PrintPortal>
  );
};

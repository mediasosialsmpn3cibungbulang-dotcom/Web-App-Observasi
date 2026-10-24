"use client";

import React from "react";
import { X, Printer, CheckSquare } from "lucide-react";
import { ChecklistItem, SchoolSettings } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
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
  if (!isOpen) return null;

  const progress = calculateChecklistProgress(items.map((i) => i.status));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white text-black border border-border rounded-panel max-w-5xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal Bar */}
        <div className="no-print flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-pine-600" />
            <span className="font-bold font-serif text-sm">
              Checklist Monitoring 29 Kegiatan Semester (A4 Siap Cetak)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-1.5" />
              Cetak Dokumen
            </Button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-500 hover:text-black hover:bg-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Content Area A4 */}
        <div className="print-area flex-1 overflow-y-auto p-8 md:p-12 space-y-6 text-black bg-white">
          {/* KOP RESMI SEKOLAH */}
          <div className="text-center border-b-2 border-black pb-4">
            <h2 className="text-base font-bold uppercase tracking-wider">
              DINAS PENDIDIKAN DAN KEBUDAYAAN
            </h2>
            <h1 className="text-xl font-black uppercase tracking-wide">
              {school.nama_sekolah}
            </h1>
            <p className="text-xs mt-1">
              {school.alamat} | NPSN: {school.npsn}
            </p>
          </div>

          {/* JUDUL */}
          <div className="text-center py-2">
            <h3 className="text-base font-bold uppercase tracking-wider underline">
              CHECKLIST MONITORING PELAKSANAAN SUPERVISI AKADEMIK GURU
            </h3>
            <p className="text-xs font-mono mt-1">Semester: {school.semester_aktif} — Tahun Ajaran 2026/2027</p>
          </div>

          {/* STATISTIK RINGKAS */}
          <div className="grid grid-cols-4 gap-3 p-3 border border-black rounded text-xs text-center">
            <div>
              <span className="text-[10px] text-gray-600 uppercase font-bold">Total Kegiatan</span>
              <p className="font-mono font-bold text-base mt-0.5">{progress.total}</p>
            </div>
            <div>
              <span className="text-[10px] text-gray-600 uppercase font-bold">Selesai Realisasi</span>
              <p className="font-mono font-bold text-base mt-0.5 text-green-800">{progress.selesai}</p>
            </div>
            <div>
              <span className="text-[10px] text-gray-600 uppercase font-bold">Sedang Berjalan</span>
              <p className="font-mono font-bold text-base mt-0.5 text-blue-800">{progress.berjalan}</p>
            </div>
            <div>
              <span className="text-[10px] text-gray-600 uppercase font-bold">Persentase Capaian</span>
              <p className="font-mono font-bold text-base mt-0.5 text-pine-800">{progress.percentage}%</p>
            </div>
          </div>

          {/* TABEL CHECKLIST 29 KEGIATAN */}
          <table className="w-full text-xs border border-black border-collapse text-left">
            <thead>
              <tr className="bg-gray-100 border-b border-black text-center font-bold">
                <th className="border border-black p-2 w-10">No</th>
                <th className="border border-black p-2">Uraian Kegiatan Supervisi</th>
                <th className="border border-black p-2 w-40">Dokumen / Bukti Fisik</th>
                <th className="border border-black p-2 w-28">PIC Penanggung Jawab</th>
                <th className="border border-black p-2 w-20">Status</th>
                <th className="border border-black p-2 w-24">Tanggal Aktual</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-black">
                  <td className="border border-black p-2 text-center font-mono font-bold">
                    {item.nomor_kode}
                  </td>
                  <td className="border border-black p-2">
                    <p className="font-semibold">{item.kegiatan}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{item.fase_nama}</p>
                  </td>
                  <td className="border border-black p-2 text-[11px]">
                    {item.dokumen_dihasilkan}
                  </td>
                  <td className="border border-black p-2 text-center text-[11px]">
                    {item.pic_peran}
                  </td>
                  <td className="border border-black p-2 text-center font-bold text-[11px]">
                    {item.status}
                  </td>
                  <td className="border border-black p-2 text-center font-mono text-[11px]">
                    {item.tanggal_deadline_aktual || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TANDA TANGAN */}
          <div className="pt-8 grid grid-cols-2 text-xs">
            <div className="text-center">
              <p>Koordinator Tim Supervisor,</p>
              <div className="h-16" />
              <p className="font-bold underline">Dra. Hj. Nuraini, M.Pd.</p>
              <p className="font-mono">NIP. 19750814 200003 2 003</p>
            </div>
            <div className="text-center">
              <p>
                {school.nama_sekolah.includes("Kota") ? "Kota" : "Kabupaten"},{" "}
                {formatTanggalIndonesia(new Date().toISOString().split("T")[0])}
              </p>
              <p>Kepala {school.nama_sekolah},</p>
              <div className="h-16" />
              <p className="font-bold underline">{school.nama_kepala_sekolah}</p>
              <p className="font-mono">NIP. {school.nip_kepala_sekolah}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

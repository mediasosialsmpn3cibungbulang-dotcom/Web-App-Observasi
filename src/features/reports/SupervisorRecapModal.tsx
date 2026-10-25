"use client";

import React from "react";
import { X, Printer, FileText, CheckCircle2 } from "lucide-react";
import { TeacherMonitoringSummary } from "../monitoring/monitoring-service";
import { SchoolSettings } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
import { formatTanggalIndonesia } from "@/lib/utils";

interface SupervisorRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaries: TeacherMonitoringSummary[];
  school: SchoolSettings;
}

export const SupervisorRecapModal: React.FC<SupervisorRecapModalProps> = ({
  isOpen,
  onClose,
  summaries,
  school,
}) => {
  if (!isOpen) return null;

  const totalGuru = summaries.length;
  const guruSelesai = summaries.filter((s) => s.status_supervisi === "Selesai").length;
  const guruDenganNilai = summaries.filter((s) => s.persentase_terbaru !== null);
  const rataRataSekolah =
    guruDenganNilai.length > 0
      ? Number(
          (
            guruDenganNilai.reduce((sum, curr) => sum + (curr.persentase_terbaru || 0), 0) /
            guruDenganNilai.length
          ).toFixed(1)
        )
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:z-auto print:block print:overflow-visible">
      <div className="bg-white text-black border border-border rounded-panel max-w-5xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:rounded-none print:max-w-none print:w-full print:max-h-none print:h-auto print:overflow-visible print:m-0 print:p-0">
        {/* Modal Header Bar */}
        <div className="no-print flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-pine-600" />
            <span className="font-bold font-serif text-sm">
              Rekapitulasi Supervisi Akademik untuk Pengawas Pembina (Sheet 10 & 11 Siap Cetak A4)
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
        <div className="print-area flex-1 overflow-y-auto p-8 md:p-12 space-y-6 text-black bg-white print:p-0 print:m-0 print:overflow-visible print:h-auto print:max-h-none">
          {/* KOP SURAT RESMI */}
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

          {/* JUDUL REKAPITULASI */}
          <div className="text-center py-2">
            <h3 className="text-sm md:text-base font-bold uppercase tracking-wider underline">
              REKAPITULASI HASIL OBSERVASI PEMBELAJARAN DAN COACHING GURU
            </h3>
            <p className="text-xs font-mono mt-1">Semester: {school.semester_aktif} — Tahun Ajaran 2026/2027</p>
          </div>

          {/* STATISTIK RINGKAS SEKOLAH */}
          <div className="grid grid-cols-4 gap-3 p-3 border border-black rounded text-xs text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-600">Total Sasaran</span>
              <p className="font-bold font-mono text-base mt-0.5">{totalGuru} Guru</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-600">Tuntas Supervisi</span>
              <p className="font-bold font-mono text-base mt-0.5 text-emerald-800">
                {guruSelesai} Guru ({totalGuru > 0 ? Math.round((guruSelesai / totalGuru) * 100) : 0}%)
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-600">Rata-Rata Capaian</span>
              <p className="font-bold font-mono text-base mt-0.5 text-pine-800">{rataRataSekolah}%</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-600">Predikat Mutu Sekolah</span>
              <p className="font-bold text-base mt-0.5">
                {rataRataSekolah >= 90 ? "Amat Baik" : rataRataSekolah >= 75 ? "Baik" : "Cukup"}
              </p>
            </div>
          </div>

          {/* TABEL REKAP GURU (SHEET 10) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Tabel 1: Rekapitulasi Capaian Nilai dan Predikat per Guru
            </h4>
            <table className="w-full text-xs border border-black border-collapse text-left">
              <thead>
                <tr className="bg-gray-100 border-b border-black text-center font-bold">
                  <th className="border border-black p-2 w-8">No</th>
                  <th className="border border-black p-2">Nama Guru</th>
                  <th className="border border-black p-2">NIP / NUPTK</th>
                  <th className="border border-black p-2">Mata Pelajaran</th>
                  <th className="border border-black p-2 w-16">Kelas</th>
                  <th className="border border-black p-2 w-16">Skor Max 112</th>
                  <th className="border border-black p-2 w-16">Nilai (%)</th>
                  <th className="border border-black p-2 w-24">Predikat</th>
                  <th className="border border-black p-2 w-20">Status RTL</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((s, idx) => (
                  <tr key={s.teacher.id} className="border-b border-black">
                    <td className="border border-black p-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-black p-2 font-semibold">{s.teacher.nama_lengkap}</td>
                    <td className="border border-black p-2 font-mono text-[11px]">{s.teacher.nip_nuptk}</td>
                    <td className="border border-black p-2">{s.teacher.mata_pelajaran}</td>
                    <td className="border border-black p-2 text-center">{s.teacher.kelas_diampu}</td>
                    <td className="border border-black p-2 text-center font-mono font-semibold">
                      {s.skor_terbaru !== null ? s.skor_terbaru : "-"}
                    </td>
                    <td className="border border-black p-2 text-center font-mono font-bold">
                      {s.persentase_terbaru !== null ? `${s.persentase_terbaru}%` : "-"}
                    </td>
                    <td className="border border-black p-2 text-center font-semibold">
                      {s.predikat_terbaru || "Belum Selesai"}
                    </td>
                    <td className="border border-black p-2 text-center font-mono text-[11px]">
                      {s.rtl_selesai}/{s.total_rtl} Tuntas
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABEL ANALISIS 5 ASPEK (SHEET 11) */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Tabel 2: Analisis Rata-Rata 5 Aspek Pembelajaran (Skala 1.00 - 4.00)
            </h4>
            <table className="w-full text-xs border border-black border-collapse text-center">
              <thead>
                <tr className="bg-gray-100 border-b border-black font-bold">
                  <th className="border border-black p-2 text-left">Nama Guru</th>
                  <th className="border border-black p-2">A. Perencanaan</th>
                  <th className="border border-black p-2">B. Pelaksanaan</th>
                  <th className="border border-black p-2">C. Penilaian</th>
                  <th className="border border-black p-2">D. Karakter</th>
                  <th className="border border-black p-2">E. Iklim Kelas</th>
                  <th className="border border-black p-2 text-left">Aspek Prioritas (&lt; 3.0)</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((s) => (
                  <tr key={s.teacher.id} className="border-b border-black">
                    <td className="border border-black p-2 text-left font-semibold">{s.teacher.nama_lengkap}</td>
                    <td className="border border-black p-2 font-mono">
                      {s.rata_aspek?.A != null ? s.rata_aspek.A.toFixed(2) : "-"}
                    </td>
                    <td className="border border-black p-2 font-mono">
                      {s.rata_aspek?.B != null ? s.rata_aspek.B.toFixed(2) : "-"}
                    </td>
                    <td className="border border-black p-2 font-mono">
                      {s.rata_aspek?.C != null ? s.rata_aspek.C.toFixed(2) : "-"}
                    </td>
                    <td className="border border-black p-2 font-mono">
                      {s.rata_aspek?.D != null ? s.rata_aspek.D.toFixed(2) : "-"}
                    </td>
                    <td className="border border-black p-2 font-mono">
                      {s.rata_aspek?.E != null ? s.rata_aspek.E.toFixed(2) : "-"}
                    </td>
                    <td className="border border-black p-2 text-left text-red-700 font-semibold text-[11px]">
                      {s.aspek_prioritas.length > 0 ? s.aspek_prioritas.join(", ") : "Tidak Ada (Tuntas)"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TANDA TANGAN PENGESAHAN */}
          <div className="pt-8 grid grid-cols-2 text-xs">
            <div className="text-center">
              <p>Mengetahui,</p>
              <p>Pengawas Pembina Sekolah,</p>
              <div className="h-16" />
              <p className="font-bold underline">Drs. H. Mulyadi, M.Pd.</p>
              <p className="font-mono">NIP. 19680512 199303 1 004</p>
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

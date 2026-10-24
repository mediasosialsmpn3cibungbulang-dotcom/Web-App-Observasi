"use client";

import React from "react";
import { X, Printer, Award, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";
import { TeacherMonitoringSummary } from "./monitoring-service";
import { SchoolSettings } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
import { formatTanggalIndonesia } from "@/lib/utils";

interface TeacherMonitoringPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: TeacherMonitoringSummary;
  school: SchoolSettings;
}

export const TeacherMonitoringPrintModal: React.FC<TeacherMonitoringPrintModalProps> = ({
  isOpen,
  onClose,
  summary,
  school,
}) => {
  if (!isOpen) return null;

  const { teacher } = summary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white text-black border border-border rounded-panel max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal Bar */}
        <div className="no-print flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-pine-600" />
            <span className="font-bold font-serif text-sm">
              Lembar Rekap Capaian & Evaluasi Perkembangan Guru (A4 Siap Cetak)
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
          {/* KOP SURAT RESMI SEKOLAH */}
          <div className="text-center border-b-2 border-black pb-4">
            <h2 className="text-lg font-bold uppercase tracking-wider">
              PEMERINTAH DAERAH PROVINSI / KABUPATEN
            </h2>
            <h1 className="text-xl font-black uppercase tracking-wide">
              {school.nama_sekolah}
            </h1>
            <p className="text-xs mt-1">
              {school.alamat} | NPSN: {school.npsn}
            </p>
            <p className="text-xs italic">
              Email: info@{school.nama_sekolah.toLowerCase().replace(/\s+/g, "")}.sch.id
            </p>
          </div>

          {/* JUDUL DOKUMEN */}
          <div className="text-center py-2">
            <h3 className="text-base font-bold uppercase tracking-wider underline">
              LEMBAR EVALUASI & CAPAIAN SUPERVISI AKADEMIK GURU
            </h3>
            <p className="text-xs font-mono mt-1">Semester: {school.semester_aktif}</p>
          </div>

          {/* IDENTITAS GURU */}
          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr>
                <td className="py-1 font-semibold w-36">Nama Guru</td>
                <td className="py-1 w-4">:</td>
                <td className="py-1 font-bold">{teacher.nama_lengkap}</td>
                <td className="py-1 font-semibold w-36">Status Kepegawaian</td>
                <td className="py-1 w-4">:</td>
                <td className="py-1">{teacher.status_kepegawaian}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">NIP / NUPTK</td>
                <td className="py-1">:</td>
                <td className="py-1 font-mono">{teacher.nip_nuptk}</td>
                <td className="py-1 font-semibold">Fase / Kelas</td>
                <td className="py-1">:</td>
                <td className="py-1">Fase {teacher.fase} ({teacher.kelas_diampu})</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">Mata Pelajaran</td>
                <td className="py-1">:</td>
                <td className="py-1">{teacher.mata_pelajaran}</td>
                <td className="py-1 font-semibold">Target Skor Sekolah</td>
                <td className="py-1">:</td>
                <td className="py-1 font-mono font-bold">{summary.target_skor}% (Baik)</td>
              </tr>
            </tbody>
          </table>

          {/* TABEL PERKEMBANGAN SESI OBSERVASI */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider">
              I. Rekapitulasi Sesi Observasi Kelas (Sheet 8)
            </h4>
            <table className="w-full text-xs border border-black border-collapse text-center">
              <thead>
                <tr className="bg-gray-100 border-b border-black font-bold">
                  <th className="border border-black p-2">Sesi</th>
                  <th className="border border-black p-2">Tanggal Pelaksanaan</th>
                  <th className="border border-black p-2">Total Skor (Max 112)</th>
                  <th className="border border-black p-2">Persentase (%)</th>
                  <th className="border border-black p-2">Predikat</th>
                  <th className="border border-black p-2">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 font-bold">Sesi 1</td>
                  <td className="border border-black p-2">{summary.sesi_1 ? formatTanggalIndonesia(summary.sesi_1.tanggal) : "-"}</td>
                  <td className="border border-black p-2 font-mono font-semibold">{summary.sesi_1 ? summary.sesi_1.skor : "-"}</td>
                  <td className="border border-black p-2 font-mono font-bold">{summary.sesi_1 ? `${summary.sesi_1.persentase}%` : "-"}</td>
                  <td className="border border-black p-2">{summary.sesi_1 ? summary.sesi_1.predikat : "Belum Dilaksanakan"}</td>
                  <td className="border border-black p-2 text-left text-[11px]">Observasi diagnostik awal</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold">Sesi 2</td>
                  <td className="border border-black p-2">{summary.sesi_2 ? formatTanggalIndonesia(summary.sesi_2.tanggal) : "-"}</td>
                  <td className="border border-black p-2 font-mono font-semibold">{summary.sesi_2 ? summary.sesi_2.skor : "-"}</td>
                  <td className="border border-black p-2 font-mono font-bold">{summary.sesi_2 ? `${summary.sesi_2.persentase}%` : "-"}</td>
                  <td className="border border-black p-2">{summary.sesi_2 ? summary.sesi_2.predikat : "Belum Dilaksanakan"}</td>
                  <td className="border border-black p-2 text-left text-[11px]">Observasi implementasi tindak lanjut</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold">Sesi 3</td>
                  <td className="border border-black p-2">{summary.sesi_3 ? formatTanggalIndonesia(summary.sesi_3.tanggal) : "-"}</td>
                  <td className="border border-black p-2 font-mono font-semibold">{summary.sesi_3 ? summary.sesi_3.skor : "-"}</td>
                  <td className="border border-black p-2 font-mono font-bold">{summary.sesi_3 ? `${summary.sesi_3.persentase}%` : "-"}</td>
                  <td className="border border-black p-2">{summary.sesi_3 ? summary.sesi_3.predikat : "Belum Dilaksanakan"}</td>
                  <td className="border border-black p-2 text-left text-[11px]">Observasi pemantapan kompetensi</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* HASIL EVALUASI & TREN */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider">
              II. Evaluasi Pencapaian Target & Analisis Tren (BR-07 & BR-08)
            </h4>
            <div className="p-3 border border-black rounded text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span>Skor Capaian Terakhir:</span>
                <span className="font-bold font-mono text-sm">
                  {summary.persentase_terbaru !== null ? `${summary.persentase_terbaru}% (${summary.predikat_terbaru})` : "Belum Ada Data"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Status Ketercapaian Target ({summary.target_skor}%):</span>
                <span className="font-bold uppercase">
                  {summary.status_target} {summary.selisih_target !== null ? `(${summary.selisih_target >= 0 ? "+" : ""}${summary.selisih_target}%)` : ""}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Dinamika Tren Perkembangan:</span>
                <span className="font-bold">
                  {summary.tren} {summary.perkembangan_poin !== null ? `(${summary.perkembangan_poin >= 0 ? "+" : ""}${summary.perkembangan_poin}% poin)` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* ANALISIS 5 ASPEK PEMBELAJARAN */}
          {summary.rata_aspek && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider">
                III. Analisis Rata-Rata Aspek Pembelajaran (Skala 1.00 - 4.00)
              </h4>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2 border border-black">
                  <p className="text-[10px] uppercase font-bold">A. Perencanaan</p>
                  <p className="font-mono font-bold text-sm mt-1">{summary.rata_aspek?.A != null ? summary.rata_aspek.A.toFixed(2) : "-"}</p>
                </div>
                <div className="p-2 border border-black">
                  <p className="text-[10px] uppercase font-bold">B. Pelaksanaan</p>
                  <p className="font-mono font-bold text-sm mt-1">{summary.rata_aspek?.B != null ? summary.rata_aspek.B.toFixed(2) : "-"}</p>
                </div>
                <div className="p-2 border border-black">
                  <p className="text-[10px] uppercase font-bold">C. Penilaian</p>
                  <p className="font-mono font-bold text-sm mt-1">{summary.rata_aspek?.C != null ? summary.rata_aspek.C.toFixed(2) : "-"}</p>
                </div>
                <div className="p-2 border border-black">
                  <p className="text-[10px] uppercase font-bold">D. Karakter</p>
                  <p className="font-mono font-bold text-sm mt-1">{summary.rata_aspek?.D != null ? summary.rata_aspek.D.toFixed(2) : "-"}</p>
                </div>
                <div className="p-2 border border-black">
                  <p className="text-[10px] uppercase font-bold">E. Iklim Kelas</p>
                  <p className="font-mono font-bold text-sm mt-1">{summary.rata_aspek?.E != null ? summary.rata_aspek.E.toFixed(2) : "-"}</p>
                </div>
              </div>
              <p className="text-xs text-gray-700 italic mt-1">
                Kelebihan utama: <span className="font-semibold text-black">{summary.aspek_tertinggi || "Kompetensi merata"}</span>.
                {summary.aspek_prioritas.length > 0 && (
                  <span> Aspek prioritas perbaikan (&lt; 3.00): <span className="font-semibold text-red-800">{summary.aspek_prioritas.join(", ")}</span>.</span>
                )}
              </p>
            </div>
          )}

          {/* REKAP TINDAK LANJUT */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider">
              IV. Realisasi Komitmen Tindak Lanjut (Sheet 9)
            </h4>
            <div className="p-3 border border-black rounded text-xs grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-[10px] text-gray-600">Total Kesepakatan</p>
                <p className="font-mono font-bold text-sm">{summary.total_rtl}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-600">Sedang Berjalan</p>
                <p className="font-mono font-bold text-sm text-blue-800">{summary.rtl_berjalan}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-600">Tuntas Diverifikasi</p>
                <p className="font-mono font-bold text-sm text-green-800">{summary.rtl_selesai}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-600">Lewat Tenggat</p>
                <p className="font-mono font-bold text-sm text-red-800">{summary.rtl_overdue}</p>
              </div>
            </div>
          </div>

          {/* TANDA TANGAN */}
          <div className="pt-8 grid grid-cols-2 text-xs">
            <div className="text-center">
              <p>Guru yang Disupervisi,</p>
              <div className="h-16" />
              <p className="font-bold underline">{teacher.nama_lengkap}</p>
              <p className="font-mono">NIP. {teacher.nip_nuptk}</p>
            </div>
            <div className="text-center">
              <p>
                {school.nama_sekolah.includes("Kota") ? "Kota" : "Kabupaten"},{" "}
                {formatTanggalIndonesia(new Date().toISOString().split("T")[0])}
              </p>
              <p>Kepala Sekolah / Supervisor,</p>
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

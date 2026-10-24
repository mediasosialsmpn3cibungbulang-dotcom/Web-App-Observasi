"use client";

import React from "react";
import { X, Printer } from "lucide-react";
import { Observation, ObservationScoreItem, Teacher, SchoolSettings } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
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
  if (!isOpen) return null;

  const scoreMap = new Map(scores.map((s) => [s.kode_indikator, s]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white text-black border border-border rounded-panel max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal Bar (Tidak ikut tercetak) */}
        <div className="no-print flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-primary" />
            <span className="font-bold font-serif text-sm">
              Pratinjau Lembar Observasi Kelas (A4 Siap Cetak)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-1.5" />
              Cetak Dokumen
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

        {/* Lembar Observasi A4 */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-6 font-serif text-black leading-relaxed print:p-0">
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
              LEMBAR OBSERVASI PEMBELAJARAN DI KELAS
            </h3>
            <p className="text-xs font-sans text-gray-600">
              Semester: {observation.semester} | Sesi Observasi ke-{observation.sesi_ke}
            </p>
          </div>

          {/* Identitas Observasi */}
          <div className="font-sans text-xs grid grid-cols-2 gap-4 border border-gray-300 p-3 rounded">
            <div className="space-y-1">
              <p><strong>Nama Guru:</strong> {teacher.nama_lengkap}</p>
              <p><strong>NIP / NUPTK:</strong> {teacher.nip_nuptk}</p>
              <p><strong>Mata Pelajaran:</strong> {teacher.mata_pelajaran} (Kelas {observation.kelas})</p>
            </div>
            <div className="space-y-1">
              <p><strong>Nama Supervisor:</strong> {school.nama_kepala_sekolah}</p>
              <p><strong>Tanggal Pelaksanaan:</strong> {formatTanggalIndonesia(observation.tanggal_observasi)}</p>
              <p><strong>Waktu / Kehadiran:</strong> {observation.jam_mulai} - {observation.jam_selesai} WIB ({observation.jumlah_siswa_hadir} Siswa Hadir)</p>
            </div>
          </div>

          {/* Tabel 28 Indikator */}
          <div className="font-sans text-[11px] space-y-2">
            <table className="w-full border-collapse border border-gray-300 text-left">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="border border-gray-300 p-1.5 w-10 text-center">Kode</th>
                  <th className="border border-gray-300 p-1.5">Indikator Pembelajaran yang Diamati</th>
                  <th className="border border-gray-300 p-1.5 w-12 text-center">Skor (1-4)</th>
                  <th className="border border-gray-300 p-1.5 w-60">Bukti Teramati / Catatan</th>
                </tr>
              </thead>
              <tbody>
                {(["A", "B", "C", "D", "E", "F", "G"] as const).map((aspek) => {
                  const indicators = SEED_INDICATORS.filter((ind) => ind.aspek === aspek);
                  const avg = metrics.aspectAverages[aspek];

                  return (
                    <React.Fragment key={aspek}>
                      <tr className="bg-gray-50 font-bold border-y border-gray-300">
                        <td colSpan={2} className="border border-gray-300 p-1.5 pl-3">
                          Aspek {aspek}: {ASPECT_NAMES[aspek]}
                        </td>
                        <td className="border border-gray-300 p-1.5 text-center font-mono">
                          {avg !== null && avg !== undefined ? avg.toFixed(2) : "-"}
                        </td>
                        <td className="border border-gray-300 p-1.5 text-gray-500 text-[10px]">
                          Rata-rata Aspek {aspek}
                        </td>
                      </tr>
                      {indicators.map((ind) => {
                        const item = scoreMap.get(ind.kode);
                        return (
                          <tr key={ind.kode}>
                            <td className="border border-gray-300 p-1.5 text-center font-mono font-bold">
                              {ind.kode}
                            </td>
                            <td className="border border-gray-300 p-1.5">{ind.pernyataan}</td>
                            <td className="border border-gray-300 p-1.5 text-center font-bold font-mono text-sm">
                              {item?.skor || "-"}
                            </td>
                            <td className="border border-gray-300 p-1.5 text-gray-700 text-[10px]">
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
          </div>

          {/* Rekap Nilai Akhir & Predikat */}
          <div className="font-sans text-xs border border-gray-300 p-3 rounded grid grid-cols-3 gap-3 text-center bg-gray-50">
            <div>
              <span className="text-gray-500 uppercase text-[10px] block font-semibold">Total Skor</span>
              <span className="text-lg font-bold font-mono">{metrics.totalScore || "-"} / 112</span>
            </div>
            <div>
              <span className="text-gray-500 uppercase text-[10px] block font-semibold">Nilai Ketercapaian</span>
              <span className="text-lg font-bold font-mono text-primary">
                {metrics.percentage !== null ? `${metrics.percentage.toFixed(1)}%` : "-"}
              </span>
            </div>
            <div>
              <span className="text-gray-500 uppercase text-[10px] block font-semibold">Predikat Kelulusan</span>
              <span className="text-lg font-bold">{metrics.predikat || "-"}</span>
            </div>
          </div>

          {/* Aspek Prioritas & Catatan Umum */}
          <div className="font-sans text-xs space-y-1">
            <p>
              <strong>Aspek Prioritas Pengembangan:</strong>{" "}
              {metrics.priorityAspect
                ? `Aspek ${metrics.priorityAspect} (${ASPECT_NAMES[metrics.priorityAspect]})`
                : "-"}
            </p>
            {observation.catatan_umum && (
              <p>
                <strong>Catatan Umum Supervisor:</strong> {observation.catatan_umum}
              </p>
            )}
          </div>

          {/* Tanda Tangan */}
          <div className="font-sans text-xs pt-8 grid grid-cols-2 gap-8 text-center break-inside-avoid">
            <div>
              <p className="text-gray-600 mb-16">Guru yang Diobservasi,</p>
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

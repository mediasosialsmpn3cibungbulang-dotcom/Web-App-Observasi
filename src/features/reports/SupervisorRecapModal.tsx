"use client";

import React, { useEffect } from "react";
import { X, Printer, FileText } from "lucide-react";
import { TeacherMonitoringSummary } from "../monitoring/monitoring-service";
import { SchoolSettings } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
import { PrintPortal } from "@/components/ui/PrintPortal";
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
  // Listener tombol Escape untuk menutup modal
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

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

  const namaPengawas = school.nama_pengawas || "Drs. H. Bambang Sujatmiko, M.M.";
  const nipPengawas = school.nip_pengawas || "196803121994121002";
  const tanggalHariIni = formatTanggalIndonesia(new Date().toISOString().split("T")[0]);

  return (
    <PrintPortal>
      {/* Backdrop Gelap: Klik luar untuk menutup */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs select-none"
        onClick={onClose}
      >
        <div
          className="bg-gray-100 rounded-2xl w-full max-w-[880px] max-h-[96vh] flex flex-col shadow-2xl overflow-hidden print:block print:bg-white print:rounded-none print:shadow-none print:max-w-none"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau Rekapitulasi Supervisi Pengawas"
        >
          {/* Header Modal Bar (Tidak ikut tercetak) */}
          <div className="no-print flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-5 h-5 text-pine-600 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">
                  Rekapitulasi Supervisi Akademik untuk Pengawas Pembina (Sheet 10 &amp; 11)
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  Tepat 2 Lembar A4 &middot; Logo Resmi SMPN 3 Cibungbulang &middot; Pas Tanpa Terpotong &middot; Tekan Esc untuk menutup
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="primary" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1.5" />
                Cetak Dokumen Resmi
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

          {/* Area Preview Lembaran A4 (2 Lembar Terpisah) */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-6 print:space-y-0 print:p-0">

            {/* ======================================================== */}
            {/* LEMBAR 1: REKAPITULASI CAPAIAN NILAI & PREDIKAT (SHEET 10) */}
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

                {/* Judul Dokumen Sheet 10 */}
                <div className="text-center space-y-0.5 pt-0.5">
                  <h3 className="font-serif text-xs font-bold uppercase tracking-wide underline text-black">
                    REKAPITULASI HASIL OBSERVASI PEMBELAJARAN DAN COACHING GURU
                  </h3>
                  <p className="text-[10px] text-gray-800 font-sans">
                    Format Pelaporan Pengawas Pembina Sekolah &nbsp;|&nbsp; <strong>Dokumen Sheet 10</strong>
                  </p>
                  <p className="text-[9px] font-mono text-gray-700">
                    Semester: {school.semester_aktif} &nbsp;&mdash;&nbsp; Tahun Ajaran 2026/2027
                  </p>
                </div>

                {/* Statistik Ringkas Mutu Sekolah */}
                <div className="grid grid-cols-4 gap-2 py-1 px-1.5 border border-black text-center text-[9px]">
                  <div>
                    <span className="text-[8px] uppercase font-bold text-gray-600">Total Sasaran</span>
                    <p className="font-bold font-mono text-[11px] mt-0.5 text-black">{totalGuru} Guru</p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-bold text-gray-600">Tuntas Supervisi</span>
                    <p className="font-bold font-mono text-[11px] mt-0.5 text-black">
                      {guruSelesai} Guru ({totalGuru > 0 ? Math.round((guruSelesai / totalGuru) * 100) : 0}%)
                    </p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-bold text-gray-600">Rata-Rata Capaian</span>
                    <p className="font-bold font-mono text-[11px] mt-0.5 text-black">{rataRataSekolah}%</p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-bold text-gray-600">Predikat Mutu Sekolah</span>
                    <p className="font-bold text-[11px] mt-0.5 text-black">
                      {rataRataSekolah >= 90 ? "Amat Baik" : rataRataSekolah >= 75 ? "Baik" : "Cukup"}
                    </p>
                  </div>
                </div>

                {/* Tabel Rekap Guru (Sheet 10) */}
                <div className="space-y-0.5">
                  <h4 className="font-serif font-bold text-[9px] uppercase text-black">
                    Tabel 1: Rekapitulasi Capaian Nilai dan Predikat per Guru
                  </h4>
                  <table className="w-full text-[8px] border border-black border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-100 border-b border-black text-center font-bold">
                        <th className="border border-black py-0.5 px-1 w-5">No</th>
                        <th className="border border-black py-0.5 px-1 text-left">Nama Guru &amp; NIP/NUPTK</th>
                        <th className="border border-black py-0.5 px-1 text-left w-24">Mata Pelajaran</th>
                        <th className="border border-black py-0.5 px-0.5 w-12">Kelas</th>
                        <th className="border border-black py-0.5 px-0.5 w-11">Skor (112)</th>
                        <th className="border border-black py-0.5 px-0.5 w-11">Nilai (%)</th>
                        <th className="border border-black py-0.5 px-0.5 w-14">Predikat</th>
                        <th className="border border-black py-0.5 px-0.5 w-14 text-center">Status RTL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaries.map((s, idx) => (
                        <tr key={s.teacher.id} className="border-b border-gray-300">
                          <td className="border border-black py-0.5 px-1 text-center font-mono">{idx + 1}</td>
                          <td className="border border-black py-0.5 px-1 leading-tight">
                            <span className="font-semibold">{s.teacher.nama_lengkap}</span>
                            {s.teacher.nip_nuptk ? (
                              <span className="text-[7.5px] text-gray-600 font-mono ml-1">
                                ({s.teacher.nip_nuptk})
                              </span>
                            ) : null}
                          </td>
                          <td className="border border-black py-0.5 px-1 leading-tight">{s.teacher.mata_pelajaran}</td>
                          <td className="border border-black py-0.5 px-0.5 text-center text-[7.5px]">{s.teacher.kelas_diampu}</td>
                          <td className="border border-black py-0.5 px-0.5 text-center font-mono font-medium">
                            {s.skor_terbaru !== null ? s.skor_terbaru : "-"}
                          </td>
                          <td className="border border-black py-0.5 px-0.5 text-center font-mono font-bold">
                            {s.persentase_terbaru !== null ? `${s.persentase_terbaru}%` : "-"}
                          </td>
                          <td className="border border-black py-0.5 px-0.5 text-center font-medium">
                            {s.predikat_terbaru || "Belum Selesai"}
                          </td>
                          <td className="border border-black py-0.5 px-0.5 text-center font-mono text-[7.5px]">
                            {s.rtl_selesai}/{s.total_rtl} Tuntas
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tanda Tangan Pengesahan Sheet 10 */}
              <div className="space-y-1.5 pt-1.5">
                <div className="grid grid-cols-2 text-[9.5px]">
                  <div className="text-center">
                    <p>Mengetahui,</p>
                    <p className="font-semibold">Pengawas Pembina Sekolah,</p>
                    <div className="h-10" />
                    <p className="font-bold underline text-black">{namaPengawas}</p>
                    <p className="font-mono text-[8.5px]">NIP. {nipPengawas}</p>
                  </div>
                  <div className="text-center">
                    <p>Kabupaten Bogor, {tanggalHariIni}</p>
                    <p className="font-semibold">Kepala {school.nama_sekolah},</p>
                    <div className="h-10" />
                    <p className="font-bold underline text-black">{school.nama_kepala_sekolah}</p>
                    <p className="font-mono text-[8.5px]">NIP. {school.nip_kepala_sekolah}</p>
                  </div>
                </div>

                {/* Catatan Kaki Lembar 1 */}
                <div className="pt-1 border-t border-black/30 flex justify-between text-[8.5px] text-gray-600 font-sans">
                  <span>Dokumen Pengawas Pembina &middot; Format Sheet 10</span>
                  <span>Lembar 1 dari 2 &middot; {school.nama_sekolah}</span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* LEMBAR 2: ANALISIS 5 ASPEK PEMBELAJARAN (SHEET 11)        */}
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

                {/* Judul Dokumen Sheet 11 */}
                <div className="text-center space-y-0.5 pt-0.5">
                  <h3 className="font-serif text-xs font-bold uppercase tracking-wide underline text-black">
                    ANALISIS KETERCAPAIAN 5 ASPEK PEMBELAJARAN DAN REKOMENDASI PRIORITAS
                  </h3>
                  <p className="text-[10px] text-gray-800 font-sans">
                    Format Pelaporan Pengawas Pembina Sekolah &nbsp;|&nbsp; <strong>Dokumen Sheet 11</strong>
                  </p>
                  <p className="text-[9px] font-mono text-gray-700">
                    Semester: {school.semester_aktif} &nbsp;&mdash;&nbsp; Tahun Ajaran 2026/2027
                  </p>
                </div>

                <div className="p-1 border border-black text-center text-[8.5px] text-gray-800 bg-gray-50/50">
                  <p>
                    <strong>Standar Penilaian:</strong> Skala 1.00 s.d. 4.00 &nbsp;|&nbsp; 
                    <strong>Kriteria Pembinaan Khusus:</strong> Rata-Rata Aspek &lt; 3.00 &nbsp;|&nbsp; 
                    <strong>Aspek:</strong> A (Perencanaan), B (Pelaksanaan), C (Penilaian), D (Karakter), E (Iklim Kelas)
                  </p>
                </div>

                {/* Tabel Analisis 5 Aspek (Sheet 11) */}
                <div className="space-y-0.5">
                  <h4 className="font-serif font-bold text-[9px] uppercase text-black">
                    Tabel 2: Analisis Rata-Rata 5 Aspek Rubrik Pembelajaran per Guru
                  </h4>
                  <table className="w-full text-[8px] border border-black border-collapse text-center">
                    <thead>
                      <tr className="bg-gray-100 border-b border-black font-bold">
                        <th className="border border-black py-0.5 px-1 w-5">No</th>
                        <th className="border border-black py-0.5 px-1 text-left">Nama Guru &amp; NIP/NUPTK</th>
                        <th className="border border-black py-0.5 px-0.5 w-12">A. Perenc.</th>
                        <th className="border border-black py-0.5 px-0.5 w-12">B. Pelaks.</th>
                        <th className="border border-black py-0.5 px-0.5 w-12">C. Penilai.</th>
                        <th className="border border-black py-0.5 px-0.5 w-12">D. Karakter</th>
                        <th className="border border-black py-0.5 px-0.5 w-12">E. Iklim</th>
                        <th className="border border-black py-0.5 px-1 text-left w-32">Aspek Prioritas (&lt; 3.00)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaries.map((s, idx) => (
                        <tr key={s.teacher.id} className="border-b border-gray-300">
                          <td className="border border-black py-0.5 px-1 text-center font-mono">{idx + 1}</td>
                          <td className="border border-black py-0.5 px-1 text-left leading-tight">
                            <span className="font-semibold">{s.teacher.nama_lengkap}</span>
                            {s.teacher.nip_nuptk ? (
                              <span className="text-[7.5px] text-gray-600 font-mono ml-1">
                                ({s.teacher.nip_nuptk})
                              </span>
                            ) : null}
                          </td>
                          <td className="border border-black py-0.5 px-0.5 font-mono font-medium">
                            {s.rata_aspek?.A != null ? s.rata_aspek.A.toFixed(2) : "-"}
                          </td>
                          <td className="border border-black py-0.5 px-0.5 font-mono font-medium">
                            {s.rata_aspek?.B != null ? s.rata_aspek.B.toFixed(2) : "-"}
                          </td>
                          <td className="border border-black py-0.5 px-0.5 font-mono font-medium">
                            {s.rata_aspek?.C != null ? s.rata_aspek.C.toFixed(2) : "-"}
                          </td>
                          <td className="border border-black py-0.5 px-0.5 font-mono font-medium">
                            {s.rata_aspek?.D != null ? s.rata_aspek.D.toFixed(2) : "-"}
                          </td>
                          <td className="border border-black py-0.5 px-0.5 font-mono font-medium">
                            {s.rata_aspek?.E != null ? s.rata_aspek.E.toFixed(2) : "-"}
                          </td>
                          <td className="border border-black py-0.5 px-1 text-left text-[7.5px] leading-tight">
                            {s.aspek_prioritas.length > 0 ? (
                              <span className="font-bold text-black underline">
                                Aspek {s.aspek_prioritas.join(", ")}
                              </span>
                            ) : (
                              <span className="text-gray-700">Tuntas (&ge; 3.00)</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tanda Tangan Pengesahan Sheet 11 */}
              <div className="space-y-1.5 pt-1.5">
                <div className="grid grid-cols-2 text-[9.5px]">
                  <div className="text-center">
                    <p>Mengetahui,</p>
                    <p className="font-semibold">Pengawas Pembina Sekolah,</p>
                    <div className="h-10" />
                    <p className="font-bold underline text-black">{namaPengawas}</p>
                    <p className="font-mono text-[8.5px]">NIP. {nipPengawas}</p>
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
                  <span>Dokumen Pengawas Pembina &middot; Format Sheet 11</span>
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

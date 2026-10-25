"use client";

import React from "react";
import { X, Printer, Award, BookOpen, CheckCircle2 } from "lucide-react";
import { TeacherMonitoringSummary } from "../monitoring/monitoring-service";
import { SchoolSettings } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
import { PrintPortal } from "@/components/ui/PrintPortal";
import { formatTanggalIndonesia } from "@/lib/utils";

interface OfficialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaries: TeacherMonitoringSummary[];
  school: SchoolSettings;
}

export const OfficialReportModal: React.FC<OfficialReportModalProps> = ({
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

  const countAmatBaik = summaries.filter((s) => s.predikat_terbaru === "Amat Baik").length;
  const countBaik = summaries.filter((s) => s.predikat_terbaru === "Baik").length;
  const countCukup = summaries.filter((s) => s.predikat_terbaru === "Cukup").length;
  const countPerlu = summaries.filter((s) => s.predikat_terbaru === "Perlu Pembinaan").length;

  return (
    <PrintPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:z-auto print:block print:overflow-visible">
      <div className="bg-white text-black border border-border rounded-panel max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:rounded-none print:max-w-none print:w-full print:max-h-none print:h-auto print:overflow-visible print:m-0 print:p-0">
        {/* Header Modal Bar */}
        <div className="no-print flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-pine-600" />
            <span className="font-bold font-serif text-sm">
              Laporan Pelaksanaan Supervisi Akademik Lengkap (Bab I s.d. IV Siap Cetak A4)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-1.5" />
              Cetak Dokumen Resmi
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
        <div
          id="printable-area"
          className="print-document print-area flex-1 overflow-y-auto p-8 md:p-14 space-y-8 text-black bg-white leading-relaxed print:p-0 print:m-0 print:overflow-visible print:h-auto print:max-h-none"
        >
          {/* HALAMAN JUDUL / COVER RESMI */}
          <div className="text-center py-12 border-b-2 border-black min-h-[400px] flex flex-col justify-between">
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider">
                LAPORAN PELAKSANAAN SUPERVISI AKADEMIK DAN COACHING GURU
              </h1>
              <p className="text-sm font-semibold tracking-wide">
                PENDEKATAN KLINIS REFLEKTIF BERBASIS KURIKULUM MERDEKA
              </p>
              <p className="text-xs font-mono">SEMESTER: {school.semester_aktif.toUpperCase()}</p>
            </div>

            <div className="my-8">
              <div className="w-20 h-20 mx-auto rounded-full border-2 border-black flex items-center justify-center font-bold text-2xl font-serif">
                LOGO
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-sm uppercase">{school.nama_sekolah}</p>
              <p>{school.alamat}</p>
              <p className="font-mono">NPSN: {school.npsn}</p>
              <p className="font-semibold pt-2">TAHUN AJARAN 2026/2027</p>
            </div>
          </div>

          {/* HALAMAN PENGESAHAN */}
          <div className="space-y-6 pt-6 page-break">
            <h2 className="text-center text-sm font-bold uppercase tracking-wider underline">
              LEMBAR PENGESAHAN
            </h2>
            <p className="text-xs text-justify">
              Laporan Pelaksanaan Supervisi Akademik dan Coaching Guru Semester {school.semester_aktif} pada {school.nama_sekolah} telah disusun dan disahkan sebagai dokumen pertanggungjawaban penjaminan mutu proses pembelajaran internal sekolah.
            </p>

            <div className="pt-8 grid grid-cols-2 text-xs">
              <div className="text-center">
                <p>Mengetahui,</p>
                <p>Pengawas Pembina Sekolah,</p>
                <div className="h-20" />
                <p className="font-bold underline">Drs. H. Mulyadi, M.Pd.</p>
                <p className="font-mono">NIP. 19680512 199303 1 004</p>
              </div>
              <div className="text-center">
                <p>
                  Disahkan di: {school.nama_sekolah.includes("Kota") ? "Kota" : "Kabupaten"}
                </p>
                <p>Pada Tanggal: {formatTanggalIndonesia(new Date().toISOString().split("T")[0])}</p>
                <p>Kepala {school.nama_sekolah},</p>
                <div className="h-20" />
                <p className="font-bold underline">{school.nama_kepala_sekolah}</p>
                <p className="font-mono">NIP. {school.nip_kepala_sekolah}</p>
              </div>
            </div>
          </div>

          {/* BAB I: PENDAHULUAN */}
          <div className="space-y-3 pt-6 border-t border-black page-break">
            <h3 className="text-sm font-bold uppercase tracking-wider">
              BAB I: PENDAHULUAN
            </h3>
            <div className="space-y-2 text-xs text-justify">
              <p>
                <strong>1.1 Latar Belakang:</strong> Supervisi akademik merupakan serangkaian kegiatan membantu guru mengembangkan kemampuannya mengelola proses pembelajaran demi mencapai tujuan pembelajaran. Melalui pendekatan coaching klinis berbasis Kurikulum Merdeka, supervisi dilaksanakan secara kolaboratif tanpa menghakimi, berpusat pada pemberdayaan potensi guru.
              </p>
              <p>
                <strong>1.2 Landasan Hukum:</strong> Permendikbudristek No. 40 Tahun 2021 tentang Penugasan Guru sebagai Kepala Sekolah, Perdirjen GTK No. 2626/B/HK.04.01/2023 tentang Model Kompetensi Guru, serta panduan Kurikulum Merdeka.
              </p>
              <p>
                <strong>1.3 Tujuan:</strong> Mengukur dan memetakan mutu pembelajaran di kelas, mendampingi guru dalam merancang diferensiasi instruksional, serta menyusun rencana aksi tindak lanjut (RTL) yang terukur dan berkelanjutan.
              </p>
            </div>
          </div>

          {/* BAB II: PELAKSANAAN */}
          <div className="space-y-3 pt-6 border-t border-black">
            <h3 className="text-sm font-bold uppercase tracking-wider">
              BAB II: PELAKSANAAN SUPERVISI AKADEMIK
            </h3>
            <div className="space-y-2 text-xs text-justify">
              <p>
                <strong>2.1 Waktu dan Sasaran:</strong> Pelaksanaan supervisi dilaksanakan pada rentang semester {school.semester_aktif} dengan total sasaran sebanyak {totalGuru} guru aktif dari berbagai rumpun mata pelajaran.
              </p>
              <p>
                <strong>2.2 Siklus 3 Tahap Pelaksanaan:</strong>
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li><strong>Pra-Observasi (Refleksi Awal):</strong> Wawancara dialogis minimal H-5 sebelum observasi kelas guna menyepakati target fokus pembelajaran, modul ajar, dan strategi diferensiasi.</li>
                <li><strong>Observasi Kelas (Pencatatan Fakta):</strong> Pengamatan langsung dengan 28 butir indikator baku (4 level rubrik) dan catatan fakta verbatim bebas asumsi.</li>
                <li><strong>Pasca-Observasi & Coaching Klinis:</strong> Wawancara reflektif terstruktur maksimal H+3 berpandukan 5 fase coaching (Pembukaan, Refleksi, Analisis Bukti, Rencana Aksi, Penutup Komitmen).</li>
              </ol>
            </div>
          </div>

          {/* BAB III: HASIL DAN EVALUASI */}
          <div className="space-y-3 pt-6 border-t border-black page-break">
            <h3 className="text-sm font-bold uppercase tracking-wider">
              BAB III: HASIL EVALUASI DAN ANALISIS MUTU
            </h3>
            <div className="space-y-3 text-xs text-justify">
              <p>
                Berdasarkan data observasi kelas yang telah divalidasi, diperoleh capaian mutu pembelajaran sekolah sebagai berikut:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Total Guru Sasaran: <strong>{totalGuru} orang</strong>.</li>
                <li>Guru Selesai 3 Tahap Supervisi Lengkap: <strong>{guruSelesai} orang ({totalGuru > 0 ? Math.round((guruSelesai / totalGuru) * 100) : 0}%)</strong>.</li>
                <li>Rata-rata Nilai Observasi Sekolah: <strong>{rataRataSekolah}%</strong> dengan predikat mutu umum <strong>{rataRataSekolah >= 90 ? "Amat Baik" : rataRataSekolah >= 75 ? "Baik" : "Cukup"}</strong>.</li>
                <li>Sebaran Predikat: Amat Baik ({countAmatBaik} guru), Baik ({countBaik} guru), Cukup ({countCukup} guru), Perlu Pembinaan ({countPerlu} guru).</li>
              </ul>

              <h4 className="font-bold text-xs uppercase pt-2">Ringkasan Nilai dan Predikat Guru:</h4>
              <table className="w-full text-xs border border-black border-collapse text-left">
                <thead>
                  <tr className="bg-gray-100 font-bold border-b border-black text-center">
                    <th className="border border-black p-1.5 w-8">No</th>
                    <th className="border border-black p-1.5">Nama Guru</th>
                    <th className="border border-black p-1.5">Mata Pelajaran</th>
                    <th className="border border-black p-1.5 w-16">Nilai (%)</th>
                    <th className="border border-black p-1.5 w-24">Predikat</th>
                    <th className="border border-black p-1.5">Keterangan RTL</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.map((s, idx) => (
                    <tr key={s.teacher.id} className="border-b border-black">
                      <td className="border border-black p-1.5 text-center font-mono">{idx + 1}</td>
                      <td className="border border-black p-1.5 font-semibold">{s.teacher.nama_lengkap}</td>
                      <td className="border border-black p-1.5">{s.teacher.mata_pelajaran}</td>
                      <td className="border border-black p-1.5 text-center font-mono font-bold">
                        {s.persentase_terbaru !== null ? `${s.persentase_terbaru}%` : "-"}
                      </td>
                      <td className="border border-black p-1.5 text-center">{s.predikat_terbaru || "Belum Final"}</td>
                      <td className="border border-black p-1.5 text-xs">
                        {s.rtl_selesai > 0 ? `${s.rtl_selesai} butir RTL diselesaikan` : "Dalam pemantauan"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* BAB IV: KESIMPULAN DAN REKOMENDASI */}
          <div className="space-y-3 pt-6 border-t border-black page-break">
            <h3 className="text-sm font-bold uppercase tracking-wider">
              BAB IV: KESIMPULAN DAN REKOMENDASI
            </h3>
            <div className="space-y-2 text-xs text-justify">
              <p>
                <strong>4.1 Kesimpulan:</strong>
                Siklus supervisi akademik semester ini telah berhasil dilaksanakan dengan pendekatan coaching yang membangun kemandirian guru. Secara umum guru telah menerapkan prinsip pembelajaran bermakna dan manajemen kelas yang kondusif.
              </p>
              <p>
                <strong>4.2 Rekomendasi:</strong>
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Bagi guru dengan aspek diferensiasi dan asesmen formatif sebagai prioritas, direkomendasikan mengikuti pengimbasan modul ajar pada komunitas belajar (Kombel) internal MGMP sekolah.</li>
                <li>Kepala sekolah memfasilitasi kebutuhan sarana pendukung yang telah disepakati dalam lembar RTL secara berkala.</li>
                <li>Melakukan pemantauan tindak lanjut (cek-in pekan ke-2, 4, 8/9) untuk memastikan seluruh kesepakatan terealisasi tuntas sebelum akhir tahun ajaran.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PrintPortal>
  );
};

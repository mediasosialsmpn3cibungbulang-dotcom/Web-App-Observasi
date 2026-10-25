"use client";

import React, { useEffect } from "react";
import { X, Printer, BookOpen } from "lucide-react";
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

/**
 * Lambang Pendidikan Tut Wuri Handayani SVG Presisi Monokrom Kedinasan
 */
function TutWuriHandayaniIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Lambang Tut Wuri Handayani"
    >
      {/* Bingkai Segi Lima Luar & Dalam */}
      <polygon
        points="50,4 96,38 78,92 22,92 4,38"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <polygon
        points="50,9 91,40 75,88 25,88 9,40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      {/* Sayap Kiri */}
      <path
        d="M26,48 C32,44 42,46 45,54 C40,56 34,58 26,48 Z"
        fill="currentColor"
      />
      <path
        d="M22,56 C30,54 40,56 44,64 C38,66 30,66 22,56 Z"
        fill="currentColor"
      />
      {/* Sayap Kanan */}
      <path
        d="M74,48 C68,44 58,46 55,54 C60,56 66,58 74,48 Z"
        fill="currentColor"
      />
      <path
        d="M78,56 C70,54 60,56 56,64 C62,66 70,66 78,56 Z"
        fill="currentColor"
      />
      {/* Obor / Nyala Api */}
      <path
        d="M50,22 C53,28 56,32 54,38 C52,43 48,43 46,38 C44,32 47,28 50,22 Z"
        fill="currentColor"
      />
      <path
        d="M48,39 L52,39 L53,49 L47,49 Z"
        fill="currentColor"
      />
      {/* Buku Terbuka di Bagian Bawah */}
      <path
        d="M50,68 C44,64 34,64 26,67 L26,76 C34,73 44,73 50,77 C56,73 66,73 74,76 L74,67 C66,64 56,64 50,68 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line x1="50" y1="68" x2="50" y2="77" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export const OfficialReportModal: React.FC<OfficialReportModalProps> = ({
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

  const countAmatBaik = summaries.filter((s) => s.predikat_terbaru === "Amat Baik").length;
  const countBaik = summaries.filter((s) => s.predikat_terbaru === "Baik").length;
  const countCukup = summaries.filter((s) => s.predikat_terbaru === "Cukup").length;
  const countPerlu = summaries.filter((s) => s.predikat_terbaru === "Perlu Pembinaan").length;

  const namaPengawas = school.nama_pengawas || "Drs. H. Bambang Sujatmiko, M.M.";
  const nipPengawas = school.nip_pengawas || "196803121994121002";
  const tanggalHariIni = formatTanggalIndonesia(new Date().toISOString().split("T")[0]);

  return (
    <PrintPortal>
      {/* Backdrop Gelap */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs select-none"
        onClick={onClose}
      >
        <div
          className="bg-gray-100 rounded-2xl w-full max-w-[880px] max-h-[94vh] flex flex-col shadow-2xl overflow-hidden print:block print:bg-white print:rounded-none print:shadow-none print:max-w-none"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Laporan Supervisi Akademik Lengkap"
        >
          {/* Header Modal Bar (Tidak ikut dicetak) */}
          <div className="no-print flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-5 h-5 text-pine-600 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">
                  Laporan Pelaksanaan Supervisi Akademik Lengkap (Bab I s.d. IV)
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  Format A4 Resmi (4 Lembar Terpisah) · Standar Kedinasan · Tekan Esc untuk menutup
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

          {/* Area Preview Lembaran A4 (4 Lembar Mandiri) */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6 print:space-y-0 print:p-0">

            {/* ======================================================== */}
            {/* LEMBAR 1: HALAMAN JUDUL & COVER RESMI DOKUMEN LAPORAN */}
            {/* ======================================================== */}
            <div className="print-document mx-auto bg-white text-black shadow-md print:shadow-none w-full max-w-[794px] min-h-[1050px] p-8 sm:p-12 font-sans leading-relaxed flex flex-col justify-between border print:border-none border-gray-300">
              <div className="border-2 border-black p-8 sm:p-12 flex flex-col justify-between h-full text-center">
                {/* Bagian Atas Sampul */}
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-black">
                    Pemerintah Daerah Kabupaten Bogor &nbsp;·&nbsp; Dinas Pendidikan
                  </p>
                  <p className="text-base font-serif font-extrabold uppercase tracking-wider text-black">
                    {school.nama_sekolah}
                  </p>
                  <div className="flex justify-center pt-3 pb-2">
                    <TutWuriHandayaniIcon className="w-20 h-20 text-black" />
                  </div>
                </div>

                {/* Bagian Tengah Sampul: Judul Dokumen */}
                <div className="space-y-4 my-auto py-6">
                  <div className="w-24 h-0.5 bg-black mx-auto" />
                  <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase tracking-wide leading-tight text-black">
                    LAPORAN PELAKSANAAN
                    <br />
                    SUPERVISI AKADEMIK &amp; COACHING GURU
                  </h1>
                  <p className="text-xs sm:text-sm font-sans font-semibold tracking-wide text-gray-800 max-w-lg mx-auto">
                    Pendekatan Kolaboratif Berbasis Siklus Reflektif Klinis Kurikulum Merdeka
                  </p>
                  <div className="inline-block border-y-2 border-black py-2 px-6 my-2">
                    <p className="text-xs sm:text-sm font-mono font-bold tracking-widest uppercase">
                      SEMESTER {school.semester_aktif.toUpperCase()} &nbsp;—&nbsp; TAHUN AJARAN 2026/2027
                    </p>
                  </div>
                  <p className="text-[11px] text-gray-700 font-sans max-w-md mx-auto italic">
                    Dokumen Akuntabilitas dan Penjaminan Mutu Proses Pembelajaran Internal Satuan Pendidikan
                  </p>
                  <div className="w-24 h-0.5 bg-black mx-auto" />
                </div>

                {/* Bagian Bawah Sampul: Identitas Satuan Pendidikan */}
                <div className="space-y-1.5 pt-4 text-xs">
                  <p className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">Disusun Oleh:</p>
                  <p className="font-serif font-bold text-sm uppercase text-black">
                    Tim Penjaminan Mutu &amp; Supervisi Pembelajaran
                  </p>
                  <p className="font-bold uppercase tracking-wide text-black">
                    {school.nama_sekolah}
                  </p>
                  <p className="text-[11px] text-gray-800">
                    {school.alamat} &nbsp;|&nbsp; NPSN: <span className="font-mono">{school.npsn}</span>
                  </p>
                  <p className="text-[11px] font-semibold text-gray-900 pt-1">
                    Kabupaten Bogor — Provinsi Jawa Barat
                  </p>
                  <p className="text-[11px] font-mono font-bold text-black">
                    Tahun 2026
                  </p>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* LEMBAR 2: PENGESAHAN RESMI, BAB I, & BAB II */}
            {/* ======================================================== */}
            <div className="print-document mx-auto bg-white text-black shadow-md print:shadow-none w-full max-w-[794px] min-h-[1050px] p-8 sm:p-12 font-sans text-[11px] leading-relaxed flex flex-col justify-between border print:border-none border-gray-300">
              <div className="space-y-3">
                {/* Kop Surat Resmi */}
                <div className="text-center border-b-[3px] border-double border-black pb-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-black">
                    Pemerintah Daerah Kabupaten Bogor &nbsp;·&nbsp; Dinas Pendidikan
                  </p>
                  <p className="font-serif text-[16px] font-bold uppercase tracking-wide leading-tight text-black mt-0.5">
                    {school.nama_sekolah}
                  </p>
                  <p className="text-[10px] text-gray-700 mt-0.5 font-sans">
                    {school.alamat} &nbsp;|&nbsp; NPSN: {school.npsn}
                  </p>
                </div>

                {/* Lembar Pengesahan */}
                <div className="space-y-2 pt-1">
                  <h2 className="text-center text-xs font-serif font-bold uppercase tracking-wider underline text-black">
                    LEMBAR PENGESAHAN LAPORAN SUPERVISI AKADEMIK
                  </h2>
                  <p className="text-[10.5px] text-justify leading-relaxed text-gray-900">
                    Laporan Pelaksanaan Supervisi Akademik dan Pendampingan Coaching Klinis Guru Semester {school.semester_aktif} Tahun Ajaran 2026/2027 pada {school.nama_sekolah} telah disusun secara kolaboratif, diverifikasi, dan disahkan sebagai dokumen pertanggungjawaban penjaminan mutu proses pembelajaran internal sekolah.
                  </p>

                  <div className="pt-3 grid grid-cols-2 text-[10.5px]">
                    <div className="text-center">
                      <p>Mengetahui,</p>
                      <p className="font-semibold">Pengawas Pembina Sekolah,</p>
                      <div className="h-14" />
                      <p className="font-bold underline text-black">{namaPengawas}</p>
                      <p className="font-mono text-[10px]">NIP. {nipPengawas}</p>
                    </div>
                    <div className="text-center">
                      <p>
                        Disahkan di: Kabupaten Bogor
                      </p>
                      <p>Pada Tanggal: {tanggalHariIni}</p>
                      <p className="font-semibold">Kepala {school.nama_sekolah},</p>
                      <div className="h-14" />
                      <p className="font-bold underline text-black">{school.nama_kepala_sekolah}</p>
                      <p className="font-mono text-[10px]">NIP. {school.nip_kepala_sekolah}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-black my-2" />

                {/* BAB I: Pendahuluan */}
                <div className="space-y-1.5 text-[10.5px]">
                  <h3 className="font-serif font-bold uppercase tracking-wide text-xs text-black">
                    BAB I: PENDAHULUAN
                  </h3>
                  <div className="space-y-1 text-justify text-gray-900 leading-normal">
                    <p>
                      <strong>1.1 Latar Belakang:</strong> Supervisi akademik merupakan serangkaian proses sistematis dan berkesinambungan untuk memberdayakan guru mengembangkan kompetensi pedagogik serta pengelolaan kelas yang berpusat pada peserta didik. Pendekatan coaching klinis Kurikulum Merdeka menitikberatkan pada kemitraan dialogis, apresiasi praktik baik, dan refleksi mandiri bebas asumsi.
                    </p>
                    <p>
                      <strong>1.2 Landasan Hukum:</strong> Permendikbudristek No. 40 Tahun 2021 tentang Penugasan Guru sebagai Kepala Sekolah, Perdirjen GTK No. 2626/B/HK.04.01/2023 tentang Model Kompetensi Guru, dan panduan implementasi Kurikulum Merdeka.
                    </p>
                    <p>
                      <strong>1.3 Tujuan:</strong> Memetakan mutu pembelajaran riil, mengawal diferensiasi instruksional, serta mengesahkan Rencana Tindak Lanjut (RTL) yang berdampak langsung pada murid.
                    </p>
                  </div>
                </div>

                <div className="border-t border-black/40 my-2" />

                {/* BAB II: Pelaksanaan */}
                <div className="space-y-1.5 text-[10.5px]">
                  <h3 className="font-serif font-bold uppercase tracking-wide text-xs text-black">
                    BAB II: PELAKSANAAN SUPERVISI AKADEMIK
                  </h3>
                  <div className="space-y-1 text-justify text-gray-900 leading-normal">
                    <p>
                      <strong>2.1 Waktu dan Sasaran:</strong> Pelaksanaan supervisi dilaksanakan pada rentang semester {school.semester_aktif} dengan sasaran sebanyak {totalGuru} guru mata pelajaran aktif di {school.nama_sekolah}.
                    </p>
                    <p>
                      <strong>2.2 Siklus 3 Tahap Pelaksanaan:</strong>
                    </p>
                    <ol className="list-decimal pl-5 space-y-0.5">
                      <li><strong>Pra-Observasi (H-5):</strong> Wawancara dialogis untuk menyepakati target fokus perilaku, modul ajar, dan strategi diferensiasi kelas.</li>
                      <li><strong>Observasi Kelas:</strong> Pengamatan langsung dengan 28 butir indikator baku (rubrik 4 level) disertai pencatatan fakta verbatim faktual.</li>
                      <li><strong>Pasca-Observasi &amp; Coaching Klinis (H+3):</strong> Percakapan reflektif terstruktur berpandukan 5 fase coaching (Pembukaan, Refleksi, Analisis Bukti, Rencana Aksi RTL, Penutup Komitmen).</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Catatan Kaki Lembar 2 */}
              <div className="pt-3 border-t border-black/30 flex justify-between text-[9.5px] text-gray-600 font-sans">
                <span>Laporan Pelaksanaan Supervisi Akademik &amp; Coaching Guru</span>
                <span>Lembar 2 dari 4 · {school.nama_sekolah}</span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* LEMBAR 3: BAB III HASIL EVALUASI & REKAPITULASI NILAI */}
            {/* ======================================================== */}
            <div className="print-document mx-auto bg-white text-black shadow-md print:shadow-none w-full max-w-[794px] min-h-[1050px] p-8 sm:p-12 font-sans text-[10.5px] leading-relaxed flex flex-col justify-between border print:border-none border-gray-300">
              <div className="space-y-3">
                {/* Header Atas Lembar 3 */}
                <div className="border-b border-black pb-1.5 flex justify-between items-center text-[10px] text-gray-700">
                  <span className="font-semibold uppercase tracking-wider">
                    {school.nama_sekolah} &nbsp;·&nbsp; SEMESTER {school.semester_aktif.toUpperCase()}
                  </span>
                  <span className="font-mono">Dokumen Evaluasi Mutu Pembelajaran</span>
                </div>

                {/* Judul Bab III */}
                <div className="space-y-1">
                  <h3 className="font-serif font-bold uppercase tracking-wide text-xs text-black">
                    BAB III: HASIL EVALUASI DAN ANALISIS MUTU
                  </h3>
                  <p className="text-[10px] text-justify text-gray-800">
                    Berdasarkan hasil pengamatan faktual dan validasi rubrik 28 indikator pada siklus supervisi akademik, berikut rekapitulasi ketercapaian mutu pembelajaran satuan pendidikan:
                  </p>
                </div>

                {/* Kotak Statistik Mutu Sekolah */}
                <div className="grid grid-cols-4 gap-2 p-2 border border-black text-center text-[10px]">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-600">Total Sasaran</span>
                    <p className="font-bold font-mono text-sm mt-0.5 text-black">{totalGuru} Guru</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-600">Tuntas Supervisi</span>
                    <p className="font-bold font-mono text-sm mt-0.5 text-black">
                      {guruSelesai} Guru ({totalGuru > 0 ? Math.round((guruSelesai / totalGuru) * 100) : 0}%)
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-600">Rata-Rata Capaian</span>
                    <p className="font-bold font-mono text-sm mt-0.5 text-black">{rataRataSekolah}%</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-600">Predikat Mutu Sekolah</span>
                    <p className="font-bold text-sm mt-0.5 text-black">
                      {rataRataSekolah >= 90 ? "Amat Baik" : rataRataSekolah >= 75 ? "Baik" : "Cukup"}
                    </p>
                  </div>
                </div>

                <p className="text-[9.5px] text-gray-700 italic">
                  Sebaran Predikat: Amat Baik ({countAmatBaik} guru), Baik ({countBaik} guru), Cukup ({countCukup} guru), Perlu Pembinaan ({countPerlu} guru).
                </p>

                {/* Tabel Rekapitulasi Capaian Guru */}
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-[10px] uppercase text-black">
                    Tabel 1: Rekapitulasi Nilai Observasi Kelas dan Keterangan RTL
                  </h4>
                  <table className="w-full text-[9px] border border-black border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-100 font-bold border-b border-black text-center">
                        <th className="border border-black py-1 px-1 w-6">No</th>
                        <th className="border border-black py-1 px-1.5 text-left">Nama Guru &amp; NIP</th>
                        <th className="border border-black py-1 px-1 text-left w-32">Mata Pelajaran</th>
                        <th className="border border-black py-1 px-1 w-12">Nilai (%)</th>
                        <th className="border border-black py-1 px-1 w-16">Predikat</th>
                        <th className="border border-black py-1 px-1.5 text-left w-36">Status RTL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaries.map((s, idx) => (
                        <tr key={s.teacher.id} className="border-b border-gray-300">
                          <td className="border border-black py-0.5 px-1 text-center font-mono">{idx + 1}</td>
                          <td className="border border-black py-0.5 px-1.5">
                            <span className="font-semibold block leading-tight">{s.teacher.nama_lengkap}</span>
                            <span className="font-mono text-[8px] text-gray-600">{s.teacher.nip_nuptk || "-"}</span>
                          </td>
                          <td className="border border-black py-0.5 px-1 leading-tight">{s.teacher.mata_pelajaran}</td>
                          <td className="border border-black py-0.5 px-1 text-center font-mono font-bold">
                            {s.persentase_terbaru !== null ? `${s.persentase_terbaru}%` : "-"}
                          </td>
                          <td className="border border-black py-0.5 px-1 text-center font-medium">
                            {s.predikat_terbaru || "Belum Selesai"}
                          </td>
                          <td className="border border-black py-0.5 px-1.5 text-[8.5px] leading-tight">
                            {s.rtl_selesai > 0
                              ? `${s.rtl_selesai} dari ${s.total_rtl} RTL tuntas`
                              : s.total_rtl > 0
                              ? `${s.total_rtl} RTL dalam pemantauan`
                              : "Menunggu coaching"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Catatan Kaki Lembar 3 */}
              <div className="pt-3 border-t border-black/30 flex justify-between text-[9.5px] text-gray-600 font-sans">
                <span>Laporan Pelaksanaan Supervisi Akademik &amp; Coaching Guru</span>
                <span>Lembar 3 dari 4 · {school.nama_sekolah}</span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* LEMBAR 4: BAB IV KESIMPULAN, REKOMENDASI & PENGESAHAN */}
            {/* ======================================================== */}
            <div className="print-document mx-auto bg-white text-black shadow-md print:shadow-none w-full max-w-[794px] min-h-[1050px] p-8 sm:p-12 font-sans text-[10.5px] leading-relaxed flex flex-col justify-between border print:border-none border-gray-300">
              <div className="space-y-3">
                {/* Header Atas Lembar 4 */}
                <div className="border-b border-black pb-1.5 flex justify-between items-center text-[10px] text-gray-700">
                  <span className="font-semibold uppercase tracking-wider">
                    {school.nama_sekolah} &nbsp;·&nbsp; SEMESTER {school.semester_aktif.toUpperCase()}
                  </span>
                  <span className="font-mono">Dokumen Rekomendasi &amp; Tindak Lanjut</span>
                </div>

                {/* Judul Bab IV */}
                <div className="space-y-2">
                  <h3 className="font-serif font-bold uppercase tracking-wide text-xs text-black">
                    BAB IV: KESIMPULAN DAN REKOMENDASI TINDAK LANJUT
                  </h3>
                  <div className="space-y-1.5 text-justify text-gray-900 leading-normal">
                    <p>
                      <strong>4.1 Kesimpulan:</strong> Siklus supervisi akademik semester {school.semester_aktif} di {school.nama_sekolah} telah terlaksana dengan lancar dan berorientasi pada pemberdayaan potensi guru secara mandiri. Sebagian besar guru telah menunjukkan keselarasan perencanaan modul ajar dan pengelolaan iklim kelas yang inklusif.
                    </p>
                    <p>
                      <strong>4.2 Rekomendasi Peningkatan Mutu Pembelajaran:</strong>
                    </p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>
                        <strong>Penguatan Komunitas Belajar (Kombel):</strong> Menyelenggarakan forum berbagi praktik baik antar MGMP sekolah guna mendalami strategi diferensiasi konten, proses, dan produk.
                      </li>
                      <li>
                        <strong>Pendampingan Asesmen Formatif:</strong> Mendorong implementasi asesmen formatif berkelanjutan yang memanfaatkan umpan balik langsung untuk penyesuaian instruksional kelas.
                      </li>
                      <li>
                        <strong>Fasilitasi Sarana Digital:</strong> Mendukung ketersediaan perangkat penunjang pembelajaran interaktif dan literasi digital sesuai kesepakatan RTL masing-masing pendidik.
                      </li>
                    </ol>
                    <p>
                      <strong>4.3 Mekanisme Pemantauan RTL:</strong> Pelaksanaan cek-in berkala dilakukan secara terjadwal pada pekan ke-2, ke-4, dan ke-8/9 oleh supervisor untuk memverifikasi dokumen bukti dukung sebelum pengesahan tuntas.
                    </p>
                  </div>
                </div>

                <div className="border-t border-black/40 my-2" />

                {/* Matriks Program Tindak Lanjut Sekolah */}
                <div className="space-y-1.5">
                  <h4 className="font-serif font-bold text-[10px] uppercase text-black">
                    Matriks Program Tindak Lanjut Satuan Pendidikan:
                  </h4>
                  <table className="w-full text-[9px] border border-black border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-100 font-bold border-b border-black text-center">
                        <th className="border border-black py-1 px-1.5 w-8">No</th>
                        <th className="border border-black py-1 px-2 text-left">Program Penguatan</th>
                        <th className="border border-black py-1 px-2 text-left">Sasaran Guru</th>
                        <th className="border border-black py-1 px-2 text-left w-36">Penanggung Jawab</th>
                        <th className="border border-black py-1 px-1.5 w-24 text-center">Target Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="border border-black py-1 px-1.5 text-center font-mono">1</td>
                        <td className="border border-black py-1 px-2 font-medium">Workshop Desain Pembelajaran Berdiferensiasi</td>
                        <td className="border border-black py-1 px-2">Seluruh Guru Rumpun Mapel</td>
                        <td className="border border-black py-1 px-2">Wakasek Kurikulum &amp; Kombel</td>
                        <td className="border border-black py-1 px-1.5 text-center font-mono">Bulan ke-2</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="border border-black py-1 px-1.5 text-center font-mono">2</td>
                        <td className="border border-black py-1 px-2 font-medium">Peer-Coaching &amp; Observasi Teman Sejawat</td>
                        <td className="border border-black py-1 px-2">Guru dengan Aspek Prioritas (&lt; 3.0)</td>
                        <td className="border border-black py-1 px-2">Koordinator Rumpun Mapel</td>
                        <td className="border border-black py-1 px-1.5 text-center font-mono">Bulan ke-3</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="border border-black py-1 px-1.5 text-center font-mono">3</td>
                        <td className="border border-black py-1 px-2 font-medium">Verifikasi Akhir Bukti Realisasi RTL</td>
                        <td className="border border-black py-1 px-2">Seluruh Guru Sasaran Supervisi</td>
                        <td className="border border-black py-1 px-2">Kepala Sekolah &amp; Supervisor</td>
                        <td className="border border-black py-1 px-1.5 text-center font-mono">Pekan ke-8/9</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Blok Bawah: Tanda Tangan Penutup Laporan */}
              <div className="space-y-3 pt-3">
                <div className="grid grid-cols-2 text-[10.5px]">
                  <div className="text-center">
                    <p>Mengetahui,</p>
                    <p className="font-semibold">Koordinator Penjaminan Mutu,</p>
                    <div className="h-14" />
                    <p className="font-bold underline text-black">Asep Saepuloh, M.Pd.</p>
                    <p className="font-mono text-[10px]">NIP. 198204152008011005</p>
                  </div>
                  <div className="text-center">
                    <p>
                      Kabupaten Bogor, {tanggalHariIni}
                    </p>
                    <p className="font-semibold">Kepala {school.nama_sekolah},</p>
                    <div className="h-14" />
                    <p className="font-bold underline text-black">{school.nama_kepala_sekolah}</p>
                    <p className="font-mono text-[10px]">NIP. {school.nip_kepala_sekolah}</p>
                  </div>
                </div>

                {/* Catatan Kaki Lembar 4 */}
                <div className="pt-2 border-t border-black/30 flex justify-between text-[9.5px] text-gray-600 font-sans">
                  <span>Laporan Pelaksanaan Supervisi Akademik &amp; Coaching Guru</span>
                  <span>Lembar 4 dari 4 · {school.nama_sekolah}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PrintPortal>
  );
};

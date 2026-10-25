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
          aria-label="Laporan Pelaksanaan Supervisi Akademik Lengkap"
        >
          {/* Header Modal Bar (Tidak ikut tercetak) */}
          <div className="no-print flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-5 h-5 text-pine-600 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">
                  Laporan Pelaksanaan Supervisi Akademik &amp; Coaching Guru
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  Tepat 4 Lembar A4 Rapi &middot; Logo Resmi SMPN 3 Cibungbulang &middot; Bebas Terpotong &middot; Tekan Esc untuk menutup
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="primary" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1.5" />
                Cetak Dokumen (4 Lembar A4)
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

          {/* Area Dokumen Kertas A4 (Tersusun 4 Lembar Mandiri) */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-6 print:space-y-0 print:p-0">

            {/* ======================================================== */}
            {/* LEMBAR 1 DARI 4: COVER RESMI LAPORAN SUPERVISI AKADEMIK  */}
            {/* ======================================================== */}
            <div className="print-document mx-auto bg-white text-black shadow-md print:shadow-none w-full max-w-[794px] h-[297mm] p-8 sm:p-10 font-sans leading-relaxed flex flex-col justify-between border print:border-none border-gray-300 box-border overflow-hidden">
              <div className="border-2 border-black p-6 sm:p-8 flex flex-col justify-between h-full text-center box-border">
                {/* Bagian Atas Sampul: Kop & Logo Resmi */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-black">
                    Pemerintah Daerah Kabupaten Bogor &nbsp;&bull;&nbsp; Dinas Pendidikan
                  </p>
                  <p className="text-base sm:text-lg font-serif font-black uppercase tracking-wider text-black">
                    {school.nama_sekolah}
                  </p>
                  
                  {/* Logo Resmi SMPN 3 Cibungbulang */}
                  <div className="flex justify-center pt-2 pb-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/logo-smpn3cibungbulang.png"
                      alt="Logo SMPN 3 Cibungbulang"
                      className="w-24 h-28 object-contain drop-shadow-xs"
                    />
                  </div>
                </div>

                {/* Bagian Tengah Sampul: Judul Laporan */}
                <div className="space-y-3.5 my-auto py-4">
                  <div className="w-20 h-0.5 bg-black mx-auto" />
                  <h1 className="text-2xl sm:text-[26px] font-serif font-black uppercase tracking-wide leading-tight text-black">
                    LAPORAN PELAKSANAAN
                    <br />
                    SUPERVISI AKADEMIK &amp; COACHING GURU
                  </h1>
                  <p className="text-xs sm:text-sm font-sans font-semibold tracking-wide text-gray-800 max-w-md mx-auto">
                    Pendekatan Kolaboratif Berbasis Siklus Reflektif Klinis Kurikulum Merdeka
                  </p>
                  <div className="inline-block border-y-2 border-black py-1.5 px-6 my-1">
                    <p className="text-xs sm:text-sm font-mono font-bold tracking-widest uppercase text-black">
                      SEMESTER {school.semester_aktif.toUpperCase()} &nbsp;&mdash;&nbsp; TAHUN AJARAN 2026/2027
                    </p>
                  </div>
                  <p className="text-[10.5px] text-gray-700 font-sans max-w-md mx-auto italic">
                    Dokumen Akuntabilitas dan Penjaminan Mutu Proses Pembelajaran Internal Satuan Pendidikan
                  </p>
                  <div className="w-20 h-0.5 bg-black mx-auto" />
                </div>

                {/* Bagian Bawah Sampul: Identitas Satuan Pendidikan */}
                <div className="space-y-1 text-xs pt-2">
                  <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Disusun Oleh:</p>
                  <p className="font-serif font-bold text-sm uppercase text-black">
                    Tim Penjaminan Mutu &amp; Supervisi Pembelajaran
                  </p>
                  <p className="font-bold uppercase tracking-wide text-black text-[11px]">
                    {school.nama_sekolah}
                  </p>
                  <p className="text-[10px] text-gray-800">
                    {school.alamat} &nbsp;|&nbsp; NPSN: <span className="font-mono">{school.npsn}</span>
                  </p>
                  <p className="text-[10px] font-semibold text-gray-900">
                    Kabupaten Bogor &mdash; Provinsi Jawa Barat &nbsp;&bull;&nbsp; Tahun 2026
                  </p>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* LEMBAR 2 DARI 4: LEMBAR PENGESAHAN, BAB I, & BAB II      */}
            {/* ======================================================== */}
            <div className="print-document mx-auto bg-white text-black shadow-md print:shadow-none w-full max-w-[794px] h-[297mm] p-8 sm:p-10 font-sans text-[10px] leading-relaxed flex flex-col justify-between border print:border-none border-gray-300 box-border overflow-hidden">
              <div className="space-y-2.5">
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

                {/* Lembar Pengesahan */}
                <div className="space-y-1.5 pt-0.5">
                  <h2 className="text-center text-[11px] font-serif font-bold uppercase tracking-wider underline text-black">
                    LEMBAR PENGESAHAN LAPORAN SUPERVISI AKADEMIK
                  </h2>
                  <p className="text-[10px] text-justify leading-relaxed text-gray-900">
                    Laporan Pelaksanaan Supervisi Akademik dan Pendampingan Coaching Klinis Guru Semester {school.semester_aktif} Tahun Ajaran 2026/2027 pada {school.nama_sekolah} telah disusun secara kolaboratif, diverifikasi, dan disahkan sebagai dokumen pertanggungjawaban penjaminan mutu proses pembelajaran internal satuan pendidikan.
                  </p>

                  <div className="pt-2 grid grid-cols-2 text-[10px]">
                    <div className="text-center">
                      <p>Mengetahui,</p>
                      <p className="font-semibold">Pengawas Pembina Sekolah,</p>
                      <div className="h-11" />
                      <p className="font-bold underline text-black">{namaPengawas}</p>
                      <p className="font-mono text-[9.5px]">NIP. {nipPengawas}</p>
                    </div>
                    <div className="text-center">
                      <p>Disahkan di: Kabupaten Bogor</p>
                      <p>Pada Tanggal: {tanggalHariIni}</p>
                      <p className="font-semibold">Kepala {school.nama_sekolah},</p>
                      <div className="h-11" />
                      <p className="font-bold underline text-black">{school.nama_kepala_sekolah}</p>
                      <p className="font-mono text-[9.5px]">NIP. {school.nip_kepala_sekolah}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-black my-1.5" />

                {/* BAB I: Pendahuluan */}
                <div className="space-y-1 text-[9.5px]">
                  <h3 className="font-serif font-bold uppercase tracking-wide text-[10.5px] text-black">
                    BAB I: PENDAHULUAN
                  </h3>
                  <div className="space-y-1 text-justify text-gray-900 leading-normal">
                    <p>
                      <strong>1.1 Latar Belakang:</strong> Supervisi akademik merupakan proses sistematis untuk memberdayakan guru dalam meningkatkan mutu pembelajaran yang berpusat pada peserta didik. Pendekatan coaching klinis Kurikulum Merdeka menitikberatkan pada kemitraan sejajar, dialog reflektif, dan pencatatan fakta nyata bebas asumsi.
                    </p>
                    <p>
                      <strong>1.2 Landasan Hukum:</strong> Permendikbudristek No. 40 Tahun 2021 tentang Penugasan Guru sebagai Kepala Sekolah, Perdirjen GTK No. 2626/B/HK.04.01/2023 tentang Model Kompetensi Guru, serta panduan Kurikulum Merdeka.
                    </p>
                    <p>
                      <strong>1.3 Tujuan Supervisi:</strong> Mengidentifikasi kompetensi mengajar, mendampingi diferensiasi instruksional kelas, serta menyusun Rencana Tindak Lanjut (RTL) yang berdampak langsung pada capaian belajar murid.
                    </p>
                  </div>
                </div>

                <div className="border-t border-black/40 my-1.5" />

                {/* BAB II: Pelaksanaan */}
                <div className="space-y-1 text-[9.5px]">
                  <h3 className="font-serif font-bold uppercase tracking-wide text-[10.5px] text-black">
                    BAB II: PELAKSANAAN SUPERVISI AKADEMIK
                  </h3>
                  <div className="space-y-1 text-justify text-gray-900 leading-normal">
                    <p>
                      <strong>2.1 Waktu dan Sasaran:</strong> Pelaksanaan supervisi dilaksanakan pada rentang semester {school.semester_aktif} terhadap seluruh {totalGuru} guru mata pelajaran aktif di {school.nama_sekolah}.
                    </p>
                    <p>
                      <strong>2.2 Siklus 3 Tahap Pelaksanaan:</strong>
                    </p>
                    <ol className="list-decimal pl-4 space-y-0.5">
                      <li><strong>Pra-Observasi (H-5):</strong> Wawancara dialogis menyepakati target fokus pembelajaran, modul ajar, dan strategi diferensiasi kelas.</li>
                      <li><strong>Observasi Kelas:</strong> Pengamatan langsung dengan 28 butir indikator baku rubrik 4 level disertai pencatatan fakta verbatim.</li>
                      <li><strong>Pasca-Observasi &amp; Coaching Klinis (H+3):</strong> Percakapan reflektif 5 alur (Pembukaan, Refleksi, Analisis Bukti, Rencana Aksi, Penutup Komitmen).</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Catatan Kaki Lembar 2 */}
              <div className="pt-2 border-t border-black/30 flex justify-between text-[9px] text-gray-600 font-sans">
                <span>Laporan Pelaksanaan Supervisi Akademik &amp; Coaching Guru</span>
                <span>Lembar 2 dari 4 &middot; {school.nama_sekolah}</span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* LEMBAR 3 DARI 4: BAB III EVALUASI & TABEL 25 GURU LENGKAP */}
            {/* ======================================================== */}
            <div className="print-document mx-auto bg-white text-black shadow-md print:shadow-none w-full max-w-[794px] h-[297mm] p-8 sm:p-10 font-sans text-[10px] leading-tight flex flex-col justify-between border print:border-none border-gray-300 box-border overflow-hidden">
              <div className="space-y-2">
                {/* Header Atas Lembar 3 */}
                <div className="border-b border-black pb-1 flex justify-between items-center text-[9.5px] text-gray-700">
                  <span className="font-semibold uppercase tracking-wider">
                    {school.nama_sekolah} &nbsp;&bull;&nbsp; SEMESTER {school.semester_aktif.toUpperCase()}
                  </span>
                  <span className="font-mono text-[9px]">Dokumen Evaluasi Mutu Pembelajaran</span>
                </div>

                {/* Judul Bab III */}
                <div className="space-y-0.5">
                  <h3 className="font-serif font-bold uppercase tracking-wide text-[11px] text-black">
                    BAB III: HASIL EVALUASI DAN ANALISIS MUTU
                  </h3>
                  <p className="text-[9.5px] text-justify text-gray-800 leading-tight">
                    Berdasarkan validasi instrumen rubrik 28 butir indikator dan catatan pengamatan faktual di kelas, berikut rekapitulasi capaian mutu pembelajaran:
                  </p>
                </div>

                {/* Kotak Statistik 4 Indikator Mutu Ringkas */}
                <div className="grid grid-cols-4 gap-2 py-1 px-2 border border-black text-center text-[9px]">
                  <div>
                    <span className="text-[8px] uppercase font-bold text-gray-600">Total Sasaran</span>
                    <p className="font-bold font-mono text-[11px] text-black">{totalGuru} Guru</p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-bold text-gray-600">Tuntas Supervisi</span>
                    <p className="font-bold font-mono text-[11px] text-black">
                      {guruSelesai} Guru ({totalGuru > 0 ? Math.round((guruSelesai / totalGuru) * 100) : 0}%)
                    </p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-bold text-gray-600">Rata-Rata Capaian</span>
                    <p className="font-bold font-mono text-[11px] text-black">{rataRataSekolah}%</p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-bold text-gray-600">Predikat Mutu Sekolah</span>
                    <p className="font-bold text-[11px] text-black">
                      {rataRataSekolah >= 90 ? "Amat Baik" : rataRataSekolah >= 75 ? "Baik" : "Cukup"}
                    </p>
                  </div>
                </div>

                <p className="text-[8.5px] text-gray-700 italic">
                  Sebaran Predikat: Amat Baik ({countAmatBaik}), Baik ({countBaik}), Cukup ({countCukup}), Perlu Pembinaan ({countPerlu}).
                </p>

                {/* Tabel Rekapitulasi Capaian Seluruh Guru (Pas 25 Baris Presisi) */}
                <div className="space-y-0.5">
                  <h4 className="font-serif font-bold text-[9.5px] uppercase text-black">
                    Tabel 1: Rekapitulasi Nilai Observasi Kelas dan Status RTL Guru
                  </h4>
                  <table className="w-full text-[8px] border border-black border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-100 font-bold border-b border-black text-center">
                        <th className="border border-black py-0.5 px-1 w-5">No</th>
                        <th className="border border-black py-0.5 px-1 text-left">Nama Guru &amp; NIP/NUPTK</th>
                        <th className="border border-black py-0.5 px-1 text-left w-24">Mata Pelajaran</th>
                        <th className="border border-black py-0.5 px-0.5 w-11">Nilai (%)</th>
                        <th className="border border-black py-0.5 px-0.5 w-14">Predikat</th>
                        <th className="border border-black py-0.5 px-1 text-left w-32">Status RTL</th>
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
                          <td className="border border-black py-0.5 px-0.5 text-center font-mono font-bold">
                            {s.persentase_terbaru !== null ? `${s.persentase_terbaru}%` : "-"}
                          </td>
                          <td className="border border-black py-0.5 px-0.5 text-center font-medium">
                            {s.predikat_terbaru || "Belum Selesai"}
                          </td>
                          <td className="border border-black py-0.5 px-1 text-[7.5px] leading-tight">
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
              <div className="pt-1.5 border-t border-black/30 flex justify-between text-[9px] text-gray-600 font-sans">
                <span>Laporan Pelaksanaan Supervisi Akademik &amp; Coaching Guru</span>
                <span>Lembar 3 dari 4 &middot; {school.nama_sekolah}</span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* LEMBAR 4 DARI 4: BAB IV, MATRIKS, & TANDA TANGAN PENUTUP */}
            {/* ======================================================== */}
            <div className="print-document mx-auto bg-white text-black shadow-md print:shadow-none w-full max-w-[794px] h-[297mm] p-8 sm:p-10 font-sans text-[10px] leading-relaxed flex flex-col justify-between border print:border-none border-gray-300 box-border overflow-hidden">
              <div className="space-y-2.5">
                {/* Header Atas Lembar 4 */}
                <div className="border-b border-black pb-1 flex justify-between items-center text-[9.5px] text-gray-700">
                  <span className="font-semibold uppercase tracking-wider">
                    {school.nama_sekolah} &nbsp;&bull;&nbsp; SEMESTER {school.semester_aktif.toUpperCase()}
                  </span>
                  <span className="font-mono text-[9px]">Dokumen Rekomendasi &amp; Tindak Lanjut</span>
                </div>

                {/* Judul Bab IV */}
                <div className="space-y-1.5">
                  <h3 className="font-serif font-bold uppercase tracking-wide text-[11px] text-black">
                    BAB IV: KESIMPULAN DAN REKOMENDASI TINDAK LANJUT
                  </h3>
                  <div className="space-y-1 text-justify text-gray-900 leading-normal text-[9.5px]">
                    <p>
                      <strong>4.1 Kesimpulan:</strong> Siklus supervisi akademik semester {school.semester_aktif} di {school.nama_sekolah} telah terlaksana secara menyeluruh berlandaskan prinsip kemitraan dan apresiasi potensi guru. Sebagian besar guru telah menunjukkan keselarasan perencanaan modul ajar dan pengelolaan iklim kelas yang inklusif.
                    </p>
                    <p>
                      <strong>4.2 Rekomendasi Peningkatan Mutu Pembelajaran:</strong>
                    </p>
                    <ol className="list-decimal pl-4 space-y-0.5">
                      <li>
                        <strong>Penguatan Kombel Guru:</strong> Optimalisasi forum MGMP sekolah untuk berbagi praktik baik diferensiasi instruksional dan strategi manajemen kelas.
                      </li>
                      <li>
                        <strong>Penguatan Asesmen Formatif:</strong> Pendampingan teknis dalam merancang asesmen autentik dan pemanfaatan umpan balik reflektif siswa.
                      </li>
                      <li>
                        <strong>Fasilitasi Sarana Belajar:</strong> Dukungan manajemen sekolah dalam pengadaan sarana media ajar digital sesuai kesepakatan RTL guru.
                      </li>
                    </ol>
                    <p>
                      <strong>4.3 Mekanisme Pemantauan RTL:</strong> Cek-in berkala dilakukan secara terjadwal pada pekan ke-2, ke-4, dan ke-8/9 oleh supervisor untuk memverifikasi dokumen bukti fisik sebelum pengesahan tuntas.
                    </p>
                  </div>
                </div>

                <div className="border-t border-black/40 my-1" />

                {/* Matriks Program Tindak Lanjut Satuan Pendidikan */}
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-[9.5px] uppercase text-black">
                    Matriks Program Tindak Lanjut Satuan Pendidikan:
                  </h4>
                  <table className="w-full text-[8.5px] border border-black border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-100 font-bold border-b border-black text-center">
                        <th className="border border-black py-0.5 px-1 w-6">No</th>
                        <th className="border border-black py-0.5 px-1.5 text-left">Program Penguatan Mutu</th>
                        <th className="border border-black py-0.5 px-1.5 text-left">Sasaran Guru</th>
                        <th className="border border-black py-0.5 px-1.5 text-left w-36">Penanggung Jawab</th>
                        <th className="border border-black py-0.5 px-1 w-20 text-center">Target Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="border border-black py-0.5 px-1 text-center font-mono">1</td>
                        <td className="border border-black py-0.5 px-1.5 font-medium">Workshop Desain Pembelajaran Berdiferensiasi</td>
                        <td className="border border-black py-0.5 px-1.5">Seluruh Guru Rumpun Mapel</td>
                        <td className="border border-black py-0.5 px-1.5">Wakasek Kurikulum &amp; Kombel</td>
                        <td className="border border-black py-0.5 px-1 text-center font-mono">Bulan ke-2</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="border border-black py-0.5 px-1.5 text-center font-mono">2</td>
                        <td className="border border-black py-0.5 px-1.5 font-medium">Peer-Coaching &amp; Observasi Teman Sejawat</td>
                        <td className="border border-black py-0.5 px-1.5">Guru Aspek Prioritas (&lt; 3.0)</td>
                        <td className="border border-black py-0.5 px-1.5">Koordinator Rumpun Mapel</td>
                        <td className="border border-black py-0.5 px-1 text-center font-mono">Bulan ke-3</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="border border-black py-0.5 px-1.5 text-center font-mono">3</td>
                        <td className="border border-black py-0.5 px-1.5 font-medium">Verifikasi Akhir Bukti Realisasi RTL</td>
                        <td className="border border-black py-0.5 px-1.5">Seluruh Guru Sasaran</td>
                        <td className="border border-black py-0.5 px-1.5">Kepala Sekolah &amp; Supervisor</td>
                        <td className="border border-black py-0.5 px-1 text-center font-mono">Pekan ke-8/9</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Blok Bawah: Tanda Tangan Pengesahan Penutup Laporan */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 text-[10px]">
                  <div className="text-center">
                    <p>Mengetahui,</p>
                    <p className="font-semibold">Koordinator Penjaminan Mutu,</p>
                    <div className="h-11" />
                    <p className="font-bold underline text-black">Asep Saepuloh, M.Pd.</p>
                    <p className="font-mono text-[9px]">NIP. 198204152008011005</p>
                  </div>
                  <div className="text-center">
                    <p>Kabupaten Bogor, {tanggalHariIni}</p>
                    <p className="font-semibold">Kepala {school.nama_sekolah},</p>
                    <div className="h-11" />
                    <p className="font-bold underline text-black">{school.nama_kepala_sekolah}</p>
                    <p className="font-mono text-[9px]">NIP. {school.nip_kepala_sekolah}</p>
                  </div>
                </div>

                {/* Catatan Kaki Lembar 4 */}
                <div className="pt-1.5 border-t border-black/30 flex justify-between text-[9px] text-gray-600 font-sans">
                  <span>Laporan Pelaksanaan Supervisi Akademik &amp; Coaching Guru</span>
                  <span>Lembar 4 dari 4 &middot; {school.nama_sekolah}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PrintPortal>
  );
};

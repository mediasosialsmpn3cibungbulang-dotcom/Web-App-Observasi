"use client";

import React, { useEffect } from "react";
import { X, Printer } from "lucide-react";
import { FollowupItem, Teacher, SchoolSettings } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
import { PrintPortal } from "@/components/ui/PrintPortal";
import { formatTanggalIndonesia } from "@/lib/utils";

interface FollowupPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  followups: FollowupItem[];
  teacher: Teacher;
  school: SchoolSettings;
}

export const FollowupPrintModal: React.FC<FollowupPrintModalProps> = ({
  isOpen,
  onClose,
  followups,
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
      {/* Backdrop gelap: klik area luar untuk menutup */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs select-none"
        onClick={onClose}
      >
        <div
          className="bg-gray-100 rounded-2xl w-full max-w-[860px] max-h-[94vh] flex flex-col shadow-2xl overflow-hidden print:block print:bg-white print:rounded-none print:shadow-none print:max-w-none"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau Format Rencana Tindak Lanjut"
        >
          {/* Header Modal Bar (Tidak ikut tercetak) */}
          <div className="no-print flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Printer className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">
                  Pratinjau Format Rencana Tindak Lanjut (RTL) Guru
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  Format A4 Resmi (Kedinasan / Monokrom) · Tekan Esc untuk menutup
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="primary" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1.5" />
                Cetak Dokumen
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

          {/* Area Dokumen Kertas A4 Formal */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 print:p-0">
            <div
              id="printable-area"
              className="print-document mx-auto bg-white text-black shadow-md print:shadow-none w-full max-w-[794px] min-h-[1050px] p-8 sm:p-12 font-sans text-[11px] leading-relaxed flex flex-col justify-between"
            >
              {/* Bagian Atas: Kop Surat, Judul, Identitas, Matriks RTL, dan Pakta Komitmen */}
              <div className="space-y-3">
                {/* Kop Surat Resmi Kedinasan */}
                <div className="text-center border-b-[3px] border-double border-black pb-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-black">
                    Pemerintah Daerah Provinsi Jawa Barat / Dinas Pendidikan
                  </p>
                  <p className="font-serif text-[17px] font-bold uppercase tracking-wide leading-tight text-black mt-0.5">
                    {school.nama_sekolah}
                  </p>
                  <p className="text-[10px] text-gray-700 mt-0.5 font-sans">
                    {school.alamat} &nbsp;|&nbsp; NPSN: {school.npsn}
                  </p>
                </div>

                {/* Judul Dokumen Formal */}
                <div className="text-center space-y-0.5 pt-1">
                  <h1 className="font-serif text-sm font-bold uppercase tracking-wide underline text-black">
                    RENCANA TINDAK LANJUT (RTL) SUPERVISI AKADEMIK GURU
                  </h1>
                  <p className="text-[10px] text-gray-700 font-mono">
                    Tahun Ajaran / Semester: {school.semester_aktif} &nbsp;|&nbsp; Status: Terverifikasi Resmi
                  </p>
                </div>

                {/* Tabel Identitas Guru & Supervisi */}
                <table className="w-full border-collapse border border-black text-[10px] my-1">
                  <tbody>
                    <tr>
                      <td className="p-1.5 border border-black font-semibold bg-gray-100 w-[20%]">Nama Guru Sasaran</td>
                      <td className="p-1.5 border border-black w-[30%]">{teacher.nama_lengkap}</td>
                      <td className="p-1.5 border border-black font-semibold bg-gray-100 w-[20%]">Nama Supervisor / Penilai</td>
                      <td className="p-1.5 border border-black w-[30%]">{school.nama_kepala_sekolah}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border border-black font-semibold bg-gray-100">NIP / NUPTK</td>
                      <td className="p-1.5 border border-black font-mono">{teacher.nip_nuptk}</td>
                      <td className="p-1.5 border border-black font-semibold bg-gray-100">Jabatan Penilai</td>
                      <td className="p-1.5 border border-black">Kepala Sekolah / Penilai Akademik</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border border-black font-semibold bg-gray-100">Mata Pelajaran</td>
                      <td className="p-1.5 border border-black">{teacher.mata_pelajaran}</td>
                      <td className="p-1.5 border border-black font-semibold bg-gray-100">Kelas Diampu</td>
                      <td className="p-1.5 border border-black">{teacher.kelas_diampu}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Matriks RTL (Dokumen Resmi Kemdikbud / Supervisi) */}
                <div className="space-y-0 pt-1">
                  <div className="bg-gray-100 border border-black px-2 py-1 font-bold text-[10px] uppercase tracking-wide text-black">
                    Matriks Rencana Aksi & Perbaikan Kualitas Pembelajaran
                  </div>
                  <table className="w-full border-collapse border border-black border-t-0 text-[9.5px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-black p-1.5 w-7 text-center font-bold">No</th>
                        <th className="border border-black p-1.5 font-bold w-[22%]">Fokus Aspek / Masalah Kunci</th>
                        <th className="border border-black p-1.5 font-bold w-[24%]">Rencana Aksi Konkret Pendidik</th>
                        <th className="border border-black p-1.5 font-bold w-[22%]">Target & Indikator Sukses</th>
                        <th className="border border-black p-1.5 font-bold w-[20%]">Fasilitasi & Dukungan Sekolah</th>
                        <th className="border border-black p-1.5 font-bold w-[12%] text-center">Batas Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {followups.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="border border-black p-2 text-center text-gray-600 italic">
                            Rencana tindak lanjut diselaraskan langsung dengan komitmen pengajaran guru di kelas.
                          </td>
                        </tr>
                      ) : (
                        followups.map((f, idx) => (
                          <tr key={f.id} className="border-b border-gray-300">
                            <td className="border border-black p-1.5 text-center font-bold">{idx + 1}</td>
                            <td className="border border-black p-1.5 leading-snug">{f.masalah_utama}</td>
                            <td className="border border-black p-1.5 leading-snug">{f.aksi_konkret_guru}</td>
                            <td className="border border-black p-1.5 leading-snug text-gray-800">
                              {f.target_indikator_sukses || "Keterlibatan belajar siswa meningkat optimal"}
                            </td>
                            <td className="border border-black p-1.5 leading-snug text-gray-800">{f.dukungan_kepala_sekolah}</td>
                            <td className="border border-black p-1.5 font-mono text-center text-[9px]">
                              {formatTanggalIndonesia(f.deadline)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pakta Komitmen Pendidik */}
                <div className="space-y-0 pt-1">
                  <div className="bg-gray-100 border border-black px-2 py-1 font-bold text-[10px] uppercase tracking-wide text-black">
                    Pakta Komitmen Pendidik
                  </div>
                  <div className="border border-black border-t-0 p-2.5 text-[10px] space-y-1 text-black leading-relaxed bg-white">
                    <p className="italic">
                      &ldquo;Saya menyatakan berkomitmen untuk merealisasikan rencana perbaikan pembelajaran ini secara konsisten demi peningkatan mutu dan keberhasilan belajar peserta didik di <strong>{school.nama_sekolah}</strong>.&rdquo;
                    </p>
                  </div>
                </div>

                {/* Mekanisme Verifikasi & Pemantauan */}
                <div className="space-y-0 pt-1">
                  <div className="bg-gray-100 border border-black px-2 py-1 font-bold text-[10px] uppercase tracking-wide text-black">
                    Mekanisme Verifikasi & Pemantauan Realisasi
                  </div>
                  <table className="w-full border-collapse border border-black border-t-0 text-[9.5px]">
                    <tbody>
                      <tr>
                        <td className="p-1.5 border border-black font-semibold bg-gray-50/70 w-[28%]">Bukti Fisik yang Disiapkan</td>
                        <td className="p-1.5 border border-black">Modul Ajar Revisi, Lembar Asesmen Baru, Bukti Produk Belajar Siswa, & Catatan Refleksi Mandiri</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 border border-black font-semibold bg-gray-50/70">Waktu Verifikasi / Pemantauan</td>
                        <td className="p-1.5 border border-black">Dilaksanakan berkala 2 pekan setelah supervisi oleh Kepala Sekolah / Tim Pengembang Kurikulum</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bagian Bawah: Tanda Tangan Resmi & Catatan Kaki */}
              <div className="space-y-3 pt-6">
                {/* Blok Tanda Tangan Resmi Kedinasan */}
                <div className="grid grid-cols-2 gap-8 text-center text-[10.5px] break-inside-avoid">
                  <div>
                    <p className="text-gray-700 mb-14">Guru Mata Pelajaran,</p>
                    <p className="font-bold underline text-black">{teacher.nama_lengkap}</p>
                    <p className="font-mono text-gray-700 text-[10px]">NIP. {teacher.nip_nuptk}</p>
                  </div>
                  <div>
                    <p className="text-gray-700 mb-14">Mengetahui,<br />Kepala Sekolah</p>
                    <p className="font-bold underline text-black">{school.nama_kepala_sekolah}</p>
                    <p className="font-mono text-gray-700 text-[10px]">NIP. {school.nip_kepala_sekolah}</p>
                  </div>
                </div>

                {/* Catatan Kaki Dokumen */}
                <div className="pt-2 border-t border-gray-300 flex items-center justify-between text-[9px] text-gray-500 font-mono">
                  <span>Dokumen RTL Supervisi Akademik — {school.nama_sekolah}</span>
                  <span>Lampiran Dokumen Resmi Supervisi Guru</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrintPortal>
  );
};

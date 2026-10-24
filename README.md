# Smart Supervisi & Coaching Guru (Aplikasi Web)

Aplikasi web terpadu untuk digitalisasi dan automasi siklus supervisi akademik dan coaching guru di lingkungan satuan pendidikan.

## Latar Belakang & Fitur Utama

Sistem ini mentransformasikan alur kerja manual berbasis berkas (13 sheet spreadsheet dan berkas dokumen terpisah) menjadi satu aplikasi web mobile-first yang terintegrasi:

1. **Siklus Supervisi Lengkap 5 Tahap:**
   - **Pra-Observasi:** Formulir kesepakatan fokus amatan dan instrumen Berita Acara Pra-Observasi.
   - **Observasi Kelas:** Rubrik 28 indikator (7 aspek pembelajaran), skor 1–4, disertai pencatatan fakta berbasis bukti secara langsung (*live fact notes*).
   - **Analisis Temuan:** Perhitungan otomatis kekuatan utama dan aspek prioritas pengembangan guru.
   - **Sesi Coaching:** Panduan durasi 5 fase, integrasi bank 45 pertanyaan coaching reflektif, dan pencatatan komitmen.
   - **Tindak Lanjut & RTL:** Rencana tindak lanjut mandiri guru, pemantauan berkala (pekan 2, 4, 8/9), dan monitoring kepala sekolah.

2. **Perhitungan Otomatis & Terpusat (Single Source of Truth):**
   - Skor, persentase ketercapaian, predikat, penentuan aspek prioritas, dan tren perkembangan dihitung melalui fungsi murni domain tanpa inkonsistensi rumus.

3. **Dokumen Resmi Siap Cetak:**
   - Cetak Berita Acara, Lembar Observasi, Notulen Coaching, Rencana Tindak Lanjut (RTL), Rekapitulasi Sekolah, dan Laporan Supervisi Akademik format standar A4.

4. **Keamanan & Resiliensi Offline:**
   - Draf lokal otomatis tersimpan di perangkat saat pengisian di kelas dengan sinyal terbatas.
   - Kontrol hak akses berbasis peran (*Role-Based Access Control*).

## Teknologi Utama

- **Framework:** Next.js (App Router) & React
- **Bahasa:** TypeScript (Strict Mode)
- **Validasi Kontrak:** Zod Runtime Schema Validation
- **Gaya Antarmuka:** Tailwind CSS dengan Apple HIG & Editorial Art Direction

## Cara Menjalankan Proyek

1. Pasang dependensi:
   ```bash
   npm install
   ```
2. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```
3. Buka peramban pada `http://localhost:3000`.

## Ringkasan Keputusan Arsitektur (ADR)

- **ADR-0001 (Platform & Data):** Next.js App Router dengan TypeScript strict, penyimpanan berbasis Postgres & Auth dengan proteksi Row Level Security (RLS).
- **ADR-0002 (Lingkup Multi-Tenant):** Konfigurasi satu sekolah per instalasi (*Single Institution per Instance*).
- **ADR-0003 (Kalkulasi Data Domain):** Data turunan (skor persen, predikat, status supervisi, status keterlambatan) dihitung *on-the-fly* via fungsi murni domain tanpa duplikasi data mentah.
- **ADR-0004 (Format Dokumen Cetak):** Halaman cetak menggunakan stylesheet cetak A4 native peramban tanpa dependensi pihak ketiga yang berat.
- **ADR-0005 (Ketahanan Offline):** Draf observasi dan catatan fakta disimpan di penyimpanan lokal peramban (IndexedDB) dan disinkronkan menggunakan kunci idempotensi (*Idempotency-Key*).

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  HelpCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  GraduationCap,
  ListTodo,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";

interface FAQItem {
  q: string;
  a: string;
  kategori: string;
}

const FAQS: FAQItem[] = [
  {
    kategori: "Alur & Siklus",
    q: "Berapa jarak waktu ideal antara Pra-Observasi, Observasi Kelas, dan Coaching?",
    a: "Berdasarkan prinsip supervisi klinis, Pra-Observasi dilakukan minimal H-5 sebelum observasi kelas agar guru memiliki cukup waktu menyelaraskan modul ajar. Sedangkan sesi Pasca-Observasi (Coaching) dilakukan maksimal H+3 sesudah observasi saat ingatan peristiwa kelas masih segar.",
  },
  {
    kategori: "Rubrik & Penilaian",
    q: "Bagaimana cara penentuan skor pada rubrik 28 butir indikator?",
    a: "Setiap butir dinilai dari skala 1 (Perlu Pembinaan) hingga 4 (Amat Baik). Total skor maksimal adalah 112 (28 butir x 4). Persentase dihitung dengan rumus (Total Skor / 112) x 100%. Predikat: Amat Baik (>=90%), Baik (75-89%), Cukup (60-74%), dan Perlu Pembinaan (<60%).",
  },
  {
    kategori: "Target & Tren",
    q: "Mengapa target standar sekolah ditetapkan 80% dan bagaimana mengevaluasinya?",
    a: "Target 80% (kategori Baik) merupakan standar pencapaian mutu minimal pembelajaran Kurikulum Merdeka. Jika nilai observasi terbaru >= 80%, status tercatat 'Tercapai'. Dinamika tren perkembangan (Meningkat, Stagnan, Menurun) dihitung otomatis membandingkan sesi observasi awal dan sesi terbaru.",
  },
  {
    kategori: "Tindak Lanjut & RTL",
    q: "Siapa yang berhak mengubah status tindak lanjut menjadi 'Selesai'?",
    a: "Guru dapat mengubah status komitmen hingga 'Berjalan' dan melampirkan berkas bukti fisik. Namun penetapan status 'Selesai' mutlak memerlukan verifikasi dan pengesahan dari Kepala Sekolah atau Supervisor setelah memeriksa dokumen bukti.",
  },
  {
    kategori: "Keamanan Data",
    q: "Apakah data draf observasi tetap aman jika koneksi internet terputus di dalam kelas?",
    a: "Ya. Aplikasi Smart Supervisi dibangun dengan arsitektur Offline-First. Setiap perubahan skor dan catatan fakta otomatis tersimpan seketika di penyimpanan lokal perangkat (Local Storage) tanpa kehilangan data.",
  },
];

export default function BantuanPage() {
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-pine-600 dark:text-pine-400" />
            Panduan Penggunaan & Bantuan Operasional
          </h1>
          <p className="text-sm text-muted mt-1">
            Standar Operasional Prosedur (SOP) supervisi akademik klinis dan jawaban atas pertanyaan umum (FAQ).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/checklist">
            <Button variant="secondary" size="md">
              <CheckCircle className="w-4 h-4 mr-2" />
              Checklist 29 Kegiatan
            </Button>
          </Link>
          <Link href="/pertanyaan">
            <Button variant="primary" size="md">
              <Sparkles className="w-4 h-4 mr-2" />
              Bank 45 Pertanyaan
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid Alur Kerja 3 Tahap Supervisi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Panel title="Tahap 1: Pra-Observasi (H-5)" subtitle="Dialog awal penyelarasan fokus">
          <div className="space-y-3 text-xs leading-relaxed text-muted">
            <p>
              Supervisor dan guru berdialog mengenai kesiapan modul ajar, karakteristik siswa di kelas, dan memilih minimal 1 indikator fokus utama pembelajaran.
            </p>
            <div className="p-2.5 rounded bg-black/5 dark:bg-white/5 font-mono text-[11px] text-foreground">
              Dokumen: Berita Acara Pra-Observasi (A4 Siap Cetak).
            </div>
          </div>
        </Panel>

        <Panel title="Tahap 2: Observasi Kelas (1 JP)" subtitle="Pengamatan fakta bebas asumsi">
          <div className="space-y-3 text-xs leading-relaxed text-muted">
            <p>
              Supervisor duduk di baris belakang kelas mengamati jalannya pembelajaran, mencatat kutipan verbatim dan fakta objektif, serta mengisi 28 indikator rubrik 4 level.
            </p>
            <div className="p-2.5 rounded bg-black/5 dark:bg-white/5 font-mono text-[11px] text-foreground">
              Dokumen: Lembar Observasi 28 Indikator & Catatan Fakta.
            </div>
          </div>
        </Panel>

        <Panel title="Tahap 3: Pasca-Observasi / Coaching (H+3)" subtitle="Refleksi mandiri & komitmen RTL">
          <div className="space-y-3 text-xs leading-relaxed text-muted">
            <p>
              Percakapan reflektif terstruktur melalui 5 fase (Pembukaan, Refleksi, Analisis Bukti, Rencana Aksi, Penutup) menghasilkan kesepakatan tindak lanjut yang terukur.
            </p>
            <div className="p-2.5 rounded bg-black/5 dark:bg-white/5 font-mono text-[11px] text-foreground">
              Dokumen: Notulen Coaching Rahasia & Format RTL (Doc 7).
            </div>
          </div>
        </Panel>
      </div>

      {/* Accordion FAQ Interaktif */}
      <Panel title="Tanya Jawab Populer (Frequently Asked Questions)" subtitle="Pedoman teknis bagi Kepala Sekolah dan Guru">
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFAQIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-xl border border-border overflow-hidden transition-all bg-card"
              >
                <button
                  type="button"
                  onClick={() => setOpenFAQIndex(isOpen ? null : idx)}
                  className="w-full text-left p-4 flex items-center justify-between gap-4 font-semibold text-foreground text-xs md:text-sm hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-pine-50 dark:bg-pine-950/40 text-pine-700 dark:text-pine-300 border border-pine-200 dark:border-pine-800">
                      {faq.kategori}
                    </span>
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-muted shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 pt-1 text-xs md:text-sm text-muted leading-relaxed border-t border-border bg-black/[0.01] dark:bg-white/[0.01]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

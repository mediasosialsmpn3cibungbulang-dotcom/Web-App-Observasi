"use client";

import React, { useState } from "react";
import { MessageSquare, Shield, Clock, Plus, CheckCircle, Printer } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { SEED_COACHING_QUESTIONS, SEED_MOCK_TEACHERS } from "@/contracts/seed-data";

export default function CoachingPage() {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(["A-01", "A-04", "D-01"]);
  const [activeCategory, setActiveCategory] = useState("A");

  const toggleQuestion = (kode: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(kode) ? prev.filter((k) => k !== kode) : [...prev, kode]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-foreground">
              Percakapan Coaching Pasca-Observasi
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-300 font-semibold">
              <Shield className="w-3 h-3" />
              KONFIDENSIAL
            </span>
          </div>
          <p className="text-sm text-muted mt-1">
            Guru: <strong>{SEED_MOCK_TEACHERS[0].nama_lengkap}</strong> | Nomor Dokumen: NC-2026-X01
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md">
            <Printer className="w-4 h-4 mr-2" />
            Cetak Notulen
          </Button>
          <Button variant="primary" size="md">
            <CheckCircle className="w-4 h-4 mr-2" />
            Finalisasi Sesi
          </Button>
        </div>
      </div>

      {/* Alur 5 Fase Coaching dengan Rekomendasi Waktu */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 select-none">
        {[
          { fase: "1. Pembukaan", durasi: "5 - 8 Menit", desc: "Mencairkan suasana & emosi" },
          { fase: "2. Eksplorasi", durasi: "10 - 15 Menit", desc: "Menganalisis data fakta" },
          { fase: "3. Strategi", durasi: "8 - 12 Menit", desc: "Curah ide alternatif solusi" },
          { fase: "4. Komitmen", durasi: "7 - 10 Menit", desc: "Rencana aksi & deadline RTL" },
          { fase: "5. Penutup", durasi: "3 - 5 Menit", desc: "Apresiasi & insight akhir" },
        ].map((item, idx) => (
          <div
            key={item.fase}
            className={`p-3 rounded-control border text-xs ${
              idx === 1
                ? "bg-primary text-primary-foreground border-primary font-semibold"
                : "bg-surface border-border text-foreground"
            }`}
          >
            <p className="font-bold">{item.fase}</p>
            <p className={`text-[11px] mt-0.5 ${idx === 1 ? "text-white/80" : "text-muted"}`}>
              {item.durasi}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri & Tengah: Bank Pertanyaan Terpilih & Jawaban Guru */}
        <div className="lg:col-span-2 space-y-6">
          <Panel
            title="Pertanyaan Percakapan Terpilih"
            subtitle={`Disarankan 3-5 pertanyaan terarah. (${selectedQuestions.length} pertanyaan dipilih)`}
          >
            <div className="space-y-4">
              {selectedQuestions.map((kode) => {
                const q = SEED_COACHING_QUESTIONS.find((item) => item.kode === kode);
                if (!q) return null;
                return (
                  <div key={kode} className="p-4 rounded-control border border-border bg-black/5 dark:bg-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-xs text-primary">{q.kode} - Kategori {q.kategori}</span>
                      <button
                        onClick={() => toggleQuestion(kode)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                    <p className="text-sm font-medium text-foreground">{q.pertanyaan}</p>
                    <textarea
                      rows={2}
                      placeholder="Catat rangkuman respon atau komitmen guru..."
                      className="w-full px-3 py-1.5 text-xs rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Pemilih dari Bank 45 Pertanyaan */}
          <Panel title="Pilih Tambahan dari Bank 45 Pertanyaan Coaching">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-border">
              {["A", "B", "C", "D", "E", "F", "G"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-control text-xs font-semibold border transition-smooth ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface text-foreground border-border"
                  }`}
                >
                  Kategori {cat}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {SEED_COACHING_QUESTIONS.filter((q) => q.kategori === activeCategory).map((q) => {
                const isSelected = selectedQuestions.includes(q.kode);
                return (
                  <div
                    key={q.kode}
                    onClick={() => toggleQuestion(q.kode)}
                    className={`p-3 rounded-control border text-xs cursor-pointer flex items-start justify-between gap-3 transition-colors ${
                      isSelected
                        ? "bg-primary/10 border-primary text-foreground"
                        : "bg-surface border-border text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <div>
                      <span className="font-bold font-mono text-primary mr-2">{q.kode}</span>
                      <span>{q.pertanyaan}</span>
                    </div>
                    <span className="font-semibold text-primary">{isSelected ? "Dipilih" : "+ Tambah"}</span>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* Kolom Kanan: Prinsip Percakapan & Temuan Aspek */}
        <div className="space-y-6">
          <Panel title="Prinsip Percakapan Kemitraan">
            <div className="space-y-3 text-xs text-muted">
              <p>
                <strong>Aturan 70/30:</strong> Dengarkan 70% dan biarkan guru berbicara, supervisor berbicara 30% memandu alur.
              </p>
              <p>
                <strong>Bebas Menghakimi:</strong> Berangkat dari data fakta nyata, bukan asumsi kepribadian.
              </p>
              <p>
                <strong>Kekuatan Terlebih Dahulu:</strong> Awali dengan mengapresiasi aspek-aspek terkuat sebelum mendiskusikan area prioritas.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

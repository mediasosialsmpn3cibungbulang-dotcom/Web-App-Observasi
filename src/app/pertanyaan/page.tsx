"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  Search,
  Plus,
  Copy,
  Check,
  Sparkles,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SEED_COACHING_QUESTIONS } from "@/contracts/seed-data";
import { CoachingQuestion } from "@/contracts/schemas";

export default function PertanyaanPage() {
  const [selectedCat, setSelectedCat] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [questions, setQuestions] = useState<CoachingQuestion[]>(SEED_COACHING_QUESTIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form tambah
  const [formKode, setFormKode] = useState("");
  const [formKategori, setFormKategori] = useState<CoachingQuestion["kategori"]>("D");
  const [formPertanyaan, setFormPertanyaan] = useState("");
  const [formTujuan, setFormTujuan] = useState("");

  const handleCopy = (kode: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(kode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPertanyaan || !formTujuan) return;

    const newQ: CoachingQuestion = {
      kode: formKode || `${formKategori}-99`,
      kategori: formKategori,
      pertanyaan: formPertanyaan,
      tujuan: formTujuan,
      kapan_efektif: "Sesi Coaching Pasca-Observasi",
      is_default: false,
      jumlah_dipakai: 0,
    };

    setQuestions([newQ, ...questions]);
    setIsModalOpen(false);
    setFormPertanyaan("");
    setFormTujuan("");
    setFormKode("");
  };

  const categoryLabels: Record<string, string> = {
    A: "Kategori A: Pembukaan & Eksplorasi Awal",
    B: "Kategori B: Refleksi Perasaan & Proses",
    C: "Kategori C: Analisis Bukti & Pembelajaran",
    D: "Kategori D: Eksplorasi Solusi & Rencana Aksi",
    E: "Kategori E: Penguatan Komitmen & Penutup",
    F: "Kategori F: Supervisi Tambahan & Khusus",
    G: "Kategori G: Cek-in Berkala RTL (Pekan 2, 4, 8/9)",
  };

  const filtered = questions.filter((q) => {
    const matchCat = selectedCat === "Semua" || q.kategori === selectedCat;
    const matchQuery =
      q.pertanyaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tujuan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-pine-600 dark:text-pine-400" />
            Bank 45 Pertanyaan Coaching Klinis
          </h1>
          <p className="text-sm text-muted mt-1">
            Daftar pertanyaan reflektif berdaya dorong tinggi dalam 7 kategori (A s.d. G) untuk memandu dialog supervisi tanpa menghakimi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Pertanyaan Kustom
          </Button>
        </div>
      </div>

      {/* Filter Kategori & Pencarian */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {["Semua", "A", "B", "C", "D", "E", "F", "G"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shrink-0 ${
                selectedCat === cat
                  ? "bg-pine-600 text-white border-pine-600 dark:bg-pine-500"
                  : "border-border text-muted hover:text-foreground bg-card"
              }`}
            >
              {cat === "Semua" ? "Semua Kategori (45)" : `Kategori ${cat}`}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode, tujuan, atau kata kunci..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-pine-500"
          />
        </div>
      </div>

      {/* Daftar Kartu Pertanyaan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.kode}
            className="p-4 rounded-xl border border-border bg-card hover:border-pine-400 dark:hover:border-pine-600 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-pine-50 text-pine-800 dark:bg-pine-950/40 dark:text-pine-300 border border-pine-200 dark:border-pine-800">
                    {item.kode}
                  </span>
                  <span className="text-[11px] text-muted">
                    {categoryLabels[item.kategori] || `Kategori ${item.kategori}`}
                  </span>
                </div>
                {!item.is_default && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200">
                    Kustom
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-foreground leading-relaxed mt-2">
                &ldquo;{item.pertanyaan}&rdquo;
              </p>

              <div className="mt-3 p-2 rounded bg-black/5 dark:bg-white/5 text-[11px] text-muted">
                <span className="font-semibold text-foreground">Tujuan Dialog: </span>
                {item.tujuan}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-border flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleCopy(item.kode, item.pertanyaan)}
              >
                {copiedCode === item.kode ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Salin Pertanyaan
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog Tambah Pertanyaan Kustom */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold font-serif text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pine-600" />
              Tambah Pertanyaan Coaching Kustom
            </h3>

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Kategori Fase Coaching
                </label>
                <select
                  value={formKategori}
                  onChange={(e) => setFormKategori(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-lg border border-border bg-card text-foreground"
                >
                  <option value="A">Kategori A: Pembukaan & Eksplorasi Awal</option>
                  <option value="B">Kategori B: Refleksi Perasaan & Proses</option>
                  <option value="C">Kategori C: Analisis Bukti & Pembelajaran</option>
                  <option value="D">Kategori D: Eksplorasi Solusi & Rencana Aksi</option>
                  <option value="E">Kategori E: Penguatan Komitmen & Penutup</option>
                  <option value="F">Kategori F: Supervisi Khusus</option>
                  <option value="G">Kategori G: Cek-in Berkala RTL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Kalimat Pertanyaan Reflektif <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formPertanyaan}
                  onChange={(e) => setFormPertanyaan(e.target.value)}
                  placeholder="Contoh: Apa indikator utama bahwa siswa telah memahami konsep tersebut?"
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Tujuan / Dampak yang Diharapkan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTujuan}
                  onChange={(e) => setFormTujuan(e.target.value)}
                  placeholder="Contoh: Mengukur kejelasan kriteria asesmen mandiri guru"
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary">
                  Simpan Pertanyaan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

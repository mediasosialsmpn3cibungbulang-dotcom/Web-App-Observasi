"use client";

import React, { useState } from "react";
import { HelpCircle, Search, Plus } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { SEED_COACHING_QUESTIONS } from "@/contracts/seed-data";

export default function PertanyaanPage() {
  const [selectedCat, setSelectedCat] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = SEED_COACHING_QUESTIONS.filter((q) => {
    const matchCat = selectedCat === "Semua" || q.kategori === selectedCat;
    const matchQuery =
      q.pertanyaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tujuan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-foreground">
            Bank Pertanyaan Coaching
          </h1>
          <p className="text-sm text-muted mt-1">
            45 pertanyaan percakapan reflektif terstruktur dalam 7 kategori (Dokumen Bonus 1 & Sheet 7).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Pertanyaan Kustom
          </Button>
        </div>
      </div>

      {/* Filter Kategori & Cari */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {["Semua", "A", "B", "C", "D", "E", "F", "G"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold border transition-smooth ${
                selectedCat === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-surface text-foreground border-border"
              }`}
            >
              {cat === "Semua" ? "Semua Kategori" : `Kategori ${cat}`}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode atau kata kunci..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((q) => (
          <Panel key={q.kode} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-primary px-2 py-0.5 rounded bg-primary/10">
                {q.kode} (Kategori {q.kategori})
              </span>
              <span className="text-[10px] text-muted">Dipakai {q.jumlah_dipakai}x</span>
            </div>
            <p className="text-sm font-medium text-foreground">{q.pertanyaan}</p>
            <div className="pt-2 border-t border-border text-xs text-muted space-y-1">
              <p>
                <strong>Tujuan:</strong> {q.tujuan}
              </p>
              <p>
                <strong>Waktu Efektif:</strong> {q.kapan_efektif}
              </p>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

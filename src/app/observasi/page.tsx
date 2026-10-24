"use client";

import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  Save,
  CheckCircle2,
  Clock,
  Plus,
  Camera,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScoreSelector } from "@/components/ui/ScoreSelector";
import { SEED_INDICATORS, SEED_MOCK_TEACHERS } from "@/contracts/seed-data";
import { AspectCode } from "@/contracts/enums";
import {
  calculateObservationTotalScore,
  calculateObservationPercentage,
  determinePredicate,
} from "@/domain/scoring";

export default function ObservasiPage() {
  // State 28 indikator (kode: skor)
  const [scores, setScores] = useState<Record<string, number>>({
    A1: 4,
    A2: 3,
    A3: 4,
    A4: 3,
    B1: 3,
    B2: 4,
  });

  const [activeAspect, setActiveAspect] = useState<AspectCode>("A");
  const [timerMinutes, setTimerMinutes] = useState(14);
  const [factNoteInput, setFactNoteInput] = useState("");
  const [factNotes, setFactNotes] = useState([
    {
      id: "1",
      menit: 4,
      fakta: "Guru menyapa siswa dengan ramah dan meminta membuka buku catatan matematika.",
      ucapan: "'Selamat pagi, mari kita lanjutkan eksplorasi persamaan kita.'",
    },
    {
      id: "2",
      menit: 11,
      fakta: "Guru mengajukan pertanyaan pemantik mengenai tarif parkir 3 jenis kendaraan.",
      ucapan: "'Berapa persamaan yang bisa kita susun dari struk parkir ini?'",
    },
  ]);

  // Hitungan nilai runtime (BR-01 s.d. BR-03)
  const scoreArray = useMemo(() => {
    return SEED_INDICATORS.map((ind) => scores[ind.kode]).filter(
      (s): s is number => typeof s === "number"
    );
  }, [scores]);

  const totalScore = calculateObservationTotalScore(scoreArray);
  const percentage = calculateObservationPercentage(totalScore);
  const predikat = determinePredicate(percentage);
  const completedCount = Object.keys(scores).length;

  const handleScoreChange = (kode: string, score: number) => {
    setScores((prev) => ({ ...prev, [kode]: score }));
  };

  const handleAddFactNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factNoteInput.trim()) return;
    setFactNotes((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        menit: timerMinutes,
        fakta: factNoteInput.trim(),
        ucapan: "",
      },
    ]);
    setFactNoteInput("");
  };

  return (
    <div className="space-y-6">
      {/* Header Observasi & Status Kelengkapan */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-foreground">
              Lembar Observasi Pembelajaran
            </h1>
            <span className="px-2.5 py-0.5 rounded text-xs bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-300 font-medium">
              Sesi Draf
            </span>
          </div>
          <p className="text-sm text-muted mt-1">
            Guru: <strong>{SEED_MOCK_TEACHERS[0].nama_lengkap}</strong> (Matematika - Kelas X-A)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md">
            <Save className="w-4 h-4 mr-2" />
            Simpan Draf (Lokal)
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={completedCount < 28}
            title={completedCount < 28 ? "Wajib mengisi 28 indikator sebelum finalisasi" : ""}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Finalisasi Observasi
          </Button>
        </div>
      </div>

      {/* Bar Indikator Kemajuan & Nilai Real-time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Kelengkapan 28 Indikator */}
        <Panel className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase text-muted font-semibold">Kelengkapan Indikator</span>
            <p className="text-xl font-bold font-serif text-foreground mt-0.5">
              {completedCount} <span className="text-sm text-muted font-normal">dari 28 butir</span>
            </p>
          </div>
          <div className="w-16 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(completedCount / 28) * 100}%` }}
            />
          </div>
        </Panel>

        {/* Nilai Persentase Real-time */}
        <Panel className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase text-muted font-semibold">Kalkulasi Skor</span>
            <p className="text-xl font-bold font-mono text-foreground mt-0.5">
              {percentage !== null ? `${percentage.toFixed(1)}%` : "Belum Lengkap"}
            </p>
          </div>
          {predikat && <Badge predikat={predikat} />}
        </Panel>

        {/* Timer Sesi Observasi Kelas */}
        <Panel className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase text-muted font-semibold">Durasi Pengamatan</span>
            <p className="text-xl font-bold font-mono text-foreground mt-0.5">
              Menit ke-{timerMinutes}
            </p>
          </div>
          <Clock className="w-5 h-5 text-primary" />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri & Tengah: 7 Aspek & Rubrik Indikator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Pemilih Aspek A s.d. G */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 select-none">
            {(["A", "B", "C", "D", "E", "F", "G"] as const).map((code) => {
              const isActive = activeAspect === code;
              return (
                <button
                  key={code}
                  onClick={() => setActiveAspect(code)}
                  className={`px-3.5 py-2 rounded-control text-xs font-semibold whitespace-nowrap transition-smooth border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-surface text-foreground border-border hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  Aspek {code}
                </button>
              );
            })}
          </div>

          {/* Daftar Indikator untuk Aspek Terpilih */}
          <div className="space-y-4">
            {SEED_INDICATORS.filter((ind) => ind.aspek === activeAspect).map((ind) => {
              const currentScore = scores[ind.kode];
              return (
                <Panel key={ind.kode} className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {ind.kode}
                    </span>
                    <p className="text-sm font-medium text-foreground flex-1 leading-snug">
                      {ind.pernyataan}
                    </p>
                  </div>

                  {/* Komponen Pemilih Skor Rubrik */}
                  <ScoreSelector
                    value={currentScore}
                    onChange={(val) => handleScoreChange(ind.kode, val)}
                    enableKeyboardShortcuts={true}
                  />

                  {/* Catatan Bukti Observasi */}
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Catat bukti teramati untuk indikator ini..."
                      className="w-full px-3 py-1.5 text-xs rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </Panel>
              );
            })}
          </div>
        </div>

        {/* Kolom Kanan: Catatan Fakta Berbasis Waktu (Live Notes) */}
        <div className="space-y-4">
          <Panel
            title="Catatan Fakta Teramati"
            subtitle="Pencatatan bukti objektif (bebas interpretasi menghakimi)"
          >
            {/* Form Tambah Catatan Fakta Cepat */}
            <form onSubmit={handleAddFactNote} className="space-y-2 mb-4 pb-4 border-b border-border">
              <div className="flex items-center gap-2 text-xs text-muted mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Menit ke-{timerMinutes}</span>
              </div>
              <textarea
                value={factNoteInput}
                onChange={(e) => setFactNoteInput(e.target.value)}
                rows={2}
                placeholder="Tulis fakta objektif atau kutip ucapan guru/siswa..."
                className="w-full px-3 py-2 text-xs rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex items-center justify-between">
                <Button type="button" variant="ghost" size="sm" className="text-xs text-muted">
                  <Camera className="w-3.5 h-3.5 mr-1" />
                  Foto Artefak
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Tambah Fakta
                </Button>
              </div>
            </form>

            {/* Riwayat Fakta Live */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {factNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-control border border-border bg-black/5 dark:bg-white/5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-muted font-mono font-semibold">
                    <span>Menit {note.menit}</span>
                    <span className="text-[10px]">Tersimpan</span>
                  </div>
                  <p className="text-foreground">{note.fakta}</p>
                  {note.ucapan && (
                    <p className="text-muted italic border-l-2 border-primary pl-2 mt-1">
                      {note.ucapan}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { X, CheckSquare, Plus, Clock } from "lucide-react";
import { FollowupItem, FollowupCheck } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
import { SEED_COACHING_QUESTIONS } from "@/contracts/seed-data";
import { formatTanggalIndonesia } from "@/lib/utils";

interface FollowupCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  followup: FollowupItem;
  checks: FollowupCheck[];
  onAddCheck: (check: Omit<FollowupCheck, "id" | "created_at">) => void;
}

export const FollowupCheckModal: React.FC<FollowupCheckModalProps> = ({
  isOpen,
  onClose,
  followup,
  checks,
  onAddCheck,
}) => {
  const [pekan, setPekan] = useState<"2" | "4" | "8" | "9">("2");
  const [kodeG, setKodeG] = useState("G-01");
  const [catatanHasil, setCatatanHasil] = useState("");
  const [dukunganLanjutan, setDukunganLanjutan] = useState("");

  if (!isOpen) return null;

  const questionsG = SEED_COACHING_QUESTIONS.filter((q) => q.kategori === "G");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catatanHasil.trim()) return;

    onAddCheck({
      followup_id: followup.id,
      pekan_ke: pekan,
      tanggal_cek: new Date().toISOString().split("T")[0],
      kode_pertanyaan_g: kodeG as any,
      catatan_hasil: catatanHasil.trim(),
      dukungan_lanjutan: dukunganLanjutan.trim() || undefined,
    });

    setCatatanHasil("");
    setDukunganLanjutan("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-surface border border-border rounded-panel max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-black/5 dark:bg-white/5">
          <div>
            <h3 className="text-base font-bold font-serif text-foreground">
              Log Monitoring Berkala Tindak Lanjut
            </h3>
            <p className="text-xs text-muted mt-0.5 line-clamp-1">{followup.masalah_utama}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-muted hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 space-y-6 overflow-y-auto text-xs md:text-sm">
          {/* Riwayat Check-in Sebelumnya */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted">
              Riwayat Cek-in Pengawasan:
            </h4>
            {checks.length === 0 ? (
              <p className="text-xs text-muted text-center py-4 border border-dashed border-border rounded-control">
                Belum ada catatan cek berkala untuk komitmen ini.
              </p>
            ) : (
              <div className="space-y-2.5">
                {checks.map((c) => {
                  const q = questionsG.find((item) => item.kode === c.kode_pertanyaan_g);
                  return (
                    <div
                      key={c.id}
                      className="p-3 rounded-control border border-border bg-black/5 dark:bg-white/5 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-muted">
                        <span className="font-bold text-primary font-mono">Pekan ke-{c.pekan_ke}</span>
                        <span className="font-mono text-[10px]">{formatTanggalIndonesia(c.tanggal_cek)}</span>
                      </div>
                      <p className="font-medium text-foreground">{c.catatan_hasil}</p>
                      {q && <p className="text-[11px] text-muted italic">Pertanyaan {c.kode_pertanyaan_g}: &ldquo;{q.pertanyaan}&rdquo;</p>}
                      {c.dukungan_lanjutan && (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                          <strong>Dukungan Lanjutan:</strong> {c.dukungan_lanjutan}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form Tambah Cek Berkala Baru */}
          <form onSubmit={handleSubmit} className="p-4 rounded-control border border-border bg-surface space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">
              Catat Hasil Cek-in Baru
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-muted mb-1">
                  Periode Pekan *
                </label>
                <select
                  value={pekan}
                  onChange={(e) => setPekan(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-control border border-border bg-surface text-foreground"
                >
                  <option value="2">Pekan ke-2</option>
                  <option value="4">Pekan ke-4</option>
                  <option value="8">Pekan ke-8</option>
                  <option value="9">Pekan ke-9 (Akhir)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-muted mb-1">
                  Pertanyaan Kategori G *
                </label>
                <select
                  value={kodeG}
                  onChange={(e) => setKodeG(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-control border border-border bg-surface text-foreground"
                >
                  {questionsG.map((q) => (
                    <option key={q.kode} value={q.kode}>
                      {q.kode} - {q.pertanyaan.slice(0, 35)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-muted mb-1">
                Catatan Hasil Kemajuan Nyata *
              </label>
              <textarea
                rows={2}
                value={catatanHasil}
                onChange={(e) => setCatatanHasil(e.target.value)}
                placeholder="Bagaimana respon siswa dan kendala teknis yang dihadapi guru..."
                className="w-full px-2.5 py-1.5 text-xs rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-muted mb-1">
                Dukungan Lanjutan Sekolah
              </label>
              <input
                type="text"
                value={dukunganLanjutan}
                onChange={(e) => setDukunganLanjutan(e.target.value)}
                placeholder="Fasilitas tambahan, pendampingan lanjutan..."
                className="w-full px-2.5 py-1.5 text-xs rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" variant="primary" size="sm">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Simpan Catatan Monitoring
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

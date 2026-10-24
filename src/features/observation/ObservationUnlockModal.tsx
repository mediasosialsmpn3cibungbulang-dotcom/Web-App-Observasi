"use client";

import React, { useState } from "react";
import { X, Unlock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ObservationUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (alasan: string) => void;
}

export const ObservationUnlockModal: React.FC<ObservationUnlockModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [alasan, setAlasan] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (alasan.trim().length < 5) {
      setErrorMsg("Alasan buka kunci wajib diisi minimal 5 karakter.");
      return;
    }
    onConfirm(alasan.trim());
    setAlasan("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-surface border border-border rounded-panel max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2 text-rose-600">
            <Unlock className="w-5 h-5" />
            <h3 className="text-base font-bold font-serif text-foreground">
              Buka Kunci Lembar Observasi
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-muted hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-muted leading-relaxed">
          Sesi observasi ini telah difinalisasi dan dikunci. Membuka kunci akan memungkinkan pengubahan skor kembali dan <strong>wajib menyertakan alasan tertulis yang dicatat di jejak audit</strong>.
        </p>

        {errorMsg && (
          <div className="p-2.5 rounded-control bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1">
              Alasan Pembukaan Kunci *
            </label>
            <textarea
              rows={3}
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Contoh: Koreksi bukti nyata indikator B2 atas persetujuan kepala sekolah..."
              className="w-full px-3 py-2 text-xs rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="danger">
              <Unlock className="w-4 h-4 mr-1.5" />
              Buka Kunci Sekarang
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

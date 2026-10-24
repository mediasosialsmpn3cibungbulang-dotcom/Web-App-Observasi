"use client";

import React, { useState } from "react";
import { X, Upload, CheckCircle2, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { Teacher } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
import { TeacherService, ImportPreviewResult } from "./teacher-service";

interface TeacherImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const TeacherImportModal: React.FC<TeacherImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [rawText, setRawText] = useState("");
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = () => {
    if (!rawText.trim()) return;
    const result = TeacherService.parseImportData(rawText);
    setPreview(result);
  };

  const handleCommit = () => {
    if (!preview || preview.valid.length === 0) return;
    TeacherService.commitImport(preview.valid);
    onImportComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-surface border border-border rounded-panel max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold font-serif text-foreground">
              Impor Data Guru (Sheet 2 Excel)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 text-xs md:text-sm">
          {!preview ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-control bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200 text-xs">
                <strong>Petunjuk Format Salinan Excel:</strong> Salin (Copy-Paste) baris data dari <em>Sheet 2 Database Guru</em>. Kolom berurutan:
                <br />
                <code>Nama Lengkap, NIP/NUPTK, Mata Pelajaran, Kelas Diampu, Status, Fase, No HP, Email, Tahun Masuk</code>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Tempel Baris Data Excel / CSV
                </label>
                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Dra. Nurul Hidayati,198501012010012001,Bahasa Indonesia,X-A,ASN,E,081234567890,nurul@sekolah.sch.id,2015\nAgus Supriyanto S.Pd,199805122025011002,Geografi,XI-3,PPPK,F,085612345678,agus@sekolah.sch.id,2025`}
                  className="w-full px-3 py-2 text-xs font-mono rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={onClose}>
                  Batal
                </Button>
                <Button variant="primary" onClick={handleAnalyze} disabled={!rawText.trim()}>
                  <Upload className="w-4 h-4 mr-1.5" />
                  Pratinjau Data Impor
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Ringkasan Hasil Pratinjau */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-control bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200">
                  <span className="text-xl font-bold font-mono">{preview.valid.length}</span>
                  <p className="text-xs mt-0.5">Baris Valid Siap Disimpan</p>
                </div>
                <div className="p-3 rounded-control bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200">
                  <span className="text-xl font-bold font-mono">{preview.invalid.length}</span>
                  <p className="text-xs mt-0.5">Baris Bermasalah (Dilewati)</p>
                </div>
              </div>

              {/* Laporan Galat per Baris */}
              {preview.invalid.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-muted tracking-wider">
                    Laporan Galat Baris:
                  </span>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {preview.invalid.map((inv, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-control bg-rose-500/5 border border-rose-500/20 text-xs flex items-start gap-2"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Baris #{inv.baris}:</strong> {inv.nama} ({inv.nip})
                          <p className="text-rose-600 dark:text-rose-400 mt-0.5">{inv.alasan.join(", ")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabel Pratinjau Valid */}
              {preview.valid.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-muted tracking-wider">
                    Daftar Guru yang Akan Ditambahkan:
                  </span>
                  <div className="max-h-48 overflow-y-auto border border-border rounded-control">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-black/5 dark:bg-white/5 border-b border-border text-muted">
                        <tr>
                          <th className="p-2">Nama Guru</th>
                          <th className="p-2">NIP/NUPTK</th>
                          <th className="p-2">Mata Pelajaran</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {preview.valid.map((t) => (
                          <tr key={t.id}>
                            <td className="p-2 font-medium">{t.nama_lengkap}</td>
                            <td className="p-2 font-mono">{t.nip_nuptk}</td>
                            <td className="p-2">{t.mata_pelajaran}</td>
                            <td className="p-2">{t.status_kepegawaian}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setPreview(null)}>
                  &larr; Ubah Teks Salinan
                </Button>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={onClose}>
                    Batal
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCommit}
                    disabled={preview.valid.length === 0}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Konfirmasi Impor ({preview.valid.length} Guru)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { Settings, Save, Shield } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { SEED_SCHOOL_SETTINGS, SEED_GRADING_SETTINGS } from "@/contracts/seed-data";

export default function PengaturanPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-foreground">
            Pengaturan Sistem & Standar Nilai
          </h1>
          <p className="text-sm text-muted mt-1">
            Konfigurasi identitas sekolah, semester aktif, dan ambang batas predikat penilaian (Sheet 13).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" size="md">
            <Save className="w-4 h-4 mr-2" />
            Simpan Perubahan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identitas Satuan Pendidikan */}
        <Panel title="Identitas Satuan Pendidikan" subtitle="Data resmi kop dan penandatanganan dokumen">
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                Nama Sekolah
              </label>
              <input
                type="text"
                defaultValue={SEED_SCHOOL_SETTINGS.nama_sekolah}
                className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  NPSN
                </label>
                <input
                  type="text"
                  defaultValue={SEED_SCHOOL_SETTINGS.npsn}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Semester Aktif
                </label>
                <input
                  type="text"
                  defaultValue={SEED_SCHOOL_SETTINGS.semester_aktif}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-semibold text-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                Alamat Sekolah
              </label>
              <input
                type="text"
                defaultValue={SEED_SCHOOL_SETTINGS.alamat}
                className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Nama Kepala Sekolah
                </label>
                <input
                  type="text"
                  defaultValue={SEED_SCHOOL_SETTINGS.nama_kepala_sekolah}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  defaultValue={SEED_SCHOOL_SETTINGS.nip_kepala_sekolah}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </Panel>

        {/* Ambang Batas Skoring & Standar Nilai */}
        <Panel title="Standar Penilaian & Ambang Batas" subtitle="Parameter rumus kalkulasi nilai (BR-02 s.d. BR-08)">
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Ambang Amat Baik (%)
                </label>
                <input
                  type="number"
                  defaultValue={SEED_GRADING_SETTINGS.ambang_amat_baik}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono font-bold text-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Ambang Baik (%)
                </label>
                <input
                  type="number"
                  defaultValue={SEED_GRADING_SETTINGS.ambang_baik}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono font-bold text-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Ambang Cukup (%)
                </label>
                <input
                  type="number"
                  defaultValue={SEED_GRADING_SETTINGS.ambang_cukup}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono font-bold text-amber-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Target Nilai Default (%)
                </label>
                <input
                  type="number"
                  defaultValue={SEED_GRADING_SETTINGS.target_default}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Ambang Aspek Prioritas (&lt; Skala 4)
                </label>
                <input
                  type="number"
                  step="0.1"
                  defaultValue={SEED_GRADING_SETTINGS.ambang_aspek_prioritas}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Toleransi Tren Stagnan (Poin)
                </label>
                <input
                  type="number"
                  step="0.5"
                  defaultValue={SEED_GRADING_SETTINGS.toleransi_tren_stagnan}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono"
                />
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

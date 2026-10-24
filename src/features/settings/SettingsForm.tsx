"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, AlertCircle, CheckCircle2, History } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { SchoolSettings, GradingSettings, AuditLog } from "@/contracts/schemas";
import { SettingsService } from "./settings-service";
import { formatTanggalIndonesia, formatWaktuIndonesia } from "@/lib/utils";

export const SettingsForm: React.FC = () => {
  const [school, setSchool] = useState<SchoolSettings | null>(null);
  const [grading, setGrading] = useState<GradingSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setSchool(SettingsService.getSchoolSettings());
    setGrading(SettingsService.getGradingSettings());
    setAuditLogs(SettingsService.getAuditLogs());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !grading) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      SettingsService.saveSchoolSettings(school);
      SettingsService.saveGradingSettings(grading);
      setAuditLogs(SettingsService.getAuditLogs());
      setSuccessMsg("Pengaturan sekolah dan standar penilaian berhasil disimpan!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Terjadi kesalahan saat menyimpan pengaturan.");
      }
    }
  };

  if (!school || !grading) {
    return <div className="p-8 text-center text-muted">Memuat data pengaturan...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Alert Umpan Balik */}
      {successMsg && (
        <div className="p-3.5 rounded-control bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 rounded-control bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Pengaturan Sekolah & Standar Nilai
          </h1>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Atur identitas resmi sekolah, semester aktif, dan ambang batas predikat penilaian supervisi guru.
          </p>
        </div>

        <Button type="submit" variant="primary" size="md">
          <Save className="w-4 h-4 mr-2" />
          Simpan Semua Pengaturan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom 1: Profil Sekolah */}
        <Panel title="Identitas Satuan Pendidikan" subtitle="Data resmi untuk kop dan Berita Acara">
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                Nama Sekolah
              </label>
              <input
                type="text"
                value={school.nama_sekolah}
                onChange={(e) => setSchool({ ...school, nama_sekolah: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  NPSN (8 Digit)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={school.npsn}
                  onChange={(e) => setSchool({ ...school, npsn: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Semester Aktif
                </label>
                <input
                  type="text"
                  value={school.semester_aktif}
                  onChange={(e) => setSchool({ ...school, semester_aktif: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                Alamat Sekolah
              </label>
              <input
                type="text"
                value={school.alamat}
                onChange={(e) => setSchool({ ...school, alamat: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Nama Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={school.nama_kepala_sekolah}
                  onChange={(e) => setSchool({ ...school, nama_kepala_sekolah: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={school.nip_kepala_sekolah}
                  onChange={(e) => setSchool({ ...school, nip_kepala_sekolah: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Nama Pengawas Pembina
                </label>
                <input
                  type="text"
                  value={school.nama_pengawas || ""}
                  onChange={(e) => setSchool({ ...school, nama_pengawas: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  NIP Pengawas Pembina
                </label>
                <input
                  type="text"
                  value={school.nip_pengawas || ""}
                  onChange={(e) => setSchool({ ...school, nip_pengawas: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </Panel>

        {/* Kolom 2: Standar Skoring */}
        <Panel title="Standar Penilaian & Ambang Batas" subtitle="Parameter rumus kalkulasi nilai (BR-02 s.d. BR-08)">
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Ambang Amat Baik (%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={grading.ambang_amat_baik}
                  onChange={(e) => setGrading({ ...grading, ambang_amat_baik: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Ambang Baik (%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={grading.ambang_baik}
                  onChange={(e) => setGrading({ ...grading, ambang_baik: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
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
                  min={1}
                  max={100}
                  value={grading.ambang_cukup}
                  onChange={(e) => setGrading({ ...grading, ambang_cukup: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono font-bold text-amber-600 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Target Nilai Default (%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={grading.target_default}
                  onChange={(e) => setGrading({ ...grading, target_default: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  required
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
                  min={1}
                  max={4}
                  value={grading.ambang_aspek_prioritas}
                  onChange={(e) => setGrading({ ...grading, ambang_aspek_prioritas: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Toleransi Tren Stagnan (Poin)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  max={10}
                  value={grading.toleransi_tren_stagnan}
                  onChange={(e) => setGrading({ ...grading, toleransi_tren_stagnan: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Jejak Audit Perubahan Terakhir */}
      {auditLogs.length > 0 && (
        <Panel title="Jejak Audit Aktivitas Perubahan" subtitle="Pencatatan riwayat perubahan pengaturan sistem">
          <div className="overflow-x-auto -mx-4 md:-mx-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-border uppercase text-muted tracking-wider">
                <tr>
                  <th className="py-2.5 px-4 md:px-6">Waktu</th>
                  <th className="py-2.5 px-4">Pengguna</th>
                  <th className="py-2.5 px-4">Aktivitas</th>
                  <th className="py-2.5 px-4">Request ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditLogs.slice(0, 5).map((log) => (
                  <tr key={log.id}>
                    <td className="py-2.5 px-4 md:px-6 font-mono text-muted">
                      {formatTanggalIndonesia(log.timestamp)} {formatWaktuIndonesia(log.timestamp)}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-foreground">{log.actor_email}</td>
                    <td className="py-2.5 px-4 font-mono text-primary">{log.aksi}</td>
                    <td className="py-2.5 px-4 text-muted font-mono">{log.request_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </form>
  );
};

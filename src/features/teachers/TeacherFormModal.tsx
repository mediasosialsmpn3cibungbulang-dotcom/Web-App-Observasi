"use client";

import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Teacher } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
import { EmploymentStatus, LearningPhase } from "@/contracts/enums";

interface TeacherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Teacher, "id" | "created_at">) => void;
  initialData?: Teacher | null;
}

export const TeacherFormModal: React.FC<TeacherFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    nip_nuptk: "",
    mata_pelajaran: "",
    kelas_diampu: "",
    status_kepegawaian: "ASN" as EmploymentStatus,
    fase: "D" as LearningPhase,
    jabatan_tambahan: "",
    wali_kelas: "",
    nomor_hp: "",
    email: "",
    tahun_masuk: 2020,
    is_senior_mentor: false,
    target_sesi: null as number | null,
    catatan_khusus: "",
    aktif: true,
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama_lengkap: initialData.nama_lengkap,
        nip_nuptk: initialData.nip_nuptk,
        mata_pelajaran: initialData.mata_pelajaran,
        kelas_diampu: initialData.kelas_diampu,
        status_kepegawaian: initialData.status_kepegawaian,
        fase: initialData.fase,
        jabatan_tambahan: initialData.jabatan_tambahan || "",
        wali_kelas: initialData.wali_kelas || "",
        nomor_hp: initialData.nomor_hp,
        email: initialData.email,
        tahun_masuk: initialData.tahun_masuk,
        is_senior_mentor: initialData.is_senior_mentor,
        target_sesi: initialData.target_sesi ?? null,
        catatan_khusus: initialData.catatan_khusus || "",
        aktif: initialData.aktif,
      });
    } else {
      setFormData({
        nama_lengkap: "",
        nip_nuptk: "",
        mata_pelajaran: "",
        kelas_diampu: "",
        status_kepegawaian: "ASN",
        fase: "D",
        jabatan_tambahan: "",
        wali_kelas: "",
        nomor_hp: "",
        email: "",
        tahun_masuk: 2024,
        is_senior_mentor: false,
        target_sesi: null,
        catatan_khusus: "",
        aktif: true,
      });
    }
    setErrorMsg(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validasi NIP
    const cleanNip = formData.nip_nuptk.replace(/\D/g, "");
    if (cleanNip.length < 15 || cleanNip.length > 18) {
      setErrorMsg("NIP/NUPTK harus berupa 15 hingga 18 digit angka.");
      return;
    }

    try {
      onSubmit({
        ...formData,
        nip_nuptk: cleanNip,
        jabatan_tambahan: formData.jabatan_tambahan.trim() || null,
        wali_kelas: formData.wali_kelas.trim() || null,
        catatan_khusus: formData.catatan_khusus.trim() || null,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Gagal menyimpan data guru.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-surface border border-border rounded-panel max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-base font-bold font-serif text-foreground">
            {initialData ? "Ubah Data Guru" : "Tambah Guru Baru"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-control bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                value={formData.nama_lengkap}
                onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                placeholder="Contoh: Dra. Nurul Hidayati, M.Pd."
                className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                NIP / NUPTK (15-18 Digit) *
              </label>
              <input
                type="text"
                value={formData.nip_nuptk}
                onChange={(e) => setFormData({ ...formData, nip_nuptk: e.target.value })}
                placeholder="198501012010011001"
                className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                Mata Pelajaran *
              </label>
              <input
                type="text"
                value={formData.mata_pelajaran}
                onChange={(e) => setFormData({ ...formData, mata_pelajaran: e.target.value })}
                placeholder="Contoh: Bahasa Indonesia"
                className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                Kelas yang Diampu *
              </label>
              <input
                type="text"
                value={formData.kelas_diampu}
                onChange={(e) => setFormData({ ...formData, kelas_diampu: e.target.value })}
                placeholder="Contoh: X-A, X-B, XI-1"
                className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                Fase Kurikulum *
              </label>
              <select
                value={formData.fase}
                onChange={(e) => setFormData({ ...formData, fase: e.target.value as LearningPhase })}
                className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {["A", "B", "C", "D", "E", "F"].map((f) => (
                  <option key={f} value={f}>
                    Fase {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                Status Kepegawaian *
              </label>
              <select
                value={formData.status_kepegawaian}
                onChange={(e) =>
                  setFormData({ ...formData, status_kepegawaian: e.target.value as EmploymentStatus })
                }
                className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {["ASN", "PPPK", "GTY", "GTT", "Honorer", "Lainnya"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                Tahun Masuk Sekolah *
              </label>
              <input
                type="number"
                min={1970}
                max={2030}
                value={formData.tahun_masuk}
                onChange={(e) => setFormData({ ...formData, tahun_masuk: parseInt(e.target.value, 10) || 2020 })}
                className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <span className="text-[10px] text-muted">
                {2026 - formData.tahun_masuk < 3
                  ? "⭐ Kategori: Guru Baru (Min. 3x supervisi per semester)"
                  : "Kategori: Reguler"}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                Nomor WhatsApp / HP *
              </label>
              <input
                type="tel"
                value={formData.nomor_hp}
                onChange={(e) => setFormData({ ...formData, nomor_hp: e.target.value })}
                placeholder="081234567890"
                className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                Email Sekolah *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nama@sekolah.sch.id"
                className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Pengaturan Kustom Target Sesi Supervisi */}
            <div className="md:col-span-2 p-3.5 rounded-xl bg-surface/70 border border-border space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-foreground">
                    Target Sesi Supervisi (Semester Ini)
                  </label>
                  <p className="text-[11px] text-muted">
                    Tentukan jumlah sesi supervisi yang wajib dijalani guru ini secara kustom.
                  </p>
                </div>

                {/* Tombol Pilihan Cepat (Preset) */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="text-[11px] text-muted mr-0.5">Pilihan:</span>
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData({ ...formData, target_sesi: num })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        formData.target_sesi === num
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-surface border border-border hover:bg-black/5 dark:hover:bg-white/5 text-foreground"
                      }`}
                    >
                      {num}x
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, target_sesi: null })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      formData.target_sesi === null
                        ? "bg-zinc-700 text-white"
                        : "bg-surface border border-border text-muted hover:text-foreground"
                    }`}
                    title="Gunakan perhitungan otomatis berdasarkan masa kerja"
                  >
                    Otomatis
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="relative w-28 shrink-0">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.target_sesi ?? ""}
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value, 10) : null;
                      setFormData({ ...formData, target_sesi: val });
                    }}
                    placeholder="Auto"
                    className="w-full px-3 py-1.5 text-sm rounded-control border border-border bg-surface text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="text-xs text-muted">
                  {formData.target_sesi !== null ? (
                    <span className="font-semibold text-primary">
                      ✓ Ditentukan kustom: <strong>{formData.target_sesi} Sesi per semester</strong>
                    </span>
                  ) : (
                    <span>
                      Otomatis sistem:{" "}
                      <strong className="text-foreground">
                        {2026 - formData.tahun_masuk < 3
                          ? "3x (Guru Baru)"
                          : formData.is_senior_mentor
                          ? "1x (Senior/Mentor)"
                          : "2x (Reguler)"}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_senior_mentor"
                checked={formData.is_senior_mentor}
                onChange={(e) => setFormData({ ...formData, is_senior_mentor: e.target.checked })}
                className="rounded text-primary focus:ring-primary w-4 h-4"
              />
              <label htmlFor="is_senior_mentor" className="text-xs font-medium text-foreground cursor-pointer">
                Tetapkan sebagai Guru Senior / Mentor Sejawat (Target min. 1x supervisi)
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              <Check className="w-4 h-4 mr-1.5" />
              Simpan Data Guru
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

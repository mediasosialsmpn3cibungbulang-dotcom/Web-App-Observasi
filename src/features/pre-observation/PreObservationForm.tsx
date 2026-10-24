"use client";

import React, { useState, useEffect } from "react";
import { ClipboardList, Printer, CheckCircle2, Plus, Trash2, Save } from "lucide-react";
import { PreObservation, Teacher, SchoolSettings } from "@/contracts/schemas";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { PreObservationService } from "./pre-observation-service";
import { PreObservationPrintModal } from "./PreObservationPrintModal";
import { TeacherService } from "../teachers/teacher-service";
import { SettingsService } from "../settings/settings-service";
import { AspectCode, ASPECT_NAMES } from "@/contracts/enums";

export const PreObservationForm: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);

  const [formData, setFormData] = useState<PreObservation | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const list = TeacherService.getTeachers().filter((t) => t.aktif);
    setTeachers(list);
    const settings = SettingsService.getSchoolSettings();
    setSchoolSettings(settings);

    if (list.length > 0) {
      setSelectedTeacherId(list[0].id);
      loadPreObs(list[0].id, settings.semester_aktif);
    }
  }, []);

  const loadPreObs = (teacherId: string, semester: string) => {
    const existing = PreObservationService.getByTeacherId(teacherId);
    if (existing) {
      setFormData(existing);
    } else {
      setFormData({
        id: crypto.randomUUID(),
        schedule_id: crypto.randomUUID(),
        teacher_id: teacherId,
        supervisor_id: "00000000-0000-0000-0000-000000000001",
        semester,
        tanggal_pelaksanaan: new Date().toISOString().split("T")[0],
        topik_pembelajaran: "",
        tujuan_pembelajaran: "",
        metode_pembelajaran: "Problem-Based Learning",
        media_alat: "LKPD & Proyektor",
        teknik_asesmen: "Asesmen Formatif & Observasi Diskusi",
        alokasi_waktu: "2 JP (90 Menit)",
        jumlah_siswa: 32,
        karakteristik_siswa: "",
        tantangan_dihadapi: "",
        rencana_diferensiasi: "",
        harapan_guru: "",
        fokus_amatan: [
          {
            aspek: "D",
            indikator_sukses: "Diferensiasi proses dengan scaffolding kelompok bertahap.",
            catatan_khusus: "",
          },
        ],
        status: "Draf",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
      });
    }
  };

  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    if (schoolSettings) {
      loadPreObs(teacherId, schoolSettings.semester_aktif);
    }
  };

  const handleAddFokus = () => {
    if (!formData || formData.fokus_amatan.length >= 5) return;
    setFormData({
      ...formData,
      fokus_amatan: [
        ...formData.fokus_amatan,
        {
          aspek: "C",
          indikator_sukses: "Pemerataan respon pertanyaan pemantik bagi seluruh siswa.",
          catatan_khusus: "",
        },
      ],
    });
  };

  const handleRemoveFokus = (index: number) => {
    if (!formData || formData.fokus_amatan.length <= 1) return;
    setFormData({
      ...formData,
      fokus_amatan: formData.fokus_amatan.filter((_, idx) => idx !== index),
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    PreObservationService.savePreObservation(formData);
    setSuccessMsg("Formulir Pra-Observasi dan kesepakatan amatan berhasil disimpan!");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const currentTeacher = teachers.find((t) => t.id === selectedTeacherId);

  if (!formData || !currentTeacher || !schoolSettings) {
    return <div className="p-8 text-center text-muted">Memuat data pra-observasi...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {successMsg && (
        <div className="p-3.5 rounded-control bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Diskusi Persiapan (Pra-Observasi)
          </h1>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Wawancara awal bersama guru sebelum masuk kelas: sepakati materi, strategi belajar, dan fokus amatan (minimal H-5).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => setIsPrintModalOpen(true)}
          >
            <Printer className="w-4 h-4 mr-2" />
            Cetak Berita Acara (A4)
          </Button>
          <Button type="submit" variant="primary" size="md">
            <Save className="w-4 h-4 mr-2" />
            Simpan Pra-Observasi
          </Button>
        </div>
      </div>

      {/* Pemilih Guru Sasaran */}
      <div className="flex items-center gap-4 p-4 rounded-control border border-border bg-surface">
        <label className="text-xs font-semibold uppercase text-muted whitespace-nowrap">
          Pilih Guru Sasaran:
        </label>
        <select
          value={selectedTeacherId}
          onChange={(e) => handleTeacherChange(e.target.value)}
          className="flex-1 max-w-md px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nama_lengkap} ({t.mata_pelajaran} - {t.kelas_diampu})
            </option>
          ))}
        </select>
        <div className="ml-auto text-xs text-muted">
          Tanggal Pelaksanaan: <strong>{formData.tanggal_pelaksanaan}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri & Tengah: Rencana Pembelajaran */}
        <div className="lg:col-span-2 space-y-6">
          <Panel
            title="A. Rencana Pelaksanaan Pembelajaran (Diisi Bersama Guru)"
            subtitle="Modul ajar, metode, media, dan instrumen asesmen"
          >
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Topik / Materi Pembelajaran *
                </label>
                <input
                  type="text"
                  value={formData.topik_pembelajaran}
                  onChange={(e) => setFormData({ ...formData, topik_pembelajaran: e.target.value })}
                  placeholder="Contoh: Sistem Persamaan Linear Tiga Variabel (SPLTV)"
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Tujuan Pembelajaran (TP) *
                </label>
                <textarea
                  rows={2}
                  value={formData.tujuan_pembelajaran}
                  onChange={(e) => setFormData({ ...formData, tujuan_pembelajaran: e.target.value })}
                  placeholder="Artikulasikan capaian kompetensi siswa..."
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Metode Pembelajaran *
                  </label>
                  <input
                    type="text"
                    value={formData.metode_pembelajaran}
                    onChange={(e) => setFormData({ ...formData, metode_pembelajaran: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Media / Alat Bantu Belajar *
                  </label>
                  <input
                    type="text"
                    value={formData.media_alat}
                    onChange={(e) => setFormData({ ...formData, media_alat: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Teknik Asesmen Formatif *
                  </label>
                  <input
                    type="text"
                    value={formData.teknik_asesmen}
                    onChange={(e) => setFormData({ ...formData, teknik_asesmen: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Alokasi Waktu Pembelajaran *
                  </label>
                  <input
                    type="text"
                    value={formData.alokasi_waktu}
                    onChange={(e) => setFormData({ ...formData, alokasi_waktu: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>
          </Panel>

          {/* Fokus Pengamatan Bersama (Maks. 5 baris) */}
          <Panel
            title="B. Kesepakatan Fokus Pengamatan Bersama"
            subtitle="Aspek spesifik yang disepakati untuk diobservasi lebih mendalam (maksimal 5 butir)"
            action={
              formData.fokus_amatan.length < 5 && (
                <Button type="button" variant="outline" size="sm" onClick={handleAddFokus}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Tambah Fokus Amatan
                </Button>
              )
            }
          >
            <div className="space-y-3">
              {formData.fokus_amatan.map((fokus, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-control border border-border bg-black/5 dark:bg-white/5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary font-mono">
                      Fokus Amatan #{idx + 1}
                    </span>
                    {formData.fokus_amatan.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFokus(idx)}
                        className="text-xs text-rose-500 hover:underline flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-muted mb-1">
                        Aspek Pembelajaran
                      </label>
                      <select
                        value={fokus.aspek}
                        onChange={(e) => {
                          const updated = [...formData.fokus_amatan];
                          updated[idx].aspek = e.target.value as AspectCode;
                          setFormData({ ...formData, fokus_amatan: updated });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-control border border-border bg-surface text-foreground"
                      >
                        {(["A", "B", "C", "D", "E", "F", "G"] as const).map((a) => (
                          <option key={a} value={a}>
                            Aspek {a}: {ASPECT_NAMES[a]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-semibold uppercase text-muted mb-1">
                        Indikator Keberhasilan yang Diharapkan
                      </label>
                      <input
                        type="text"
                        value={fokus.indikator_sukses}
                        onChange={(e) => {
                          const updated = [...formData.fokus_amatan];
                          updated[idx].indikator_sukses = e.target.value;
                          setFormData({ ...formData, fokus_amatan: updated });
                        }}
                        placeholder="Contoh: Pemberian scaffolding berjenjang tepat sasaran..."
                        className="w-full px-2.5 py-1.5 text-xs rounded-control border border-border bg-surface text-foreground"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Kolom Kanan: Karakteristik & Tantangan */}
        <div className="space-y-6">
          <Panel
            title="C. Karakteristik & Tantangan Kelas"
            subtitle="Catatan profil siswa dan harapan guru"
          >
            <div className="space-y-4 text-xs md:text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Jumlah Siswa di Kelas
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.jumlah_siswa}
                  onChange={(e) =>
                    setFormData({ ...formData, jumlah_siswa: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full px-3 py-2 text-xs rounded-control border border-border bg-surface text-foreground font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Karakteristik & Profil Siswa
                </label>
                <textarea
                  rows={3}
                  value={formData.karakteristik_siswa}
                  onChange={(e) => setFormData({ ...formData, karakteristik_siswa: e.target.value })}
                  placeholder="Kesiapan belajar, profil minat..."
                  className="w-full px-3 py-2 text-xs rounded-control border border-border bg-surface text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Tantangan yang Diantisipasi
                </label>
                <textarea
                  rows={3}
                  value={formData.tantangan_dihadapi}
                  onChange={(e) => setFormData({ ...formData, tantangan_dihadapi: e.target.value })}
                  placeholder="Kendala pemahaman, keaktifan..."
                  className="w-full px-3 py-2 text-xs rounded-control border border-border bg-surface text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Rencana Diferensiasi Pembelajaran
                </label>
                <textarea
                  rows={2}
                  value={formData.rencana_diferensiasi}
                  onChange={(e) => setFormData({ ...formData, rencana_diferensiasi: e.target.value })}
                  placeholder="Diferensiasi konten/proses/produk..."
                  className="w-full px-3 py-2 text-xs rounded-control border border-border bg-surface text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Harapan Guru Terhadap Supervisi Ini
                </label>
                <textarea
                  rows={2}
                  value={formData.harapan_guru}
                  onChange={(e) => setFormData({ ...formData, harapan_guru: e.target.value })}
                  placeholder="Masukan objektif yang diharapkan..."
                  className="w-full px-3 py-2 text-xs rounded-control border border-border bg-surface text-foreground"
                />
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Modal Cetak Berita Acara A4 */}
      <PreObservationPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={formData}
        teacher={currentTeacher}
        school={schoolSettings}
      />
    </form>
  );
};

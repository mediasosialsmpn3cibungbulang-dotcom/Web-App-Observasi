import React from "react";
import { ClipboardList, Printer, CheckCircle } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";

export default function PraObservasiPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-foreground">
            Pertemuan Pra-Observasi
          </h1>
          <p className="text-sm text-muted mt-1">
            Penelaahan kesiapan modul ajar, tantangan kelas, dan kesepakatan fokus amatan pembelajaran (H-5).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md">
            <Printer className="w-4 h-4 mr-2" />
            Cetak Berita Acara
          </Button>
          <Button variant="primary" size="md">
            <CheckCircle className="w-4 h-4 mr-2" />
            Simpan Pra-Observasi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Rencana Pembelajaran */}
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Rencana Pembelajaran (Diisi oleh Guru)" subtitle="Data kesiapan modul ajar dan strategi instruksional">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Mata Pelajaran & Topik Pembelajaran
                </label>
                <input
                  type="text"
                  defaultValue="Matematika - Sistem Persamaan Linear Tiga Variabel (SPLTV)"
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Tujuan Pembelajaran (TP)
                </label>
                <textarea
                  rows={2}
                  defaultValue="Siswa mampu memodelkan masalah kontekstual ke dalam SPLTV dan menyelesaikannya secara kolaboratif."
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Metode Pembelajaran
                  </label>
                  <input
                    type="text"
                    defaultValue="Problem-Based Learning (PBL)"
                    className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Media / Alat Bantu
                  </label>
                  <input
                    type="text"
                    defaultValue="Lembar Kerja Peserta Didik (LKPD) & Geogebra"
                    className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground"
                  />
                </div>
              </div>
            </div>
          </Panel>

          {/* Fokus Pengamatan Bersama (Maksimal 5 Baris) */}
          <Panel
            title="Fokus Amatan Bersama"
            subtitle="Aspek spesifik yang disepakati untuk diobservasi lebih mendalam (maksimal 5 butir)"
          >
            <div className="space-y-3">
              <div className="p-3 rounded-control border border-border bg-black/5 dark:bg-white/5 text-sm flex items-start justify-between">
                <div>
                  <span className="font-semibold text-primary">Aspek D: Diferensiasi Pembelajaran</span>
                  <p className="text-muted text-xs mt-0.5">
                    Indikator: Efektivitas scaffolding berjenjang bagi kelompok siswa berkemampuan dasar.
                  </p>
                </div>
                <span className="text-xs text-muted">Fokus #1</span>
              </div>

              <div className="p-3 rounded-control border border-border bg-black/5 dark:bg-white/5 text-sm flex items-start justify-between">
                <div>
                  <span className="font-semibold text-primary">Aspek C: Interaksi Guru-Siswa</span>
                  <p className="text-muted text-xs mt-0.5">
                    Indikator: Pemerataan pertanyaan pemantik HOTS agar tidak didominasi barisan depan.
                  </p>
                </div>
                <span className="text-xs text-muted">Fokus #2</span>
              </div>
            </div>
          </Panel>
        </div>

        {/* Kolom Kanan: Karakteristik Siswa & Guru */}
        <div className="space-y-6">
          <Panel title="Karakteristik & Tantangan Kelas">
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-muted block font-semibold uppercase">Kelas & Jumlah Siswa</span>
                <p className="font-medium text-foreground">Kelas X-A (32 Siswa)</p>
              </div>
              <div>
                <span className="text-xs text-muted block font-semibold uppercase">Tantangan yang Diantisipasi</span>
                <p className="text-muted text-xs mt-1">
                  Sebagian siswa cenderung pasif saat pemodelan aljabar abstrak dan membutuhkan visualisasi kontekstual.
                </p>
              </div>
              <div>
                <span className="text-xs text-muted block font-semibold uppercase">Harapan Guru Terhadap Supervisi</span>
                <p className="text-muted text-xs mt-1">
                  Mendapatkan masukan objektif mengenai manajemen waktu transisi antar fase diskusi kelompok.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

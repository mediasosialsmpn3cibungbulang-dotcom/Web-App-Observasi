import React from "react";
import { FileBarChart2, Printer, Download } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";

export default function LaporanPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-foreground">
            Rekapitulasi & Laporan Supervisi
          </h1>
          <p className="text-sm text-muted mt-1">
            Format laporan resmi untuk Kepala Sekolah, Dewan Guru, dan Pengawas Pembina.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md">
            <Download className="w-4 h-4 mr-2" />
            Ekspor Data (XLSX)
          </Button>
          <Button variant="primary" size="md">
            <Printer className="w-4 h-4 mr-2" />
            Cetak Rekap Pengawas
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Panel title="Rekapitulasi Pelaksanaan Supervisi" subtitle="Statistik kumulatif semester">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted">Total Sasaran Guru</span>
              <span className="font-bold">5 Guru</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted">Sudah Diobservasi</span>
              <span className="font-bold text-emerald-600">4 Guru (80%)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted">Selesai 3 Tahap Lengkap</span>
              <span className="font-bold text-primary">2 Guru (40%)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted">Total Kesepakatan RTL</span>
              <span className="font-bold">4 Butir</span>
            </div>
          </div>
        </Panel>

        <Panel title="Sebaran Predikat Hasil Supervisi" subtitle="Berdasarkan nilai observasi terbaru">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted">Amat Baik ( $\ge$ 90% )</span>
              <span className="font-bold text-emerald-700">1 Guru (20%)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted">Baik ( 75 - 89% )</span>
              <span className="font-bold text-blue-700">2 Guru (40%)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted">Cukup ( 60 - 74% )</span>
              <span className="font-bold text-amber-700">2 Guru (40%)</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted">Perlu Pembinaan ( &lt; 60% )</span>
              <span className="font-bold text-red-700">0 Guru (0%)</span>
            </div>
          </div>
        </Panel>

        <Panel title="Dokumen Siap Cetak A4" subtitle="Template cetak resmi">
          <div className="space-y-2 text-xs">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Printer className="w-3.5 h-3.5 mr-2" />
              1. Laporan Supervisi Akademik (Bab I-IV)
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Printer className="w-3.5 h-3.5 mr-2" />
              2. Rekap Siap Print Pengawas Pembina
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Printer className="w-3.5 h-3.5 mr-2" />
              3. Matriks Hasil Observasi per Aspek
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  GraduationCap,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SEED_MOCK_TEACHERS } from "@/contracts/seed-data";

export default function BerandaPage() {
  return (
    <div className="space-y-6">
      {/* Banner Sapaan Editorial & Aksi Cepat */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-foreground">
            Dashboard Supervisi Akademik
          </h1>
          <p className="text-sm text-muted mt-1">
            Pantauan pelaksanaan observasi pembelajaran dan coaching klinis guru semester ini.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/observasi">
            <Button variant="primary" size="md">
              <GraduationCap className="w-4 h-4 mr-2" />
              Mulai Observasi Baru
            </Button>
          </Link>
          <Link href="/jadwal">
            <Button variant="secondary" size="md">
              <CalendarDays className="w-4 h-4 mr-2" />
              Lihat Jadwal
            </Button>
          </Link>
        </div>
      </div>

      {/* Baris Kartu Metrik Angka (KPI) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Guru */}
        <Panel className="p-4">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Guru</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl md:text-3xl font-bold font-serif text-foreground">
            {SEED_MOCK_TEACHERS.length}
          </p>
          <p className="text-xs text-muted mt-1">Terdaftar aktif</p>
        </Panel>

        {/* Supervisi Selesai */}
        <Panel className="p-4">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Selesai 3 Tahap</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl md:text-3xl font-bold font-serif text-foreground">2</p>
          <p className="text-xs text-muted mt-1">40% target semester</p>
        </Panel>

        {/* Dalam Proses */}
        <Panel className="p-4">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Dalam Proses</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl md:text-3xl font-bold font-serif text-foreground">2</p>
          <p className="text-xs text-muted mt-1">Pra-obs & observasi</p>
        </Panel>

        {/* Rata-rata Nilai Sekolah */}
        <Panel className="p-4">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Rata-rata Sekolah</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl md:text-3xl font-bold font-serif text-foreground">81.4%</p>
          <div className="mt-1">
            <Badge predikat="Baik" />
          </div>
        </Panel>
      </div>

      {/* Ringkasan Perhatian Segera (Alert Bar) */}
      <div className="flex items-center justify-between p-3.5 rounded-control bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs md:text-sm">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Perhatian:</strong> Ada 1 jadwal observasi terlewat dan 1 tindak lanjut melewati tenggat waktu.
          </span>
        </div>
        <Link href="/jadwal" className="font-semibold underline hover:no-underline ml-2 flex-shrink-0">
          Periksa Jadwal
        </Link>
      </div>

      {/* Tabel Progres Guru Terkini */}
      <Panel
        title="Daftar Progres Supervisi Guru"
        subtitle="Status ketercapaian siklus observasi dan predikat terbaru"
        action={
          <Link href="/guru" className="text-xs font-semibold text-primary hover:underline flex items-center">
            Semua Guru <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        }
      >
        <div className="overflow-x-auto -mx-4 md:-mx-6">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-border text-xs uppercase text-muted tracking-wider">
              <tr>
                <th className="py-3 px-4 md:px-6">Nama Guru & Mapel</th>
                <th className="py-3 px-4">Fase</th>
                <th className="py-3 px-4">Status Supervisi</th>
                <th className="py-3 px-4 text-right">Nilai Terbaru</th>
                <th className="py-3 px-4">Predikat</th>
                <th className="py-3 px-4">Aspek Prioritas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SEED_MOCK_TEACHERS.map((teacher, idx) => {
                // Mock visual predikat & nilai untuk shell tampilan awal
                const mockNilai = [88.4, 72.3, 80.5, 66.8, 92.0][idx];
                const mockPredikat = (["Baik", "Cukup", "Baik", "Cukup", "Amat Baik"] as const)[idx];
                const mockStatus = (["Selesai", "Dalam Proses", "Dalam Proses", "Belum Mulai", "Selesai"] as const)[idx];
                const mockAspek = ["Diferensiasi", "Interaksi", "Asesmen", "Pengelolaan Kelas", "Pembukaan"][idx];

                return (
                  <tr key={teacher.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 md:px-6">
                      <p className="font-semibold text-foreground leading-tight">{teacher.nama_lengkap}</p>
                      <p className="text-xs text-muted mt-0.5">{teacher.mata_pelajaran}</p>
                    </td>
                    <td className="py-3.5 px-4 text-muted">Fase {teacher.fase}</td>
                    <td className="py-3.5 px-4">
                      <Badge statusSupervisi={mockStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold font-mono">
                      {mockNilai.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge predikat={mockPredikat} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted">
                      {mockAspek}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

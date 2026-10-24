import React from "react";
import { ListTodo, Plus, Printer, CheckCircle2, Clock } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SEED_MOCK_TEACHERS } from "@/contracts/seed-data";

export default function TindakLanjutPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-foreground">
            Tindak Lanjut & RTL Guru
          </h1>
          <p className="text-sm text-muted mt-1">
            Pemantauan aksi konkret perbaikan pembelajaran dan dukungan kepala sekolah.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md">
            <Printer className="w-4 h-4 mr-2" />
            Cetak Format RTL
          </Button>
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kesepakatan
          </Button>
        </div>
      </div>

      <Panel title="Daftar Komitmen & Kesepakatan Tindak Lanjut">
        <div className="overflow-x-auto -mx-4 md:-mx-6">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-border text-xs uppercase text-muted tracking-wider">
              <tr>
                <th className="py-3 px-4 md:px-6">Guru & Masalah Utama</th>
                <th className="py-3 px-4">Solusi & Aksi Konkret</th>
                <th className="py-3 px-4">Dukungan Kepala Sekolah</th>
                <th className="py-3 px-4">Tenggat Waktu</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-black/5 dark:hover:bg-white/5">
                <td className="py-3.5 px-4 md:px-6">
                  <p className="font-semibold text-foreground">{SEED_MOCK_TEACHERS[0].nama_lengkap}</p>
                  <p className="text-xs text-muted mt-0.5">Siswa baris belakang pasif pada aljabar abstrak.</p>
                </td>
                <td className="py-3.5 px-4 text-xs">
                  <p className="font-medium text-foreground">Menyiapkan LKPD berdiferensiasi 2 tingkat kesulitan.</p>
                </td>
                <td className="py-3.5 px-4 text-xs text-muted">
                  Memfasilitasi modul referensi dan waktu diskusi tim MGMP sekolah.
                </td>
                <td className="py-3.5 px-4 text-xs font-mono font-semibold">2026-09-15</td>
                <td className="py-3.5 px-4">
                  <Badge statusFollowup="Berjalan" />
                </td>
                <td className="py-3.5 px-4 text-center">
                  <Button variant="ghost" size="sm">
                    Detail
                  </Button>
                </td>
              </tr>
              <tr className="hover:bg-black/5 dark:hover:bg-white/5">
                <td className="py-3.5 px-4 md:px-6">
                  <p className="font-semibold text-foreground">{SEED_MOCK_TEACHERS[1].nama_lengkap}</p>
                  <p className="text-xs text-muted mt-0.5">Pengelolaan alokasi waktu sesi penutup sering terlewat.</p>
                </td>
                <td className="py-3.5 px-4 text-xs">
                  <p className="font-medium text-foreground">Menggunakan timer visual di layar proyektor untuk tiap segmen kelas.</p>
                </td>
                <td className="py-3.5 px-4 text-xs text-muted">
                  Pendampingan berkala oleh wakasek kurikulum.
                </td>
                <td className="py-3.5 px-4 text-xs font-mono font-semibold">2026-09-30</td>
                <td className="py-3.5 px-4">
                  <Badge statusFollowup="Selesai" />
                </td>
                <td className="py-3.5 px-4 text-center">
                  <Button variant="ghost" size="sm">
                    Detail
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

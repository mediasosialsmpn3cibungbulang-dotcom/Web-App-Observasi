import React from "react";
import { Users, UserPlus, Upload, Search } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SEED_MOCK_TEACHERS } from "@/contracts/seed-data";

export default function GuruPage() {
  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-foreground">
            Database Guru
          </h1>
          <p className="text-sm text-muted mt-1">
            Data pokok tenaga pendidik, status kepegawaian, dan kategori frekuensi supervisi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md">
            <Upload className="w-4 h-4 mr-2" />
            Impor Excel
          </Button>
          <Button variant="primary" size="md">
            <UserPlus className="w-4 h-4 mr-2" />
            Tambah Guru
          </Button>
        </div>
      </div>

      {/* Filter & Pencarian Cepat */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Cari guru berdasarkan nama atau mapel..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-control border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Tabel Data Guru */}
      <Panel>
        <div className="overflow-x-auto -mx-4 md:-mx-6">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-border text-xs uppercase text-muted tracking-wider">
              <tr>
                <th className="py-3 px-4 md:px-6">Nama Lengkap & NIP/NUPTK</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4">Status & Kategori</th>
                <th className="py-3 px-4">Kelas Diampu</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SEED_MOCK_TEACHERS.map((teacher) => {
                const isGuruBaru = 2026 - teacher.tahun_masuk < 3;
                return (
                  <tr key={teacher.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 md:px-6">
                      <p className="font-semibold text-foreground leading-tight">{teacher.nama_lengkap}</p>
                      <p className="text-xs font-mono text-muted mt-0.5">
                        {teacher.nip_nuptk.slice(0, 4)}...{teacher.nip_nuptk.slice(-4)}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-foreground font-medium">{teacher.mata_pelajaran}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-xs bg-black/5 dark:bg-white/5 border border-border">
                          {teacher.status_kepegawaian}
                        </span>
                        {isGuruBaru && (
                          <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300">
                            Guru Baru (Min 3x)
                          </span>
                        )}
                        {teacher.is_senior_mentor && (
                          <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300">
                            Senior/Mentor
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-muted text-xs">{teacher.kelas_diampu}</td>
                    <td className="py-3.5 px-4 text-xs text-muted">
                      <p>{teacher.nomor_hp}</p>
                      <p>{teacher.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Button variant="ghost" size="sm">
                        Profil
                      </Button>
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

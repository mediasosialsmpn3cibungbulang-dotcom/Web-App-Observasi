import React from "react";
import { CalendarDays, Plus, Filter, AlertTriangle } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SEED_MOCK_TEACHERS } from "@/contracts/seed-data";

export default function JadwalPage() {
  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-foreground">
            Jadwal Supervisi Akademik
          </h1>
          <p className="text-sm text-muted mt-1">
            Matriks rencana dan realisasi supervisi gelombang 1 (Prioritas) dan gelombang 2 (Reguler).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Jadwal
          </Button>
        </div>
      </div>

      {/* Peringatan Kepatuhan Jarak Waktu (SOP BR-14) */}
      <div className="p-3.5 rounded-control bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200 text-xs md:text-sm flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div>
          <strong>Pedoman Jarak Waktu Baku:</strong> Pra-observasi dilakukan minimal H-5 sebelum observasi kelas. Percakapan coaching pasca-observasi dilaksanakan paling lambat H+3 setelah observasi.
        </div>
      </div>

      {/* Matriks Jadwal */}
      <Panel title="Matriks Rencana vs Realisasi Semester Ini">
        <div className="overflow-x-auto -mx-4 md:-mx-6">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-border text-xs uppercase text-muted tracking-wider">
              <tr>
                <th className="py-3 px-4 md:px-6">Guru Sasaran</th>
                <th className="py-3 px-4">Gelombang</th>
                <th className="py-3 px-4">Rencana Pra-Obs</th>
                <th className="py-3 px-4">Rencana Observasi</th>
                <th className="py-3 px-4">Rencana Coaching</th>
                <th className="py-3 px-4">Supervisor</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SEED_MOCK_TEACHERS.slice(0, 3).map((teacher, idx) => {
                const gelombang = idx === 1 ? "1 Prioritas" : "2 Reguler";
                const dates = [
                  { pra: "2026-08-10", obs: "2026-08-15", coach: "2026-08-18", status: "Selesai" as const },
                  { pra: "2026-09-02", obs: "2026-09-08", coach: "2026-09-10", status: "Dalam Proses" as const },
                  { pra: "2026-10-15", obs: "2026-10-22", coach: "2026-10-25", status: "Belum Mulai" as const },
                ][idx];

                return (
                  <tr key={teacher.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 md:px-6">
                      <p className="font-semibold text-foreground leading-tight">{teacher.nama_lengkap}</p>
                      <p className="text-xs text-muted mt-0.5">{teacher.mata_pelajaran}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-xs border border-border bg-black/5 dark:bg-white/5">
                        {gelombang}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono">{dates.pra}</td>
                    <td className="py-3.5 px-4 text-xs font-mono font-semibold text-primary">{dates.obs}</td>
                    <td className="py-3.5 px-4 text-xs font-mono">{dates.coach}</td>
                    <td className="py-3.5 px-4 text-xs text-muted">Dr. Hj. Rahmawati</td>
                    <td className="py-3.5 px-4">
                      <Badge statusSupervisi={dates.status} />
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

import React from "react";
import { CheckSquare, CheckCircle, Clock } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { SEED_CHECKLIST_TEMPLATES } from "@/contracts/seed-data";

export default function ChecklistPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-foreground">
            Checklist Supervisi Semesteran
          </h1>
          <p className="text-sm text-muted mt-1">
            29 kegiatan terstruktur dalam 6 fase siklus supervisi semesteran (Dokumen Bonus 4).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" size="md">
            <CheckCircle className="w-4 h-4 mr-2" />
            Perbarui Status Checklist
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {["Fase 1", "Fase 2", "Fase 3", "Fase 4", "Fase 5", "Fase 6"].map((fasePrefix) => {
          const items = SEED_CHECKLIST_TEMPLATES.filter((item) =>
            item.fase_nama.startsWith(fasePrefix)
          );
          if (items.length === 0) return null;

          return (
            <Panel key={fasePrefix} title={items[0].fase_nama}>
              <div className="overflow-x-auto -mx-4 md:-mx-6">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-black/5 dark:bg-white/5 border-b border-border text-[11px] uppercase text-muted tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4 md:px-6 w-16">Kode</th>
                      <th className="py-2.5 px-4">Kegiatan</th>
                      <th className="py-2.5 px-4">Dokumen yang Dihasilkan</th>
                      <th className="py-2.5 px-4">PIC</th>
                      <th className="py-2.5 px-4">Tenggat Waktu</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item) => (
                      <tr key={item.nomor_kode} className="hover:bg-black/5 dark:hover:bg-white/5">
                        <td className="py-2.5 px-4 md:px-6 font-mono font-bold text-primary">
                          {item.nomor_kode}
                        </td>
                        <td className="py-2.5 px-4 text-foreground font-medium">{item.kegiatan}</td>
                        <td className="py-2.5 px-4 text-muted text-xs">{item.dokumen_dihasilkan}</td>
                        <td className="py-2.5 px-4 text-xs">{item.pic_peran}</td>
                        <td className="py-2.5 px-4 text-xs font-mono">{item.deadline_deskripsi}</td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded text-xs border border-border bg-black/5 dark:bg-white/5">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

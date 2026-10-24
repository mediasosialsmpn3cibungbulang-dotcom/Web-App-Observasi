import React from "react";
import { BookOpen, Video, HelpCircle, CheckCircle } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";

export default function BantuanPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-foreground">
            Panduan Penggunaan & Bantuan
          </h1>
          <p className="text-sm text-muted mt-1">
            Panduan ringkas alur supervisi, video demonstrasi, dan jawaban pertanyaan umum (FAQ).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="md">
            <Video className="w-4 h-4 mr-2" />
            Tonton Video Demo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Alur Kerja Supervisi 5 Tahap">
          <div className="space-y-4 text-xs md:text-sm">
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center flex-shrink-0 text-xs">
                1
              </span>
              <div>
                <strong className="text-foreground">Pra-Observasi (H-5):</strong>
                <p className="text-muted mt-0.5">
                  Supervisor berdialog dengan guru mengenai kesiapan modul ajar, tantangan kelas, dan menyepakati fokus amatan bersama.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center flex-shrink-0 text-xs">
                2
              </span>
              <div>
                <strong className="text-foreground">Observasi Kelas (1 JP Penuh):</strong>
                <p className="text-muted mt-0.5">
                  Supervisor mengamati di kelas, mencatat fakta objektif langsung, dan memberikan skor pada 28 butir indikator.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center flex-shrink-0 text-xs">
                3
              </span>
              <div>
                <strong className="text-foreground">Analisis Temuan (H+1 sampai H+2):</strong>
                <p className="text-muted mt-0.5">
                  Aplikasi secara otomatis merangkum 3 kekuatan utama dan aspek prioritas pengembangan untuk bahan diskusi.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center flex-shrink-0 text-xs">
                4
              </span>
              <div>
                <strong className="text-foreground">Sesi Coaching Pasca-Observasi (Maksimal H+3):</strong>
                <p className="text-muted mt-0.5">
                  Percakapan reflektif kolegial menggunakan bank pertanyaan, merumuskan komitmen, dan menetapkan RTL.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center flex-shrink-0 text-xs">
                5
              </span>
              <div>
                <strong className="text-foreground">Monitoring & Tindak Lanjut (Pekan 2, 4, 8/9):</strong>
                <p className="text-muted mt-0.5">
                  Pemeriksaan implementasi berkala, pengumpulan bukti dokumentasi, dan verifikasi penyelesaian target.
                </p>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Pertanyaan Umum (FAQ)">
          <div className="space-y-4 text-xs md:text-sm">
            <div>
              <p className="font-semibold text-foreground">
                Bagaimana jika saat observasi di kelas koneksi internet terputus?
              </p>
              <p className="text-muted mt-1">
                Aplikasi telah dilengkapi fitur <em>Offline-First</em>. Seluruh skor dan catatan fakta otomatis tersimpan aman di perangkat Anda dan disinkronkan ke server saat sinyal kembali pulih.
              </p>
            </div>

            <div>
              <p className="font-semibold text-foreground">
                Apakah guru dapat langsung melihat nilai dan predikatnya?
              </p>
              <p className="text-muted mt-1">
                Nilai dan predikat baru terbuka untuk akun guru setelah sesi coaching final dilaksanakan, agar dialog reflektif kemitraan terjadi terlebih dahulu tanpa prasangka angka.
              </p>
            </div>

            <div>
              <p className="font-semibold text-foreground">
                Apakah hasil percakapan coaching bisa dibaca oleh pihak lain?
              </p>
              <p className="text-muted mt-1">
                Tidak. Percakapan coaching dan catatan notulen berstatus konfidensial dan hanya dapat diakses oleh Guru yang bersangkutan, Supervisor sesi tersebut, dan Kepala Sekolah.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

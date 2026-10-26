"use client";

import React, { useState, useEffect } from "react";
import { X, Clock, Calendar, Check, BookOpen, Layers } from "lucide-react";
import { DayName, TeachingSlot } from "@/contracts/teaching-schedules";
import { Button } from "@/components/ui/Button";

interface TeachingSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slotData: Omit<TeachingSlot, "id">, slotId?: string) => void;
  initialSlot?: TeachingSlot | null;
  teacherName: string;
  defaultMapel: string;
  defaultDay?: DayName;
}

const PRESET_DAYS: DayName[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

const PRESET_CLASSES = [
  "7A", "7B", "7C", "7D", "7E", "7F", "7G", "7H", "7I", "7J",
  "8A", "8B", "8C", "8D", "8E", "8F", "8G", "8H", "8I", "8J",
  "9A", "9B", "9C", "9D", "9E", "9F", "9G", "9H", "9I", "9J",
];

const PRESET_TIME_OPTIONS: Record<DayName, Array<{ jam_ke: string; waktu: string }>> = {
  Senin: [
    { jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:10" },
    { jam_ke: "Jam Ke 3", waktu: "09:10 - 09:45" },
    { jam_ke: "Jam Ke 4-5", waktu: "10:10 - 11:20" },
    { jam_ke: "Jam Ke 6", waktu: "11:20 - 11:55" },
    { jam_ke: "Jam Ke 6-7", waktu: "11:20 - 13:20" },
    { jam_ke: "Jam Ke 7-8", waktu: "12:45 - 13:55" },
    { jam_ke: "Jam Ke 8-9", waktu: "13:20 - 14:30" },
  ],
  Selasa: [
    { jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40" },
    { jam_ke: "Jam Ke 3-4", waktu: "08:40 - 09:50" },
    { jam_ke: "Jam Ke 4-5", waktu: "10:15 - 11:25" },
    { jam_ke: "Jam Ke 5-6", waktu: "10:15 - 12:00" },
    { jam_ke: "Jam Ke 7-8", waktu: "12:25 - 13:35" },
    { jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10" },
  ],
  Rabu: [
    { jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40" },
    { jam_ke: "Jam Ke 1-2", waktu: "07:30 - 09:15" },
    { jam_ke: "Jam Ke 3-4", waktu: "08:40 - 09:50" },
    { jam_ke: "Jam Ke 5-6", waktu: "10:50 - 12:00" },
    { jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10" },
    { jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10" },
  ],
  Kamis: [
    { jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40" },
    { jam_ke: "Jam Ke 3-4", waktu: "09:15 - 10:50" },
    { jam_ke: "Jam Ke 3-5", waktu: "09:15 - 11:25" },
    { jam_ke: "Jam Ke 5-6", waktu: "10:50 - 12:00" },
    { jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10" },
    { jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10" },
  ],
  Jumat: [
    { jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:00" },
    { jam_ke: "Jam Ke 3-4", waktu: "09:00 - 10:20" },
    { jam_ke: "Jam Ke 3-4", waktu: "09:00 - 10:50" },
    { jam_ke: "Jam Ke 5-6", waktu: "10:20 - 11:20" },
  ],
};

export const TeachingSlotModal: React.FC<TeachingSlotModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSlot,
  teacherName,
  defaultMapel,
  defaultDay = "Senin",
}) => {
  const [hari, setHari] = useState<DayName>(defaultDay);
  const [jamKe, setJamKe] = useState<string>("Jam Ke 1-2");
  const [waktu, setWaktu] = useState<string>("07:30 - 08:40");
  const [kelas, setKelas] = useState<string>("7A");
  const [mataPelajaran, setMataPelajaran] = useState<string>(defaultMapel);
  const [isCustomTime, setIsCustomTime] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialSlot) {
      setHari(initialSlot.hari);
      setJamKe(initialSlot.jam_ke || "Jam Ke 1-2");
      setWaktu(initialSlot.waktu);
      setKelas(initialSlot.kelas);
      setMataPelajaran(initialSlot.mata_pelajaran);
      setIsCustomTime(false);
    } else {
      setHari(defaultDay);
      const presets = PRESET_TIME_OPTIONS[defaultDay] || PRESET_TIME_OPTIONS.Senin;
      const firstPreset = presets[0];
      setJamKe(firstPreset.jam_ke);
      setWaktu(firstPreset.waktu);
      setKelas("7A");
      setMataPelajaran(defaultMapel);
      setIsCustomTime(false);
    }
    setErrorMsg(null);
  }, [initialSlot, defaultDay, defaultMapel, isOpen]);

  // Saat hari berubah, sesuaikan pilihan preset waktu
  const handleDayChange = (newDay: DayName) => {
    setHari(newDay);
    const presets = PRESET_TIME_OPTIONS[newDay] || [];
    if (presets.length > 0 && !isCustomTime) {
      setJamKe(presets[0].jam_ke);
      setWaktu(presets[0].waktu);
    }
  };

  const handlePresetTimeSelect = (preset: { jam_ke: string; waktu: string }) => {
    setJamKe(preset.jam_ke);
    setWaktu(preset.waktu);
    setIsCustomTime(false);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!waktu.trim()) {
      setErrorMsg("Rentang waktu mengajar wajib diisi.");
      return;
    }
    if (!kelas.trim()) {
      setErrorMsg("Kelas yang diajar wajib dipilih atau diisi.");
      return;
    }
    if (!mataPelajaran.trim()) {
      setErrorMsg("Mata pelajaran wajib diisi.");
      return;
    }

    onSave(
      {
        hari,
        jam_ke: jamKe.trim() || undefined,
        waktu: waktu.trim(),
        kelas: kelas.trim(),
        mata_pelajaran: mataPelajaran.trim(),
      },
      initialSlot?.id
    );
    onClose();
  };

  const availablePresets = PRESET_TIME_OPTIONS[hari] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-xs select-none animate-fadeIn">
      <div className="bg-surface border border-border rounded-panel max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-foreground">
                {initialSlot ? "Ubah Slot Mengajar KBM" : "Tambah Slot Mengajar KBM"}
              </h3>
              <p className="text-xs text-muted truncate max-w-[280px] md:max-w-md">
                Untuk Guru: <strong className="text-foreground">{teacherName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-control bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Pemilihan Hari Sekolah */}
          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Hari Mengajar (Senin s.d. Jumat) *
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {PRESET_DAYS.map((d) => {
                const isSelected = hari === d;
                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() => handleDayChange(d)}
                    className={`py-2 text-xs font-bold rounded-control border transition-all text-center ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/30"
                        : "bg-surface text-foreground border-border hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pemilihan Waktu KBM */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase text-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Pilihan Waktu KBM Resmi Hari {hari} *
              </label>
              <button
                type="button"
                onClick={() => setIsCustomTime(!isCustomTime)}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                {isCustomTime ? "Gunakan Preset Sekolah" : "Kustom Waktu Sendiri"}
              </button>
            </div>

            {!isCustomTime ? (
              <div className="grid grid-cols-2 gap-2">
                {availablePresets.map((p, idx) => {
                  const isSelected = waktu === p.waktu && jamKe === p.jam_ke;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handlePresetTimeSelect(p)}
                      className={`p-2 rounded-control border text-left text-xs transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-surface text-foreground border-border hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="font-bold">{p.jam_ke}</div>
                      <div className="text-[11px] font-mono opacity-90">{p.waktu}</div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-control bg-slate-50 dark:bg-slate-900/60 border border-border">
                <div>
                  <label className="block text-[11px] font-medium text-muted mb-1">
                    Jam Ke- (Contoh: Jam Ke 1-2)
                  </label>
                  <input
                    type="text"
                    value={jamKe}
                    onChange={(e) => setJamKe(e.target.value)}
                    placeholder="Jam Ke 1-2"
                    className="w-full px-3 py-1.5 text-xs rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted mb-1">
                    Rentang Waktu (Contoh: 07:30 - 08:40)
                  </label>
                  <input
                    type="text"
                    value={waktu}
                    onChange={(e) => setWaktu(e.target.value)}
                    placeholder="07:30 - 08:40"
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pemilihan Kelas */}
          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              Kelas yang Diajar *
            </label>
            <div className="flex gap-2 items-center">
              <select
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                {PRESET_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    Kelas {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                placeholder="Lainnya..."
                className="w-28 px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Mata Pelajaran */}
          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              Mata Pelajaran yang Diajarkan *
            </label>
            <input
              type="text"
              value={mataPelajaran}
              onChange={(e) => setMataPelajaran(e.target.value)}
              placeholder="Contoh: Matematika / Bahasa Indonesia"
              className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Footer Aksi */}
          <div className="pt-4 border-t border-border flex justify-end items-center gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              <Check className="w-4 h-4 mr-1.5" />
              {initialSlot ? "Simpan Perubahan" : "Tambahkan Slot"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
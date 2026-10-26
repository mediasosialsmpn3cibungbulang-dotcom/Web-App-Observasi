"use client";

import React, { useState, useEffect } from "react";
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { CloudSyncService, SyncStatus } from "@/services/cloud-sync-service";

export const CloudSyncIndicator: React.FC = () => {
  const [status, setStatus] = useState<SyncStatus>("synced");
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  useEffect(() => {
    // Inisialisasi koneksi realtime dan auto pull saat komponen dimuat
    CloudSyncService.initRealtime();
    CloudSyncService.pullAllFromCloud();

    const unsubscribe = CloudSyncService.subscribeStatus((newStatus, syncTime) => {
      setStatus(newStatus);
      if (syncTime) setLastSyncTime(syncTime);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      await CloudSyncService.pullAllFromCloud();
    } finally {
      setTimeout(() => {
        setIsManualSyncing(false);
      }, 600);
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "Baru saja";
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const isSpinning = status === "syncing" || isManualSyncing;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
          status === "synced"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
            : status === "syncing"
            ? "bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20"
            : "bg-slate-500/10 border-slate-500/30 text-slate-700 dark:text-slate-300 hover:bg-slate-500/20"
        }`}
        title="Status Sinkronisasi Multi-Device Cloud"
      >
        {isSpinning ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600 dark:text-sky-400" />
        ) : status === "synced" ? (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        ) : (
          <CloudOff className="w-3.5 h-3.5 text-muted" />
        )}

        <span className="hidden md:inline font-mono text-[11px]">
          {isSpinning ? "Sinkronisasi..." : status === "synced" ? "Tersinkron Cloud" : "Offline"}
        </span>
      </button>

      {/* Popover Detail Sinkronisasi */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 z-50 w-72 rounded-control bg-surface border border-border shadow-xl p-3.5 text-xs space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-primary" />
                Sinkronisasi Multi-Perangkat
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  status === "synced"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : status === "syncing"
                    ? "bg-sky-500/10 text-sky-600"
                    : "bg-black/5 text-muted"
                }`}
              >
                {status.toUpperCase()}
              </span>
            </div>

            <p className="text-[11px] text-muted leading-relaxed">
              Seluruh data jadwal, observasi, dan guru tersinkronisasi otomatis antar Chrome, laptop, dan PWA HP Android via Supabase Cloud Realtime.
            </p>

            <div className="p-2 rounded bg-black/5 dark:bg-white/5 space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-muted">
                <span>Sinkronisasi Terakhir:</span>
                <strong className="text-foreground font-mono">{formatTime(lastSyncTime)}</strong>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>Jalur Koneksi:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Realtime WebSocket
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSpinning}
              className="w-full py-1.5 px-3 rounded-control bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin" : ""}`} />
              {isSpinning ? "Menyinkronkan..." : "Sinkronkan Sekarang"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

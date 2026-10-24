"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log galat terstruktur tanpa membocorkan kredensial
    console.error("[GLOBAL_ERROR] Terjadi kesalahan fatal aplikasi:", error.message);
  }, [error]);

  return (
    <html lang="id">
      <body className="min-h-screen bg-[#FAF8F3] dark:bg-[#16181A] text-[#1B1F1D] dark:text-[#ECEDEA] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#1E2124] border border-[#E5E2DA] dark:border-[#2E3338] rounded-2xl p-6 text-center shadow-lg">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Terjadi Gangguan Sistem</h2>
          <p className="text-sm text-[#565C58] dark:text-[#A9AFA9] mb-6">
            Aplikasi mengalami kendala yang tidak terduga. Data draf Anda yang tersimpan di perangkat tetap aman.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-lg bg-[#1F5C45] text-white hover:bg-[#184836] font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1F5C45]"
            >
              Coba Pulihkan
            </button>
            <button
              onClick={() => (window.location.href = "/beranda")}
              className="px-5 py-2.5 rounded-lg border border-[#E5E2DA] dark:border-[#2E3338] text-sm hover:bg-black/5 dark:hover:bg-white/5 font-medium transition-all"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

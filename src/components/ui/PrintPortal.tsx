"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Merender modal cetak langsung ke <body> (di luar app shell).
 * - Di layar: modal tidak terpengaruh transform/animasi parent sehingga selalu center di viewport.
 * - Saat cetak: CSS global menyembunyikan seluruh elemen body selain portal ini,
 *   sehingga yang tercetak hanya dokumen resmi tanpa sidebar, header, atau ruang kosong.
 */
export const PrintPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Kunci scroll halaman di belakang modal
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!mounted) return null;
  return createPortal(<div className="print-portal-root">{children}</div>, document.body);
};

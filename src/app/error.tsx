"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ROUTE_ERROR] Kesalahan render segmen rute:", error.message);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Panel className="max-w-md w-full text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg md:text-xl font-bold font-serif mb-2">Halaman Gagal Dimuat</h2>
        <p className="text-sm text-muted mb-6">
          Komponen tampilan ini mengalami kendala teknis sementara. Data Anda tidak hilang.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => reset()} variant="primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Muat Ulang
          </Button>
          <Link href="/beranda">
            <Button variant="secondary">
              <Home className="w-4 h-4 mr-2" />
              Ke Beranda
            </Button>
          </Link>
        </div>
      </Panel>
    </div>
  );
}

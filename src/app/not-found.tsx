import React from "react";
import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Panel className="max-w-md w-full text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-primary-subtle text-primary flex items-center justify-center mb-4">
          <FileQuestion className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-muted mb-6">
          Tautan yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <div className="flex justify-center">
          <Link href="/beranda">
            <Button variant="primary">
              <Home className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </Panel>
    </div>
  );
}

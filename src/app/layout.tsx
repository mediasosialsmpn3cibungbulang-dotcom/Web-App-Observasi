import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/shell/Sidebar";
import { Header } from "@/components/shell/Header";
import { BottomBar } from "@/components/shell/BottomBar";

export const metadata: Metadata = {
  title: "Smart Supervisi & Coaching Guru",
  description: "Aplikasi web terpadu untuk digitalisasi siklus supervisi akademik dan coaching guru sekolah.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F3" },
    { media: "(prefers-color-scheme: dark)", color: "#16181A" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <div className="flex-1 flex w-full">
          {/* Sidebar Navigasi Desktop */}
          <Sidebar />

          {/* Area Konten Utama */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header Aplikasi */}
            <Header />

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>

        {/* Bilah Navigasi Bawah Khusus Mobile */}
        <BottomBar />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/shell/Sidebar";
import { Header } from "@/components/shell/Header";
import { BottomBar } from "@/components/shell/BottomBar";

// Font sans-serif modern yang ramah, bersih, dan sangat mudah dibaca
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

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
    { media: "(prefers-color-scheme: light)", color: "#F8FAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#131615" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={plusJakarta.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground antialiased selection:bg-pine-600/20 selection:text-pine-700">
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

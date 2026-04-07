import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BodyStart Nutrition — Supplement Advisor",
  description: "Outil de génération de protocoles personnalisés",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900`}>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="BodyStart Nutrition" width={40} height={40} />
              <span className="text-lg font-semibold tracking-tight">BodyStart Nutrition</span>
            </Link>
            <nav className="ml-auto flex gap-2 text-sm">
              <Link href="/consultation/new" className="rounded-md px-3 py-2 hover:bg-slate-100">Nouvelle consultation</Link>
              <Link href="/history" className="rounded-md px-3 py-2 hover:bg-slate-100">Historique</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

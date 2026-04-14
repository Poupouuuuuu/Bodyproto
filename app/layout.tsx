import type { Metadata } from "next";
import { Inter, Montserrat, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "BodyStart Nutrition — Test & Protocole",
  description: "Test personnalisé BodyStart Nutrition : carences + compléments recommandés.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${montserrat.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-bs-bg text-bs-text antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

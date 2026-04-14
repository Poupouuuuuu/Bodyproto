import Link from "next/link";
import { ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr";

export function FloatingHistory() {
  return (
    <Link
      href="/history"
      aria-label="Ouvrir l'historique clients"
      className="fixed top-4 right-4 z-30 grid h-11 w-11 place-items-center rounded-full border border-bs-primary/10 bg-bs-surface/60 text-bs-primary transition-all duration-200 hover:bg-bs-surface active:scale-95 md:top-6 md:right-6"
    >
      <ClockCounterClockwise size={18} />
    </Link>
  );
}

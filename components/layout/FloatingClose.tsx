"use client";
import { useRouter } from "next/navigation";
import { X } from "@phosphor-icons/react/dist/ssr";

export function FloatingClose() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/")}
      aria-label="Fermer et revenir à l'accueil"
      className="fixed top-4 right-4 z-30 grid h-14 w-14 place-items-center rounded-full border border-bs-primary/10 bg-bs-surface/95 text-bs-primary shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-bs-primary hover:text-bs-bg active:scale-95 md:top-6 md:right-6"
    >
      <X size={22} weight="bold" />
    </button>
  );
}

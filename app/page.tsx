import Link from "next/link";
import { BrandButton } from "@/components/ui/brand-button";
import { Sparkle, ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="mb-16 md:mb-24">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-bs-accent">
          Test personnalisé
        </p>
        <h1 className="text-5xl md:text-7xl xl:text-[100px] text-bs-primary max-w-4xl font-display font-black uppercase tracking-tight">
          Le protocole<br />qui te correspond
        </h1>
        <p className="mt-6 max-w-2xl text-base text-bs-muted md:text-lg">
          Un bilan en 8 étapes, une analyse complète des carences, un protocole de compléments sur-mesure. Envoyé par email en fin de test.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/consultation/new"
          className="group rounded-4xl border border-bs-primary/10 bg-bs-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-12"
        >
          <div className="mb-8 inline-flex items-center justify-center rounded-full bg-bs-primary p-4 text-bs-bg">
            <Sparkle size={24} weight="fill" />
          </div>
          <h2 className="mb-3 font-display text-3xl font-black uppercase tracking-tight text-bs-primary">
            Nouveau test
          </h2>
          <p className="mb-8 text-bs-muted">
            Démarre un bilan complet pour un nouveau client. Résultat en moins d&apos;une minute, livré par email avec PDF.
          </p>
          <BrandButton variant="primary">
            Commencer →
          </BrandButton>
        </Link>

        <Link
          href="/history"
          className="group rounded-4xl border border-bs-primary/10 bg-bs-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-12"
        >
          <div className="mb-8 inline-flex items-center justify-center rounded-full bg-bs-accent p-4 text-bs-primary">
            <ClockCounterClockwise size={24} weight="fill" />
          </div>
          <h2 className="mb-3 font-display text-3xl font-black uppercase tracking-tight text-bs-primary">
            Historique
          </h2>
          <p className="mb-8 text-bs-muted">
            Retrouve, rouvre, ré-envoie ou supprime un protocole passé. Export CSV disponible.
          </p>
          <BrandButton variant="secondary">
            Ouvrir →
          </BrandButton>
        </Link>
      </div>
    </div>
  );
}

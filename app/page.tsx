import { BrandButton } from "@/components/ui/brand-button";
import { FloatingHistory } from "@/components/layout/FloatingHistory";
import { Sparkle } from "@phosphor-icons/react/dist/ssr";

export default function HomePage() {
  return (
    <>
      <FloatingHistory />
      <main className="relative mx-auto flex min-h-[100dvh] max-w-5xl flex-col justify-center px-6 py-16 md:px-10">
        <div className="mb-12 md:mb-16">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-bs-accent">
            Test personnalisé
          </p>
          <h1 className="max-w-4xl font-display text-5xl font-black uppercase leading-[0.95] tracking-tight text-bs-primary md:text-7xl xl:text-[96px]">
            Le protocole<br />qui te correspond
          </h1>
          <p className="mt-6 max-w-xl text-base text-bs-muted md:text-lg">
            Un bilan en 8 étapes, une analyse complète des carences, un protocole de compléments sur-mesure. Envoyé par email en fin de test.
          </p>
        </div>

        <BrandButton href="/consultation/new" variant="primary" size="xl" className="self-start">
          <Sparkle size={22} weight="fill" /> Commencer le test
        </BrandButton>
      </main>
    </>
  );
}

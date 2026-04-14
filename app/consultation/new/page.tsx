import { WizardShell } from "@/components/wizard/WizardShell";
import { FloatingClose } from "@/components/layout/FloatingClose";

export default function Page() {
  return (
    <>
      <FloatingClose />
      <main className="mx-auto max-w-3xl px-6 py-10 md:py-16">
        <header className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-bs-accent">
            Test personnalisé
          </p>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight text-bs-primary md:text-5xl">
            Nouveau bilan
          </h1>
        </header>
        <WizardShell />
      </main>
    </>
  );
}

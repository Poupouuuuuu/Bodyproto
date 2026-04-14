import { WizardShell } from "@/components/wizard/WizardShell";

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-bs-accent">
          Test personnalisé
        </p>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight text-bs-primary md:text-5xl">
          Nouveau bilan
        </h1>
      </header>
      <WizardShell />
    </div>
  );
}

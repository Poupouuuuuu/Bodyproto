export function WarningsBlock({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <section className="rounded-3xl border border-bs-primary/10 bg-bs-surface p-8">
      <h2 className="mb-4 font-display text-2xl font-black uppercase tracking-tight text-bs-primary">
        Avertissements
      </h2>
      <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900">
        {warnings.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>
    </section>
  );
}

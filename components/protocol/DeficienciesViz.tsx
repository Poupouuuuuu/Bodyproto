import type { Deficiency, Severity } from "@/lib/schemas/protocol";

const SEVERITY_CONFIG: Record<Severity, { label: string; widthPct: number; colorClass: string }> = {
  high: { label: "Déficit élevé", widthPct: 100, colorClass: "bg-sev-high" },
  moderate: { label: "Déficit moyen", widthPct: 66, colorClass: "bg-sev-mid" },
  low: { label: "Léger", widthPct: 33, colorClass: "bg-sev-low" },
};

export function DeficienciesViz({ deficiencies }: { deficiencies: Deficiency[] }) {
  if (deficiencies.length === 0) {
    return (
      <section className="rounded-3xl border border-bs-primary/10 bg-bs-surface p-10 text-center">
        <p className="text-bs-muted">Aucune carence identifiée pour ce profil.</p>
      </section>
    );
  }
  return (
    <section className="rounded-3xl border border-bs-primary/10 bg-bs-surface p-8 md:p-10">
      <h2 className="mb-1 font-display text-3xl font-black uppercase tracking-tight text-bs-primary">
        Ce qui te manque
      </h2>
      <p className="mb-8 text-sm text-bs-muted">
        Carences identifiées à partir de ton profil. Chacune est couverte par au moins un complément du protocole.
      </p>
      <ul className="divide-y divide-bs-primary/10">
        {deficiencies.map((d) => {
          const cfg = SEVERITY_CONFIG[d.severity];
          return (
            <li key={d.nutrient} className="grid gap-3 py-5 md:grid-cols-[1fr,auto] md:items-center md:gap-8">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-display text-lg font-bold uppercase tracking-tight text-bs-primary">
                    {d.nutrient}
                  </span>
                  <span className="text-sm font-medium text-bs-muted">{cfg.label}</span>
                </div>
                <p className="text-sm italic text-bs-muted">{d.whyAtRisk}</p>
                {d.addressedBy.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs uppercase tracking-widest text-bs-muted">Couvert par</span>
                    {d.addressedBy.map((id) => (
                      <a
                        key={id}
                        href={`#supp-${id}`}
                        className="rounded-full border border-bs-accent/50 px-3 py-0.5 text-xs text-bs-primary transition hover:bg-bs-accent/10"
                      >
                        {id}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 md:w-80">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-bs-primary/5">
                  <div
                    className={`h-full rounded-full ${cfg.colorClass}`}
                    style={{ width: `${cfg.widthPct}%` }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

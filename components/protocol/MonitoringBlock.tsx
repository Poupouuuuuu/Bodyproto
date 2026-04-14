import type { Protocol } from "@/lib/schemas/protocol";

export function MonitoringBlock({ m }: { m: Protocol["monitoring"] }) {
  return (
    <section className="rounded-3xl border border-bs-primary/10 bg-bs-surface p-8">
      <h2 className="mb-4 font-display text-2xl font-black uppercase tracking-tight text-bs-primary">
        Suivi recommandé
      </h2>
      <p className="text-sm text-bs-text">
        Réévaluation dans <strong>{m.reviewAfterWeeks} semaines</strong>.
      </p>
      {m.indicators.length > 0 && (
        <>
          <p className="mt-2 text-sm font-medium text-bs-text">Indicateurs à surveiller :</p>
          <ul className="list-disc pl-5 text-sm text-bs-text">
            {m.indicators.map((i, k) => (
              <li key={k}>{i}</li>
            ))}
          </ul>
        </>
      )}
      {m.bloodTests.length > 0 && (
        <>
          <p className="mt-2 text-sm font-medium text-bs-text">Analyses de suivi :</p>
          <ul className="list-disc pl-5 text-sm text-bs-text">
            {m.bloodTests.map((i, k) => (
              <li key={k}>{i}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

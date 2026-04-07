import type { Protocol } from "@/lib/schemas/protocol";

export function MonitoringBlock({ m }: { m: Protocol["monitoring"] }) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <h3 className="mb-2 font-semibold">🔁 Suivi recommandé</h3>
      <p className="text-sm">
        Réévaluation dans <strong>{m.reviewAfterWeeks} semaines</strong>.
      </p>
      {m.indicators.length > 0 && (
        <>
          <p className="mt-2 text-sm font-medium">Indicateurs à surveiller :</p>
          <ul className="list-disc pl-5 text-sm">
            {m.indicators.map((i, k) => (
              <li key={k}>{i}</li>
            ))}
          </ul>
        </>
      )}
      {m.bloodTests.length > 0 && (
        <>
          <p className="mt-2 text-sm font-medium">Analyses de suivi :</p>
          <ul className="list-disc pl-5 text-sm">
            {m.bloodTests.map((i, k) => (
              <li key={k}>{i}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

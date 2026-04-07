import type { Supplement } from "@/lib/schemas/protocol";
import { Badge } from "@/components/ui/badge";

const tierColor: Record<1 | 2 | 3, string> = {
  1: "bg-emerald-600",
  2: "bg-amber-500",
  3: "bg-slate-400",
};

export function SupplementCard({ s }: { s: Supplement }) {
  return (
    <div id={`supp-${s.id}`} className="rounded-lg border bg-white p-5">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {s.emoji} {s.name} — <span className="text-emerald-700">{s.form}</span>
          </h3>
          <p className="text-sm text-slate-600">
            {s.doseValue} {s.doseUnit} · {s.duration}
          </p>
        </div>
        <Badge className={`${tierColor[s.tier]} text-white`}>Tier {s.tier}</Badge>
      </div>
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="font-medium">Pourquoi cette forme</dt>
          <dd className="text-slate-700">{s.formRationale}</dd>
        </div>
        <div>
          <dt className="font-medium">Moment de prise</dt>
          <dd className="text-slate-700">{s.timingRationale}</dd>
        </div>
        <div>
          <dt className="font-medium">Justification pour ce profil</dt>
          <dd className="text-slate-700">{s.justification}</dd>
        </div>
        {s.interactions.length > 0 && (
          <div>
            <dt className="font-medium">Interactions</dt>
            <dd className="text-slate-700">
              <ul className="list-disc pl-5">
                {s.interactions.map((i, k) => (
                  <li key={k}>{i}</li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        {s.successIndicators.length > 0 && (
          <div>
            <dt className="font-medium">Signes que ça fonctionne</dt>
            <dd className="text-slate-700">
              <ul className="list-disc pl-5">
                {s.successIndicators.map((i, k) => (
                  <li key={k}>{i}</li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}

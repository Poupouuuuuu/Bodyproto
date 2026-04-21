import type { Supplement } from "@/lib/schemas/protocol";
import { tierColor, tierShort, type TierNum } from "@/lib/tier/labels";
import ReactMarkdown from "react-markdown";

const TIMING_LABEL: Record<string, string> = {
  morning_fasted: "Matin à jeun",
  morning_meal: "Matin avec repas",
  midday: "Midi",
  pre_workout: "Pré-entraînement",
  post_workout: "Post-entraînement",
  evening: "Soir",
  bedtime: "Coucher",
};

function Prose({ children }: { children: string }) {
  return (
    <div className="prose prose-sm max-w-none text-bs-text prose-strong:text-bs-primary prose-p:my-1">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}

export function SupplementCard({ supplement: s }: { supplement: Supplement }) {
  const color = tierColor(s.tier as TierNum);
  return (
    <article
      id={`supp-${s.id}`}
      className={`rounded-3xl border bg-bs-surface p-6 md:p-8 transition-all duration-300 hover:-translate-y-0.5 ${color.card}`}
    >
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl" aria-hidden>{s.emoji}</span>
            <h3 className="font-display text-xl font-black uppercase tracking-tight text-bs-primary">
              {s.name}
            </h3>
          </div>
          <p className="text-sm text-bs-muted">
            {s.form} ·{" "}
            <span className="font-mono">{s.doseValue} {s.doseUnit}</span>
            {" · "}
            {TIMING_LABEL[s.timing] ?? s.timing}
            {" · "}
            <span className="italic">{s.duration}</span>
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${color.badge}`}
          aria-label={`Tier ${s.tier}`}
        >
          {tierShort(s.tier as TierNum)}
        </span>
      </header>

      <dl className="space-y-4 text-sm">
        <div>
          <dt className="mb-1 text-xs uppercase tracking-widest text-bs-muted">Pourquoi cette forme</dt>
          <dd><Prose>{s.formRationale}</Prose></dd>
        </div>
        <div>
          <dt className="mb-1 text-xs uppercase tracking-widest text-bs-muted">Pourquoi ce moment</dt>
          <dd><Prose>{s.timingRationale}</Prose></dd>
        </div>
        <div>
          <dt className="mb-1 text-xs uppercase tracking-widest text-bs-muted">Ce que ça t&apos;apporte</dt>
          <dd><Prose>{s.justification}</Prose></dd>
        </div>
        {s.interactions.length > 0 && (
          <div>
            <dt className="mb-1 text-xs uppercase tracking-widest text-bs-muted">Interactions</dt>
            <dd>
              <ul className="list-disc pl-5 text-bs-text">
                {s.interactions.map((i, k) => (
                  <li key={k}>{i}</li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        {s.successIndicators.length > 0 && (
          <div>
            <dt className="mb-2 text-xs uppercase tracking-widest text-bs-muted">Indicateurs de succès</dt>
            <dd className="flex flex-wrap gap-2">
              {s.successIndicators.map((i, k) => (
                <span
                  key={k}
                  className="rounded-full border border-bs-primary/15 bg-bs-bg px-3 py-1 text-xs text-bs-primary"
                >
                  {i}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </article>
  );
}

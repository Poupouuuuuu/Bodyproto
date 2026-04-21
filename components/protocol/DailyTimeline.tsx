import { SunHorizon, Sun, Barbell, ArrowClockwise, Moon, Bed, CaretDown } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { Protocol } from "@/lib/schemas/protocol";

const COLUMN_META: { key: keyof Protocol["dailySchedule"]; label: string; Icon: Icon }[] = [
  { key: "morning", label: "Matin", Icon: SunHorizon },
  { key: "midday", label: "Midi", Icon: Sun },
  { key: "preWorkout", label: "Pré-training", Icon: Barbell },
  { key: "postWorkout", label: "Post-training", Icon: ArrowClockwise },
  { key: "evening", label: "Soir", Icon: Moon },
  { key: "bedtime", label: "Coucher", Icon: Bed },
];

export function DailyTimeline({ protocol }: { protocol: Protocol }) {
  const bySlug = new Map(protocol.supplements.map((s) => [s.id, s]));

  // Check if any column has content
  const hasContent = COLUMN_META.some(
    (c) => (protocol.dailySchedule[c.key] ?? []).length > 0,
  );

  if (!hasContent) return null;

  return (
    <details className="group" open>
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl bg-bs-primary/5 px-6 py-4 [&::-webkit-details-marker]:hidden">
        <h2 className="font-display text-2xl font-black uppercase tracking-tight text-bs-primary">
          Planning journée
        </h2>
        <CaretDown
          size={18}
          weight="bold"
          className="text-bs-primary transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-bs-primary/10 bg-bs-surface p-4 md:grid-cols-3 lg:grid-cols-6">
        {COLUMN_META.map((c) => {
          const ids = protocol.dailySchedule[c.key] ?? [];
          return (
            <div key={c.key} className="rounded-xl bg-bs-bg p-3">
              <div className="mb-3 flex items-center gap-1.5">
                <c.Icon size={16} className="text-bs-primary" />
                <h3 className="font-display text-xs font-bold uppercase tracking-widest text-bs-primary">
                  {c.label}
                </h3>
              </div>
              <ul className="space-y-2">
                {ids.length === 0 && <li className="text-xs text-bs-muted italic">—</li>}
                {ids.map((id) => {
                  const s = bySlug.get(id);
                  if (!s) return null;
                  return (
                    <li key={id}>
                      <a
                        href={`#supp-${id}`}
                        className="block rounded-xl bg-bs-surface px-2.5 py-2 text-xs transition-colors hover:bg-bs-primary/5"
                      >
                        <span className="font-medium text-bs-primary">
                          {s.emoji} {s.name}
                        </span>
                        <span className="mt-0.5 block font-mono text-[10px] text-bs-muted">
                          {s.doseValue} {s.doseUnit}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </details>
  );
}

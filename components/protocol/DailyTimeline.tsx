import { SunHorizon, Sun, Barbell, ArrowClockwise, Moon, Bed } from "@phosphor-icons/react/dist/ssr";
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
  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-bs-primary/10 bg-bs-surface p-4 md:grid-cols-6">
      {COLUMN_META.map((c) => {
        const ids = protocol.dailySchedule[c.key] ?? [];
        return (
          <div key={c.key} className="rounded-xl bg-bs-bg p-3">
            <div className="mb-2 flex items-center gap-1">
              <c.Icon size={14} className="text-bs-primary" />
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-bs-primary">
                {c.label}
              </h3>
            </div>
            <ul className="space-y-1">
              {ids.length === 0 && <li className="text-xs text-bs-muted">—</li>}
              {ids.map((id) => {
                const s = bySlug.get(id);
                if (!s) return null;
                return (
                  <li key={id}>
                    <a
                      href={`#supp-${id}`}
                      className="block rounded-xl bg-bs-surface px-2 py-1 text-xs hover:bg-emerald-50"
                    >
                      {s.emoji} {s.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

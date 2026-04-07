import type { Protocol } from "@/lib/schemas/protocol";

const COLS: { key: keyof Protocol["dailySchedule"]; label: string; emoji: string }[] = [
  { key: "morning", label: "Matin", emoji: "🌅" },
  { key: "midday", label: "Midi", emoji: "🥗" },
  { key: "preWorkout", label: "Pré-train", emoji: "🏋️" },
  { key: "postWorkout", label: "Post-train", emoji: "🔄" },
  { key: "evening", label: "Soir", emoji: "🌙" },
  { key: "bedtime", label: "Coucher", emoji: "🛌" },
];

export function DailyTimeline({ protocol }: { protocol: Protocol }) {
  const bySlug = new Map(protocol.supplements.map((s) => [s.id, s]));
  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg border bg-white p-4 md:grid-cols-6">
      {COLS.map((c) => {
        const ids = protocol.dailySchedule[c.key] ?? [];
        return (
          <div key={c.key} className="rounded-md bg-slate-50 p-3">
            <div className="mb-2 text-sm font-semibold">
              {c.emoji} {c.label}
            </div>
            <ul className="space-y-1">
              {ids.length === 0 && <li className="text-xs text-slate-400">—</li>}
              {ids.map((id) => {
                const s = bySlug.get(id);
                if (!s) return null;
                return (
                  <li key={id}>
                    <a
                      href={`#supp-${id}`}
                      className="block rounded bg-white px-2 py-1 text-xs hover:bg-emerald-50"
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

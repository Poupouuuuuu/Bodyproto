import type { Supplement } from "@/lib/schemas/protocol";
import { tierLabel, tierColor, type TierNum } from "@/lib/tier/labels";
import { SupplementCard } from "./SupplementCard";

export function TierSection({ tier, supplements }: { tier: TierNum; supplements: Supplement[] }) {
  if (supplements.length === 0) return null;
  const color = tierColor(tier);
  return (
    <section className="space-y-4">
      <div className={`flex items-baseline justify-between rounded-2xl px-6 py-4 ${color.band}`}>
        <h2 className="font-display text-2xl font-black uppercase tracking-tight">
          {tierLabel(tier)}
        </h2>
        <span className="text-sm font-medium opacity-80">
          {supplements.length} {supplements.length > 1 ? "compléments" : "complément"}
        </span>
      </div>
      <div className="grid gap-4">
        {supplements.map((s) => (
          <SupplementCard key={s.id} s={s} />
        ))}
      </div>
    </section>
  );
}

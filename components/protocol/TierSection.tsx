import type { Supplement } from "@/lib/schemas/protocol";
import { tierLabel, tierColor, type TierNum } from "@/lib/tier/labels";
import { SupplementCard } from "./SupplementCard";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";

export function TierSection({ tier, supplements, defaultOpen = false }: { tier: TierNum; supplements: Supplement[]; defaultOpen?: boolean }) {
  if (supplements.length === 0) return null;
  const color = tierColor(tier);
  return (
    <details open={defaultOpen || undefined} className="group">
      <summary
        className={`flex cursor-pointer list-none items-baseline justify-between rounded-2xl px-6 py-4 ${color.band} [&::-webkit-details-marker]:hidden`}
      >
        <h2 className="font-display text-2xl font-black uppercase tracking-tight">
          {tierLabel(tier)}
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium opacity-80">
            {supplements.length} {supplements.length > 1 ? "compléments" : "complément"}
          </span>
          <CaretDown
            size={18}
            weight="bold"
            className="transition-transform duration-200 group-open:rotate-180"
          />
        </div>
      </summary>
      <div className="mt-4 grid gap-4">
        {supplements.map((s) => (
          <SupplementCard key={s.id} supplement={s} />
        ))}
      </div>
    </details>
  );
}

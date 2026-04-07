"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { Checkbox } from "@/components/ui/checkbox";

type Goal = ClientProfile["goals"]["priorities"][number];

const GOALS: { value: Goal; label: string }[] = [
  { value: "performance", label: "Performance sportive / masse musculaire" },
  { value: "weight_loss", label: "Perte de poids / recomposition" },
  { value: "energy", label: "Énergie / anti-fatigue" },
  { value: "sleep", label: "Sommeil et récupération" },
  { value: "stress", label: "Stress / anxiété" },
  { value: "cognition", label: "Cognition / concentration" },
  { value: "longevity", label: "Longévité / santé préventive" },
  { value: "hormonal", label: "Santé hormonale / libido" },
  { value: "immunity", label: "Immunité" },
  { value: "digestive", label: "Santé digestive" },
  { value: "beauty", label: "Beauté (peau, cheveux, ongles)" },
  { value: "other", label: "Autre" },
];

export function Section2Goals() {
  const { setValue, watch } = useFormContext<ClientProfile>();
  const selected = (watch("goals.priorities") ?? []) as Goal[];

  function toggle(v: Goal) {
    const set = new Set<Goal>(selected);
    if (set.has(v)) set.delete(v);
    else if (set.size < 3) set.add(v);
    setValue("goals.priorities", Array.from(set), { shouldValidate: true });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Objectifs prioritaires</h2>
      <p className="text-sm text-slate-600">Choisis jusqu&apos;à 3 objectifs.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {GOALS.map((g) => {
          const checked = selected.includes(g.value);
          return (
            <label
              key={g.value}
              className={`flex items-center gap-2 rounded-md border p-3 ${checked ? "border-emerald-600 bg-emerald-50" : ""}`}
            >
              <Checkbox checked={checked} onCheckedChange={() => toggle(g.value)} />
              <span className="text-sm">{g.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

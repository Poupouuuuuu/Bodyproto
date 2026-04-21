"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { Checkbox } from "@/components/ui/checkbox";

type Goal = ClientProfile["goals"]["priorities"][number];

const GOALS: { value: Goal; label: string }[] = [
  { value: "muscle_gain", label: "Prise de masse / force" },
  { value: "weight_loss", label: "Perte de poids / sèche" },
  { value: "maintenance", label: "Maintien / santé générale" },
  { value: "energy", label: "Énergie / anti-fatigue" },
  { value: "sleep", label: "Sommeil et récupération" },
  { value: "stress", label: "Gestion du stress" },
  { value: "immunity", label: "Immunité / résistance" },
  { value: "beauty", label: "Beauté (peau, cheveux, ongles)" },
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
      <p className="text-sm text-bs-muted">Choisis jusqu&apos;à 3 objectifs.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {GOALS.map((g) => {
          const checked = selected.includes(g.value);
          return (
            <label
              key={g.value}
              className={`flex items-center gap-3 rounded-2xl border p-4 transition-colors ${checked ? "border-bs-primary bg-bs-primary/5" : "border-bs-primary/10"}`}
            >
              <Checkbox checked={checked} onCheckedChange={() => toggle(g.value)} />
              <span className="text-sm font-medium">{g.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

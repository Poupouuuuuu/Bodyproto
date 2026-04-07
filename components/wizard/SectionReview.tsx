"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";

export function SectionReview() {
  const { getValues } = useFormContext<ClientProfile>();
  const v = getValues();
  const row = (label: string, value: string) => (
    <div className="flex gap-3 py-1 text-sm">
      <span className="w-40 shrink-0 text-slate-500">{label}</span>
      <span>{value}</span>
    </div>
  );
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Vérification</h2>
      <div className="divide-y">
        {row("Client", `${v.client.firstName} ${v.client.lastName} — ${v.client.email}`)}
        {row(
          "Âge / sexe",
          `${v.basics.age} ans · ${v.basics.sex === "male" ? "Homme" : "Femme"}`,
        )}
        {row("Poids / taille", `${v.basics.weightKg} kg · ${v.basics.heightCm} cm`)}
        {row("Objectifs", v.goals.priorities.join(", "))}
        {row("Activité", v.lifestyle.activityLevel)}
        {row("Régime", v.nutrition.diet)}
        {row("Budget", v.supplements.budgetTier)}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Clique sur «&nbsp;Générer le protocole&nbsp;» quand tu es prêt.
      </p>
    </div>
  );
}

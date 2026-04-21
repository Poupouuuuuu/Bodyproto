"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";

const ACTIVITY_LABEL: Record<string, string> = {
  sedentary: "Sédentaire",
  light: "Légèrement actif",
  moderate: "Modérément actif",
  very_active: "Très actif",
  athlete: "Athlète",
};

const DIET_LABEL: Record<string, string> = {
  omnivore: "Omnivore",
  flexitarian: "Flexitarien",
  vegetarian: "Végétarien",
  vegan: "Vegan",
  carnivore_keto: "Carnivore / Keto",
  gluten_free: "Sans gluten",
  lactose_free: "Sans lactose",
};

const GOAL_LABEL: Record<string, string> = {
  muscle_gain: "Prise de masse",
  weight_loss: "Perte de poids",
  maintenance: "Maintien",
  energy: "Énergie",
  sleep: "Sommeil",
  stress: "Stress",
  immunity: "Immunité",
  beauty: "Beauté",
};

export function SectionReview() {
  const { getValues } = useFormContext<ClientProfile>();
  const v = getValues();
  const row = (label: string, value: string) => (
    <div className="flex gap-3 py-2 text-sm">
      <span className="w-40 shrink-0 text-bs-muted">{label}</span>
      <span className="text-bs-primary">{value}</span>
    </div>
  );
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Vérification</h2>
      <div className="divide-y divide-bs-primary/10">
        {row("Client", `${v.client.firstName} ${v.client.lastName} — ${v.client.email}`)}
        {row(
          "Âge / sexe",
          `${v.basics.age} ans · ${v.basics.sex === "male" ? "Homme" : "Femme"}`,
        )}
        {row("Poids / taille", `${v.basics.weightKg} kg · ${v.basics.heightCm} cm`)}
        {row("Objectifs", v.goals.priorities.map((g) => GOAL_LABEL[g] ?? g).join(", "))}
        {row("Activité", ACTIVITY_LABEL[v.lifestyle.activityLevel] ?? v.lifestyle.activityLevel)}
        {row("Régime", DIET_LABEL[v.nutrition.diet] ?? v.nutrition.diet)}
        {v.supplements.current && v.supplements.current !== "" && row("Compléments", v.supplements.current)}
      </div>
      <p className="mt-4 text-xs text-bs-muted">
        Clique sur «&nbsp;Générer le protocole&nbsp;» quand tu es prêt.
      </p>
    </div>
  );
}

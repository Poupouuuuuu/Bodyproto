export const STEPS = [
  { id: "client", label: "Client" },
  { id: "basics", label: "Données de base" },
  { id: "goals", label: "Objectifs" },
  { id: "lifestyle", label: "Mode de vie" },
  { id: "nutrition", label: "Alimentation" },
  { id: "health", label: "Santé" },
  { id: "supplements", label: "Compléments actuels" },
  { id: "review", label: "Récapitulatif" },
] as const;

export type StepId = typeof STEPS[number]["id"];

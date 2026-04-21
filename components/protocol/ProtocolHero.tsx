import type { ClientProfile } from "@/lib/schemas/clientProfile";

const GOAL_LABEL: Record<string, string> = {
  muscle_gain: "Prise de masse",
  weight_loss: "Perte de poids",
  maintenance: "Maintien",
  energy: "Énergie",
  sleep: "Sommeil",
  stress: "Stress",
  immunity: "Immunité",
  beauty: "Beauté",
  // Legacy values (existing consultations)
  performance: "Performance",
  cognition: "Cognition",
  longevity: "Longévité",
  hormonal: "Hormonal",
  digestive: "Digestion",
  other: "Autre",
};

export function ProtocolHero({ profile }: { profile: ClientProfile }) {
  const first = profile.client.firstName;
  const age = profile.basics.age;
  return (
    <header className="flex flex-col gap-6 rounded-4xl border border-bs-primary/10 bg-bs-surface p-8 md:flex-row md:items-end md:justify-between md:p-12">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-bs-accent">
          Protocole personnalisé
        </p>
        <h1 className="mb-6 text-display-hero text-4xl md:text-5xl xl:text-6xl text-bs-primary">
          Pour {first}, {age} ans
        </h1>
        <div className="flex flex-wrap gap-2">
          {profile.goals.priorities.map((g) => (
            <span
              key={g}
              className="rounded-full border border-bs-accent/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-bs-primary"
            >
              {GOAL_LABEL[g] ?? g}
            </span>
          ))}
        </div>
      </div>
      <div className="text-right text-xs text-bs-muted md:text-sm">
        <p>Consultation du</p>
        <p className="font-mono text-bs-primary">{profile.client.consultationDate}</p>
      </div>
    </header>
  );
}

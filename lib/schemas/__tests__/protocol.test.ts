import { describe, expect, it } from "vitest";
import { protocolSchema } from "../protocol";

const validProtocol = {
  summary: "Protocole axé sur performance et sommeil.",
  supplements: [
    {
      id: "magnesium-bisglycinate",
      emoji: "💊",
      name: "Magnésium",
      form: "Bisglycinate",
      formRationale: "Biodisponibilité 4x supérieure à l'oxyde.",
      doseValue: 400,
      doseUnit: "mg",
      timing: "bedtime",
      timingRationale: "Favorise la détente nerveuse avant le coucher.",
      duration: "en continu",
      justification: "Stress élevé + activité physique.",
      interactions: [],
      successIndicators: ["Meilleure qualité de sommeil sous 2 semaines"],
      tier: 1,
      category: "foundation",
    },
  ],
  dailySchedule: { morning: [], midday: [], preWorkout: [], postWorkout: [], evening: [], bedtime: ["magnesium-bisglycinate"] },
  warnings: ["Consulter un médecin si traitement en cours."],
  monitoring: { reviewAfterWeeks: 8, indicators: ["Qualité du sommeil"], bloodTests: ["Magnésium érythrocytaire"] },
};

describe("protocolSchema", () => {
  it("accepts a valid protocol", () => {
    const result = protocolSchema.safeParse(validProtocol);
    if (!result.success) console.error(result.error);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid timing value", () => {
    const bad = { ...validProtocol, supplements: [{ ...validProtocol.supplements[0], timing: "random_time" }] };
    expect(protocolSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a negative dose", () => {
    const bad = { ...validProtocol, supplements: [{ ...validProtocol.supplements[0], doseValue: -10 }] };
    expect(protocolSchema.safeParse(bad).success).toBe(false);
  });
});

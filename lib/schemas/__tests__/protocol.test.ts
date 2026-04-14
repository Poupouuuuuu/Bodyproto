import { describe, it, expect } from "vitest";
import { protocolSchema } from "../protocol";

const basePayload = {
  summary: "Protocole test",
  deficiencies: [
    {
      nutrient: "Magnésium",
      severity: "high" as const,
      whyAtRisk: "Stress élevé",
      addressedBy: ["magnesium-bisglycinate"],
    },
  ],
  supplements: [
    {
      id: "magnesium-bisglycinate",
      emoji: "💊",
      name: "Magnésium bisglycinate",
      form: "Bisglycinate",
      formRationale: "Meilleure biodisponibilité",
      doseValue: 400,
      doseUnit: "mg" as const,
      timing: "bedtime" as const,
      timingRationale: "Soir pour sommeil",
      duration: "3 mois",
      justification: "Stress chronique",
      interactions: [],
      successIndicators: ["Meilleur sommeil"],
      tier: 1 as const,
      category: "foundation" as const,
    },
  ],
  dailySchedule: { morning: [], midday: [], preWorkout: [], postWorkout: [], evening: [], bedtime: ["magnesium-bisglycinate"] },
  warnings: [],
  monitoring: { reviewAfterWeeks: 8, indicators: [], bloodTests: [] },
};

describe("protocolSchema", () => {
  it("accepts valid payload with deficiencies", () => {
    const result = protocolSchema.safeParse(basePayload);
    expect(result.success).toBe(true);
  });

  it("rejects payload without deficiencies field", () => {
    const { deficiencies, ...rest } = basePayload;
    const result = protocolSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects deficiency with invalid severity", () => {
    const bad = { ...basePayload, deficiencies: [{ ...basePayload.deficiencies[0], severity: "critical" }] };
    const result = protocolSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });
});

import { describe, expect, it, beforeAll } from "vitest";
process.env.DATABASE_URL = ":memory:";

let q: typeof import("../queries");

beforeAll(async () => {
  q = await import("../queries");
});

const profile = {
  client: { firstName: "Marie", lastName: "Dupont", email: "marie@example.com", phone: null, consultationDate: "2026-04-07", consentGiven: true },
  basics: { age: 32, sex: "female" as const, weightKg: 62, heightCm: 168, country: "France" },
  goals: { priorities: ["energy" as const] },
  lifestyle: { activityLevel: "moderate" as const, sportTypes: [], sleepQuality: 7, sleepHours: 7, stressLevel: 5, sunExposureMinutes: 20 },
  nutrition: { diet: "omnivore" as const, frequentFoods: [], alcoholPerWeek: 0, caffeinePerDay: 1 },
  health: { conditions: "", medications: "", bloodwork: "", allergies: "", pregnancy: false },
  supplements: { current: "", pastBadExperiences: "", budgetTier: "30-60" as const },
};

const protocol = {
  summary: "x",
  supplements: [{ id: "s1", emoji: "💊", name: "Mg", form: "Bisglycinate", formRationale: "r", doseValue: 400, doseUnit: "mg" as const, timing: "bedtime" as const, timingRationale: "r", duration: "continu", justification: "j", interactions: [], successIndicators: [], tier: 1 as const, category: "foundation" as const }],
  dailySchedule: { morning: [], midday: [], preWorkout: [], postWorkout: [], evening: [], bedtime: ["s1"] },
  warnings: [],
  monitoring: { reviewAfterWeeks: 8, indicators: [], bloodTests: [] },
};

describe("queries", () => {
  it("saves and retrieves a consultation", () => {
    const { consultationId, clientId } = q.upsertClientAndConsultation(profile as any, protocol as any);
    const fetched = q.getConsultation(consultationId);
    expect(fetched?.client?.email).toBe("marie@example.com");
    expect(fetched?.protocol.supplements[0].id).toBe("s1");
    const list = q.listClientsWithCounts();
    expect(list.find(c => c.id === clientId)?.consultationCount).toBe(1);
  });
});

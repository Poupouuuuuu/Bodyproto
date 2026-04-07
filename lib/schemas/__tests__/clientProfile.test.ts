import { describe, expect, it } from "vitest";
import { clientProfileSchema } from "../clientProfile";

describe("clientProfileSchema", () => {
  it("accepts a minimal valid profile", () => {
    const result = clientProfileSchema.safeParse({
      client: { firstName: "Marie", lastName: "Dupont", email: "marie@example.com", phone: null, consultationDate: "2026-04-07", consentGiven: true },
      basics: { age: 32, sex: "female", weightKg: 62, heightCm: 168, country: "France" },
      goals: { priorities: ["energy", "sleep", "stress"] },
      lifestyle: { activityLevel: "moderate", sportTypes: ["strength"], sleepQuality: 7, sleepHours: 7.5, stressLevel: 6, sunExposureMinutes: 20 },
      nutrition: { diet: "omnivore", frequentFoods: ["eggs", "leafy_greens"], alcoholPerWeek: 2, caffeinePerDay: 2 },
      health: { conditions: "", medications: "", bloodwork: "", allergies: "", pregnancy: false },
      supplements: { current: "", pastBadExperiences: "", budgetTier: "30-60" },
    });
    if (!result.success) console.error(result.error);
    expect(result.success).toBe(true);
  });

  it("rejects a profile missing consent", () => {
    const result = clientProfileSchema.safeParse({
      client: { firstName: "Marie", lastName: "Dupont", email: "marie@example.com", phone: null, consultationDate: "2026-04-07", consentGiven: false },
      basics: { age: 32, sex: "female", weightKg: 62, heightCm: 168, country: "France" },
      goals: { priorities: ["energy"] },
      lifestyle: { activityLevel: "moderate", sportTypes: [], sleepQuality: 7, sleepHours: 7, stressLevel: 5, sunExposureMinutes: 20 },
      nutrition: { diet: "omnivore", frequentFoods: [], alcoholPerWeek: 0, caffeinePerDay: 1 },
      health: { conditions: "", medications: "", bloodwork: "", allergies: "", pregnancy: false },
      supplements: { current: "", pastBadExperiences: "", budgetTier: "30-60" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty goal list", () => {
    const base = {
      client: { firstName: "M", lastName: "D", email: "m@d.fr", phone: null, consultationDate: "2026-04-07", consentGiven: true },
      basics: { age: 30, sex: "male", weightKg: 70, heightCm: 175, country: "France" },
      goals: { priorities: [] },
      lifestyle: { activityLevel: "sedentary", sportTypes: [], sleepQuality: 5, sleepHours: 7, stressLevel: 5, sunExposureMinutes: 10 },
      nutrition: { diet: "omnivore", frequentFoods: [], alcoholPerWeek: 0, caffeinePerDay: 0 },
      health: { conditions: "", medications: "", bloodwork: "", allergies: "", pregnancy: false },
      supplements: { current: "", pastBadExperiences: "", budgetTier: "<30" },
    };
    expect(clientProfileSchema.safeParse(base).success).toBe(false);
  });
});

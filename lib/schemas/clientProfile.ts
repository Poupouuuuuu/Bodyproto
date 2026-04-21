import { z } from "zod";

export const goalEnum = z.enum([
  "muscle_gain", "weight_loss", "maintenance", "energy", "sleep",
  "stress", "immunity", "beauty",
]);

export const activityLevelEnum = z.enum(["sedentary", "light", "moderate", "very_active", "athlete"]);
export const sportTypeEnum = z.enum(["strength", "endurance", "hiit", "cross_training", "powerlifting", "team", "yoga"]);
export const dietEnum = z.enum(["omnivore", "flexitarian", "vegetarian", "vegan", "carnivore_keto", "gluten_free", "lactose_free"]);
export const frequentFoodEnum = z.enum(["fatty_fish", "eggs", "dairy", "legumes", "nuts_seeds", "leafy_greens"]);
export const sexEnum = z.enum(["male", "female"]);

export const clientProfileSchema = z.object({
  client: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().nullable(),
    consultationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    consentGiven: z.boolean().refine((v) => v === true, { message: "Consent required" }),
  }),
  basics: z.object({
    age: z.number().int().min(14).max(110),
    sex: sexEnum,
    weightKg: z.number().positive().max(300),
    heightCm: z.number().positive().max(250),
  }),
  goals: z.object({
    priorities: z.array(goalEnum).min(1).max(3),
  }),
  lifestyle: z.object({
    activityLevel: activityLevelEnum,
    sportTypes: z.array(sportTypeEnum),
    sleepQuality: z.number().int().min(1).max(10),
    sleepHours: z.number().min(0).max(14),
    stressLevel: z.number().int().min(1).max(10),
    sunExposureMinutes: z.number().min(0).max(600),
  }),
  nutrition: z.object({
    diet: dietEnum,
    frequentFoods: z.array(frequentFoodEnum),
    alcoholPerWeek: z.number().min(0).max(100),
    caffeinePerDay: z.number().min(0).max(20),
  }),
  health: z.object({
    conditions: z.string(),
    medications: z.string(),
    allergies: z.string(),
    pregnancy: z.boolean(),
  }),
  supplements: z.object({
    current: z.string(),
  }),
});

export type ClientProfile = z.infer<typeof clientProfileSchema>;

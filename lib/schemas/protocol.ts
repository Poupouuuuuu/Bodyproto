import { z } from "zod";

export const timingEnum = z.enum([
  "morning_fasted", "morning_meal", "midday", "pre_workout", "post_workout", "evening", "bedtime",
]);
export type Timing = z.infer<typeof timingEnum>;

export const categoryEnum = z.enum([
  "foundation", "performance", "recovery", "beauty", "hormonal", "digestive",
]);

export const doseUnitEnum = z.enum(["mg", "g", "UI", "µg"]);

export const supplementSchema = z.object({
  id: z.string().min(1),
  emoji: z.string().min(1),
  name: z.string().min(1),
  form: z.string().min(1),
  formRationale: z.string().min(1),
  doseValue: z.number().positive(),
  doseUnit: doseUnitEnum,
  timing: timingEnum,
  timingRationale: z.string().min(1),
  duration: z.string().min(1),
  justification: z.string().min(1),
  interactions: z.array(z.string()),
  successIndicators: z.array(z.string()),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  category: categoryEnum,
});
export type Supplement = z.infer<typeof supplementSchema>;

export const protocolSchema = z.object({
  summary: z.string().min(1),
  supplements: z.array(supplementSchema).min(1),
  dailySchedule: z.object({
    morning: z.array(z.string()),
    midday: z.array(z.string()),
    preWorkout: z.array(z.string()),
    postWorkout: z.array(z.string()),
    evening: z.array(z.string()),
    bedtime: z.array(z.string()),
  }),
  warnings: z.array(z.string()),
  monitoring: z.object({
    reviewAfterWeeks: z.number().int().positive(),
    indicators: z.array(z.string()),
    bloodTests: z.array(z.string()),
  }),
});
export type Protocol = z.infer<typeof protocolSchema>;

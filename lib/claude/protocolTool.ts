import "server-only";
import type Anthropic from "@anthropic-ai/sdk";

export const PROTOCOL_TOOL_NAME = "emit_protocol";

export const protocolTool: Anthropic.Tool = {
  name: PROTOCOL_TOOL_NAME,
  description: "Émet le protocole de compléments structuré pour le client. Tu DOIS appeler cet outil avec les recommandations finales.",
  input_schema: {
    type: "object",
    required: ["summary", "supplements", "dailySchedule", "warnings", "monitoring"],
    properties: {
      summary: { type: "string", description: "Introduction narrative 2-3 phrases, markdown autorisé." },
      supplements: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["id", "emoji", "name", "form", "formRationale", "doseValue", "doseUnit", "timing", "timingRationale", "duration", "justification", "interactions", "successIndicators", "tier", "category"],
          properties: {
            id: { type: "string", description: "slug unique kebab-case, ex: magnesium-bisglycinate" },
            emoji: { type: "string" },
            name: { type: "string" },
            form: { type: "string" },
            formRationale: { type: "string" },
            doseValue: { type: "number", minimum: 0 },
            doseUnit: { type: "string", enum: ["mg", "g", "UI", "µg"] },
            timing: { type: "string", enum: ["morning_fasted", "morning_meal", "midday", "pre_workout", "post_workout", "evening", "bedtime"] },
            timingRationale: { type: "string" },
            duration: { type: "string" },
            justification: { type: "string" },
            interactions: { type: "array", items: { type: "string" } },
            successIndicators: { type: "array", items: { type: "string" } },
            tier: { type: "integer", enum: [1, 2, 3] },
            category: { type: "string", enum: ["foundation", "performance", "recovery", "beauty", "hormonal", "digestive"] },
          },
        },
      },
      dailySchedule: {
        type: "object",
        required: ["morning", "midday", "preWorkout", "postWorkout", "evening", "bedtime"],
        properties: {
          morning: { type: "array", items: { type: "string" } },
          midday: { type: "array", items: { type: "string" } },
          preWorkout: { type: "array", items: { type: "string" } },
          postWorkout: { type: "array", items: { type: "string" } },
          evening: { type: "array", items: { type: "string" } },
          bedtime: { type: "array", items: { type: "string" } },
        },
      },
      warnings: { type: "array", items: { type: "string" } },
      monitoring: {
        type: "object",
        required: ["reviewAfterWeeks", "indicators", "bloodTests"],
        properties: {
          reviewAfterWeeks: { type: "integer", minimum: 1 },
          indicators: { type: "array", items: { type: "string" } },
          bloodTests: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};

import "server-only";
import type Anthropic from "@anthropic-ai/sdk";

export const PROTOCOL_TOOL_NAME = "emit_protocol";

export const protocolTool: Anthropic.Tool = {
  name: PROTOCOL_TOOL_NAME,
  description: "Émet le protocole de compléments structuré pour le client. Tu DOIS appeler cet outil avec les recommandations finales.",
  input_schema: {
    type: "object",
    required: ["summary", "deficiencies", "supplements", "dailySchedule", "warnings", "monitoring"],
    properties: {
      summary: { type: "string", description: "Introduction narrative 2-3 phrases, markdown autorisé." },
      deficiencies: {
        type: "array",
        minItems: 1,
        description: "Carences alimentaires ou micronutritionnelles identifiées à partir du profil. Chaque carence doit être couverte par au moins un supplément du tableau 'supplements'.",
        items: {
          type: "object",
          required: ["nutrient", "severity", "whyAtRisk", "addressedBy"],
          properties: {
            nutrient: { type: "string", description: "Nom clair et court, ex: 'Magnésium', 'Vitamine D3', 'Oméga-3 EPA/DHA'" },
            severity: { type: "string", enum: ["low", "moderate", "high"], description: "high = déficit probable confirmé par plusieurs signaux, moderate = plausible, low = sous-optimal non critique" },
            whyAtRisk: { type: "string", description: "Une phrase factuelle courte (< 20 mots)" },
            addressedBy: { type: "array", items: { type: "string" }, description: "IDs des suppléments du protocole qui couvrent cette carence" },
          },
        },
      },
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
            formRationale: { type: "string", description: "Comparaison EXHAUSTIVE de toutes les formes existantes de ce complément. Nommer chaque forme concurrente, donner ses défauts, conclure pourquoi la forme choisie est supérieure. Peut contenir du markdown (gras, listes)." },
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
        description: "OBLIGATOIRE — NE PAS LAISSER VIDE. Place l'ID de CHAQUE supplément du protocole dans le créneau horaire correspondant (basé sur son champ timing). Utilise les mêmes IDs kebab-case que supplements[].id. Chaque supplément DOIT apparaître dans au moins un créneau.",
        required: ["morning", "midday", "preWorkout", "postWorkout", "evening", "bedtime"],
        properties: {
          morning: { type: "array", items: { type: "string" }, description: "IDs des suppléments à prendre le matin (morning_fasted + morning_meal)" },
          midday: { type: "array", items: { type: "string" }, description: "IDs des suppléments à prendre le midi" },
          preWorkout: { type: "array", items: { type: "string" }, description: "IDs des suppléments pré-entraînement" },
          postWorkout: { type: "array", items: { type: "string" }, description: "IDs des suppléments post-entraînement" },
          evening: { type: "array", items: { type: "string" }, description: "IDs des suppléments du soir" },
          bedtime: { type: "array", items: { type: "string" }, description: "IDs des suppléments au coucher" },
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

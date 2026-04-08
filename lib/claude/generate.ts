import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, CLAUDE_MODEL } from "./client";
import { loadSystemPrompt } from "./systemPrompt";
import { protocolTool, PROTOCOL_TOOL_NAME } from "./protocolTool";
import { protocolSchema, type Protocol } from "@/lib/schemas/protocol";
import type { ClientProfile } from "@/lib/schemas/clientProfile";

export async function generateProtocol(profile: ClientProfile): Promise<Protocol> {
  const msg = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    system: loadSystemPrompt(),
    tools: [protocolTool],
    tool_choice: { type: "tool", name: PROTOCOL_TOOL_NAME },
    messages: [
      {
        role: "user",
        content: `Voici le profil client (JSON). Génère le protocole personnalisé en appelant l'outil ${PROTOCOL_TOOL_NAME}.\n\n\`\`\`json\n${JSON.stringify(profile, null, 2)}\n\`\`\``,
      },
    ],
  });

  const toolUse = msg.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  if (!toolUse) throw new Error("Claude did not call emit_protocol tool");
  const parsed = protocolSchema.safeParse(toolUse.input);
  if (!parsed.success) throw new Error(`Protocol validation failed: ${parsed.error.message}`);
  return parsed.data;
}

export async function refineProtocol(
  profile: ClientProfile,
  currentProtocol: Protocol,
  dietaryDescription: string,
): Promise<{ adjustedProtocol: Protocol; analysisNarrative: string }> {
  const msg = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    system: loadSystemPrompt(),
    tools: [protocolTool],
    tool_choice: { type: "tool", name: PROTOCOL_TOOL_NAME },
    messages: [
      {
        role: "user",
        content: `Profil client:\n\`\`\`json\n${JSON.stringify(profile, null, 2)}\n\`\`\`\n\nProtocole actuel:\n\`\`\`json\n${JSON.stringify(currentProtocol, null, 2)}\n\`\`\``,
      },
      { role: "assistant", content: "Protocole émis. Souhaites-tu la Phase 3 — analyse alimentaire ?" },
      {
        role: "user",
        content: `Oui. Voici la journée alimentaire type:\n\n${dietaryDescription}\n\nAnalyse, identifie les lacunes, et ré-émets le protocole AJUSTÉ via l'outil ${PROTOCOL_TOOL_NAME}. Avant l'appel d'outil, explique brièvement les ajustements en 3-5 lignes.`,
      },
    ],
  });

  const textBlocks = msg.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
  const toolUse = msg.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  if (!toolUse) throw new Error("Claude did not call emit_protocol tool during refine");
  const parsed = protocolSchema.safeParse(toolUse.input);
  if (!parsed.success) throw new Error(`Refined protocol validation failed: ${parsed.error.message}`);
  return {
    adjustedProtocol: parsed.data,
    analysisNarrative: textBlocks.map(b => b.text).join("\n\n"),
  };
}

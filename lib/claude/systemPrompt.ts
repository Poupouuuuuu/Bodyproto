import "server-only";
import fs from "node:fs";
import path from "node:path";

let cached: string | null = null;

export function loadSystemPrompt(): string {
  if (cached) return cached;
  const p = path.join(process.cwd(), "prompts", "system.md");
  cached = fs.readFileSync(p, "utf8");
  return cached;
}

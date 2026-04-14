export type TierNum = 1 | 2 | 3;

export function tierLabel(t: TierNum): string {
  return { 1: "Essentiels", 2: "Prioritaires", 3: "Optimisations" }[t];
}

export function tierShort(t: TierNum): string {
  return { 1: "S", 2: "A", 3: "B" }[t];
}

export function tierColor(t: TierNum): { band: string; card: string; badge: string } {
  return {
    1: {
      band: "bg-bs-primary text-bs-bg",
      card: "border-bs-primary/25 shadow-[0_4px_20px_rgba(26,46,35,0.08)]",
      badge: "bg-bs-primary text-bs-bg",
    },
    2: {
      band: "bg-bs-accent text-bs-primary",
      card: "border-bs-accent/40",
      badge: "bg-bs-accent text-bs-primary",
    },
    3: {
      band: "bg-bs-muted/15 text-bs-primary",
      card: "border-bs-primary/10",
      badge: "bg-bs-muted/20 text-bs-muted",
    },
  }[t];
}

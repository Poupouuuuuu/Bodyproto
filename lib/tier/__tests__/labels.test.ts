import { describe, it, expect } from "vitest";
import { tierLabel, tierShort, tierColor } from "../labels";

describe("tier labels", () => {
  it("maps 1 → ESSENTIELS / S / forest", () => {
    expect(tierLabel(1)).toBe("Essentiels");
    expect(tierShort(1)).toBe("S");
    expect(tierColor(1).band).toContain("bs-primary");
  });
  it("maps 2 → PRIORITAIRES / A / sage", () => {
    expect(tierLabel(2)).toBe("Prioritaires");
    expect(tierShort(2)).toBe("A");
    expect(tierColor(2).band).toContain("bs-accent");
  });
  it("maps 3 → OPTIMISATIONS / B / cream-dark", () => {
    expect(tierLabel(3)).toBe("Optimisations");
    expect(tierShort(3)).toBe("B");
  });
});

// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { DeficienciesViz } from "../DeficienciesViz";
import type { Deficiency } from "@/lib/schemas/protocol";

const sample: Deficiency[] = [
  { nutrient: "Magnésium", severity: "high", whyAtRisk: "Stress + peu de feuillus", addressedBy: ["mg"] },
  { nutrient: "Zinc", severity: "low", whyAtRisk: "Régime végétal", addressedBy: ["zn"] },
];

describe("DeficienciesViz", () => {
  it("renders each nutrient name", () => {
    render(<DeficienciesViz deficiencies={sample} />);
    expect(screen.getByText(/magnésium/i)).toBeInTheDocument();
    expect(screen.getByText(/zinc/i)).toBeInTheDocument();
  });

  it("renders empty-state when no deficiencies", () => {
    render(<DeficienciesViz deficiencies={[]} />);
    expect(screen.getByText(/aucune carence/i)).toBeInTheDocument();
  });

  it("renders severity labels", () => {
    render(<DeficienciesViz deficiencies={sample} />);
    expect(screen.getByText(/déficit élevé/i)).toBeInTheDocument();
    expect(screen.getByText(/léger/i)).toBeInTheDocument();
  });
});

// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FloatingHistory } from "../FloatingHistory";

describe("FloatingHistory", () => {
  it("renders as a link pointing to /history", () => {
    render(<FloatingHistory />);
    const link = screen.getByRole("link", { name: /historique/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/history");
  });
});

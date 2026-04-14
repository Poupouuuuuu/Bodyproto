// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScannerOverlay } from "../ScannerOverlay";

// framer-motion uses browser animation APIs that are absent in jsdom.
// Mock it so that motion.div renders as a plain div.
vi.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: new Proxy(
      {},
      {
        get: (_target: unknown, prop: string) =>
          React.forwardRef(
            (
              { children, ...rest }: Record<string, unknown>,
              ref: React.Ref<HTMLElement>
            ) => React.createElement(prop, { ref, ...rest }, children)
          ),
      }
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});

// AnatomicalSilhouette uses SVG logic; stub it to keep tests focused on
// ScannerOverlay behaviour rather than SVG rendering details.
vi.mock("../AnatomicalSilhouette", () => ({
  AnatomicalSilhouette: () => null,
  ORGANS: {},
}));

describe("ScannerOverlay", () => {
  it("does not render anything when open=false", () => {
    const { container } = render(<ScannerOverlay open={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows status text when open=true", () => {
    render(<ScannerOverlay open={true} />);
    expect(screen.getByText(/analyse du profil/i)).toBeInTheDocument();
  });

  it("has aria-live polite for screen readers", () => {
    render(<ScannerOverlay open={true} />);
    const live = document.querySelector('[aria-live="polite"]');
    expect(live).not.toBeNull();
  });
});

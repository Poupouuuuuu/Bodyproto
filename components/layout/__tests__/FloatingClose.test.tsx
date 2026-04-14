// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FloatingClose } from "../FloatingClose";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("FloatingClose", () => {
  it("renders a button with accessible label", () => {
    render(<FloatingClose />);
    const btn = screen.getByRole("button", { name: /fermer/i });
    expect(btn).toBeInTheDocument();
  });

  it("navigates to / when clicked", async () => {
    pushMock.mockReset();
    render(<FloatingClose />);
    const btn = screen.getByRole("button", { name: /fermer/i });
    btn.click();
    expect(pushMock).toHaveBeenCalledWith("/");
  });
});

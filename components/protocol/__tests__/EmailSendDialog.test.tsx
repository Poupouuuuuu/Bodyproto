// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render } from "@testing-library/react";
import { EmailSendDialog } from "../EmailSendDialog";

describe("EmailSendDialog", () => {
  it("renders pre-filled email when open", () => {
    render(
      <EmailSendDialog
        open={true}
        onClose={() => {}}
        consultationId="abc"
        defaultEmail="thomas@example.com"
        emailSentAt={null}
      />,
    );
    // Input should have the default email as its value
    const inputs = document.querySelectorAll('input[type="email"]');
    expect(inputs.length).toBeGreaterThan(0);
    expect((inputs[0] as HTMLInputElement).value).toBe("thomas@example.com");
  });

  it("does not render anything when open=false", () => {
    const { container } = render(
      <EmailSendDialog
        open={false}
        onClose={() => {}}
        consultationId="abc"
        defaultEmail=""
        emailSentAt={null}
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});

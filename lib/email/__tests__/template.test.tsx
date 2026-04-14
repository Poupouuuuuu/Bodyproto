// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render } from "@react-email/components";
import { ProtocolEmail } from "../templates/ProtocolEmail";

describe("ProtocolEmail template", () => {
  it("renders with standard props", async () => {
    const html = await render(
      <ProtocolEmail
        firstName="Thomas"
        consultationUrl="https://example.com/r/abc"
        consultationDate="2026-04-14"
        essentialCount={2}
        priorityCount={3}
        optimisationCount={2}
        shopAddress="8 Rue du Pont des Landes, 78310 Coignières"
        shopPhone="07 61 84 75 80"
      />,
    );
    expect(html).toContain("Thomas");
    expect(html).toContain("Coignières");
    expect(html).toContain("https://example.com/r/abc");
  });
});

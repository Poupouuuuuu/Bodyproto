import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    anthropicApiKey: "test-key",
    resendApiKey: "test-resend-key",
    resendFromEmail: "test@example.com",
    shopAddress: "8 Rue du Pont des Landes, 78310 Coignières",
    shopPhone: "07 61 84 75 80",
    appOrigin: "http://localhost:3000",
  },
}));

import { sendProtocolEmail } from "../send";

vi.mock("../client", () => ({
  getResend: () => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "mock-id" }, error: null }),
    },
  }),
}));

describe("sendProtocolEmail", () => {
  it("sends to given recipient with PDF attachment", async () => {
    const result = await sendProtocolEmail({
      toEmail: "thomas@example.com",
      firstName: "Thomas",
      consultationId: "abc",
      consultationDate: "2026-04-14",
      essentialCount: 2,
      priorityCount: 3,
      optimisationCount: 2,
      pdfBuffer: Buffer.from("fake-pdf"),
    });
    expect(result.id).toBe("mock-id");
  });
});

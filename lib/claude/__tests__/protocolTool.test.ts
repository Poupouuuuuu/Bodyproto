import { describe, expect, it } from "vitest";
import { protocolTool, PROTOCOL_TOOL_NAME } from "../protocolTool";

describe("protocolTool", () => {
  it("has the expected name", () => {
    expect(protocolTool.name).toBe(PROTOCOL_TOOL_NAME);
  });
  it("requires the same top-level keys as the Zod schema", () => {
    const required = (protocolTool.input_schema as { required: string[] }).required;
    expect([...required].sort()).toEqual([
      "dailySchedule",
      "monitoring",
      "summary",
      "supplements",
      "warnings",
    ]);
  });
});

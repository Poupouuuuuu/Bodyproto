import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getConsultation, updateProtocol } from "@/lib/db/queries";
import { refineProtocol } from "@/lib/claude/generate";

export const runtime = "nodejs";

const bodySchema = z.object({
  consultationId: z.string(),
  dietaryDescription: z.string().min(10),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const c = getConsultation(parsed.data.consultationId);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const { adjustedProtocol, analysisNarrative } = await refineProtocol(
      c.profile,
      c.protocol,
      parsed.data.dietaryDescription,
    );
    updateProtocol(c.id, adjustedProtocol, {
      description: parsed.data.dietaryDescription,
      narrative: analysisNarrative,
    });
    return NextResponse.json({ adjustedProtocol, analysisNarrative });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

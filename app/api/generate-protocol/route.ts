import { NextRequest, NextResponse } from "next/server";
import { clientProfileSchema } from "@/lib/schemas/clientProfile";
import { generateProtocol } from "@/lib/claude/generate";
import { upsertClientAndConsultation } from "@/lib/db/queries";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = clientProfileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid profile", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const protocol = await generateProtocol(parsed.data);
    const { consultationId } = upsertClientAndConsultation(parsed.data, protocol);
    return NextResponse.json({ consultationId, protocol });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

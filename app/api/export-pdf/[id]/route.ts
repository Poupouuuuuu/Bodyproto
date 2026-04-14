import { NextRequest, NextResponse } from "next/server";
import { getConsultation } from "@/lib/db/queries";
import { renderConsultationPdf } from "@/lib/pdf/generate";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const c = getConsultation(id);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pdf = await renderConsultationPdf(id);
  const lastName = c.profile.client.lastName ?? "client";
  const filename = `BodyStart-${lastName}-${c.id.slice(0, 6)}.pdf`;
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}

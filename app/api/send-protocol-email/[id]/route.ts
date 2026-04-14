import { NextRequest, NextResponse } from "next/server";
import { getConsultation, markEmailSent } from "@/lib/db/queries";
import { sendProtocolEmail } from "@/lib/email/send";
import { renderConsultationPdf } from "@/lib/pdf/generate";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { toEmail?: string };

  const data = getConsultation(id);
  if (!data) return NextResponse.json({ error: "Consultation not found" }, { status: 404 });

  const toEmail = body.toEmail ?? data.profile.client.email;
  if (!toEmail) return NextResponse.json({ error: "Missing recipient email" }, { status: 400 });

  try {
    const pdfBuffer = await renderConsultationPdf(id);

    const byTier = (t: 1 | 2 | 3) => data.protocol.supplements.filter((s) => s.tier === t).length;
    const result = await sendProtocolEmail({
      toEmail,
      firstName: data.profile.client.firstName,
      consultationId: id,
      consultationDate: data.profile.client.consultationDate,
      essentialCount: byTier(1),
      priorityCount: byTier(2),
      optimisationCount: byTier(3),
      pdfBuffer,
    });

    markEmailSent(id);
    return NextResponse.json({ ok: true, emailId: result.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Email send failed" },
      { status: 500 },
    );
  }
}

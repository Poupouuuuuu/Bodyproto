import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { getConsultation } from "@/lib/db/queries";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const c = getConsultation(id);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const origin = process.env.APP_ORIGIN ?? "http://localhost:3000";
  const url = `${origin}/consultation/${id}/print`;

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" },
    });
    const lastName = c.profile.client.lastName ?? "client";
    const filename = `BodyStart-${lastName}-${c.id.slice(0, 6)}.pdf`;
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${filename}"`,
      },
    });
  } finally {
    await browser.close();
  }
}

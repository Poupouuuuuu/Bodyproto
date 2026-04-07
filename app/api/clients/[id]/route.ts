import { NextRequest, NextResponse } from "next/server";
import { deleteClient } from "@/lib/db/queries";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  deleteClient(id);
  return NextResponse.json({ ok: true });
}

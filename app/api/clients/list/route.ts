import { NextResponse } from "next/server";
import { listClientsWithCounts } from "@/lib/db/queries";

export async function GET() {
  return NextResponse.json(listClientsWithCounts());
}

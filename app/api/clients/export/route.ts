import { NextResponse } from "next/server";
import { listClientsWithCounts } from "@/lib/db/queries";

export async function GET() {
  const rows = listClientsWithCounts();
  const header = "firstName,lastName,email,phone,consultationCount\n";
  const body = rows
    .map((r) =>
      [r.firstName, r.lastName, r.email, r.phone ?? "", r.consultationCount]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
  return new NextResponse(header + body, {
    headers: {
      "content-type": "text/csv",
      "content-disposition": 'attachment; filename="bodystart-clients.csv"',
    },
  });
}

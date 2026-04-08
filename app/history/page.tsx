"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type Row = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  consultationCount: number;
  lastConsultationAt: number;
  lastConsultationId: string | null;
};

export default function HistoryPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");

  async function load() {
    const res = await fetch("/api/clients/list", { cache: "no-store" });
    if (res.ok) setRows(await res.json());
  }
  useEffect(() => {
    load();
  }, []);

  async function del(id: string) {
    if (!confirm("Supprimer ce client et toutes ses consultations ?")) return;
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Client supprimé");
      load();
    }
  }

  const filtered = rows.filter((r) =>
    `${r.firstName} ${r.lastName} ${r.email}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Historique clients</h1>
        <div className="ml-auto flex gap-2">
          <Input
            placeholder="Rechercher…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64"
          />
          <a href="/api/clients/export">
            <Button variant="secondary">Export CSV</Button>
          </a>
        </div>
      </div>
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Consultations</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  {r.firstName} {r.lastName}
                </TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.phone ?? "—"}</TableCell>
                <TableCell>{r.consultationCount}</TableCell>
                <TableCell className="text-right">
                  {r.lastConsultationId && (
                    <Link href={`/consultation/${r.lastConsultationId}`}>
                      <Button variant="secondary" size="sm" className="mr-2">
                        Voir le rapport
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => del(r.id)}>
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-500">
                  Aucun client
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

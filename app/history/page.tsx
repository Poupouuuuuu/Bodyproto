"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { BrandButton } from "@/components/ui/brand-button";
import { FloatingClose } from "@/components/layout/FloatingClose";
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
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");

  async function load() {
    const res = await fetch("/api/clients/list", { cache: "no-store" });
    if (res.ok) setRows(await res.json());
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch pattern
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
    <>
      <FloatingClose />
      <main className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="font-display text-4xl font-black uppercase tracking-tight text-bs-primary md:text-5xl">
              Historique clients
            </h1>
            <div className="ml-auto flex items-center gap-3">
              <Input
                placeholder="Rechercher…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-64"
              />
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- /api route, not a page */}
              <a href="/api/clients/export">
                <BrandButton variant="secondary" size="md">Export CSV</BrandButton>
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-bs-primary/10 bg-bs-surface">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-bs-muted">Nom</TableHead>
                  <TableHead className="text-bs-muted">Email</TableHead>
                  <TableHead className="text-bs-muted">Téléphone</TableHead>
                  <TableHead className="text-bs-muted">Consultations</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const openReport = () => {
                    if (r.lastConsultationId) {
                      router.push(`/consultation/${r.lastConsultationId}`);
                    }
                  };
                  return (
                    <TableRow
                      key={r.id}
                      className={`h-[72px] transition-colors ${r.lastConsultationId ? "cursor-pointer hover:bg-bs-muted/5" : ""}`}
                      onClick={openReport}
                    >
                      <TableCell className="text-bs-primary font-medium">
                        {r.firstName} {r.lastName}
                      </TableCell>
                      <TableCell className="text-bs-muted">{r.email}</TableCell>
                      <TableCell className="text-bs-muted">{r.phone ?? "—"}</TableCell>
                      <TableCell className="text-bs-muted">{r.consultationCount}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        {r.lastConsultationId && (
                          <Link href={`/consultation/${r.lastConsultationId}`}>
                            <BrandButton variant="secondary" size="sm" className="mr-2">
                              Voir le rapport
                            </BrandButton>
                          </Link>
                        )}
                        <BrandButton variant="ghost" size="sm" onClick={() => del(r.id)}>
                          Supprimer
                        </BrandButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-bs-muted">
                      Aucun client
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </>
  );
}

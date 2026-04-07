import { notFound } from "next/navigation";
import Link from "next/link";
import { getConsultation } from "@/lib/db/queries";
import { ProtocolView } from "@/components/protocol/ProtocolView";
import { Button } from "@/components/ui/button";

export default async function ConsultationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = getConsultation(id);
  if (!c) notFound();
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <a href={`/api/export-pdf/${c.id}`}>
          <Button>Exporter PDF</Button>
        </a>
        <Link href={`/consultation/${c.id}/refine`}>
          <Button variant="secondary">Affiner avec analyse alimentaire</Button>
        </Link>
        <Link href="/history">
          <Button variant="ghost">Retour à l&apos;historique</Button>
        </Link>
      </div>
      <ProtocolView profile={c.profile} protocol={c.protocol} />
    </div>
  );
}

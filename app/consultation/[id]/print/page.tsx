import { notFound } from "next/navigation";
import { getConsultation } from "@/lib/db/queries";
import { ProtocolViewPrint } from "@/components/protocol/ProtocolViewPrint";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const data = getConsultation(id);
  if (!data) notFound();
  return <ProtocolViewPrint profile={data.profile} protocol={data.protocol} />;
}

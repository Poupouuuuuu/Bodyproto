import { notFound } from "next/navigation";
import { getConsultation } from "@/lib/db/queries";
import { ProtocolView } from "@/components/protocol/ProtocolView";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const data = getConsultation(id);
  if (!data) notFound();

  return (
    <ProtocolView
      consultationId={data.id}
      profile={data.profile}
      protocol={data.protocol}
      dietaryAnalysis={data.dietaryAnalysis}
      analysedAt={data.updatedAt ? data.updatedAt.getTime() / 1000 : undefined}
      emailSentAt={data.emailSentAt}
    />
  );
}

import { notFound } from "next/navigation";
import Image from "next/image";
import { getConsultation } from "@/lib/db/queries";
import { ProtocolView } from "@/components/protocol/ProtocolView";
import { env } from "@/lib/env";
import "./print.css";

export default async function PrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = getConsultation(id);
  if (!c) notFound();
  return (
    <div className="pdf-root">
      <header className="pdf-header">
        <Image src="/logo.png" alt="BodyStart" width={56} height={56} />
        <div>
          <div className="pdf-brand">BodyStart Nutrition</div>
          <div className="pdf-brand-sub">
            {env.shopAddress} · {env.shopPhone}
          </div>
        </div>
      </header>
      <ProtocolView profile={c.profile} protocol={c.protocol} />
      <footer className="pdf-footer">
        Document généré le {new Date().toLocaleDateString("fr-FR")} — BodyStart Nutrition
      </footer>
    </div>
  );
}

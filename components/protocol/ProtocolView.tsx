"use client";
import { useState } from "react";
import type { Protocol } from "@/lib/schemas/protocol";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { ProtocolHero } from "./ProtocolHero";
import { SummaryBlock } from "./SummaryBlock";
import { DeficienciesViz } from "./DeficienciesViz";
import { TierSection } from "./TierSection";
import { DailyTimeline } from "./DailyTimeline";
import { RecapTable } from "./RecapTable";
import { WarningsBlock } from "./WarningsBlock";
import { MonitoringBlock } from "./MonitoringBlock";
import { DietaryAnalysisBlock } from "./DietaryAnalysisBlock";
import { ActionBar } from "./ActionBar";
import { EmailSendDialog } from "./EmailSendDialog";
import type { TierNum } from "@/lib/tier/labels";

type Props = {
  consultationId: string;
  profile: ClientProfile;
  protocol: Protocol;
  dietaryAnalysis: { description?: string; narrative?: string } | null;
  analysedAt?: number;
  emailSentAt: Date | null;
};

export function ProtocolView({
  consultationId,
  profile,
  protocol,
  dietaryAnalysis,
  analysedAt,
  emailSentAt,
}: Props) {
  const [emailOpen, setEmailOpen] = useState(false);

  const byTier = (tier: TierNum) =>
    protocol.supplements.filter((s) => s.tier === tier);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-10">
      <ProtocolHero profile={profile} />
      <SummaryBlock text={protocol.summary} />
      {dietaryAnalysis && (
        <DietaryAnalysisBlock analysis={dietaryAnalysis} analysedAt={analysedAt} />
      )}
      <DeficienciesViz deficiencies={protocol.deficiencies} />
      <div className="space-y-10">
        <TierSection tier={1} supplements={byTier(1)} />
        <TierSection tier={2} supplements={byTier(2)} />
        <TierSection tier={3} supplements={byTier(3)} />
      </div>
      <DailyTimeline protocol={protocol} />
      <section>
        <h2 className="mb-4 font-display text-2xl font-black uppercase tracking-tight text-bs-primary">
          Récapitulatif
        </h2>
        <div className="rounded-3xl border border-bs-primary/10 bg-bs-surface overflow-hidden">
          <RecapTable protocol={protocol} />
        </div>
      </section>
      <WarningsBlock warnings={protocol.warnings} />
      <MonitoringBlock m={protocol.monitoring} />
      <ActionBar consultationId={consultationId} onEmailClick={() => setEmailOpen(true)} />
      <EmailSendDialog
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        consultationId={consultationId}
        defaultEmail={profile.client.email}
        emailSentAt={emailSentAt}
      />
    </div>
  );
}

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
import { DietaryAnalysisBlock } from "./DietaryAnalysisBlock";
import { ActionBar } from "./ActionBar";
import { EmailSendDialog } from "./EmailSendDialog";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
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
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      {/* Always visible */}
      <ProtocolHero profile={profile} />
      <SummaryBlock text={protocol.summary} />
      {dietaryAnalysis && (
        <DietaryAnalysisBlock analysis={dietaryAnalysis} analysedAt={analysedAt} />
      )}
      <DeficienciesViz deficiencies={protocol.deficiencies} />

      {/* Tier sections — Essentiels open by default, others collapsed */}
      <div className="space-y-6">
        <TierSection tier={1} supplements={byTier(1)} defaultOpen />
        <TierSection tier={2} supplements={byTier(2)} />
        <TierSection tier={3} supplements={byTier(3)} />
      </div>

      {/* Planning journée (collapsible, open by default) */}
      <DailyTimeline protocol={protocol} />

      {/* Récapitulatif (collapsible) */}
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl bg-bs-primary/5 px-6 py-4 [&::-webkit-details-marker]:hidden">
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-bs-primary">
            Récapitulatif
          </h2>
          <CaretDown
            size={18}
            weight="bold"
            className="text-bs-primary transition-transform duration-200 group-open:rotate-180"
          />
        </summary>
        <div className="mt-4 rounded-3xl border border-bs-primary/10 bg-bs-surface overflow-hidden">
          <RecapTable protocol={protocol} />
        </div>
      </details>

      {/* Avertissements (collapsible) */}
      {protocol.warnings.length > 0 && (
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl bg-sev-high/5 px-6 py-4 [&::-webkit-details-marker]:hidden">
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-bs-primary">
              Avertissements
            </h2>
            <CaretDown
              size={18}
              weight="bold"
              className="text-bs-primary transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <div className="mt-4">
            <WarningsBlock warnings={protocol.warnings} />
          </div>
        </details>
      )}

      {/* MonitoringBlock retiré — trop technique pour la boutique */}

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

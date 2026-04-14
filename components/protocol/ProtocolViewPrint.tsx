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
import { env } from "@/lib/env";
import type { TierNum } from "@/lib/tier/labels";

export function ProtocolViewPrint({ profile, protocol }: { profile: ClientProfile; protocol: Protocol }) {
  const byTier = (t: TierNum) => protocol.supplements.filter((s) => s.tier === t);
  return (
    <div className="mx-auto max-w-[820px] bg-bs-bg p-10 text-bs-text">
      <header className="mb-8 flex items-center justify-between border-b border-bs-primary/15 pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-bs-accent">Protocole BodyStart Nutrition</p>
        </div>
        <div className="text-right text-xs text-bs-muted">
          <p>{env.shopAddress}</p>
          <p>{env.shopPhone}</p>
        </div>
      </header>
      <div className="space-y-8">
        <ProtocolHero profile={profile} />
        <SummaryBlock text={protocol.summary} />
        <DeficienciesViz deficiencies={protocol.deficiencies} />
        <TierSection tier={1} supplements={byTier(1)} />
        <TierSection tier={2} supplements={byTier(2)} />
        <TierSection tier={3} supplements={byTier(3)} />
        <DailyTimeline protocol={protocol} />
        <section>
          <h2 className="mb-3 font-display text-xl font-black uppercase tracking-tight text-bs-primary">
            Récapitulatif
          </h2>
          <div className="rounded-2xl border border-bs-primary/10 overflow-hidden">
            <RecapTable protocol={protocol} />
          </div>
        </section>
        <WarningsBlock warnings={protocol.warnings} />
        <MonitoringBlock m={protocol.monitoring} />
      </div>
    </div>
  );
}

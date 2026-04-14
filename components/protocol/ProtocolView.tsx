import type { Protocol } from "@/lib/schemas/protocol";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { SummaryBlock } from "./SummaryBlock";
import { DailyTimeline } from "./DailyTimeline";
import { SupplementCard } from "./SupplementCard";
import { RecapTable } from "./RecapTable";
import { WarningsBlock } from "./WarningsBlock";
import { MonitoringBlock } from "./MonitoringBlock";

export function ProtocolView({
  profile,
  protocol,
}: {
  profile: ClientProfile;
  protocol: Protocol;
}) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">
          Protocole personnalisé — {profile.client.firstName} {profile.client.lastName}
        </h1>
        <p className="text-sm text-slate-500">
          Consultation du {profile.client.consultationDate}
        </p>
      </header>
      <SummaryBlock text={protocol.summary} />
      <DailyTimeline protocol={protocol} />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Suppléments recommandés</h2>
        {[...protocol.supplements]
          .sort((a, b) => a.tier - b.tier)
          .map((s) => (
            <SupplementCard key={s.id} supplement={s} />
          ))}
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Récapitulatif</h2>
        <div className="rounded-lg border bg-white">
          <RecapTable protocol={protocol} />
        </div>
      </section>
      <WarningsBlock warnings={protocol.warnings} />
      <MonitoringBlock m={protocol.monitoring} />
    </div>
  );
}

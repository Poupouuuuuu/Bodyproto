import type { Protocol } from "@/lib/schemas/protocol";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const timingLabels: Record<string, string> = {
  morning_fasted: "Matin à jeun",
  morning_meal: "Matin avec repas",
  midday: "Midi",
  pre_workout: "Pré-train",
  post_workout: "Post-train",
  evening: "Soir",
  bedtime: "Coucher",
};

export function RecapTable({ protocol }: { protocol: Protocol }) {
  const sorted = [...protocol.supplements].sort((a, b) => a.tier - b.tier);
  return (
    <div className="rounded-3xl border border-bs-primary/10 overflow-hidden bg-bs-surface">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-display uppercase tracking-wider text-bs-muted text-xs">Complément</TableHead>
            <TableHead className="font-display uppercase tracking-wider text-bs-muted text-xs">Forme</TableHead>
            <TableHead className="font-display uppercase tracking-wider text-bs-muted text-xs">Dose</TableHead>
            <TableHead className="font-display uppercase tracking-wider text-bs-muted text-xs">Moment</TableHead>
            <TableHead className="font-display uppercase tracking-wider text-bs-muted text-xs">Objectif</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="text-bs-text">
                {s.emoji} {s.name}
              </TableCell>
              <TableCell className="text-bs-text">{s.form}</TableCell>
              <TableCell className="font-mono text-bs-text">
                {s.doseValue} {s.doseUnit}
              </TableCell>
              <TableCell className="text-bs-text">{timingLabels[s.timing]}</TableCell>
              <TableCell className="text-bs-text">{s.category}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

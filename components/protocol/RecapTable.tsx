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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Complément</TableHead>
          <TableHead>Forme</TableHead>
          <TableHead>Dose</TableHead>
          <TableHead>Moment</TableHead>
          <TableHead>Objectif</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((s) => (
          <TableRow key={s.id}>
            <TableCell>
              {s.emoji} {s.name}
            </TableCell>
            <TableCell>{s.form}</TableCell>
            <TableCell>
              {s.doseValue} {s.doseUnit}
            </TableCell>
            <TableCell>{timingLabels[s.timing]}</TableCell>
            <TableCell>{s.category}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

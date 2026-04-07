"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Section6Supplements() {
  const { register, setValue, watch } = useFormContext<ClientProfile>();
  const budget = watch("supplements.budgetTier");
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Compléments actuels et budget</h2>
      <div>
        <Label>Compléments déjà pris (noms, doses)</Label>
        <Textarea {...register("supplements.current")} />
      </div>
      <div>
        <Label>Mauvaises expériences passées</Label>
        <Textarea {...register("supplements.pastBadExperiences")} />
      </div>
      <div>
        <Label>Budget mensuel</Label>
        <Select
          value={budget}
          onValueChange={(v) =>
            setValue(
              "supplements.budgetTier",
              v as ClientProfile["supplements"]["budgetTier"],
              { shouldValidate: true },
            )
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="<30">Moins de 30€</SelectItem>
            <SelectItem value="30-60">30-60€</SelectItem>
            <SelectItem value="60-100">60-100€</SelectItem>
            <SelectItem value="100+">100€+ / pas de contrainte</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

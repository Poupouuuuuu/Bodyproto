"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export function Section5Health() {
  const { register, setValue, watch } = useFormContext<ClientProfile>();
  const sex = watch("basics.sex");
  const pregnancy = watch("health.pregnancy");
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Santé et antécédents</h2>
      <div>
        <Label>Problèmes de santé connus</Label>
        <Textarea
          {...register("health.conditions")}
          placeholder="Thyroïde, diabète, SOPK..."
        />
      </div>
      <div>
        <Label>Médicaments en cours</Label>
        <Textarea {...register("health.medications")} />
      </div>
      <div>
        <Label>Bilan sanguin récent (valeurs connues)</Label>
        <Textarea
          {...register("health.bloodwork")}
          placeholder="Vit D 22 ng/mL, Ferritine 45..."
        />
      </div>
      <div>
        <Label>Allergies / intolérances</Label>
        <Textarea {...register("health.allergies")} />
      </div>
      {sex === "female" && (
        <label className="flex items-center gap-2">
          <Checkbox
            checked={pregnancy}
            onCheckedChange={(v) => setValue("health.pregnancy", v === true)}
          />{" "}
          Enceinte ou possible grossesse
        </label>
      )}
    </div>
  );
}

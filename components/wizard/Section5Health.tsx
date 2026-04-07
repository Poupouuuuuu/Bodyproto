"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export function Section5Health() {
  const { register, setValue, watch } = useFormContext<ClientProfile>();
  const sex = watch("basics.sex");
  const pregnancy = watch("health.pregnancy");

  function markNothing() {
    setValue("health.conditions", "Aucun", { shouldValidate: true });
    setValue("health.medications", "Aucun", { shouldValidate: true });
    setValue("health.bloodwork", "Aucun", { shouldValidate: true });
    setValue("health.allergies", "Aucune", { shouldValidate: true });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Santé et antécédents</h2>
        <Button type="button" variant="secondary" size="sm" onClick={markNothing}>
          Rien à signaler
        </Button>
      </div>
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

"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function Section1Basics() {
  const { register, setValue, watch } = useFormContext<ClientProfile>();
  const sex = watch("basics.sex");
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Données de base</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Âge</Label>
          <Input type="number" {...register("basics.age", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Sexe biologique</Label>
          <RadioGroup
            value={sex}
            onValueChange={(v) =>
              setValue("basics.sex", v as ClientProfile["basics"]["sex"], {
                shouldValidate: true,
              })
            }
            className="mt-2 flex gap-4"
          >
            <label className="flex items-center gap-2">
              <RadioGroupItem value="male" /> Homme
            </label>
            <label className="flex items-center gap-2">
              <RadioGroupItem value="female" /> Femme
            </label>
          </RadioGroup>
        </div>
        <div>
          <Label>Poids (kg)</Label>
          <Input
            type="number"
            step="0.1"
            {...register("basics.weightKg", { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label>Taille (cm)</Label>
          <Input
            type="number"
            {...register("basics.heightCm", { valueAsNumber: true })}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Pays / continent</Label>
          <Input {...register("basics.country")} />
        </div>
      </div>
    </div>
  );
}

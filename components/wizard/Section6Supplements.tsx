"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BrandButton } from "@/components/ui/brand-button";

export function Section6Supplements() {
  const { register, setValue } = useFormContext<ClientProfile>();

  function markNothing() {
    setValue("supplements.current", "Aucun", { shouldValidate: true });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Compléments actuels</h2>
        <BrandButton type="button" variant="secondary" size="sm" onClick={markNothing}>
          Rien à signaler
        </BrandButton>
      </div>
      <div>
        <Label>Compléments déjà pris (noms, doses)</Label>
        <Textarea
          {...register("supplements.current")}
          placeholder="Whey 30g/jour, Créatine 5g, Omega-3..."
        />
      </div>
    </div>
  );
}

"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function Section0Client() {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<ClientProfile>();
  const consent = watch("client.consentGiven");
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Informations client</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Prénom</Label>
          <Input {...register("client.firstName")} />
        </div>
        <div>
          <Label>Nom</Label>
          <Input {...register("client.lastName")} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" {...register("client.email")} />
        </div>
        <div>
          <Label>Téléphone (optionnel)</Label>
          <Input {...register("client.phone")} />
        </div>
        <div>
          <Label>Date de consultation</Label>
          <Input type="date" {...register("client.consultationDate")} />
        </div>
      </div>
      <label className="flex items-start gap-3 rounded-md border bg-slate-50 p-3">
        <Checkbox
          checked={!!consent}
          onCheckedChange={(v) =>
            setValue("client.consentGiven", v === true, { shouldValidate: true })
          }
        />
        <span className="text-sm">
          Le client consent à la conservation de ses données personnelles pour un suivi
          nutritionnel personnalisé.
        </span>
      </label>
      {errors.client && (
        <p className="text-sm text-red-600">
          {Object.values(errors.client)
            .map((e) => (e as { message?: string })?.message)
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
    </div>
  );
}

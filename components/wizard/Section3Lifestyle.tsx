"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type SportType = ClientProfile["lifestyle"]["sportTypes"][number];

const SPORTS: { v: SportType; l: string }[] = [
  { v: "strength", l: "Force / Musculation" },
  { v: "endurance", l: "Endurance / Cardio" },
  { v: "hiit", l: "HIIT" },
  { v: "cross_training", l: "Cross Training" },
  { v: "powerlifting", l: "SBD / Powerlifting" },
  { v: "team", l: "Sport co" },
  { v: "yoga", l: "Yoga / Mobilité" },
];

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sédentaire (bureau, peu de mouvement)",
  light: "Légèrement actif (1-2 séances/sem)",
  moderate: "Modérément actif (3-4 séances/sem)",
  very_active: "Très actif (5+ séances/sem)",
  athlete: "Athlète / compétition",
};

export function Section3Lifestyle() {
  const { register, setValue, watch } = useFormContext<ClientProfile>();
  const v = watch("lifestyle");
  function toggleSport(value: SportType) {
    const set = new Set<SportType>(v.sportTypes as SportType[]);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    setValue("lifestyle.sportTypes", Array.from(set), { shouldValidate: true });
  }
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">Mode de vie</h2>
      <div>
        <Label>Niveau d&apos;activité</Label>
        <Select
          value={v.activityLevel}
          onValueChange={(val) =>
            setValue(
              "lifestyle.activityLevel",
              val as ClientProfile["lifestyle"]["activityLevel"],
              { shouldValidate: true },
            )
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Sélectionner...">
              {ACTIVITY_LABELS[v.activityLevel] ?? v.activityLevel}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Type(s) de sport</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {SPORTS.map((s) => {
            const checked = (v.sportTypes as SportType[]).includes(s.v);
            return (
              <label
                key={s.v}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${checked ? "border-bs-primary bg-bs-primary/5" : "border-bs-primary/10"}`}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggleSport(s.v)} />
                {s.l}
              </label>
            );
          })}
        </div>
      </div>
      <div>
        <Label>Qualité du sommeil : {v.sleepQuality}/10</Label>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[v.sleepQuality]}
          onValueChange={(val) =>
            setValue("lifestyle.sleepQuality", Array.isArray(val) ? val[0] : val)
          }
          className="mt-2"
        />
      </div>
      <div>
        <Label>Durée moyenne du sommeil (heures)</Label>
        <Input
          type="number"
          step="0.5"
          {...register("lifestyle.sleepHours", { valueAsNumber: true })}
        />
      </div>
      <div>
        <Label>Niveau de stress : {v.stressLevel}/10</Label>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[v.stressLevel]}
          onValueChange={(val) =>
            setValue("lifestyle.stressLevel", Array.isArray(val) ? val[0] : val)
          }
          className="mt-2"
        />
      </div>
      <div>
        <Label>Exposition solaire quotidienne (minutes)</Label>
        <Input
          type="number"
          {...register("lifestyle.sunExposureMinutes", { valueAsNumber: true })}
        />
      </div>
    </div>
  );
}

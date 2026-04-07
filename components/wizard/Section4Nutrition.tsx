"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Food = ClientProfile["nutrition"]["frequentFoods"][number];

const FOODS: { v: Food; l: string }[] = [
  { v: "fatty_fish", l: "Poisson gras (saumon, sardines...)" },
  { v: "eggs", l: "Œufs" },
  { v: "dairy", l: "Produits laitiers" },
  { v: "legumes", l: "Légumineuses" },
  { v: "nuts_seeds", l: "Noix et graines" },
  { v: "leafy_greens", l: "Légumes verts feuillus" },
];

export function Section4Nutrition() {
  const { register, setValue, watch } = useFormContext<ClientProfile>();
  const v = watch("nutrition");
  function toggleFood(value: Food) {
    const set = new Set<Food>(v.frequentFoods as Food[]);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    setValue("nutrition.frequentFoods", Array.from(set), { shouldValidate: true });
  }
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">Alimentation</h2>
      <div>
        <Label>Régime alimentaire</Label>
        <Select
          value={v.diet}
          onValueChange={(val) =>
            setValue("nutrition.diet", val as ClientProfile["nutrition"]["diet"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="omnivore">Omnivore</SelectItem>
            <SelectItem value="flexitarian">Flexitarien</SelectItem>
            <SelectItem value="vegetarian">Végétarien</SelectItem>
            <SelectItem value="vegan">Vegan</SelectItem>
            <SelectItem value="carnivore_keto">Carnivore / Keto / Paleo</SelectItem>
            <SelectItem value="gluten_free">Sans gluten</SelectItem>
            <SelectItem value="lactose_free">Sans lactose</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Consommation régulière (plusieurs fois/semaine)</Label>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {FOODS.map((f) => {
            const checked = (v.frequentFoods as Food[]).includes(f.v);
            return (
              <label
                key={f.v}
                className={`flex items-center gap-2 rounded-md border p-2 ${checked ? "border-emerald-600 bg-emerald-50" : ""}`}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggleFood(f.v)} />
                <span className="text-sm">{f.l}</span>
              </label>
            );
          })}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Alcool (verres/semaine)</Label>
          <Input
            type="number"
            {...register("nutrition.alcoholPerWeek", { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label>Caféine (tasses/jour)</Label>
          <Input
            type="number"
            {...register("nutrition.caffeinePerDay", { valueAsNumber: true })}
          />
        </div>
      </div>
    </div>
  );
}

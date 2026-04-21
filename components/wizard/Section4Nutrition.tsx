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

const DIETS: { value: string; label: string; desc: string }[] = [
  { value: "omnivore", label: "Omnivore", desc: "Tu manges de tout" },
  { value: "flexitarian", label: "Flexitarien", desc: "Majoritairement végétal, un peu de viande" },
  { value: "vegetarian", label: "Végétarien", desc: "Pas de viande ni poisson" },
  { value: "vegan", label: "Vegan", desc: "Aucun produit animal" },
  { value: "carnivore_keto", label: "Carnivore / Keto / Paleo", desc: "Très peu de glucides, riche en protéines" },
  { value: "gluten_free", label: "Sans gluten", desc: "Intolérance ou choix" },
  { value: "lactose_free", label: "Sans lactose", desc: "Intolérance aux produits laitiers" },
];

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

  const currentDiet = DIETS.find((d) => d.value === v.diet);

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
            <SelectValue placeholder="Sélectionner...">
              {currentDiet ? `${currentDiet.label} — ${currentDiet.desc}` : v.diet}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DIETS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                <span className="font-medium">{d.label}</span>
                <span className="ml-2 text-xs text-bs-muted">{d.desc}</span>
              </SelectItem>
            ))}
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
                className={`flex items-center gap-2 rounded-2xl border p-3 transition-colors ${checked ? "border-bs-primary bg-bs-primary/5" : "border-bs-primary/10"}`}
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

"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const MEALS = [
  { key: "breakfast", label: "Petit-déjeuner" },
  { key: "lunch", label: "Déjeuner" },
  { key: "snack", label: "Collations" },
  { key: "dinner", label: "Dîner" },
  { key: "drinks", label: "Boissons" },
] as const;

type MealKey = (typeof MEALS)[number]["key"];

const UNITS = ["g", "ml", "unité", "cuillère", "tasse", "tranche"] as const;
type Unit = (typeof UNITS)[number];

type Item = { food: string; quantity: string; unit: Unit };

const emptyItem = (): Item => ({ food: "", quantity: "", unit: "g" });

export default function RefinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [meals, setMeals] = useState<Record<MealKey, Item[]>>({
    breakfast: [emptyItem()],
    lunch: [emptyItem()],
    snack: [emptyItem()],
    dinner: [emptyItem()],
    drinks: [emptyItem()],
  });
  const [loading, setLoading] = useState(false);

  function updateItem(meal: MealKey, idx: number, patch: Partial<Item>) {
    setMeals((prev) => ({
      ...prev,
      [meal]: prev[meal].map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    }));
  }
  function addItem(meal: MealKey) {
    setMeals((prev) => ({ ...prev, [meal]: [...prev[meal], emptyItem()] }));
  }
  function removeItem(meal: MealKey, idx: number) {
    setMeals((prev) => ({
      ...prev,
      [meal]: prev[meal].filter((_, i) => i !== idx),
    }));
  }

  const composed = MEALS.map((m) => {
    const lines = meals[m.key]
      .filter((it) => it.food.trim())
      .map((it) => `  - ${it.food.trim()}${it.quantity.trim() ? ` (${it.quantity.trim()} ${it.unit})` : ""}`);
    return `${m.label}:\n${lines.length ? lines.join("\n") : "  - (rien)"}`;
  }).join("\n\n");

  const totalItems = Object.values(meals)
    .flat()
    .filter((it) => it.food.trim()).length;

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/refine-protocol", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ consultationId: id, dietaryDescription: composed }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erreur");
      toast.success("Protocole ajusté");
      router.push(`/consultation/${id}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Analyse alimentaire</h1>
      <p className="text-sm text-slate-600">
        Liste les aliments d&apos;une journée type avec leur quantité. Ajoute autant
        de lignes que nécessaire par repas.
      </p>

      {MEALS.map((m) => (
        <section key={m.key} className="rounded-lg border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <Label className="text-base font-semibold">{m.label}</Label>
            <Button type="button" variant="secondary" size="sm" onClick={() => addItem(m.key)}>
              + Ajouter
            </Button>
          </div>
          <div className="space-y-2">
            {meals[m.key].map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2">
                <Input
                  className="col-span-6"
                  placeholder="Aliment (ex: poulet, banane, riz)"
                  value={it.food}
                  onChange={(e) => updateItem(m.key, idx, { food: e.target.value })}
                />
                <Input
                  className="col-span-2"
                  type="number"
                  placeholder="Qté"
                  value={it.quantity}
                  onChange={(e) => updateItem(m.key, idx, { quantity: e.target.value })}
                />
                <div className="col-span-3">
                  <Select
                    value={it.unit}
                    onValueChange={(v) => updateItem(m.key, idx, { unit: v as Unit })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="col-span-1"
                  onClick={() => removeItem(m.key, idx)}
                  disabled={meals[m.key].length === 1}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </section>
      ))}

      <Button onClick={submit} disabled={loading || totalItems < 3}>
        {loading ? "Analyse..." : "Ajuster le protocole"}
      </Button>
    </div>
  );
}

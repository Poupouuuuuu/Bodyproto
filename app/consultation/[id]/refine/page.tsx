"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MEALS = [
  { key: "breakfast", label: "Petit-déjeuner", placeholder: "2 œufs, avocat, café noir..." },
  { key: "lunch", label: "Déjeuner", placeholder: "Poulet grillé, riz, légumes vapeur..." },
  { key: "snack", label: "Collations", placeholder: "Amandes, fruit, yaourt grec..." },
  { key: "dinner", label: "Dîner", placeholder: "Saumon, patate douce, salade..." },
  { key: "drinks", label: "Boissons", placeholder: "Eau (2L), 2 cafés, 1 verre de vin..." },
] as const;

type MealKey = (typeof MEALS)[number]["key"];

export default function RefinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [meals, setMeals] = useState<Record<MealKey, string>>({
    breakfast: "",
    lunch: "",
    snack: "",
    dinner: "",
    drinks: "",
  });
  const [loading, setLoading] = useState(false);

  const composed = MEALS.map((m) => `${m.label}: ${meals[m.key].trim() || "—"}`).join("\n");
  const filledChars = Object.values(meals).reduce((n, v) => n + v.trim().length, 0);

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
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Analyse alimentaire</h1>
      <p className="text-sm text-slate-600">
        Détaille une journée alimentaire type du client. Remplis chaque section
        (laisse vide ou mets «&nbsp;rien&nbsp;» si le client ne consomme pas ce repas).
      </p>
      {MEALS.map((m) => (
        <div key={m.key}>
          <Label>{m.label}</Label>
          <Textarea
            rows={3}
            value={meals[m.key]}
            onChange={(e) => setMeals((prev) => ({ ...prev, [m.key]: e.target.value }))}
            placeholder={m.placeholder}
          />
        </div>
      ))}
      <Button onClick={submit} disabled={loading || filledChars < 20}>
        {loading ? "Analyse..." : "Ajuster le protocole"}
      </Button>
    </div>
  );
}

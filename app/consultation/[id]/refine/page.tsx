"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RefinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/refine-protocol", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ consultationId: id, dietaryDescription: desc }),
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
        Décris une journée alimentaire type du client : petit-déjeuner, déjeuner,
        collations, dîner, boissons.
      </p>
      <div>
        <Label>Journée type</Label>
        <Textarea
          rows={12}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Petit-déjeuner: 2 œufs, avocat, café..."
        />
      </div>
      <Button onClick={submit} disabled={loading || desc.length < 20}>
        {loading ? "Analyse..." : "Ajuster le protocole"}
      </Button>
    </div>
  );
}

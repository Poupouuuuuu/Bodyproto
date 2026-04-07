import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle consultation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">Démarre un nouveau bilan client et génère un protocole personnalisé.</p>
          <Link href="/consultation/new"><Button>Commencer</Button></Link>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Historique clients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">Retrouve, rouvre ou exporte un protocole passé.</p>
          <Link href="/history"><Button variant="secondary">Ouvrir</Button></Link>
        </CardContent>
      </Card>
    </div>
  );
}

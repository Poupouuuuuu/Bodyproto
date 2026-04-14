# BodyStart Kiosque — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer l'outil interne existant en **expérience boutique payante** alignée sur bodystart.vercel.app, avec animation scanner pendant la génération Claude, visualisation des carences, tier list rebrandée, envoi email via Resend, et refresh visuel complet.

**Architecture:** Next.js 16 App Router + Tailwind v4 `@theme` + Drizzle SQLite + Claude API (tool-forced). Scanner isolé en Client Component (`'use client'`) avec Framer Motion. Email via Resend + React Email. PDF Puppeteer réutilisé. Changements data model : `Protocol.deficiencies` (nouveau champ), `consultations.emailSentAt` (timestamp).

**Tech Stack:** Next.js 16.2.2 · TypeScript · Tailwind v4 · Drizzle ORM · Zod · react-hook-form · shadcn/ui · Framer Motion (à installer) · Resend · React Email · Phosphor Icons · Montserrat font · Vitest.

**Spec source:** [`docs/superpowers/specs/2026-04-14-bodystart-kiosque-redesign-design.md`](../specs/2026-04-14-bodystart-kiosque-redesign-design.md)

---

## Conventions

- Tous les composants utilisant des animations continues ou des hooks Framer Motion ont `'use client'` en tête de fichier.
- Tous les paths sont relatifs à la racine du projet `C:\Users\lecha\OneDrive\Bureau\Bodystart_protocole`.
- Tous les commits utilisent `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>` en trailer.
- Les messages de commit utilisent conventional commits : `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`.
- Tests unitaires dans `<module>/__tests__/*.test.ts` (convention existante : `lib/db/__tests__/queries.test.ts`).
- Après chaque modif Drizzle schema : `npx drizzle-kit generate` puis commit la migration générée.
- Le dev server tourne via `npm run dev` sur le port 3000. Ne pas le redémarrer à chaque tâche — Next.js HMR suffit.

---

## Structure de fichiers — cartographie globale

### Nouveaux fichiers à créer

```
app/
├── r/
│   └── [id]/
│       └── page.tsx                                    # Page publique durable du rapport
├── api/
│   └── send-protocol-email/
│       └── [id]/
│           └── route.ts                                # Envoi email via Resend

components/
├── scanner/
│   ├── ScannerOverlay.tsx                              # Wrapper fullscreen + status text
│   ├── AnatomicalSilhouette.tsx                        # SVG corps + organes + scan line
│   └── __tests__/
│       └── ScannerOverlay.test.tsx
├── protocol/
│   ├── DeficienciesViz.tsx                             # Bar chart horizontal carences
│   ├── TierSection.tsx                                 # Bande tier + cards groupées
│   ├── DietaryAnalysisBlock.tsx                        # Réintégration Phase 3
│   ├── EmailSendDialog.tsx                             # Modal envoi email
│   ├── ActionBar.tsx                                   # Barre sticky bas rapport
│   ├── ProtocolHero.tsx                                # Hero client (nom + objectifs)
│   └── __tests__/
│       ├── DeficienciesViz.test.tsx
│       └── EmailSendDialog.test.tsx
└── ui/
    └── brand-button.tsx                                # Pill button aligné charte

lib/
├── email/
│   ├── client.ts                                       # Instance Resend
│   ├── send.ts                                         # sendProtocolEmail()
│   ├── templates/
│   │   └── ProtocolEmail.tsx                           # React Email template
│   └── __tests__/
│       ├── send.test.ts
│       └── template.test.tsx
├── tier/
│   └── labels.ts                                       # tierLabel(1|2|3) → string

drizzle/
└── NNNN_add_email_sent_at.sql                          # Migration générée

docs/
└── CHANGELOG.md                                        # Suivi changements (si absent)
```

### Fichiers à modifier

```
app/
├── globals.css                                         # Tokens BodyStart (cream, forest, fonts)
├── layout.tsx                                          # Typo Montserrat + Inter, header refait
├── page.tsx                                            # Home redesignée
├── consultation/
│   ├── new/
│   │   └── page.tsx                                    # (wrapper wizard, inchangé si OK)
│   ├── [id]/
│   │   ├── page.tsx                                    # Action bar + email dialog intégrés
│   │   └── print/
│   │       └── page.tsx                                # Template PDF refait
│   └── refine/
│       └── page.tsx                                    # Refresh visuel

components/
├── wizard/
│   ├── WizardShell.tsx                                 # Intègre ScannerOverlay au submit
│   └── Section*.tsx                                    # Refresh visuel tokens charte
├── protocol/
│   ├── ProtocolView.tsx                                # Recomposition complète
│   ├── SupplementCard.tsx                              # Refonte premium tier
│   ├── DailyTimeline.tsx                               # Refresh visuel cream/forest
│   ├── RecapTable.tsx                                  # Refresh visuel
│   ├── SummaryBlock.tsx                                # Refresh visuel
│   ├── WarningsBlock.tsx                               # Refresh visuel
│   └── MonitoringBlock.tsx                             # Refresh visuel

lib/
├── schemas/
│   └── protocol.ts                                     # Ajoute DeficiencySchema + Protocol.deficiencies
├── claude/
│   └── protocolTool.ts                                 # Étend input_schema avec deficiencies
├── db/
│   ├── schema.ts                                       # Ajoute emailSentAt
│   └── queries.ts                                      # Expose emailSentAt + markEmailSent()
└── env.ts                                              # Ajoute RESEND_API_KEY + RESEND_FROM_EMAIL

prompts/
└── system.md                                           # Section CARENCES + mentions bloodwork/pastBad

package.json                                            # deps : resend, @react-email/components, @phosphor-icons/react, framer-motion, react-email
```

---

# PHASE 1 — Foundation (design system + logo + polices)

**Objectif de la phase** : Poser les tokens de design, les fonts, l'icônes pack, et optimiser le logo. Après cette phase, le site ressemble visuellement à bodystart.vercel.app mais le contenu structurel n'a pas bougé.

**Checkpoint** : Home + wizard + rapport existants tournent sans erreur, font Montserrat visible sur les H1, background cream `#f8f4ee`.

---

### Task 1 : Installer les nouvelles dépendances

**Files:**
- Modify: `package.json`

- [ ] **Step 1 : Installer Framer Motion, Phosphor Icons et Resend en une commande**

```bash
npm install framer-motion@^11 @phosphor-icons/react@^2 resend@^4 react-email@^3 @react-email/components@^0
```

Attendu : l'install ajoute ces packages dans `dependencies` et met `package-lock.json` à jour. Aucun warning bloquant.

- [ ] **Step 2 : Vérifier build TypeScript après install**

```bash
npx tsc --noEmit
```

Attendu : aucune erreur. Si erreur d'incompatibilité majeure, épingler les versions en `~11`, `~2`, `~4`, `~0` (minor pins) et relancer.

- [ ] **Step 3 : Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add framer-motion, phosphor, resend, react-email"
```

---

### Task 2 : Ajouter Montserrat + JetBrains Mono dans layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1 : Remplacer le contenu de `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Inter, Montserrat, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "BodyStart Nutrition — Test & Protocole",
  description: "Test personnalisé BodyStart Nutrition : carences + compléments recommandés.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${montserrat.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-bs-bg text-bs-text antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
```

Note : la structure `<header>` inline est supprimée pour laisser les pages décider de leur propre header (home, wizard, et rapport ont des besoins différents). Un `AppHeader` dédié sera créé en Task 4.

- [ ] **Step 2 : Vérifier démarrage du dev server**

```bash
npm run dev
```

Attendu : `✓ Ready in Xs`, pas d'erreur font import. Ouvrir http://localhost:3000 : le texte utilise Inter par défaut, fond cream (après Task 3).

- [ ] **Step 3 : Commit**

```bash
git add app/layout.tsx
git commit -m "feat(brand): add Montserrat + JetBrains Mono fonts"
```

---

### Task 3 : Poser les tokens BodyStart dans globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1 : Remplacer le contenu de `app/globals.css`**

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* BodyStart brand palette */
  --color-bs-bg: #f8f4ee;
  --color-bs-surface: #ffffff;
  --color-bs-primary: #1a2e23;
  --color-bs-accent: #89a890;
  --color-bs-highlight: #2ab0b0;
  --color-bs-text: #111827;
  --color-bs-muted: #4a5f4c;

  /* Severity palette (carences) */
  --color-sev-high: #c05621;
  --color-sev-mid: #d4a574;
  --color-sev-low: #89a890;

  /* Dark mode — scanner uniquement */
  --color-bs-dark-bg: #0a0e0c;
  --color-bs-dark-surf: #111914;
  --color-bs-scan-line: #89a890;
  --color-bs-scan-data: #2ab0b0;

  /* Fonts */
  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-display: var(--font-montserrat), system-ui, sans-serif;
  --font-mono: var(--font-mono), ui-monospace, monospace;

  /* Shadcn tokens — kept for compatibility */
  --color-background: var(--color-bs-bg);
  --color-foreground: var(--color-bs-text);
  --color-card: var(--color-bs-surface);
  --color-card-foreground: var(--color-bs-text);
  --color-popover: var(--color-bs-surface);
  --color-popover-foreground: var(--color-bs-text);
  --color-primary: var(--color-bs-primary);
  --color-primary-foreground: var(--color-bs-bg);
  --color-secondary: var(--color-bs-accent);
  --color-secondary-foreground: var(--color-bs-primary);
  --color-muted: #eae4d9;
  --color-muted-foreground: var(--color-bs-muted);
  --color-accent: var(--color-bs-accent);
  --color-accent-foreground: var(--color-bs-primary);
  --color-destructive: #c05621;
  --color-border: rgba(26, 46, 35, 0.12);
  --color-input: rgba(26, 46, 35, 0.15);
  --color-ring: var(--color-bs-accent);

  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.25rem;
  --radius-2xl: 1.5rem;
  --radius-3xl: 2rem;
  --radius-4xl: 2.5rem;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    font-family: var(--font-sans);
  }
  h1, h2, h3 {
    font-family: var(--font-display);
    letter-spacing: -0.035em;
  }
}

/* Utility classes */
.font-display {
  font-family: var(--font-display);
  letter-spacing: -0.035em;
}

.text-display-hero {
  font-family: var(--font-display);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.04em;
  line-height: 0.95;
}
```

- [ ] **Step 2 : Vérifier visuellement au dev server**

Ouvrir http://localhost:3000 dans le navigateur.
Attendu : fond cream `#f8f4ee`, texte `#111827`, les H1 utilisent Montserrat (plus géométrique que l'Inter actuel).

Vérifier via DevTools → Inspect → `body` que `background-color: rgb(248, 244, 238)`.

- [ ] **Step 3 : Commit**

```bash
git add app/globals.css
git commit -m "feat(brand): BodyStart design tokens (cream, forest, sage, fonts)"
```

---

### Task 4 : Créer le composant AppHeader

**Files:**
- Create: `components/layout/AppHeader.tsx`
- Modify: `app/layout.tsx` (réintégrer le header)

- [ ] **Step 1 : Créer `components/layout/AppHeader.tsx`**

```tsx
import Link from "next/link";
import Image from "next/image";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-bs-primary/10 bg-bs-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="BodyStart Nutrition"
            width={160}
            height={40}
            priority
            className="h-10 w-auto"
          />
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm font-medium text-bs-muted">
          <Link
            href="/consultation/new"
            className="rounded-full px-4 py-2 transition hover:bg-bs-primary/5 hover:text-bs-primary"
          >
            Nouveau test
          </Link>
          <Link
            href="/history"
            className="rounded-full px-4 py-2 transition hover:bg-bs-primary/5 hover:text-bs-primary"
          >
            Historique
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2 : Ajouter `<AppHeader />` + `<main>` wrapper dans `app/layout.tsx`**

Remplacer le contenu du `<body>` :

```tsx
<body className="min-h-screen bg-bs-bg text-bs-text antialiased">
  <AppHeader />
  <main>{children}</main>
  <Toaster richColors position="top-right" />
</body>
```

Et ajouter l'import en haut :
```tsx
import { AppHeader } from "@/components/layout/AppHeader";
```

- [ ] **Step 3 : Vérifier visuellement**

Ouvrir http://localhost:3000. Attendu : header sticky cream, logo visible à gauche, nav à droite.

- [ ] **Step 4 : Commit**

```bash
git add components/layout/AppHeader.tsx app/layout.tsx
git commit -m "feat(brand): AppHeader with sticky backdrop-blur"
```

---

### Task 5 : Optimiser le logo 4.4 MB → WebP <50 KB

**Files:**
- Modify: `public/logo.png` (ou remplacer par `public/logo.webp`)
- Modify: `components/layout/AppHeader.tsx` (changer src)

- [ ] **Step 1 : Générer une version WebP optimisée**

Via Node inline script (pas de dep externe) :

```bash
cat > /tmp/opt-logo.mjs << 'EOF'
import sharp from "sharp";
await sharp("public/logo.png")
  .resize({ width: 640, withoutEnlargement: true })
  .webp({ quality: 82 })
  .toFile("public/logo.webp");
console.log("done");
EOF
npm install --no-save sharp
node /tmp/opt-logo.mjs
ls -lh public/logo.webp
```

Attendu : `public/logo.webp` généré, taille <50 KB.

- [ ] **Step 2 : Mettre à jour `components/layout/AppHeader.tsx`**

Remplacer `src="/logo.png"` par `src="/logo.webp"`. Le reste de la balise `Image` reste identique.

- [ ] **Step 3 : Supprimer l'ancien PNG**

```bash
git rm public/logo.png
```

- [ ] **Step 4 : Vérifier visuellement**

Recharger http://localhost:3000. Le logo doit s'afficher identique à l'œil nu. DevTools → Network → vérifier que `logo.webp` < 50 KB.

- [ ] **Step 5 : Commit**

```bash
git add public/logo.webp components/layout/AppHeader.tsx
git commit -m "perf(assets): replace 4.4MB logo.png with optimized WebP"
```

---

### Task 6 : Créer `components/ui/brand-button.tsx` (pill button charte)

**Files:**
- Create: `components/ui/brand-button.tsx`

- [ ] **Step 1 : Créer le composant**

```tsx
"use client";
import { forwardRef } from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const brandButton = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-widest transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bs-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bs-bg disabled:opacity-60 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-bs-primary text-bs-bg hover:-translate-y-0.5 hover:shadow-lg",
        secondary: "bg-bs-surface text-bs-primary border border-bs-primary/15 hover:-translate-y-0.5 hover:shadow-md",
        ghost: "text-bs-primary hover:bg-bs-primary/5",
      },
      size: {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-3 text-[13px]",
        lg: "px-10 py-5 text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type BrandButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof brandButton> & {
    href?: string;
  };

export const BrandButton = forwardRef<HTMLButtonElement, BrandButtonProps>(
  function BrandButton({ className, variant, size, href, children, ...rest }, ref) {
    if (href) {
      return (
        <Link href={href} className={cn(brandButton({ variant, size }), className)}>
          {children}
        </Link>
      );
    }
    return (
      <button ref={ref} className={cn(brandButton({ variant, size }), className)} {...rest}>
        {children}
      </button>
    );
  },
);
```

- [ ] **Step 2 : Vérifier build TS**

```bash
npx tsc --noEmit
```

Attendu : pas d'erreur.

- [ ] **Step 3 : Commit**

```bash
git add components/ui/brand-button.tsx
git commit -m "feat(ui): BrandButton pill component matching brand"
```

---

# PHASE 2 — Data model + Claude tool + prompt

**Objectif** : Étendre le schéma pour supporter `deficiencies` et `emailSentAt`. Mettre à jour le tool Claude et le prompt pour émettre les carences.

**Checkpoint** : Après cette phase, lancer un test wizard → la réponse API inclut `protocol.deficiencies` avec 3-6 entrées bien formées (vérif via Network tab DevTools).

---

### Task 7 : Ajouter `DeficiencySchema` + `Protocol.deficiencies` (Zod)

**Files:**
- Modify: `lib/schemas/protocol.ts`
- Create: `lib/schemas/__tests__/protocol.test.ts` (si absent)

- [ ] **Step 1 : Écrire le test qui vérifie qu'un protocole sans deficiencies est rejeté**

Créer `lib/schemas/__tests__/protocol.test.ts` :

```ts
import { describe, it, expect } from "vitest";
import { protocolSchema } from "../protocol";

const basePayload = {
  summary: "Protocole test",
  deficiencies: [
    {
      nutrient: "Magnésium",
      severity: "high" as const,
      whyAtRisk: "Stress élevé",
      addressedBy: ["magnesium-bisglycinate"],
    },
  ],
  supplements: [
    {
      id: "magnesium-bisglycinate",
      emoji: "💊",
      name: "Magnésium bisglycinate",
      form: "Bisglycinate",
      formRationale: "Meilleure biodisponibilité",
      doseValue: 400,
      doseUnit: "mg" as const,
      timing: "bedtime" as const,
      timingRationale: "Soir pour sommeil",
      duration: "3 mois",
      justification: "Stress chronique",
      interactions: [],
      successIndicators: ["Meilleur sommeil"],
      tier: 1 as const,
      category: "foundation" as const,
    },
  ],
  dailySchedule: { morning: [], midday: [], preWorkout: [], postWorkout: [], evening: [], bedtime: ["magnesium-bisglycinate"] },
  warnings: [],
  monitoring: { reviewAfterWeeks: 8, indicators: [], bloodTests: [] },
};

describe("protocolSchema", () => {
  it("accepts valid payload with deficiencies", () => {
    const result = protocolSchema.safeParse(basePayload);
    expect(result.success).toBe(true);
  });

  it("rejects payload without deficiencies field", () => {
    const { deficiencies, ...rest } = basePayload;
    const result = protocolSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects deficiency with invalid severity", () => {
    const bad = { ...basePayload, deficiencies: [{ ...basePayload.deficiencies[0], severity: "critical" }] };
    const result = protocolSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2 : Lancer les tests — attendu FAIL (schéma pas encore étendu)**

```bash
npm test -- lib/schemas/__tests__/protocol.test.ts
```

Attendu : les 3 tests échouent (le premier car `deficiencies` est inconnu du schéma, les autres car aucune validation).

- [ ] **Step 3 : Étendre `lib/schemas/protocol.ts`**

Ajouter, juste après `categoryEnum` :

```ts
export const severityEnum = z.enum(["low", "moderate", "high"]);
export type Severity = z.infer<typeof severityEnum>;

export const deficiencySchema = z.object({
  nutrient: z.string().min(1),
  severity: severityEnum,
  whyAtRisk: z.string().min(1),
  addressedBy: z.array(z.string()),
});
export type Deficiency = z.infer<typeof deficiencySchema>;
```

Puis modifier `protocolSchema` pour ajouter `deficiencies` :

```ts
export const protocolSchema = z.object({
  summary: z.string().min(1),
  deficiencies: z.array(deficiencySchema),
  supplements: z.array(supplementSchema).min(1),
  dailySchedule: z.object({
    morning: z.array(z.string()),
    midday: z.array(z.string()),
    preWorkout: z.array(z.string()),
    postWorkout: z.array(z.string()),
    evening: z.array(z.string()),
    bedtime: z.array(z.string()),
  }),
  warnings: z.array(z.string()),
  monitoring: z.object({
    reviewAfterWeeks: z.number().int().positive(),
    indicators: z.array(z.string()),
    bloodTests: z.array(z.string()),
  }),
});
```

- [ ] **Step 4 : Relancer les tests — attendu PASS**

```bash
npm test -- lib/schemas/__tests__/protocol.test.ts
```

Attendu : les 3 tests passent.

- [ ] **Step 5 : Commit**

```bash
git add lib/schemas/protocol.ts lib/schemas/__tests__/protocol.test.ts
git commit -m "feat(schema): add Deficiency and Protocol.deficiencies field"
```

---

### Task 8 : Étendre le Claude tool schema

**Files:**
- Modify: `lib/claude/protocolTool.ts`

- [ ] **Step 1 : Ajouter `deficiencies` au tool**

Modifier `lib/claude/protocolTool.ts` :

```ts
import "server-only";
import type Anthropic from "@anthropic-ai/sdk";

export const PROTOCOL_TOOL_NAME = "emit_protocol";

export const protocolTool: Anthropic.Tool = {
  name: PROTOCOL_TOOL_NAME,
  description: "Émet le protocole de compléments structuré pour le client. Tu DOIS appeler cet outil avec les recommandations finales.",
  input_schema: {
    type: "object",
    required: ["summary", "deficiencies", "supplements", "dailySchedule", "warnings", "monitoring"],
    properties: {
      summary: { type: "string", description: "Introduction narrative 2-3 phrases, markdown autorisé." },
      deficiencies: {
        type: "array",
        minItems: 1,
        description: "Carences alimentaires ou micronutritionnelles identifiées à partir du profil. Chaque carence doit être couverte par au moins un supplément du tableau 'supplements'.",
        items: {
          type: "object",
          required: ["nutrient", "severity", "whyAtRisk", "addressedBy"],
          properties: {
            nutrient: { type: "string", description: "Nom clair et court, ex: 'Magnésium', 'Vitamine D3', 'Oméga-3 EPA/DHA'" },
            severity: { type: "string", enum: ["low", "moderate", "high"], description: "high = déficit probable confirmé par plusieurs signaux, moderate = plausible, low = sous-optimal non critique" },
            whyAtRisk: { type: "string", description: "Une phrase factuelle courte (< 20 mots)" },
            addressedBy: { type: "array", items: { type: "string" }, description: "IDs des suppléments du protocole qui couvrent cette carence" },
          },
        },
      },
      supplements: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["id", "emoji", "name", "form", "formRationale", "doseValue", "doseUnit", "timing", "timingRationale", "duration", "justification", "interactions", "successIndicators", "tier", "category"],
          properties: {
            id: { type: "string", description: "slug unique kebab-case, ex: magnesium-bisglycinate" },
            emoji: { type: "string" },
            name: { type: "string" },
            form: { type: "string" },
            formRationale: { type: "string" },
            doseValue: { type: "number", minimum: 0 },
            doseUnit: { type: "string", enum: ["mg", "g", "UI", "µg"] },
            timing: { type: "string", enum: ["morning_fasted", "morning_meal", "midday", "pre_workout", "post_workout", "evening", "bedtime"] },
            timingRationale: { type: "string" },
            duration: { type: "string" },
            justification: { type: "string" },
            interactions: { type: "array", items: { type: "string" } },
            successIndicators: { type: "array", items: { type: "string" } },
            tier: { type: "integer", enum: [1, 2, 3] },
            category: { type: "string", enum: ["foundation", "performance", "recovery", "beauty", "hormonal", "digestive"] },
          },
        },
      },
      dailySchedule: {
        type: "object",
        required: ["morning", "midday", "preWorkout", "postWorkout", "evening", "bedtime"],
        properties: {
          morning: { type: "array", items: { type: "string" } },
          midday: { type: "array", items: { type: "string" } },
          preWorkout: { type: "array", items: { type: "string" } },
          postWorkout: { type: "array", items: { type: "string" } },
          evening: { type: "array", items: { type: "string" } },
          bedtime: { type: "array", items: { type: "string" } },
        },
      },
      warnings: { type: "array", items: { type: "string" } },
      monitoring: {
        type: "object",
        required: ["reviewAfterWeeks", "indicators", "bloodTests"],
        properties: {
          reviewAfterWeeks: { type: "integer", minimum: 1 },
          indicators: { type: "array", items: { type: "string" } },
          bloodTests: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};
```

- [ ] **Step 2 : Vérifier que build TS passe**

```bash
npx tsc --noEmit
```

- [ ] **Step 3 : Commit**

```bash
git add lib/claude/protocolTool.ts
git commit -m "feat(claude): add deficiencies to emit_protocol tool schema"
```

---

### Task 9 : Mettre à jour le prompt système (carences + mentions bloodwork/pastBad)

**Files:**
- Modify: `prompts/system.md`

- [ ] **Step 1 : Ajouter la section CARENCES au prompt**

Ouvrir `prompts/system.md`. Repérer la section PHASE 2 — GÉNÉRATION DU PROTOCOLE (ligne ~147).

Ajouter **avant** la règle "6. Termine par un TABLEAU RÉCAPITULATIF", cette nouvelle règle numérotée 6 (décaler l'ancienne en 7) :

```markdown
6. IDENTIFICATION DES CARENCES (obligatoire) :

Identifie 3 à 6 carences probables (alimentaires ou micronutritionnelles) à partir du profil. Pour chacune, émets dans le tool `emit_protocol` un objet avec :
- `nutrient` : nom court et clair (ex : "Magnésium", "Vitamine D3", "Oméga-3 EPA/DHA", "Zinc")
- `severity` :
  - `high` = déficit probable confirmé par plusieurs signaux (symptômes + alimentation + mode de vie + bloodwork si présent)
  - `moderate` = déficit plausible (un ou deux signaux)
  - `low` = sous-optimal non critique
- `whyAtRisk` : 1 phrase factuelle courte (< 20 mots, ex : "Stress élevé combiné à peu de légumes feuillus")
- `addressedBy` : IDs des suppléments du protocole qui couvrent cette carence (au minimum 1)

Règle stricte : chaque carence identifiée DOIT être couverte par au moins un supplément du protocole. Si une carence identifiée n'a pas de supplément associé, ajoute-le au protocole (minimum tier 2).
```

- [ ] **Step 2 : Ajouter instruction explicite pour bloodwork et pastBadExperiences**

Ajouter **après** l'ancienne règle 4 (budget contraint) et **avant** la nouvelle règle 6 (carences), cette règle 5 :

```markdown
5. PRISE EN COMPTE DES DONNÉES CONTEXTUELLES :

Si le champ `health.bloodwork` du profil est non-vide, lis son contenu pour :
- Ajuster les doses si des valeurs biologiques sont données (ex : ferritine basse → augmenter fer)
- Ne pas recommander un supplément si sa valeur sanguine est déjà optimale (ex : vitamine D 25-OH > 50 ng/mL → ne pas supplémenter D3 en tier 1)

Si `supplements.pastBadExperiences` est non-vide, évite les formes ou molécules qui y sont mentionnées. Propose une alternative si le besoin persiste.
```

- [ ] **Step 3 : Ajouter en fin de SYSTEM PROMPT (ligne ~20) une mention explicite du tool**

Remplacer la dernière phrase du SYSTEM PROMPT (`"Tu es direct, précis, sans blabla. Chaque recommandation est chiffrée et justifiée."`) par :

```
Tu es direct, précis, sans blabla. Chaque recommandation est chiffrée et justifiée.

En PHASE 2, tu DOIS appeler le tool `emit_protocol` avec la structure complète (summary, deficiencies, supplements, dailySchedule, warnings, monitoring). N'écris pas de texte libre avant ou après : seul l'appel du tool est attendu.
```

- [ ] **Step 4 : Commit**

```bash
git add prompts/system.md
git commit -m "docs(prompt): add deficiencies instructions + bloodwork/pastBad handling"
```

---

### Task 10 : Ajouter `emailSentAt` au schema Drizzle

**Files:**
- Modify: `lib/db/schema.ts`
- Create: `drizzle/NNNN_add_email_sent_at.sql` (généré)

- [ ] **Step 1 : Ajouter la colonne**

Modifier `lib/db/schema.ts` pour ajouter à `consultations` :

```ts
export const consultations = sqliteTable("consultations", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  profileJson: text("profile_json").notNull(),
  protocolJson: text("protocol_json").notNull(),
  dietaryAnalysisJson: text("dietary_analysis_json"),
  emailSentAt: integer("email_sent_at", { mode: "timestamp" }),  // ← NEW
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});
```

- [ ] **Step 2 : Générer la migration**

```bash
npx drizzle-kit generate
```

Attendu : un nouveau fichier `drizzle/NNNN_xxxx.sql` (ex : `0001_ambitious_groot.sql`) est créé.

Ouvrir le fichier pour vérifier qu'il contient bien `ALTER TABLE consultations ADD COLUMN email_sent_at INTEGER;` (ou équivalent SQL). Si Drizzle-kit génère une colonne `NOT NULL` par erreur, ajuster manuellement pour qu'elle soit nullable.

- [ ] **Step 3 : Appliquer la migration en redémarrant le dev server**

```bash
# Arrêter le server Next.js et relancer
npm run dev
```

Le DB SQLite `bodystart.db` applique la migration au démarrage via la logique de `lib/db/client.ts`. Si pas de logique d'application automatique dans le projet, appliquer manuellement :

```bash
npx drizzle-kit push
```

Vérifier avec `sqlite3 bodystart.db ".schema consultations"` : la colonne `email_sent_at` doit apparaître.

- [ ] **Step 4 : Commit**

```bash
git add lib/db/schema.ts drizzle/
git commit -m "feat(db): add emailSentAt timestamp to consultations"
```

---

### Task 11 : Exposer `emailSentAt` + ajouter `markEmailSent()` dans queries

**Files:**
- Modify: `lib/db/queries.ts`
- Modify: `lib/db/__tests__/queries.test.ts`

- [ ] **Step 1 : Ajouter test `markEmailSent updates timestamp`**

Ouvrir `lib/db/__tests__/queries.test.ts` (en suivant le style existant). Ajouter :

```ts
import { describe, it, expect, beforeEach } from "vitest";
process.env.DATABASE_URL = ":memory:";
// ...existing imports from the test file stay as-is above...

import { upsertClientAndConsultation, getConsultation, markEmailSent } from "../queries";

// (reuse existing valid profile + protocol factories in this file)

describe("markEmailSent", () => {
  it("sets emailSentAt on the consultation", () => {
    const { consultationId } = upsertClientAndConsultation(validProfile(), validProtocol());
    const before = getConsultation(consultationId);
    expect(before?.emailSentAt).toBeNull();

    markEmailSent(consultationId);

    const after = getConsultation(consultationId);
    expect(after?.emailSentAt).toBeInstanceOf(Date);
  });
});
```

Note : si `validProfile()` et `validProtocol()` n'existent pas encore dans le test file, les ajouter en haut en suivant la structure du schema (profile avec client/basics/goals/lifestyle/nutrition/health/supplements ; protocol avec summary/deficiencies/supplements/dailySchedule/warnings/monitoring — voir Task 7 pour un exemple de payload valide).

- [ ] **Step 2 : Lancer le test — attendu FAIL (markEmailSent n'existe pas)**

```bash
npm test -- lib/db/__tests__/queries.test.ts
```

Attendu : erreur d'import ou TypeError.

- [ ] **Step 3 : Ajouter `markEmailSent` + exposer `emailSentAt` dans `getConsultation`**

Dans `lib/db/queries.ts`, modifier `getConsultation` (ligne ~39) :

```ts
export function getConsultation(id: string) {
  const row = db.select().from(consultations).where(eq(consultations.id, id)).get();
  if (!row) return null;
  const clientRow = db.select().from(clients).where(eq(clients.id, row.clientId)).get();
  return {
    id: row.id,
    client: clientRow,
    profile: JSON.parse(row.profileJson) as ClientProfile,
    protocol: JSON.parse(row.protocolJson) as Protocol,
    dietaryAnalysis: row.dietaryAnalysisJson ? JSON.parse(row.dietaryAnalysisJson) : null,
    emailSentAt: row.emailSentAt,  // ← NEW
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
```

Ajouter en bas du fichier :

```ts
export function markEmailSent(consultationId: string) {
  db.update(consultations)
    .set({ emailSentAt: new Date() })
    .where(eq(consultations.id, consultationId))
    .run();
}
```

- [ ] **Step 4 : Relancer le test — attendu PASS**

```bash
npm test -- lib/db/__tests__/queries.test.ts
```

- [ ] **Step 5 : Commit**

```bash
git add lib/db/queries.ts lib/db/__tests__/queries.test.ts
git commit -m "feat(db): markEmailSent() + expose emailSentAt in getConsultation"
```

---

### Task 12 : Ajouter RESEND_API_KEY + RESEND_FROM_EMAIL à env.ts

**Files:**
- Modify: `lib/env.ts`

- [ ] **Step 1 : Étendre `lib/env.ts`**

```ts
import "server-only";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  anthropicApiKey: required("ANTHROPIC_API_KEY"),
  shopAddress: process.env.BODYSTART_SHOP_ADDRESS ?? "8 Rue du Pont des Landes, 78310 Coignières",
  shopPhone: process.env.BODYSTART_SHOP_PHONE ?? "07 61 84 75 80",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
  appOrigin: process.env.APP_ORIGIN ?? "http://localhost:3000",
};
```

Note : `resendApiKey` et `resendFromEmail` sont volontairement **non-required** pour ne pas casser le build si un dev n'a pas encore setup Resend. La validation bloquante est faite au moment de l'envoi dans `lib/email/send.ts` (voir Phase 6).

- [ ] **Step 2 : Commit**

```bash
git add lib/env.ts
git commit -m "feat(env): add Resend + shop defaults from Coignières"
```

---

# PHASE 3 — Scanner component (pièce maîtresse)

**Objectif** : Construire le composant scanner isolé, testable, qui s'affiche plein écran pendant la génération. Silhouette anatomique + organes + scan line + particules + texte status + fallback reduced-motion.

**Checkpoint** : Le scanner s'affiche correctement quand on lance un test. Pas encore forcément connecté au submit wizard — sera fait en Task 17.

---

### Task 13 : Créer le squelette SVG `AnatomicalSilhouette` (statique)

**Files:**
- Create: `components/scanner/AnatomicalSilhouette.tsx`

- [ ] **Step 1 : Créer le composant avec SVG corps + organes statiques**

```tsx
"use client";

export type OrganId = "brain" | "thyroid" | "heart" | "liver" | "gut" | "shoulders" | "knees";

type SilhouetteProps = {
  /** Y coordinate (0-100) où la ligne de scan se trouve ; si undefined, pas de scan */
  scanY?: number;
  /** Organes qui ont déjà été "scannés" — pulsent et laissent des particules */
  scannedOrgans?: OrganId[];
};

// Coordonnées anatomiques approximatives (dans un viewBox 200x400)
export const ORGANS: Record<OrganId, { cx: number; cy: number; r: number; label: string }> = {
  brain:     { cx: 100, cy: 30,  r: 18, label: "Cerveau" },
  thyroid:   { cx: 100, cy: 75,  r: 6,  label: "Thyroïde" },
  heart:     { cx: 92,  cy: 120, r: 10, label: "Cœur" },
  liver:     { cx: 115, cy: 150, r: 14, label: "Foie" },
  gut:       { cx: 100, cy: 195, r: 16, label: "Intestin" },
  shoulders: { cx: 100, cy: 90,  r: 4,  label: "Épaules" },
  knees:     { cx: 100, cy: 310, r: 6,  label: "Genoux" },
};

export function AnatomicalSilhouette({ scanY, scannedOrgans = [] }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 200 400"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden
    >
      {/* Contour corps stylisé — tête + torse + bras + jambes */}
      <g stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.85">
        {/* Tête */}
        <ellipse cx="100" cy="30" rx="22" ry="26" />
        {/* Cou */}
        <path d="M 88 55 L 88 68 Q 100 72 112 68 L 112 55" />
        {/* Torse */}
        <path d="M 65 70 Q 70 95 65 175 Q 80 185 100 185 Q 120 185 135 175 Q 130 95 135 70 Q 118 65 100 65 Q 82 65 65 70 Z" />
        {/* Bras gauche */}
        <path d="M 65 75 Q 45 110 42 160 Q 40 180 45 200" />
        {/* Bras droit */}
        <path d="M 135 75 Q 155 110 158 160 Q 160 180 155 200" />
        {/* Jambes */}
        <path d="M 80 185 Q 75 240 80 310 Q 82 350 85 390" />
        <path d="M 120 185 Q 125 240 120 310 Q 118 350 115 390" />
      </g>

      {/* Organes (glyphes translucides) */}
      <g>
        {Object.entries(ORGANS).map(([id, { cx, cy, r }]) => {
          const scanned = scannedOrgans.includes(id as OrganId);
          return (
            <circle
              key={id}
              cx={cx}
              cy={cy}
              r={r}
              fill="currentColor"
              opacity={scanned ? 0.55 : 0.15}
              className="transition-opacity duration-300"
            />
          );
        })}
      </g>

      {/* Ligne de scan */}
      {scanY !== undefined && (
        <g>
          <line
            x1={30}
            x2={170}
            y1={(scanY / 100) * 400}
            y2={(scanY / 100) * 400}
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.9"
            style={{ filter: "drop-shadow(0 0 8px currentColor)" }}
          />
          <rect
            x={30}
            y={(scanY / 100) * 400 - 1}
            width={140}
            height={2}
            fill="url(#scan-gradient)"
          />
          <defs>
            <linearGradient id="scan-gradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
        </g>
      )}
    </svg>
  );
}
```

- [ ] **Step 2 : Vérifier build TS**

```bash
npx tsc --noEmit
```

- [ ] **Step 3 : Commit**

```bash
git add components/scanner/AnatomicalSilhouette.tsx
git commit -m "feat(scanner): AnatomicalSilhouette SVG with organs + scan line"
```

---

### Task 14 : Animer la silhouette avec Framer Motion

**Files:**
- Modify: `components/scanner/AnatomicalSilhouette.tsx`
- Create: `components/scanner/ScanParticles.tsx`

- [ ] **Step 1 : Créer `ScanParticles.tsx`**

```tsx
"use client";
import { AnimatePresence, motion } from "framer-motion";

export type Particle = { id: string; x: number; y: number };

export function ScanParticles({ particles }: { particles: Particle[] }) {
  return (
    <AnimatePresence>
      {particles.map((p) => (
        <motion.circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={1.5}
          fill="currentColor"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.85, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
        />
      ))}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2 : Intégrer les particules à `AnatomicalSilhouette`**

Modifier `AnatomicalSilhouette` pour accepter `particles` :

```tsx
import { ScanParticles, type Particle } from "./ScanParticles";

// ... extend props
type SilhouetteProps = {
  scanY?: number;
  scannedOrgans?: OrganId[];
  particles?: Particle[];
};

export function AnatomicalSilhouette({ scanY, scannedOrgans = [], particles = [] }: SilhouetteProps) {
  return (
    <svg /* ... existing ... */>
      {/* ... existing body + organs + scan line ... */}
      <ScanParticles particles={particles} />
    </svg>
  );
}
```

- [ ] **Step 3 : Vérifier build TS**

```bash
npx tsc --noEmit
```

- [ ] **Step 4 : Commit**

```bash
git add components/scanner/AnatomicalSilhouette.tsx components/scanner/ScanParticles.tsx
git commit -m "feat(scanner): particles component + integration"
```

---

### Task 15 : Créer le `ScannerOverlay` complet (orchestration animation)

**Files:**
- Create: `components/scanner/ScannerOverlay.tsx`

- [ ] **Step 1 : Créer `ScannerOverlay.tsx`**

```tsx
"use client";
import { useEffect, useMemo, useReducer, useRef } from "react";
import { motion } from "framer-motion";
import { AnatomicalSilhouette, ORGANS, type OrganId } from "./AnatomicalSilhouette";
import type { Particle } from "./ScanParticles";

const STATUS_MESSAGES = [
  "Analyse du profil…",
  "Identification des carences…",
  "Calibration du protocole…",
  "Finalisation…",
];

const SCAN_PERIOD_MS = 2200;
const ORGAN_ORDER: OrganId[] = ["brain", "shoulders", "thyroid", "heart", "liver", "gut", "knees"];

type State = {
  scanYPct: number;
  scannedOrgans: OrganId[];
  particles: Particle[];
  statusIndex: number;
  reducedMotion: boolean;
};

type Action =
  | { type: "tick"; scanYPct: number }
  | { type: "organ"; id: OrganId; particles: Particle[] }
  | { type: "status"; index: number }
  | { type: "reducedMotion"; value: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "tick":
      return { ...state, scanYPct: action.scanYPct };
    case "organ":
      return {
        ...state,
        scannedOrgans: state.scannedOrgans.includes(action.id)
          ? state.scannedOrgans
          : [...state.scannedOrgans, action.id],
        particles: [...state.particles, ...action.particles].slice(-40),
      };
    case "status":
      return { ...state, statusIndex: action.index };
    case "reducedMotion":
      return { ...state, reducedMotion: action.value };
  }
}

export function ScannerOverlay({ open }: { open: boolean }) {
  const [state, dispatch] = useReducer(reducer, {
    scanYPct: 0,
    scannedOrgans: [],
    particles: [],
    statusIndex: 0,
    reducedMotion: false,
  });

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const lastOrganTriggeredY = useRef<number>(-1);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => dispatch({ type: "reducedMotion", value: mq.matches });
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Status text cycle
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      dispatch({ type: "status", index: Math.min(state.statusIndex + 1, STATUS_MESSAGES.length - 1) });
    }, 2000);
    return () => clearInterval(id);
  }, [open, state.statusIndex]);

  // Main scan animation (RAF)
  useEffect(() => {
    if (!open || state.reducedMotion) return;
    startRef.current = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startRef.current) % SCAN_PERIOD_MS;
      const progress = elapsed / SCAN_PERIOD_MS; // 0 → 1
      const y = progress * 100;

      // Trigger organ pulse when scan line crosses an organ
      for (const id of ORGAN_ORDER) {
        const organ = ORGANS[id];
        const organYPct = (organ.cy / 400) * 100;
        if (y > organYPct && lastOrganTriggeredY.current < organYPct) {
          lastOrganTriggeredY.current = organYPct;
          const particles: Particle[] = Array.from({ length: 4 }).map((_, i) => ({
            id: `${id}-${Date.now()}-${i}`,
            x: organ.cx + (Math.random() * 20 - 10),
            y: organ.cy + (Math.random() * 20 - 10),
          }));
          dispatch({ type: "organ", id, particles });
        }
      }
      if (y < lastOrganTriggeredY.current) lastOrganTriggeredY.current = -1;

      dispatch({ type: "tick", scanYPct: y });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [open, state.reducedMotion]);

  if (!open) return null;

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bs-dark-bg"
    >
      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "3px 3px",
        }}
      />

      <div className="relative h-[70vh] w-[40vh] max-w-[320px] text-bs-scan-line">
        {state.reducedMotion ? (
          <AnatomicalSilhouette />
        ) : (
          <AnatomicalSilhouette
            scanY={state.scanYPct}
            scannedOrgans={state.scannedOrgans}
            particles={state.particles}
          />
        )}
      </div>

      <p className="mt-8 text-lg font-semibold uppercase tracking-[0.3em] text-bs-scan-line">
        {STATUS_MESSAGES[state.statusIndex]}
      </p>

      {state.reducedMotion && (
        <p className="mt-3 max-w-xs text-center text-sm text-bs-scan-line/70">
          Analyse en cours. Merci de patienter.
        </p>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2 : Vérifier build TS**

```bash
npx tsc --noEmit
```

- [ ] **Step 3 : Test visuel rapide** — créer une page de debug

Créer temporairement `app/debug-scanner/page.tsx` :

```tsx
"use client";
import { useState } from "react";
import { ScannerOverlay } from "@/components/scanner/ScannerOverlay";
import { BrandButton } from "@/components/ui/brand-button";

export default function Page() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-8">
      <BrandButton onClick={() => setOpen(true)}>Test scanner</BrandButton>
      <BrandButton variant="secondary" onClick={() => setOpen(false)}>Close</BrandButton>
      <ScannerOverlay open={open} />
    </div>
  );
}
```

Ouvrir http://localhost:3000/debug-scanner, cliquer "Test scanner". Attendu :
- Overlay plein écran fond `#0a0e0c`
- Silhouette sage centrée
- Ligne de scan qui bouge verticalement en boucle (2.2s cycle)
- Organes qui deviennent plus visibles au passage
- Particules teal qui apparaissent autour des organes
- Texte status qui change toutes les 2s
- Pas de layout thrashing, 60fps stable

- [ ] **Step 4 : Supprimer la page de debug**

```bash
rm -rf app/debug-scanner
```

- [ ] **Step 5 : Commit**

```bash
git add components/scanner/ScannerOverlay.tsx
git commit -m "feat(scanner): ScannerOverlay with organ pulse + particles + status text"
```

---

### Task 16 : Tests unitaires `ScannerOverlay`

**Files:**
- Create: `components/scanner/__tests__/ScannerOverlay.test.tsx`
- Modify: `vitest.config.mts` (ajout setup JSDOM si absent)

- [ ] **Step 1 : Vérifier la config vitest supporte JSDOM**

Lire `vitest.config.mts`. Si `environment: "jsdom"` absent, l'ajouter :

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

Installer JSDOM si absent :
```bash
npm install -D jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2 : Écrire le test**

Créer `components/scanner/__tests__/ScannerOverlay.test.tsx` :

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScannerOverlay } from "../ScannerOverlay";

describe("ScannerOverlay", () => {
  it("does not render anything when open=false", () => {
    const { container } = render(<ScannerOverlay open={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows status text when open=true", () => {
    render(<ScannerOverlay open={true} />);
    expect(screen.getByText(/analyse du profil/i)).toBeInTheDocument();
  });

  it("has aria-live polite for screen readers", () => {
    render(<ScannerOverlay open={true} />);
    const live = document.querySelector('[aria-live="polite"]');
    expect(live).not.toBeNull();
  });
});
```

- [ ] **Step 3 : Lancer les tests — attendu PASS**

```bash
npm test -- components/scanner/__tests__/ScannerOverlay.test.tsx
```

- [ ] **Step 4 : Commit**

```bash
git add components/scanner/__tests__ vitest.config.mts package.json package-lock.json
git commit -m "test(scanner): ScannerOverlay render + a11y tests"
```

---

### Task 17 : Brancher le scanner au submit wizard

**Files:**
- Modify: `components/wizard/WizardShell.tsx`

- [ ] **Step 1 : Ajouter ScannerOverlay au WizardShell**

Modifier `components/wizard/WizardShell.tsx`. Import en tête :

```tsx
import { ScannerOverlay } from "@/components/scanner/ScannerOverlay";
```

Ajouter juste avant `</FormProvider>` (dernière ligne du JSX) :

```tsx
      <ScannerOverlay open={submitting} />
    </FormProvider>
  );
```

Remplacer aussi le label "Génération..." par "Lancer l'analyse" (plus cohérent avec le scanner) — sur la ligne qui contient `{submitting ? "Génération..." : "Générer le protocole"}` :

```tsx
{submitting ? "Lancer l'analyse…" : "Générer le protocole"}
```

- [ ] **Step 2 : Vérifier visuellement**

Lancer http://localhost:3000/consultation/new, remplir les 8 étapes avec des données bidon, cliquer "Générer le protocole". Attendu : le scanner apparaît plein écran pendant ~8s, puis redirect vers `/consultation/[id]`.

- [ ] **Step 3 : Commit**

```bash
git add components/wizard/WizardShell.tsx
git commit -m "feat(wizard): trigger ScannerOverlay on submit"
```

---

# PHASE 4 — Rapport redesigné

**Objectif** : Refondre `ProtocolView` avec hero + carences viz + tier list rebrandée + timeline refresh + recap + action bar sticky.

**Checkpoint** : `/consultation/[id]` affiche le nouveau design. Les 3 tiers sont visibles (Essentiels/Prioritaires/Optimisations), le bar chart carences s'affiche, l'action bar sticky en bas avec 3 boutons.

---

### Task 18 : Créer `lib/tier/labels.ts` (mapping 1/2/3 → Essentiels/Prioritaires/Optimisations)

**Files:**
- Create: `lib/tier/labels.ts`
- Create: `lib/tier/__tests__/labels.test.ts`

- [ ] **Step 1 : Écrire le test**

```ts
import { describe, it, expect } from "vitest";
import { tierLabel, tierShort, tierColor } from "../labels";

describe("tier labels", () => {
  it("maps 1 → ESSENTIELS / S / forest", () => {
    expect(tierLabel(1)).toBe("Essentiels");
    expect(tierShort(1)).toBe("S");
    expect(tierColor(1).band).toContain("bs-primary");
  });
  it("maps 2 → PRIORITAIRES / A / sage", () => {
    expect(tierLabel(2)).toBe("Prioritaires");
    expect(tierShort(2)).toBe("A");
    expect(tierColor(2).band).toContain("bs-accent");
  });
  it("maps 3 → OPTIMISATIONS / B / cream-dark", () => {
    expect(tierLabel(3)).toBe("Optimisations");
    expect(tierShort(3)).toBe("B");
  });
});
```

- [ ] **Step 2 : Lancer — attendu FAIL**

```bash
npm test -- lib/tier/__tests__/labels.test.ts
```

- [ ] **Step 3 : Implémenter**

Créer `lib/tier/labels.ts` :

```ts
export type TierNum = 1 | 2 | 3;

export function tierLabel(t: TierNum): string {
  return { 1: "Essentiels", 2: "Prioritaires", 3: "Optimisations" }[t];
}

export function tierShort(t: TierNum): string {
  return { 1: "S", 2: "A", 3: "B" }[t];
}

export function tierColor(t: TierNum): { band: string; card: string; badge: string } {
  return {
    1: {
      band: "bg-bs-primary text-bs-bg",
      card: "border-bs-primary/25 shadow-[0_4px_20px_rgba(26,46,35,0.08)]",
      badge: "bg-bs-primary text-bs-bg",
    },
    2: {
      band: "bg-bs-accent text-bs-primary",
      card: "border-bs-accent/40",
      badge: "bg-bs-accent text-bs-primary",
    },
    3: {
      band: "bg-bs-muted/15 text-bs-primary",
      card: "border-bs-primary/10",
      badge: "bg-bs-muted/20 text-bs-muted",
    },
  }[t];
}
```

- [ ] **Step 4 : Relancer — attendu PASS**

```bash
npm test -- lib/tier/__tests__/labels.test.ts
```

- [ ] **Step 5 : Commit**

```bash
git add lib/tier/
git commit -m "feat(tier): labels + colors for Essentiels/Prioritaires/Optimisations"
```

---

### Task 19 : Créer `DeficienciesViz` (bar chart horizontal)

**Files:**
- Create: `components/protocol/DeficienciesViz.tsx`
- Create: `components/protocol/__tests__/DeficienciesViz.test.tsx`

- [ ] **Step 1 : Écrire le test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeficienciesViz } from "../DeficienciesViz";
import type { Deficiency } from "@/lib/schemas/protocol";

const sample: Deficiency[] = [
  { nutrient: "Magnésium", severity: "high", whyAtRisk: "Stress + peu de feuillus", addressedBy: ["mg"] },
  { nutrient: "Zinc", severity: "low", whyAtRisk: "Régime végétal", addressedBy: ["zn"] },
];

describe("DeficienciesViz", () => {
  it("renders each nutrient name", () => {
    render(<DeficienciesViz deficiencies={sample} />);
    expect(screen.getByText(/magnésium/i)).toBeInTheDocument();
    expect(screen.getByText(/zinc/i)).toBeInTheDocument();
  });

  it("renders empty-state when no deficiencies", () => {
    render(<DeficienciesViz deficiencies={[]} />);
    expect(screen.getByText(/aucune carence/i)).toBeInTheDocument();
  });

  it("renders severity labels", () => {
    render(<DeficienciesViz deficiencies={sample} />);
    expect(screen.getByText(/déficit élevé/i)).toBeInTheDocument();
    expect(screen.getByText(/léger/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2 : Lancer — attendu FAIL**

```bash
npm test -- components/protocol/__tests__/DeficienciesViz.test.tsx
```

- [ ] **Step 3 : Implémenter**

Créer `components/protocol/DeficienciesViz.tsx` :

```tsx
import type { Deficiency, Severity } from "@/lib/schemas/protocol";

const SEVERITY_CONFIG: Record<Severity, { label: string; widthPct: number; colorClass: string }> = {
  high: { label: "Déficit élevé", widthPct: 100, colorClass: "bg-sev-high" },
  moderate: { label: "Déficit moyen", widthPct: 66, colorClass: "bg-sev-mid" },
  low: { label: "Léger", widthPct: 33, colorClass: "bg-sev-low" },
};

export function DeficienciesViz({ deficiencies }: { deficiencies: Deficiency[] }) {
  if (deficiencies.length === 0) {
    return (
      <section className="rounded-3xl border border-bs-primary/10 bg-bs-surface p-10 text-center">
        <p className="text-bs-muted">Aucune carence identifiée pour ce profil.</p>
      </section>
    );
  }
  return (
    <section className="rounded-3xl border border-bs-primary/10 bg-bs-surface p-8 md:p-10">
      <h2 className="mb-1 font-display text-3xl font-black uppercase tracking-tight text-bs-primary">
        Ce qui te manque
      </h2>
      <p className="mb-8 text-sm text-bs-muted">
        Carences identifiées à partir de ton profil. Chacune est couverte par au moins un complément du protocole.
      </p>
      <ul className="divide-y divide-bs-primary/10">
        {deficiencies.map((d) => {
          const cfg = SEVERITY_CONFIG[d.severity];
          return (
            <li key={d.nutrient} className="grid gap-3 py-5 md:grid-cols-[1fr,auto] md:items-center md:gap-8">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-display text-lg font-bold uppercase tracking-tight text-bs-primary">
                    {d.nutrient}
                  </span>
                  <span className="text-sm font-medium text-bs-muted">{cfg.label}</span>
                </div>
                <p className="text-sm italic text-bs-muted">{d.whyAtRisk}</p>
                {d.addressedBy.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs uppercase tracking-widest text-bs-muted">Couvert par</span>
                    {d.addressedBy.map((id) => (
                      <a
                        key={id}
                        href={`#supp-${id}`}
                        className="rounded-full border border-bs-accent/50 px-3 py-0.5 text-xs text-bs-primary transition hover:bg-bs-accent/10"
                      >
                        {id}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 md:w-80">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-bs-primary/5">
                  <div
                    className={`h-full rounded-full ${cfg.colorClass}`}
                    style={{ width: `${cfg.widthPct}%` }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4 : Relancer — attendu PASS**

```bash
npm test -- components/protocol/__tests__/DeficienciesViz.test.tsx
```

- [ ] **Step 5 : Commit**

```bash
git add components/protocol/DeficienciesViz.tsx components/protocol/__tests__/DeficienciesViz.test.tsx
git commit -m "feat(protocol): DeficienciesViz bar chart with severity colors"
```

---

### Task 20 : Créer `TierSection` (bande tier + groupe suppléments)

**Files:**
- Create: `components/protocol/TierSection.tsx`

- [ ] **Step 1 : Créer le composant**

```tsx
import type { Supplement } from "@/lib/schemas/protocol";
import { tierLabel, tierColor, type TierNum } from "@/lib/tier/labels";
import { SupplementCard } from "./SupplementCard";

export function TierSection({ tier, supplements }: { tier: TierNum; supplements: Supplement[] }) {
  if (supplements.length === 0) return null;
  const color = tierColor(tier);
  return (
    <section className="space-y-4">
      <div className={`flex items-baseline justify-between rounded-2xl px-6 py-4 ${color.band}`}>
        <h2 className="font-display text-2xl font-black uppercase tracking-tight">
          {tierLabel(tier)}
        </h2>
        <span className="text-sm font-medium opacity-80">
          {supplements.length} {supplements.length > 1 ? "compléments" : "complément"}
        </span>
      </div>
      <div className="grid gap-4">
        {supplements.map((s) => (
          <SupplementCard key={s.id} supplement={s} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2 : Commit (sans test — tested indirectly via report render)**

```bash
git add components/protocol/TierSection.tsx
git commit -m "feat(protocol): TierSection component with tier band"
```

---

### Task 21 : Refondre `SupplementCard` (version premium tier)

**Files:**
- Modify: `components/protocol/SupplementCard.tsx`

- [ ] **Step 1 : Remplacer le contenu**

```tsx
import type { Supplement } from "@/lib/schemas/protocol";
import { tierColor, tierShort, type TierNum } from "@/lib/tier/labels";

const TIMING_LABEL: Record<string, string> = {
  morning_fasted: "Matin à jeun",
  morning_meal: "Matin avec repas",
  midday: "Midi",
  pre_workout: "Pré-entraînement",
  post_workout: "Post-entraînement",
  evening: "Soir",
  bedtime: "Coucher",
};

export function SupplementCard({ supplement: s }: { supplement: Supplement }) {
  const color = tierColor(s.tier as TierNum);
  return (
    <article
      id={`supp-${s.id}`}
      className={`rounded-3xl border bg-bs-surface p-6 md:p-8 transition-all duration-300 hover:-translate-y-0.5 ${color.card}`}
    >
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl" aria-hidden>{s.emoji}</span>
            <h3 className="font-display text-xl font-black uppercase tracking-tight text-bs-primary">
              {s.name}
            </h3>
          </div>
          <p className="text-sm text-bs-muted">
            {s.form} ·{" "}
            <span className="font-mono">{s.doseValue} {s.doseUnit}</span>
            {" · "}
            {TIMING_LABEL[s.timing] ?? s.timing}
            {" · "}
            <span className="italic">{s.duration}</span>
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${color.badge}`}
          aria-label={`Tier ${s.tier}`}
        >
          {tierShort(s.tier as TierNum)}
        </span>
      </header>

      <dl className="space-y-4 text-sm">
        <div>
          <dt className="mb-1 text-xs uppercase tracking-widest text-bs-muted">Pourquoi cette forme</dt>
          <dd className="text-bs-text">{s.formRationale}</dd>
        </div>
        <div>
          <dt className="mb-1 text-xs uppercase tracking-widest text-bs-muted">Pourquoi ce moment</dt>
          <dd className="text-bs-text">{s.timingRationale}</dd>
        </div>
        <div>
          <dt className="mb-1 text-xs uppercase tracking-widest text-bs-muted">Ce que ça t'apporte</dt>
          <dd className="text-bs-text">{s.justification}</dd>
        </div>
        {s.interactions.length > 0 && (
          <div>
            <dt className="mb-1 text-xs uppercase tracking-widest text-bs-muted">Interactions</dt>
            <dd>
              <ul className="list-disc pl-5 text-bs-text">
                {s.interactions.map((i, k) => (
                  <li key={k}>{i}</li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        {s.successIndicators.length > 0 && (
          <div>
            <dt className="mb-2 text-xs uppercase tracking-widest text-bs-muted">Indicateurs de succès</dt>
            <dd className="flex flex-wrap gap-2">
              {s.successIndicators.map((i, k) => (
                <span
                  key={k}
                  className="rounded-full border border-bs-primary/15 bg-bs-bg px-3 py-1 text-xs text-bs-primary"
                >
                  {i}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </article>
  );
}
```

- [ ] **Step 2 : Vérifier TS**

```bash
npx tsc --noEmit
```

- [ ] **Step 3 : Commit**

```bash
git add components/protocol/SupplementCard.tsx
git commit -m "refactor(protocol): SupplementCard with tier colors + brand tokens"
```

---

### Task 22 : Créer `ProtocolHero` (en-tête rapport)

**Files:**
- Create: `components/protocol/ProtocolHero.tsx`

- [ ] **Step 1 : Créer le composant**

```tsx
import type { ClientProfile } from "@/lib/schemas/clientProfile";

const GOAL_LABEL: Record<string, string> = {
  performance: "Performance",
  weight_loss: "Perte de poids",
  energy: "Énergie",
  sleep: "Sommeil",
  stress: "Stress",
  cognition: "Cognition",
  longevity: "Longévité",
  hormonal: "Hormonal",
  immunity: "Immunité",
  digestive: "Digestion",
  beauty: "Beauté",
  other: "Autre",
};

export function ProtocolHero({ profile }: { profile: ClientProfile }) {
  const first = profile.client.firstName;
  const age = profile.basics.age;
  return (
    <header className="flex flex-col gap-6 rounded-4xl border border-bs-primary/10 bg-bs-surface p-8 md:flex-row md:items-end md:justify-between md:p-12">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-bs-accent">
          Protocole personnalisé
        </p>
        <h1 className="mb-6 text-display-hero text-4xl md:text-5xl xl:text-6xl text-bs-primary">
          Pour {first}, {age} ans
        </h1>
        <div className="flex flex-wrap gap-2">
          {profile.goals.priorities.map((g) => (
            <span
              key={g}
              className="rounded-full border border-bs-accent/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-bs-primary"
            >
              {GOAL_LABEL[g] ?? g}
            </span>
          ))}
        </div>
      </div>
      <div className="text-right text-xs text-bs-muted md:text-sm">
        <p>Consultation du</p>
        <p className="font-mono text-bs-primary">{profile.client.consultationDate}</p>
      </div>
    </header>
  );
}
```

- [ ] **Step 2 : Commit**

```bash
git add components/protocol/ProtocolHero.tsx
git commit -m "feat(protocol): ProtocolHero component"
```

---

### Task 23 : Refresh visuel `DailyTimeline`, `RecapTable`, `WarningsBlock`, `MonitoringBlock`, `SummaryBlock`

**Files:**
- Modify: `components/protocol/DailyTimeline.tsx`
- Modify: `components/protocol/RecapTable.tsx`
- Modify: `components/protocol/WarningsBlock.tsx`
- Modify: `components/protocol/MonitoringBlock.tsx`
- Modify: `components/protocol/SummaryBlock.tsx`

Pour chacun de ces 5 fichiers : **remplacer les classes Tailwind** par les équivalents tokens BodyStart. Pas de changement structurel.

- [ ] **Step 1 : `DailyTimeline.tsx` — refresh avec tokens + icônes Phosphor**

Lire le fichier existant. Remplacer les classes suivantes (recherche/remplace) :
- `bg-white` → `bg-bs-surface`
- `border-slate-200` → `border-bs-primary/10`
- `text-slate-600` / `text-slate-500` → `text-bs-muted`
- `text-slate-900` → `text-bs-primary`
- `rounded-lg` → `rounded-2xl`

Ajouter les icônes Phosphor pour les headers de colonne. Exemple pour la colonne "Matin" :

```tsx
import { Sunrise, Sun, Barbell, ArrowClockwise, Moon, Bed } from "@phosphor-icons/react/dist/ssr";

const COLUMN_META = [
  { key: "morning", label: "Matin", Icon: Sunrise },
  { key: "midday", label: "Midi", Icon: Sun },
  { key: "preWorkout", label: "Pré-training", Icon: Barbell },
  { key: "postWorkout", label: "Post-training", Icon: ArrowClockwise },
  { key: "evening", label: "Soir", Icon: Moon },
  { key: "bedtime", label: "Coucher", Icon: Bed },
] as const;
```

Puis dans le render de chaque colonne, afficher `<Icon size={20} weight="regular" />` à côté du label et styler le header en Montserrat uppercase.

- [ ] **Step 2 : `SummaryBlock.tsx` — refresh typo**

Remplacer le contenu par un bloc cream avec padding généreux, Inter body, texte muted. Si le fichier utilise `react-markdown`, garder cette logique. Exemple simplifié :

```tsx
import ReactMarkdown from "react-markdown";

export function SummaryBlock({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-bs-primary/10 bg-bs-bg p-8 text-bs-text">
      <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tight prose-a:text-bs-primary">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}
```

- [ ] **Step 3 : `RecapTable.tsx` — divide-y sans cards**

Lire le fichier. Remplacer la table actuelle par une liste `divide-y divide-bs-primary/10` avec header Montserrat uppercase. Garder la logique de mapping sur les supplements + timing. Classes à utiliser : `text-bs-muted` pour les entêtes, `text-bs-text` pour le contenu, `font-mono` pour les doses.

- [ ] **Step 4 : `WarningsBlock.tsx` + `MonitoringBlock.tsx` — refresh**

Appliquer le même pattern : `rounded-3xl border border-bs-primary/10 bg-bs-surface p-8`, titres en Montserrat uppercase `text-bs-primary`, body `text-bs-text` avec `text-bs-muted` pour les sous-textes. Garder la logique de contenu.

- [ ] **Step 5 : Vérifier TS**

```bash
npx tsc --noEmit
```

- [ ] **Step 6 : Commit**

```bash
git add components/protocol/DailyTimeline.tsx components/protocol/SummaryBlock.tsx components/protocol/RecapTable.tsx components/protocol/WarningsBlock.tsx components/protocol/MonitoringBlock.tsx
git commit -m "style(protocol): refresh sub-components with BodyStart tokens"
```

---

### Task 24 : Créer `DietaryAnalysisBlock` (Phase 3 réintégration)

**Files:**
- Create: `components/protocol/DietaryAnalysisBlock.tsx`

- [ ] **Step 1 : Créer le composant**

```tsx
import ReactMarkdown from "react-markdown";

type Analysis = {
  description?: string;
  narrative?: string;
};

export function DietaryAnalysisBlock({ analysis, analysedAt }: { analysis: Analysis | null; analysedAt?: number }) {
  if (!analysis || (!analysis.narrative && !analysis.description)) return null;
  return (
    <section className="rounded-3xl border border-bs-accent/30 bg-bs-accent/5 p-8">
      <header className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl font-black uppercase tracking-tight text-bs-primary">
          Analyse alimentaire
        </h2>
        {analysedAt && (
          <span className="rounded-full border border-bs-accent/40 px-3 py-1 text-xs font-medium text-bs-primary">
            Analysé le {new Date(analysedAt * 1000).toLocaleDateString("fr-FR")}
          </span>
        )}
      </header>
      <div className="prose prose-sm max-w-none text-bs-text">
        {analysis.narrative && <ReactMarkdown>{analysis.narrative}</ReactMarkdown>}
      </div>
    </section>
  );
}
```

- [ ] **Step 2 : Commit**

```bash
git add components/protocol/DietaryAnalysisBlock.tsx
git commit -m "feat(protocol): DietaryAnalysisBlock re-integrates Phase 3 output"
```

---

### Task 25 : Créer `ActionBar` sticky bas de rapport

**Files:**
- Create: `components/protocol/ActionBar.tsx`

- [ ] **Step 1 : Créer le composant**

```tsx
"use client";
import { BrandButton } from "@/components/ui/brand-button";
import { ChatTeardropText, Download, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";

type Props = {
  consultationId: string;
  onEmailClick: () => void;
};

export function ActionBar({ consultationId, onEmailClick }: Props) {
  return (
    <div className="sticky bottom-4 z-20 mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3 rounded-full border border-bs-primary/10 bg-bs-surface/95 p-3 shadow-lg backdrop-blur-md">
      <BrandButton href={`/consultation/${consultationId}/refine`} variant="secondary" size="sm">
        <ChatTeardropText size={16} /> Affiner avec l'alimentation
      </BrandButton>
      <BrandButton href={`/api/export-pdf/${consultationId}`} variant="secondary" size="sm">
        <Download size={16} /> Télécharger PDF
      </BrandButton>
      <BrandButton onClick={onEmailClick} size="sm">
        <PaperPlaneTilt size={16} /> Envoyer par email
      </BrandButton>
    </div>
  );
}
```

- [ ] **Step 2 : Commit**

```bash
git add components/protocol/ActionBar.tsx
git commit -m "feat(protocol): ActionBar sticky with 3 CTAs"
```

---

### Task 26 : Recomposer `ProtocolView` avec tous les nouveaux composants

**Files:**
- Modify: `components/protocol/ProtocolView.tsx`

- [ ] **Step 1 : Remplacer le contenu**

```tsx
"use client";
import { useState } from "react";
import type { Protocol } from "@/lib/schemas/protocol";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { ProtocolHero } from "./ProtocolHero";
import { SummaryBlock } from "./SummaryBlock";
import { DeficienciesViz } from "./DeficienciesViz";
import { TierSection } from "./TierSection";
import { DailyTimeline } from "./DailyTimeline";
import { RecapTable } from "./RecapTable";
import { WarningsBlock } from "./WarningsBlock";
import { MonitoringBlock } from "./MonitoringBlock";
import { DietaryAnalysisBlock } from "./DietaryAnalysisBlock";
import { ActionBar } from "./ActionBar";
import { EmailSendDialog } from "./EmailSendDialog";
import type { TierNum } from "@/lib/tier/labels";

type Props = {
  consultationId: string;
  profile: ClientProfile;
  protocol: Protocol;
  dietaryAnalysis: { description?: string; narrative?: string } | null;
  analysedAt?: number;
  emailSentAt: Date | null;
};

export function ProtocolView({
  consultationId,
  profile,
  protocol,
  dietaryAnalysis,
  analysedAt,
  emailSentAt,
}: Props) {
  const [emailOpen, setEmailOpen] = useState(false);

  const byTier = (tier: TierNum) =>
    protocol.supplements.filter((s) => s.tier === tier);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-10">
      <ProtocolHero profile={profile} />
      <SummaryBlock text={protocol.summary} />
      {dietaryAnalysis && (
        <DietaryAnalysisBlock analysis={dietaryAnalysis} analysedAt={analysedAt} />
      )}
      <DeficienciesViz deficiencies={protocol.deficiencies} />
      <div className="space-y-10">
        <TierSection tier={1} supplements={byTier(1)} />
        <TierSection tier={2} supplements={byTier(2)} />
        <TierSection tier={3} supplements={byTier(3)} />
      </div>
      <DailyTimeline protocol={protocol} />
      <section>
        <h2 className="mb-4 font-display text-2xl font-black uppercase tracking-tight text-bs-primary">
          Récapitulatif
        </h2>
        <div className="rounded-3xl border border-bs-primary/10 bg-bs-surface overflow-hidden">
          <RecapTable protocol={protocol} />
        </div>
      </section>
      <WarningsBlock warnings={protocol.warnings} />
      <MonitoringBlock m={protocol.monitoring} />
      <ActionBar consultationId={consultationId} onEmailClick={() => setEmailOpen(true)} />
      <EmailSendDialog
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        consultationId={consultationId}
        defaultEmail={profile.client.email}
        emailSentAt={emailSentAt}
      />
    </div>
  );
}
```

Note : `EmailSendDialog` n'existe pas encore — il sera créé en Phase 6. Le build va échouer jusqu'à Task 31. C'est ok, on enchaîne.

- [ ] **Step 2 : Commit (WIP — build fails jusqu'à Task 31)**

```bash
git add components/protocol/ProtocolView.tsx
git commit -m "refactor(protocol): recompose ProtocolView with new sections (WIP)"
```

---

### Task 27 : Passer les nouveaux props à `ProtocolView` depuis la page détail

**Files:**
- Modify: `app/consultation/[id]/page.tsx`

- [ ] **Step 1 : Lire le fichier actuel**

```bash
cat app/consultation/\[id\]/page.tsx
```

- [ ] **Step 2 : Modifier pour passer tous les nouveaux props**

Remplacer le contenu (en gardant la logique de fetch via `getConsultation`) :

```tsx
import { notFound } from "next/navigation";
import { getConsultation } from "@/lib/db/queries";
import { ProtocolView } from "@/components/protocol/ProtocolView";

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const data = getConsultation(id);
  if (!data) notFound();

  return (
    <ProtocolView
      consultationId={data.id}
      profile={data.profile}
      protocol={data.protocol}
      dietaryAnalysis={data.dietaryAnalysis}
      analysedAt={data.updatedAt ? Number(data.updatedAt) / 1000 : undefined}
      emailSentAt={data.emailSentAt}
    />
  );
}
```

- [ ] **Step 3 : Commit**

```bash
git add app/consultation/\[id\]/page.tsx
git commit -m "feat(consultation): wire new ProtocolView props from getConsultation"
```

---

# PHASE 5 — Refresh Home + Wizard + History

**Objectif** : Appliquer les tokens charte sur les pages existantes. Pas de refonte structurelle.

---

### Task 28 : Refondre `app/page.tsx` (home)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1 : Remplacer le contenu**

```tsx
import { BrandButton } from "@/components/ui/brand-button";
import { Sparkle, ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="mb-16 md:mb-24">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-bs-accent">
          Test personnalisé
        </p>
        <h1 className="text-display-hero text-5xl md:text-7xl xl:text-[100px] text-bs-primary max-w-4xl">
          Le protocole<br />qui te correspond
        </h1>
        <p className="mt-6 max-w-2xl text-base text-bs-muted md:text-lg">
          Un bilan en 8 étapes, une analyse complète des carences, un protocole de compléments sur-mesure. Envoyé par email en fin de test.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <a
          href="/consultation/new"
          className="group rounded-4xl border border-bs-primary/10 bg-bs-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-12"
        >
          <div className="mb-8 inline-flex items-center justify-center rounded-full bg-bs-primary p-4 text-bs-bg">
            <Sparkle size={24} weight="fill" />
          </div>
          <h2 className="mb-3 font-display text-3xl font-black uppercase tracking-tight text-bs-primary">
            Nouveau test
          </h2>
          <p className="mb-8 text-bs-muted">
            Démarre un bilan complet pour un nouveau client. Résultat en moins d'une minute, livré par email avec PDF.
          </p>
          <BrandButton href="/consultation/new" variant="primary">
            Commencer →
          </BrandButton>
        </a>

        <a
          href="/history"
          className="group rounded-4xl border border-bs-primary/10 bg-bs-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-12"
        >
          <div className="mb-8 inline-flex items-center justify-center rounded-full bg-bs-accent p-4 text-bs-primary">
            <ClockCounterClockwise size={24} weight="fill" />
          </div>
          <h2 className="mb-3 font-display text-3xl font-black uppercase tracking-tight text-bs-primary">
            Historique
          </h2>
          <p className="mb-8 text-bs-muted">
            Retrouve, rouvre, ré-envoie ou supprime un protocole passé. Export CSV disponible.
          </p>
          <BrandButton href="/history" variant="secondary">
            Ouvrir →
          </BrandButton>
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Vérifier visuellement**

Ouvrir http://localhost:3000. Attendu : typo massive cream/forest, 2 cards premium hover-lift.

- [ ] **Step 3 : Commit**

```bash
git add app/page.tsx
git commit -m "feat(home): redesign with massive typo + premium cards"
```

---

### Task 29 : Refresh `StepProgress` du wizard

**Files:**
- Modify: `components/wizard/StepProgress.tsx`

- [ ] **Step 1 : Lire le fichier existant**

```bash
cat components/wizard/StepProgress.tsx
```

- [ ] **Step 2 : Adapter les classes aux tokens**

Remplacer :
- `bg-emerald-600` / `bg-green-500` → `bg-bs-primary`
- `bg-slate-200` → `bg-bs-primary/10`
- `text-slate-700` → `text-bs-primary`
- Texte des étapes en Montserrat 700 uppercase tracking-wider

- [ ] **Step 3 : Commit**

```bash
git add components/wizard/StepProgress.tsx
git commit -m "style(wizard): refresh StepProgress with BodyStart tokens"
```

---

### Task 30 : Refresh visuel `WizardShell` + wrapper page

**Files:**
- Modify: `components/wizard/WizardShell.tsx`
- Modify: `app/consultation/new/page.tsx`

- [ ] **Step 1 : Moderniser le bouton submit + container `WizardShell`**

Dans `WizardShell.tsx`, remplacer `<Button>` par `<BrandButton>` pour le bouton "Suivant" et "Générer le protocole" :

```tsx
import { BrandButton } from "@/components/ui/brand-button";

// ...

<div className="mt-6 flex items-center justify-between">
  <BrandButton
    variant="ghost"
    disabled={step === 0 || submitting}
    onClick={() => setStep((s) => s - 1)}
    size="sm"
  >
    ← Précédent
  </BrandButton>
  {step < STEPS.length - 1 ? (
    <BrandButton onClick={next} size="md">Suivant →</BrandButton>
  ) : (
    <BrandButton onClick={submit} disabled={submitting} size="lg">
      {submitting ? "Lancer l'analyse…" : "Générer le protocole"}
    </BrandButton>
  )}
</div>
```

Remplacer aussi le container shell :

```tsx
<div className="rounded-3xl border border-bs-primary/10 bg-bs-surface p-8 md:p-10">
  {/* step components */}
</div>
```

- [ ] **Step 2 : Refresh `app/consultation/new/page.tsx`**

Remplacer le contenu :

```tsx
import { WizardShell } from "@/components/wizard/WizardShell";

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-bs-accent">
          Test personnalisé
        </p>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight text-bs-primary md:text-5xl">
          Nouveau bilan
        </h1>
      </header>
      <WizardShell />
    </div>
  );
}
```

- [ ] **Step 3 : Commit**

```bash
git add components/wizard/WizardShell.tsx app/consultation/new/page.tsx
git commit -m "style(wizard): refresh shell + wrapper page with brand tokens"
```

---

### Task 31 : Refresh `app/history/page.tsx`

**Files:**
- Modify: `app/history/page.tsx`

- [ ] **Step 1 : Lire le fichier existant pour comprendre la structure**

```bash
cat app/history/page.tsx
```

- [ ] **Step 2 : Adapter les classes aux tokens**

Ne pas refaire la logique (liste, search, delete, CSV export). Juste remplacer les classes :
- Tous les `bg-white` / `bg-slate-*` → `bg-bs-surface` / `bg-bs-bg`
- `text-slate-*` → `text-bs-muted` / `text-bs-primary`
- `border-slate-200` → `border-bs-primary/10`
- `rounded-lg` → `rounded-2xl`
- Les `Button` shadcn existants → `BrandButton` avec `size="sm"`
- Titre principal en `font-display text-4xl font-black uppercase tracking-tight`
- Wrapper `<div className="mx-auto max-w-6xl px-6 py-10">`

- [ ] **Step 3 : Commit**

```bash
git add app/history/page.tsx
git commit -m "style(history): refresh with brand tokens"
```

---

# PHASE 6 — Email feature (Resend + React Email)

**Objectif** : Implémenter l'envoi email complet — template React Email + route API + dialog client + mark as sent.

**Checkpoint** : Cliquer "Envoyer par email" sur un rapport déclenche un vrai email (envoyé à l'adresse saisie), le PDF est en pièce jointe, le toast succès s'affiche, `emailSentAt` est stocké.

---

### Task 32 : Créer l'instance Resend

**Files:**
- Create: `lib/email/client.ts`

- [ ] **Step 1 : Créer le client**

```ts
import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!env.resendApiKey) {
    throw new Error("RESEND_API_KEY is not set. Add it to .env.local.");
  }
  if (!_resend) _resend = new Resend(env.resendApiKey);
  return _resend;
}
```

- [ ] **Step 2 : Commit**

```bash
git add lib/email/client.ts
git commit -m "feat(email): lazy Resend client"
```

---

### Task 33 : Créer le template React Email `ProtocolEmail`

**Files:**
- Create: `lib/email/templates/ProtocolEmail.tsx`
- Create: `lib/email/__tests__/template.test.tsx`

- [ ] **Step 1 : Écrire le test snapshot**

Créer `lib/email/__tests__/template.test.tsx` :

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@react-email/components";
import { ProtocolEmail } from "../templates/ProtocolEmail";

describe("ProtocolEmail template", () => {
  it("renders with standard props", async () => {
    const html = await render(
      <ProtocolEmail
        firstName="Thomas"
        consultationUrl="https://example.com/r/abc"
        consultationDate="2026-04-14"
        essentialCount={2}
        priorityCount={3}
        optimisationCount={2}
        shopAddress="8 Rue du Pont des Landes, 78310 Coignières"
        shopPhone="07 61 84 75 80"
      />,
    );
    expect(html).toContain("Thomas");
    expect(html).toContain("Coignières");
    expect(html).toContain("https://example.com/r/abc");
  });
});
```

- [ ] **Step 2 : Lancer — attendu FAIL**

```bash
npm test -- lib/email/__tests__/template.test.tsx
```

- [ ] **Step 3 : Implémenter le template**

Créer `lib/email/templates/ProtocolEmail.tsx` :

```tsx
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type Props = {
  firstName: string;
  consultationUrl: string;
  consultationDate: string;
  essentialCount: number;
  priorityCount: number;
  optimisationCount: number;
  shopAddress: string;
  shopPhone: string;
  logoUrl?: string;
};

export function ProtocolEmail({
  firstName,
  consultationUrl,
  consultationDate,
  essentialCount,
  priorityCount,
  optimisationCount,
  shopAddress,
  shopPhone,
  logoUrl,
}: Props) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>Votre protocole BodyStart personnalisé</Preview>
      <Tailwind>
        <Body className="bg-[#f8f4ee] font-sans">
          <Container className="mx-auto my-8 max-w-xl rounded-2xl bg-white p-0 overflow-hidden shadow">
            <Section className="bg-[#f8f4ee] px-8 py-6">
              {logoUrl && (
                <Img src={logoUrl} alt="BodyStart Nutrition" width="160" height="40" />
              )}
            </Section>

            <Section className="px-8 py-6">
              <Text className="text-base text-[#111827]">
                Bonjour {firstName},
              </Text>
              <Text className="text-base text-[#111827]">
                Voici votre protocole personnalisé BodyStart Nutrition, établi suite à votre consultation du {consultationDate}.
              </Text>

              <Section className="text-center py-4">
                <Button
                  href={consultationUrl}
                  className="bg-[#1a2e23] rounded-full px-8 py-3 text-sm font-bold uppercase tracking-widest text-white"
                >
                  Consulter en ligne
                </Button>
                <Text className="mt-2 text-xs text-[#4a5f4c]">
                  PDF en pièce jointe également
                </Text>
              </Section>

              <Hr className="my-6 border-[#1a2e23]/10" />

              <Text className="text-sm font-bold uppercase tracking-widest text-[#4a5f4c]">
                Récap en 3 points
              </Text>
              <Text className="text-sm text-[#111827]">
                • <strong>{essentialCount}</strong> complément{essentialCount > 1 ? "s" : ""} essentiel{essentialCount > 1 ? "s" : ""}<br />
                • <strong>{priorityCount}</strong> prioritaire{priorityCount > 1 ? "s" : ""}<br />
                • <strong>{optimisationCount}</strong> optimisation{optimisationCount > 1 ? "s" : ""}
              </Text>

              <Text className="mt-6 text-sm text-[#111827]">
                Questions ? Revenez nous voir en boutique ou répondez à cet email.
              </Text>

              <Text className="text-sm text-[#111827]">L'équipe BodyStart</Text>
            </Section>

            <Section className="bg-[#1a2e23] px-8 py-6 text-center">
              <Text className="m-0 text-xs text-[#f8f4ee]">
                {shopAddress}
              </Text>
              <Text className="m-0 text-xs text-[#f8f4ee]">{shopPhone}</Text>
              <Text className="m-0 text-xs text-[#89a890]">bodystart.vercel.app</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default ProtocolEmail;
```

- [ ] **Step 4 : Relancer — attendu PASS**

```bash
npm test -- lib/email/__tests__/template.test.tsx
```

- [ ] **Step 5 : Commit**

```bash
git add lib/email/templates/ProtocolEmail.tsx lib/email/__tests__/template.test.tsx
git commit -m "feat(email): ProtocolEmail React Email template"
```

---

### Task 34 : Créer la fonction `sendProtocolEmail`

**Files:**
- Create: `lib/email/send.ts`
- Create: `lib/email/__tests__/send.test.ts`

- [ ] **Step 1 : Écrire le test (utilisation de spyOn sur Resend)**

Créer `lib/email/__tests__/send.test.ts` :

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendProtocolEmail } from "../send";

vi.mock("../client", () => ({
  getResend: () => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "mock-id" }, error: null }),
    },
  }),
}));

describe("sendProtocolEmail", () => {
  it("sends to given recipient with PDF attachment", async () => {
    const result = await sendProtocolEmail({
      toEmail: "thomas@example.com",
      firstName: "Thomas",
      consultationId: "abc",
      consultationDate: "2026-04-14",
      essentialCount: 2,
      priorityCount: 3,
      optimisationCount: 2,
      pdfBuffer: Buffer.from("fake-pdf"),
    });
    expect(result.id).toBe("mock-id");
  });
});
```

- [ ] **Step 2 : Lancer — attendu FAIL**

```bash
npm test -- lib/email/__tests__/send.test.ts
```

- [ ] **Step 3 : Implémenter**

Créer `lib/email/send.ts` :

```ts
import "server-only";
import { render } from "@react-email/components";
import { getResend } from "./client";
import { ProtocolEmail } from "./templates/ProtocolEmail";
import { env } from "@/lib/env";

export type SendProtocolEmailArgs = {
  toEmail: string;
  firstName: string;
  consultationId: string;
  consultationDate: string;
  essentialCount: number;
  priorityCount: number;
  optimisationCount: number;
  pdfBuffer: Buffer;
};

export async function sendProtocolEmail(args: SendProtocolEmailArgs): Promise<{ id: string }> {
  const consultationUrl = `${env.appOrigin}/r/${args.consultationId}`;

  const html = await render(
    ProtocolEmail({
      firstName: args.firstName,
      consultationUrl,
      consultationDate: args.consultationDate,
      essentialCount: args.essentialCount,
      priorityCount: args.priorityCount,
      optimisationCount: args.optimisationCount,
      shopAddress: env.shopAddress,
      shopPhone: env.shopPhone,
      logoUrl: `${env.appOrigin}/logo.webp`,
    }),
  );

  const resend = getResend();
  const response = await resend.emails.send({
    from: env.resendFromEmail,
    to: args.toEmail,
    subject: "Votre protocole BodyStart personnalisé",
    html,
    attachments: [
      {
        filename: `protocole-bodystart-${args.consultationId}.pdf`,
        content: args.pdfBuffer,
      },
    ],
  });

  if (response.error) {
    throw new Error(`Resend error: ${response.error.message}`);
  }
  return { id: response.data?.id ?? "" };
}
```

- [ ] **Step 4 : Relancer — attendu PASS**

```bash
npm test -- lib/email/__tests__/send.test.ts
```

- [ ] **Step 5 : Commit**

```bash
git add lib/email/send.ts lib/email/__tests__/send.test.ts
git commit -m "feat(email): sendProtocolEmail with Resend + PDF attachment"
```

---

### Task 35 : Créer la route API `POST /api/send-protocol-email/[id]`

**Files:**
- Create: `app/api/send-protocol-email/[id]/route.ts`

- [ ] **Step 1 : Lire la route `export-pdf` pour reproduire la logique PDF**

```bash
cat app/api/export-pdf/\[id\]/route.ts
```

On réutilise la même approche Puppeteer pour générer le PDF. On peut soit factoriser dans une fonction commune, soit dupliquer le code si c'est court.

- [ ] **Step 2 : Créer la route (avec factorisation si pertinente)**

Si la logique puppeteer dans `export-pdf` fait plus de 30 lignes, extraire dans `lib/pdf/generate.ts` :

```ts
// lib/pdf/generate.ts
import "server-only";
import puppeteer from "puppeteer";
import { env } from "@/lib/env";

export async function renderConsultationPdf(consultationId: string): Promise<Buffer> {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(`${env.appOrigin}/consultation/${consultationId}/print`, {
      waitUntil: "networkidle0",
    });
    const pdf = await page.pdf({ format: "A4", printBackground: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
```

(Si cette fonction existe déjà sous un autre nom dans l'actuel `export-pdf/route.ts`, l'extraire avec le même nom. Adapter `export-pdf/route.ts` pour l'utiliser.)

Créer `app/api/send-protocol-email/[id]/route.ts` :

```ts
import { NextRequest, NextResponse } from "next/server";
import { getConsultation, markEmailSent } from "@/lib/db/queries";
import { sendProtocolEmail } from "@/lib/email/send";
import { renderConsultationPdf } from "@/lib/pdf/generate";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { toEmail?: string };

  const data = getConsultation(id);
  if (!data) return NextResponse.json({ error: "Consultation not found" }, { status: 404 });

  const toEmail = body.toEmail ?? data.profile.client.email;
  if (!toEmail) return NextResponse.json({ error: "Missing recipient email" }, { status: 400 });

  try {
    const pdfBuffer = await renderConsultationPdf(id);

    const byTier = (t: 1 | 2 | 3) => data.protocol.supplements.filter((s) => s.tier === t).length;
    const result = await sendProtocolEmail({
      toEmail,
      firstName: data.profile.client.firstName,
      consultationId: id,
      consultationDate: data.profile.client.consultationDate,
      essentialCount: byTier(1),
      priorityCount: byTier(2),
      optimisationCount: byTier(3),
      pdfBuffer,
    });

    markEmailSent(id);
    return NextResponse.json({ ok: true, emailId: result.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Email send failed" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 3 : Commit**

```bash
git add app/api/send-protocol-email lib/pdf/
git commit -m "feat(email): route POST /api/send-protocol-email/[id]"
```

---

### Task 36 : Créer `EmailSendDialog`

**Files:**
- Create: `components/protocol/EmailSendDialog.tsx`
- Create: `components/protocol/__tests__/EmailSendDialog.test.tsx`

- [ ] **Step 1 : Écrire le test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EmailSendDialog } from "../EmailSendDialog";

describe("EmailSendDialog", () => {
  it("renders pre-filled email when open", () => {
    render(
      <EmailSendDialog
        open={true}
        onClose={() => {}}
        consultationId="abc"
        defaultEmail="thomas@example.com"
        emailSentAt={null}
      />,
    );
    const input = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(input.value).toBe("thomas@example.com");
  });

  it("does not render anything when open=false", () => {
    const { container } = render(
      <EmailSendDialog
        open={false}
        onClose={() => {}}
        consultationId="abc"
        defaultEmail=""
        emailSentAt={null}
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 2 : Lancer — attendu FAIL**

- [ ] **Step 3 : Implémenter**

Créer `components/protocol/EmailSendDialog.tsx` :

```tsx
"use client";
import { useState } from "react";
import { toast } from "sonner";
import { BrandButton } from "@/components/ui/brand-button";
import { X } from "@phosphor-icons/react/dist/ssr";

type Props = {
  open: boolean;
  onClose: () => void;
  consultationId: string;
  defaultEmail: string;
  emailSentAt: Date | null;
};

export function EmailSendDialog({ open, onClose, consultationId, defaultEmail, emailSentAt }: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [sending, setSending] = useState(false);

  if (!open) return null;

  async function submit() {
    if (!email) return;
    setSending(true);
    try {
      const res = await fetch(`/api/send-protocol-email/${consultationId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ toEmail: email }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      toast.success("Email envoyé");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Envoi échoué");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-center justify-center bg-bs-primary/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-bs-primary/10 bg-bs-surface p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-bs-accent">
              Envoi email
            </p>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-bs-primary">
              Envoyer le protocole
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-bs-muted hover:bg-bs-primary/5"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <label className="mb-6 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-bs-muted">
            Email du client
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="prenom@exemple.fr"
            className="w-full rounded-full border border-bs-primary/15 bg-bs-bg px-5 py-3 text-bs-text focus:border-bs-accent focus:outline-none focus:ring-2 focus:ring-bs-accent/40"
          />
        </label>

        <p className="mb-6 text-sm text-bs-muted">
          Le protocole sera envoyé avec le PDF en pièce jointe et un lien durable vers la version en ligne.
        </p>

        {emailSentAt && (
          <p className="mb-4 rounded-full bg-bs-accent/15 px-4 py-2 text-xs text-bs-primary">
            Déjà envoyé le {emailSentAt.toLocaleDateString("fr-FR")}
          </p>
        )}

        <div className="flex gap-3">
          <BrandButton variant="ghost" onClick={onClose} size="sm">
            Annuler
          </BrandButton>
          <BrandButton onClick={submit} disabled={sending || !email} size="sm">
            {sending ? "Envoi…" : "Envoyer"}
          </BrandButton>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4 : Relancer — attendu PASS**

```bash
npm test -- components/protocol/__tests__/EmailSendDialog.test.tsx
```

- [ ] **Step 5 : Commit**

```bash
git add components/protocol/EmailSendDialog.tsx components/protocol/__tests__/EmailSendDialog.test.tsx
git commit -m "feat(email): EmailSendDialog modal with Resend integration"
```

---

# PHASE 7 — Page publique durable `/r/:id`

**Objectif** : Créer une URL publique (pas d'auth) pour partager le rapport via le lien email.

---

### Task 37 : Créer la page `/r/[id]`

**Files:**
- Create: `app/r/[id]/page.tsx`

- [ ] **Step 1 : Créer le fichier**

```tsx
import { notFound } from "next/navigation";
import { getConsultation } from "@/lib/db/queries";
import { ProtocolView } from "@/components/protocol/ProtocolView";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const data = getConsultation(id);
  if (!data) notFound();

  return (
    <ProtocolView
      consultationId={data.id}
      profile={data.profile}
      protocol={data.protocol}
      dietaryAnalysis={data.dietaryAnalysis}
      analysedAt={data.updatedAt ? Number(data.updatedAt) / 1000 : undefined}
      emailSentAt={data.emailSentAt}
    />
  );
}
```

- [ ] **Step 2 : Vérifier que le lien marche**

Créer une consultation via `/consultation/new`. Récupérer l'ID depuis l'URL du rapport. Ouvrir `http://localhost:3000/r/<id>` dans un navigateur privé (sans cookies). Attendu : le rapport s'affiche identique à `/consultation/<id>`.

- [ ] **Step 3 : Commit**

```bash
git add app/r/
git commit -m "feat(public): /r/:id durable public report URL"
```

---

# PHASE 8 — PDF template refresh

**Objectif** : Refaire `/consultation/[id]/print` pour matcher le nouveau design du rapport (cream/forest, tiers, carences).

---

### Task 38 : Refaire `app/consultation/[id]/print/page.tsx`

**Files:**
- Modify: `app/consultation/[id]/print/page.tsx`

- [ ] **Step 1 : Lire le fichier existant**

```bash
cat app/consultation/\[id\]/print/page.tsx
```

- [ ] **Step 2 : Adapter pour utiliser les nouveaux composants**

Le print template doit :
- Pas d'`AppHeader` (le layout parent)
- Rendre `ProtocolView` simplifié (sans `ActionBar` ni `EmailSendDialog` — pas utiles dans un PDF)
- Utiliser un CSS print-friendly (page breaks, margins)

Créer une version adaptée de `ProtocolView` spécifique au print : `components/protocol/ProtocolViewPrint.tsx` :

```tsx
import type { Protocol } from "@/lib/schemas/protocol";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { ProtocolHero } from "./ProtocolHero";
import { SummaryBlock } from "./SummaryBlock";
import { DeficienciesViz } from "./DeficienciesViz";
import { TierSection } from "./TierSection";
import { DailyTimeline } from "./DailyTimeline";
import { RecapTable } from "./RecapTable";
import { WarningsBlock } from "./WarningsBlock";
import { MonitoringBlock } from "./MonitoringBlock";
import { env } from "@/lib/env";
import type { TierNum } from "@/lib/tier/labels";

export function ProtocolViewPrint({ profile, protocol }: { profile: ClientProfile; protocol: Protocol }) {
  const byTier = (t: TierNum) => protocol.supplements.filter((s) => s.tier === t);
  return (
    <div className="mx-auto max-w-[820px] bg-bs-bg p-10 text-bs-text">
      <header className="mb-8 flex items-center justify-between border-b border-bs-primary/15 pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-bs-accent">Protocole BodyStart Nutrition</p>
        </div>
        <div className="text-right text-xs text-bs-muted">
          <p>{env.shopAddress}</p>
          <p>{env.shopPhone}</p>
        </div>
      </header>
      <div className="space-y-8">
        <ProtocolHero profile={profile} />
        <SummaryBlock text={protocol.summary} />
        <DeficienciesViz deficiencies={protocol.deficiencies} />
        <TierSection tier={1} supplements={byTier(1)} />
        <TierSection tier={2} supplements={byTier(2)} />
        <TierSection tier={3} supplements={byTier(3)} />
        <DailyTimeline protocol={protocol} />
        <section>
          <h2 className="mb-3 font-display text-xl font-black uppercase tracking-tight text-bs-primary">
            Récapitulatif
          </h2>
          <div className="rounded-2xl border border-bs-primary/10 overflow-hidden">
            <RecapTable protocol={protocol} />
          </div>
        </section>
        <WarningsBlock warnings={protocol.warnings} />
        <MonitoringBlock m={protocol.monitoring} />
      </div>
    </div>
  );
}
```

Ensuite dans `app/consultation/[id]/print/page.tsx` :

```tsx
import { notFound } from "next/navigation";
import { getConsultation } from "@/lib/db/queries";
import { ProtocolViewPrint } from "@/components/protocol/ProtocolViewPrint";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const data = getConsultation(id);
  if (!data) notFound();
  return <ProtocolViewPrint profile={data.profile} protocol={data.protocol} />;
}
```

- [ ] **Step 3 : Vérifier que l'export PDF marche**

Ouvrir http://localhost:3000/api/export-pdf/<consultationId> dans le navigateur → le PDF doit se télécharger et afficher le nouveau design (cream/forest, tiers rebrandés, carences visibles).

- [ ] **Step 4 : Commit**

```bash
git add app/consultation/\[id\]/print/page.tsx components/protocol/ProtocolViewPrint.tsx
git commit -m "feat(pdf): refresh print template with new design"
```

---

# PHASE 9 — Verification finale

**Objectif** : Tout fonctionne end-to-end. Build passe. Tests passent.

---

### Task 39 : Smoke test manuel end-to-end

**Files:** (aucun — manual check)

- [ ] **Step 1 : Scénario complet**

1. Aller sur http://localhost:3000 → vérifier home premium cream/forest
2. Cliquer "Nouveau test" → wizard s'affiche en charte
3. Remplir les 8 étapes avec données cohérentes (email valide)
4. Cliquer "Générer le protocole" → scanner overlay dark mode apparaît
5. Attendre la fin (~8s) → rapport s'affiche avec : hero client, summary, deficiencies bar chart, 3 tiers (Essentiels/Prioritaires/Optimisations), timeline 6 colonnes, recap, warnings, monitoring
6. Cliquer "Télécharger PDF" → PDF télécharge, ouvrir pour vérifier le design
7. Cliquer "Envoyer par email" → dialog s'ouvre avec email pré-rempli → envoyer → toast succès (si Resend configuré)
8. Ouvrir http://localhost:3000/r/<id> dans navigateur privé → rapport accessible
9. Retour home → cliquer "Historique" → client + consultation présents

- [ ] **Step 2 : Noter tous les bugs visibles**

Si bugs : les lister en section `## Bugs trouvés` dans le plan, et créer une task de correction ciblée avant la task 40.

- [ ] **Step 3 : Commit (rien à commit — step valid quand tout passe)**

---

### Task 40 : Build production + lint

**Files:** (aucun — verification)

- [ ] **Step 1 : Build Next.js**

```bash
npm run build
```

Attendu : `✓ Compiled successfully`, aucune erreur TS ou ESLint bloquante. Warnings tolérés seulement pour `react-markdown`/`server-only` patterns attendus.

- [ ] **Step 2 : Lint**

```bash
npm run lint
```

Attendu : pas d'erreur. Warnings tolérés si préexistants.

- [ ] **Step 3 : Tests complets**

```bash
npm test
```

Attendu : tous les tests passent.

- [ ] **Step 4 : Commit (rien si tout passe)**

Si des fixs sont nécessaires pour faire passer build/lint/test, créer une task de fix et commit les corrections.

---

### Task 41 : Mettre à jour le README

**Files:**
- Modify: `README.md`

- [ ] **Step 1 : Ajouter la section nouvelles variables env**

Après la section "Installation" :

```markdown
## Variables d'environnement

```
ANTHROPIC_API_KEY=sk-ant-xxx      # Requis — génération Claude
RESEND_API_KEY=re_xxx             # Optionnel — envoi email (omettre bloque l'envoi mais pas l'app)
RESEND_FROM_EMAIL=...             # Optionnel — défaut: onboarding@resend.dev
BODYSTART_SHOP_ADDRESS=...        # Optionnel — défaut: Coignières
BODYSTART_SHOP_PHONE=...          # Optionnel
APP_ORIGIN=http://localhost:3000  # Optionnel — pour liens email et PDF
```
```

Ajouter la section "Nouveautés avril 2026" :

```markdown
## Nouveautés — refonte kiosque

- Design aligné sur bodystart.vercel.app (cream + forest green + Montserrat 900)
- Moment "scanner" pendant la génération Claude (~8s) : silhouette anatomique, scan line, particules
- Visualisation des carences en bar chart horizontal (nouveau champ `Protocol.deficiencies`)
- Tier list rebrandée : Essentiels / Prioritaires / Optimisations
- Envoi email via Resend avec PDF en pièce jointe + lien web durable `/r/:id`
- Réintégration de l'analyse Phase 3 dans le rapport
```

- [ ] **Step 2 : Commit final**

```bash
git add README.md
git commit -m "docs: README update for kiosque redesign + email feature"
```

---

## Self-review du plan (à faire avant de lancer l'exécution)

Avant de lancer l'exécution, l'auteur du plan vérifie :

### Couverture spec

- [x] Task 1–6 : Design tokens, fonts, logo opt, BrandButton → couvre §5 du spec
- [x] Task 7–12 : Schema + tool + prompt + emailSentAt + env → couvre §11 du spec
- [x] Task 13–17 : Scanner complet → couvre §6 du spec
- [x] Task 18–27 : Rapport redesign (carences, tier, supplement, hero, action bar, recompose, print refresh plus loin) → couvre §4, §7, §8, §12 du spec
- [x] Task 28–31 : Home + Wizard + History refresh → couvre §4 du spec
- [x] Task 32–36 : Email end-to-end → couvre §10 du spec
- [x] Task 37 : Public /r/:id → couvre §10.5 du spec
- [x] Task 38 : PDF refresh → couvre §12.2 du spec (PDF template refait)
- [x] Task 39–41 : Verification + docs → couvre §17 du spec (success criteria)

### Placeholder scan

- Aucun "TBD", "TODO", "fill in later", "similar to N"
- Code inline fourni pour chaque step qui modifie du code
- Commandes exactes pour les tests
- Paths absolus-relatifs-projet explicites

### Cohérence types

- `Deficiency`, `Protocol.deficiencies`, `severity` enum → définis en Task 7, utilisés en Task 8 (tool), Task 19 (viz), Task 26 (recompose)
- `TierNum` (`1 | 2 | 3`) défini en Task 18, utilisé en Task 20, 21, 26, 38
- `markEmailSent` défini en Task 11, utilisé en Task 35
- `sendProtocolEmail` défini en Task 34, utilisé en Task 35
- `renderConsultationPdf` défini en Task 35 (dans `lib/pdf/generate.ts`), si pré-existant ailleurs (dans `export-pdf/route.ts`), l'en extraire comme prévu

### Scope

- Gros plan (~41 tasks) mais cohérent avec le spec : chaque task sert un goal précis du spec
- Chaque task produit un commit — rollback facile si besoin
- Phases 3 et 6 isolées (scanner + email) peuvent être exécutées indépendamment si budget temps contraint

---

## Notes d'exécution

- Si Resend n'est pas configuré au moment de l'exécution, Task 35/36 se testeront sans pouvoir envoyer de vrai email. Le flow reste testable via le toast d'erreur. Configurer Resend est une opération hors-code (signup + DNS) — ne pas bloquer l'exécution du plan.
- Le scanner (Task 15) est volontairement isolé dans `components/scanner/` : si la direction visuelle ne convient pas à l'exécution, ce composant peut être itéré seul sans impacter le reste.
- Les refresh visuels (Phase 5) sont des diffs CSS de classes — si l'exécuteur a des doutes sur un fichier, il peut prendre une screenshot avant/après pour valider avec l'utilisateur.

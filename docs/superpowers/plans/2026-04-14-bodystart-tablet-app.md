# BodyStart Tablet App Pivot — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer l'UX de site-web-à-header en **app tablette landscape** : retirer `AppHeader`, ajouter navigation flottante minimaliste (✕ sub-pages, icône historique discrète home uniquement), touch targets ≥44px partout, responsive tablette-first.

**Architecture:** Deux nouveaux composants de navigation flottante (`FloatingClose`, `FloatingHistory`) remplacent l'entête persistante. Le layout racine perd son `<header>`, chaque page décide elle-même si elle affiche un ✕. Aucun changement data/logique métier — uniquement chrome UI et responsive strategy.

**Tech Stack:** Next.js 16.2.2 · TypeScript · Tailwind v4 · Phosphor Icons (installé) · class-variance-authority · Vitest + happy-dom (composant tests).

**Spec source:** [`docs/superpowers/specs/2026-04-14-bodystart-tablet-app-design.md`](../specs/2026-04-14-bodystart-tablet-app-design.md)

---

## Conventions

- Tous les paths relatifs à la racine du projet `C:\Users\lecha\OneDrive\Bureau\Bodystart_protocole`.
- Working branch : `feat/tablet-app-pivot` (à créer en tâche 0).
- Chaque task = 1 commit. Tous les commits incluent le trailer `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>`.
- Messages de commit : conventional (`feat`, `refactor`, `style`, `chore`, `test`).
- Tests unitaires existants : 25/25. Ils doivent continuer à passer après chaque task.
- Le dev server tourne sur port 3000 ; pas besoin de le redémarrer entre tasks (HMR suffit).

---

## Structure de fichiers

### Nouveaux fichiers
```
components/
├── layout/
│   ├── FloatingClose.tsx       # bouton ✕ fixed top-right sub-pages
│   ├── FloatingHistory.tsx     # icône horloge fixed top-right home
│   └── __tests__/
│       ├── FloatingClose.test.tsx
│       └── FloatingHistory.test.tsx
```

### Fichiers modifiés
```
app/
├── layout.tsx                                  # retire AppHeader
├── page.tsx                                    # home launcher (FloatingHistory + CTA xl centré)
├── consultation/
│   ├── new/page.tsx                            # + FloatingClose
│   └── [id]/page.tsx                           # + FloatingClose
├── r/[id]/page.tsx                             # + FloatingClose
└── history/page.tsx                            # + FloatingClose, rows 72px, suppr max-w rigide

components/
├── ui/brand-button.tsx                         # + size "xl", + active:scale
├── wizard/
│   ├── WizardShell.tsx                         # nav buttons: Précédent md, Suivant/Générer lg
│   ├── Section0Client.tsx                      # inputs py-4 si besoin
│   └── Section1Basics.tsx ... Section6*.tsx    # idem (vérif au cas par cas)
```

### Supprimés
```
components/layout/AppHeader.tsx                 # plus utilisé après task 4
```

---

## Task 0 : Créer la branche feature

**Files:** N/A (git operation)

- [ ] **Step 1 : Créer et basculer sur la branche**

```bash
cd "C:/Users/lecha/OneDrive/Bureau/Bodystart_protocole" && git checkout -b feat/tablet-app-pivot
```

Attendu : `Switched to a new branch 'feat/tablet-app-pivot'`.

- [ ] **Step 2 : Vérifier état propre**

```bash
git status
```

Attendu : `nothing to commit, working tree clean`.

---

## Task 1 : Ajouter size `xl` + `active:` à `BrandButton`

**Files:**
- Modify: `components/ui/brand-button.tsx`

- [ ] **Step 1 : Lire le fichier actuel**

```bash
cat components/ui/brand-button.tsx
```

- [ ] **Step 2 : Remplacer les définitions de `size` et ajouter `active:scale` aux variantes**

Remplacer le bloc `cva(...)` en gardant la structure mais en étendant `size` :

```tsx
"use client";
import { forwardRef } from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const brandButton = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-widest transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bs-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bs-bg disabled:opacity-60 disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-bs-primary text-bs-bg hover:-translate-y-0.5 hover:shadow-lg",
        secondary: "bg-bs-surface text-bs-primary border border-bs-primary/15 hover:-translate-y-0.5 hover:shadow-md",
        ghost: "text-bs-primary hover:bg-bs-primary/5",
      },
      size: {
        sm: "px-5 py-2.5 text-xs",
        md: "px-6 py-3 text-[13px]",
        lg: "px-10 py-5 text-sm",
        xl: "px-12 py-6 text-base gap-3",
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

Deux changements clés :
1. `active:scale-[0.98]` ajouté à la `cva` base (classes partagées par toutes les variantes)
2. `size: "xl"` ajouté avec `px-12 py-6 text-base gap-3` (~72px tall, pour le CTA home)
3. `size: "sm"` légèrement remonté de `px-4 py-2` à `px-5 py-2.5` (~40px au lieu de 32px, tap-safe)

- [ ] **Step 3 : Vérifier TSC**

```bash
npx tsc --noEmit
```

Attendu : 0 erreur.

- [ ] **Step 4 : Vérifier tests existants**

```bash
npm test
```

Attendu : 25/25 pass.

- [ ] **Step 5 : Commit**

```bash
git commit -am "$(cat <<'EOF'
feat(ui): BrandButton size xl + active:scale tactile feedback

Add size="xl" for the home hero CTA (~72px tall with px-12 py-6 text-base).
Bump size="sm" from 32px to ~40px for touch-safety.
Add active:scale-[0.98] at base level so all variants get tactile feedback
on tap.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2 : Créer `FloatingClose` component

**Files:**
- Create: `components/layout/FloatingClose.tsx`
- Create: `components/layout/__tests__/FloatingClose.test.tsx`

### Step 1 : Écrire le test (TDD)

- [ ] **Step 1 : Créer le fichier de test**

```tsx
// components/layout/__tests__/FloatingClose.test.tsx
// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FloatingClose } from "../FloatingClose";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("FloatingClose", () => {
  it("renders a button with accessible label", () => {
    render(<FloatingClose />);
    const btn = screen.getByRole("button", { name: /fermer/i });
    expect(btn).toBeInTheDocument();
  });

  it("navigates to / when clicked", async () => {
    pushMock.mockReset();
    render(<FloatingClose />);
    const btn = screen.getByRole("button", { name: /fermer/i });
    btn.click();
    expect(pushMock).toHaveBeenCalledWith("/");
  });
});
```

- [ ] **Step 2 : Lancer le test — attendu FAIL (module absent)**

```bash
npm test -- components/layout/__tests__/FloatingClose.test.tsx
```

Attendu : échec d'import `Cannot find module '../FloatingClose'`.

### Step 3 : Implémenter

- [ ] **Step 3 : Créer `components/layout/FloatingClose.tsx`**

```tsx
"use client";
import { useRouter } from "next/navigation";
import { X } from "@phosphor-icons/react/dist/ssr";

export function FloatingClose() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/")}
      aria-label="Fermer et revenir à l'accueil"
      className="fixed top-4 right-4 z-30 grid h-14 w-14 place-items-center rounded-full border border-bs-primary/10 bg-bs-surface/95 text-bs-primary shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-bs-primary hover:text-bs-bg active:scale-95 md:top-6 md:right-6"
    >
      <X size={22} weight="bold" />
    </button>
  );
}
```

- [ ] **Step 4 : Lancer le test — attendu PASS**

```bash
npm test -- components/layout/__tests__/FloatingClose.test.tsx
```

Attendu : 2 tests pass.

- [ ] **Step 5 : Commit**

```bash
git add components/layout/FloatingClose.tsx components/layout/__tests__/FloatingClose.test.tsx
git commit -m "$(cat <<'EOF'
feat(layout): FloatingClose button (fixed top-right, router.push / on click)

Circular ✕ button 56×56px with backdrop blur, aria-label, touch-safe.
Used on all sub-pages (wizard, consultation, /r/:id, history) to return home.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3 : Créer `FloatingHistory` component

**Files:**
- Create: `components/layout/FloatingHistory.tsx`
- Create: `components/layout/__tests__/FloatingHistory.test.tsx`

### Step 1 : Écrire le test (TDD)

- [ ] **Step 1 : Créer le fichier de test**

```tsx
// components/layout/__tests__/FloatingHistory.test.tsx
// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FloatingHistory } from "../FloatingHistory";

describe("FloatingHistory", () => {
  it("renders as a link pointing to /history", () => {
    render(<FloatingHistory />);
    const link = screen.getByRole("link", { name: /historique/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/history");
  });
});
```

- [ ] **Step 2 : Lancer le test — attendu FAIL**

```bash
npm test -- components/layout/__tests__/FloatingHistory.test.tsx
```

### Step 3 : Implémenter

- [ ] **Step 3 : Créer `components/layout/FloatingHistory.tsx`**

```tsx
import Link from "next/link";
import { ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr";

export function FloatingHistory() {
  return (
    <Link
      href="/history"
      aria-label="Ouvrir l'historique clients"
      className="fixed top-4 right-4 z-30 grid h-11 w-11 place-items-center rounded-full border border-bs-primary/10 bg-bs-surface/60 text-bs-primary transition-all duration-200 hover:bg-bs-surface active:scale-95 md:top-6 md:right-6"
    >
      <ClockCounterClockwise size={18} />
    </Link>
  );
}
```

- [ ] **Step 4 : Lancer le test — attendu PASS**

```bash
npm test -- components/layout/__tests__/FloatingHistory.test.tsx
```

- [ ] **Step 5 : Commit**

```bash
git add components/layout/FloatingHistory.tsx components/layout/__tests__/FloatingHistory.test.tsx
git commit -m "$(cat <<'EOF'
feat(layout): FloatingHistory icon link (home only, fixed top-right)

44×44px clock icon link to /history, used only on the home launcher.
Discrete entry point for accessing past consultations.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4 : Retirer `AppHeader` du layout + supprimer le fichier

**Files:**
- Modify: `app/layout.tsx`
- Delete: `components/layout/AppHeader.tsx`

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
      <body className="min-h-[100dvh] bg-bs-bg text-bs-text antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
```

Trois changements :
1. Suppression de `import { AppHeader } from ...`
2. Suppression du `<AppHeader />` et du `<main>{children}</main>` wrapper (chaque page gère son propre main)
3. `min-h-screen` → `min-h-[100dvh]` sur le body

- [ ] **Step 2 : Supprimer `components/layout/AppHeader.tsx`**

```bash
git rm components/layout/AppHeader.tsx
```

- [ ] **Step 3 : Vérifier qu'il n'y a plus aucun import de `AppHeader`**

```bash
grep -rn "AppHeader" --include="*.tsx" --include="*.ts" .
```

Attendu : aucun résultat. Si grep trouve des références, supprimer l'import et la référence au composant dans le fichier concerné.

- [ ] **Step 4 : Vérifier TSC + tests**

```bash
npx tsc --noEmit && npm test
```

Attendu : 0 erreur TSC, 27/27 tests pass (25 existants + 2 nouveaux de Task 2&3).

- [ ] **Step 5 : Commit**

```bash
git add app/layout.tsx
git commit -m "$(cat <<'EOF'
refactor(layout): remove AppHeader from root layout

Kill the persistent top nav — each page now decides its own chrome
(FloatingClose on sub-pages, FloatingHistory on home only). This is
the pivot from website feel to tablet-app feel.

Delete components/layout/AppHeader.tsx (no longer used).

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5 : Refondre `app/page.tsx` en home launcher

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1 : Remplacer le contenu**

```tsx
import { BrandButton } from "@/components/ui/brand-button";
import { FloatingHistory } from "@/components/layout/FloatingHistory";
import { Sparkle } from "@phosphor-icons/react/dist/ssr";

export default function HomePage() {
  return (
    <>
      <FloatingHistory />
      <main className="relative mx-auto flex min-h-[100dvh] max-w-5xl flex-col justify-center px-6 py-16 md:px-10">
        <div className="mb-12 md:mb-16">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-bs-accent">
            Test personnalisé
          </p>
          <h1 className="max-w-4xl font-display text-5xl font-black uppercase leading-[0.95] tracking-tight text-bs-primary md:text-7xl xl:text-[96px]">
            Le protocole<br />qui te correspond
          </h1>
          <p className="mt-6 max-w-xl text-base text-bs-muted md:text-lg">
            Un bilan en 8 étapes, une analyse complète des carences, un protocole de compléments sur-mesure. Envoyé par email en fin de test.
          </p>
        </div>

        <BrandButton href="/consultation/new" variant="primary" size="xl" className="self-start">
          <Sparkle size={22} weight="fill" /> Commencer le test
        </BrandButton>
      </main>
    </>
  );
}
```

Changements clés :
- Suppression de la grille 2 colonnes (1 seul CTA maintenant)
- `<FloatingHistory />` en premier enfant (se positionne fixed au-dessus de main)
- `<main>` flex vertical centré (`min-h-[100dvh] flex-col justify-center`)
- Pas de card "Historique" en dessous — remplacée par l'icône flottante
- CTA unique en `size="xl"` avec icône Sparkle + texte complet "Commencer le test"
- `max-w-5xl` (moins de containment que l'ancien) — home respire plus sur tablette landscape

- [ ] **Step 2 : Vérifier visuellement**

Lancer http://localhost:3000. Attendu :
- Pas de header en haut
- Icône horloge discrète coin haut-droit
- Titre massif "LE PROTOCOLE QUI TE CORRESPOND" centré vertical
- CTA "Commencer le test" pill noir forest visible
- Pas de scroll sur tablette landscape (1280×800)

- [ ] **Step 3 : Vérifier TSC + tests**

```bash
npx tsc --noEmit && npm test
```

Attendu : 0 erreur, 27/27 pass.

- [ ] **Step 4 : Commit**

```bash
git add app/page.tsx
git commit -m "$(cat <<'EOF'
refactor(home): single-CTA launcher with FloatingHistory

Home is now a launcher: one giant CTA (BrandButton size="xl") + discrete
FloatingHistory icon top-right. No more 2-card grid, no more header.
Vertically centered at 100dvh — tablet landscape no scroll.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6 : Injecter `FloatingClose` sur `/consultation/new`

**Files:**
- Modify: `app/consultation/new/page.tsx`

- [ ] **Step 1 : Lire le fichier actuel**

```bash
cat app/consultation/new/page.tsx
```

- [ ] **Step 2 : Remplacer le contenu**

```tsx
import { WizardShell } from "@/components/wizard/WizardShell";
import { FloatingClose } from "@/components/layout/FloatingClose";

export default function Page() {
  return (
    <>
      <FloatingClose />
      <main className="mx-auto max-w-3xl px-6 py-10 md:py-16">
        <header className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-bs-accent">
            Test personnalisé
          </p>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight text-bs-primary md:text-5xl">
            Nouveau bilan
          </h1>
        </header>
        <WizardShell />
      </main>
    </>
  );
}
```

Changement : ajout de `<FloatingClose />` en premier enfant (fixed top-right) + wrapper `<main>` conservé. `<header>` de la page (titre hero) reste, ce n'est pas le nav du site.

- [ ] **Step 3 : Vérifier TSC + tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 4 : Commit**

```bash
git add app/consultation/new/page.tsx
git commit -m "$(cat <<'EOF'
feat(wizard): inject FloatingClose on /consultation/new

Tablet-app navigation pattern: ✕ top-right closes and returns home.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7 : Injecter `FloatingClose` sur `/consultation/[id]` et `/r/[id]`

**Files:**
- Modify: `app/consultation/[id]/page.tsx`
- Modify: `app/r/[id]/page.tsx`

### 7a — Consultation detail

- [ ] **Step 1 : Lire le fichier actuel**

```bash
cat "app/consultation/[id]/page.tsx"
```

- [ ] **Step 2 : Wrapper avec Fragment + FloatingClose**

```tsx
import { notFound } from "next/navigation";
import { getConsultation } from "@/lib/db/queries";
import { ProtocolView } from "@/components/protocol/ProtocolView";
import { FloatingClose } from "@/components/layout/FloatingClose";

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const data = getConsultation(id);
  if (!data) notFound();

  return (
    <>
      <FloatingClose />
      <main>
        <ProtocolView
          consultationId={data.id}
          profile={data.profile}
          protocol={data.protocol}
          dietaryAnalysis={data.dietaryAnalysis}
          analysedAt={data.updatedAt ? data.updatedAt.getTime() / 1000 : undefined}
          emailSentAt={data.emailSentAt}
        />
      </main>
    </>
  );
}
```

### 7b — Public `/r/[id]`

- [ ] **Step 3 : Lire le fichier actuel**

```bash
cat "app/r/[id]/page.tsx"
```

- [ ] **Step 4 : Wrapper idem**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getConsultation } from "@/lib/db/queries";
import { ProtocolView } from "@/components/protocol/ProtocolView";
import { FloatingClose } from "@/components/layout/FloatingClose";

export const dynamic = "force-dynamic";

// Public durable URL carries personal information (first name, age, goals,
// supplement protocol). Prevent search engine indexing and shared caching.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const data = getConsultation(id);
  if (!data) notFound();

  return (
    <>
      <FloatingClose />
      <main>
        <ProtocolView
          consultationId={data.id}
          profile={data.profile}
          protocol={data.protocol}
          dietaryAnalysis={data.dietaryAnalysis}
          analysedAt={data.updatedAt ? data.updatedAt.getTime() / 1000 : undefined}
          emailSentAt={data.emailSentAt}
        />
      </main>
    </>
  );
}
```

- [ ] **Step 5 : Vérifier TSC + tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 6 : Commit**

```bash
git add "app/consultation/[id]/page.tsx" "app/r/[id]/page.tsx"
git commit -m "$(cat <<'EOF'
feat(consultation): inject FloatingClose on detail + public /r/:id

Both report views get the ✕ top-right for tablet-app navigation.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8 : Refresh `app/history/page.tsx`

**Files:**
- Modify: `app/history/page.tsx`

### Step 1 : Lire le fichier actuel

- [ ] **Step 1 : Lire le fichier**

```bash
cat app/history/page.tsx
```

Noter la structure actuelle : probablement un `<Table>` shadcn avec `<TableRow>`. On va :
- Ajouter `<FloatingClose />`
- Élargir les rows (`min-h-[72px]`)
- Rendre la row entière clickable vers le report
- Enlever le `max-w-6xl` trop rigide pour landscape (passer en `max-w-7xl` ou supprimer)

### Step 2 : Patch ciblé

- [ ] **Step 2 : Ajouter l'import FloatingClose en tête**

```tsx
import { FloatingClose } from "@/components/layout/FloatingClose";
```

- [ ] **Step 3 : Wrapper le return avec Fragment + FloatingClose**

Remplacer le `return (...)` par :

```tsx
return (
  <>
    <FloatingClose />
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* ... existing content ... */}
    </div>
  </>
);
```

Ajustement `max-w-6xl` → `max-w-7xl` pour respirer en landscape.

- [ ] **Step 4 : Agrandir les rows de la table**

Localiser chaque `<TableRow>` dans le rendu du `tbody` et ajouter la classe `min-h-[72px] cursor-pointer hover:bg-bs-muted/5` :

```tsx
<TableRow
  key={row.id}
  className="min-h-[72px] cursor-pointer hover:bg-bs-muted/5 transition-colors"
  onClick={() => row.lastConsultationId && router.push(`/consultation/${row.lastConsultationId}`)}
>
  {/* existing cells */}
</TableRow>
```

**IMPORTANT** : le composant a besoin de `useRouter` — vérifier que `import { useRouter } from "next/navigation"` + `const router = useRouter()` soient présents en haut du composant fonctionnel.

**Note** : si la row contient déjà un bouton "Voir le rapport" ou équivalent qui fait la même nav, le `onClick` au niveau row + `cursor-pointer` double l'action — c'est OK (le bouton reste pour l'affordance visuelle, mais toute la row devient tap-friendly).

- [ ] **Step 5 : Vérifier visuellement**

Ouvrir http://localhost:3000/history. Attendu :
- ✕ en haut à droite
- Titre "HISTORIQUE CLIENTS" massif
- Rows plus hautes (72px+), entièrement clickables, hover subtil
- Largeur exploitée à ~1400px au lieu de 1152 avant

- [ ] **Step 6 : Vérifier TSC + tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 7 : Commit**

```bash
git add app/history/page.tsx
git commit -m "$(cat <<'EOF'
feat(history): FloatingClose + tap-optimized rows (72px, click anywhere)

Inject ✕ button top-right. Bump row height to 72px min and make the whole
row clickable to navigate to the latest consultation report. Widen the
container from max-w-6xl to max-w-7xl for landscape breathing room.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9 : Ajuster `WizardShell` (nav buttons sizes)

**Files:**
- Modify: `components/wizard/WizardShell.tsx`

- [ ] **Step 1 : Lire le fichier**

```bash
cat components/wizard/WizardShell.tsx
```

Localiser le bloc des boutons de navigation (généralement juste avant la fermeture du JSX). Il contient actuellement :

```tsx
<BrandButton variant="ghost" disabled={step === 0 || submitting} onClick={() => setStep((s) => s - 1)} size="sm">
  ← Précédent
</BrandButton>
...
<BrandButton onClick={next} size="md">Suivant →</BrandButton>
<BrandButton onClick={submit} disabled={submitting} size="lg">
```

- [ ] **Step 2 : Bump les tailles**

Modifier :

```tsx
<BrandButton
  variant="ghost"
  disabled={step === 0 || submitting}
  onClick={() => setStep((s) => s - 1)}
  size="md"
>
  ← Précédent
</BrandButton>
{step < STEPS.length - 1 ? (
  <BrandButton onClick={next} size="lg">Suivant →</BrandButton>
) : (
  <BrandButton onClick={submit} disabled={submitting} size="lg">
    {submitting ? "Lancer l'analyse…" : "Générer le protocole"}
  </BrandButton>
)}
```

Soit : Précédent `sm`→`md`, Suivant `md`→`lg`, Générer reste `lg`. Tous ≥44px maintenant.

Ajuster aussi l'espacement : si la `<div>` parente a `justify-between`, garder. Si elle est serrée, ajouter `gap-4` pour respirer.

- [ ] **Step 3 : Vérifier TSC + tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 4 : Commit**

```bash
git add components/wizard/WizardShell.tsx
git commit -m "$(cat <<'EOF'
feat(wizard): bump nav button sizes for touch targets

Précédent sm→md (40px→44px), Suivant md→lg (44px→56px), Générer stays lg.
All nav controls now ≥44px tap target.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10 : Ajuster tap targets inputs (shadcn Input)

**Files:**
- Modify: `components/ui/input.tsx` (if needed)

- [ ] **Step 1 : Lire le fichier**

```bash
cat components/ui/input.tsx
```

Le composant shadcn `Input` définit généralement des classes de base. Le problème : `h-10` (40px) est sous le tap-target confortable.

- [ ] **Step 2 : Bump la hauteur de base à h-12 (48px)**

Dans la définition des classes (ligne avec `h-10` ou similaire), remplacer `h-10` par `h-12` et ajuster le padding vertical si nécessaire.

Si le fichier utilise `cn()` avec un string de classes par défaut, localiser la classe `h-10` et remplacer. Exemple typique avant :

```tsx
className={cn(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ...",
  className
)}
```

Après :

```tsx
className={cn(
  "flex h-12 w-full rounded-md border border-input bg-background px-3 py-3 text-sm ...",
  className
)}
```

**Attention** : si d'autres composants (`Select`, `Textarea`) dérivent du même style, vérifier aussi. Pour MVP, Input suffit — les autres restent comme sont si non bloquants.

- [ ] **Step 3 : Vérifier visuellement le wizard**

Ouvrir http://localhost:3000/consultation/new. Les champs Prénom/Nom/Email/Téléphone doivent avoir une hauteur plus confortable (48px au lieu de 40px).

- [ ] **Step 4 : Vérifier TSC + tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 5 : Commit**

```bash
git add components/ui/input.tsx
git commit -m "$(cat <<'EOF'
feat(ui): bump shadcn Input height to h-12 (48px) for touch targets

Default h-10 (40px) is below the recommended 44px tap target for touch.
Used everywhere in the wizard — single change covers all 8 sections.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11 : Smoke test visuel + build + lint

**Files:** N/A (verification)

- [ ] **Step 1 : Dev server smoke test**

Ouvrir dans le browser chaque page à 1280×800 et vérifier :

| Page | Attendu |
|------|---------|
| `/` | Pas de header. ✕ absent. Icône horloge top-right. CTA "Commencer le test" visible. Pas de scroll |
| `/consultation/new` | Pas de header. ✕ top-right. Titre "NOUVEAU BILAN". Wizard étape 1 avec inputs 48px |
| `/history` | Pas de header. ✕ top-right. Rows 72px clickables |
| Un `/consultation/[id]` existant (via historique) | Pas de header. ✕ top-right. ActionBar sticky bottom avec 3 boutons |

Si aucune consultation n'existe en DB, en créer une rapidement via le wizard (remplir minimal → Générer → vérifier le rapport).

- [ ] **Step 2 : Build production**

```bash
npm run build
```

Attendu : `✓ Compiled successfully`. (ANTHROPIC_API_KEY doit être en `.env.local` sinon échec de collect page data — connu.)

- [ ] **Step 3 : Lint**

```bash
npm run lint
```

Attendu : 0 errors.

- [ ] **Step 4 : Tests complets**

```bash
npm test
```

Attendu : 27/27 (25 existants + 2 nouveaux FloatingClose/History).

- [ ] **Step 5 : Si tout passe, aucun commit nécessaire**

S'il faut des fixes (apostrophes, imports, etc.), créer un commit `fix(lint): ...` ciblé et rerun.

---

## Task 12 : Merger sur `main` et pousser

**Files:** N/A (git operation)

- [ ] **Step 1 : Checkout main et merger**

```bash
git checkout main
git merge --no-ff feat/tablet-app-pivot -m "$(cat <<'EOF'
Merge branch 'feat/tablet-app-pivot'

Pivot UX tablette landscape :
- Retrait AppHeader (persistent header)
- FloatingClose (✕ top-right sub-pages) + FloatingHistory (icône home)
- Home launcher single-CTA xl centered
- Touch targets ≥44px partout (BrandButton sm→40px, Input h-12)
- Wizard nav buttons: Précédent md, Suivant/Générer lg

0 breaking change côté data/logique. Responsive 1280×800 first, laptop + portrait + mobile fallback.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 2 : Pousser sur GitHub**

```bash
git push origin main feat/tablet-app-pivot
```

Attendu : `main` pushed with new commits, `feat/tablet-app-pivot` new remote branch.

---

## Self-review (fait par l'auteur du plan)

### Couverture de spec

| Section spec | Task(s) |
|---|---|
| §4 Arc nav (home→sub-pages) | Tasks 2+3 (composants), 4 (retrait header), 5 (home), 6-7-8 (sub-pages wire) |
| §5 Design tokens nouveaux | Task 1 (BrandButton xl + active) |
| §5 Touch targets inputs | Task 10 |
| §5 Touch targets boutons wizard | Task 9 |
| §6.1 Nouveaux composants FloatingClose/History | Tasks 2, 3 |
| §6.2 Modifications layout/home/wizard/consultation/r/history | Tasks 4, 5, 6, 7, 8, 9, 10 |
| §6.3 Suppression AppHeader | Task 4 |
| §7 Responsive strategy | Tests manuels dans Task 11 |
| §8 A11y touch | Couvert dans Tasks 2, 3 (aria-label, focus-visible via BrandButton) |
| §9 Tests | Tasks 2, 3 (tests composants flottants) |
| §10 Success criteria | Vérifié en Task 11 |

Couverture complète. Aucune section non couverte.

### Placeholder scan

Recherche de "TBD", "TODO", "similar to", "fill in" — aucune occurrence.

### Type consistency

`FloatingClose` (no props) et `FloatingHistory` (no props) — cohérents entre les 4 injections (tasks 6, 7a, 7b, 8). `BrandButton` size `xl` utilisé une fois en Task 5 avec la définition exacte de Task 1. Le `useRouter().push("/")` de FloatingClose et celui du Task 8 (`router.push(` `/consultation/${id}` `)`) sont indépendants, aucune collision.

### Scope

12 tasks, chacune produit un commit. Total estimé : 45-90 min en inline execution, ~2h en subagent-driven avec reviews. Scope contenu et cohérent pour un seul plan.

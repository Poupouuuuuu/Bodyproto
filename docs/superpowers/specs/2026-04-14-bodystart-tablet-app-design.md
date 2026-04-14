# BodyStart Kiosque — Pivot UX tablette landscape

**Date**: 2026-04-14
**Statut**: Spec validée — prêt pour plan d'implémentation
**Parent spec**: [`2026-04-14-bodystart-kiosque-redesign-design.md`](./2026-04-14-bodystart-kiosque-redesign-design.md)

---

## 1. Contexte

Après livraison de la refonte complète (cream + forest, scanner, carences, email), retour utilisateur :

> "Le design actuel fait trop 'site internet'. Il faut que ça ressemble à une app mobile horizontale, faite pour tablette tactile. En attendant l'écran tablette, je suis sur laptop — donc adapte tout ça responsive, tablet-first."

La logique métier (schema, prompt, Claude tool, Resend, PDF) reste inchangée. Seul le **chrome UI** et la **responsive strategy** pivotent.

**Contexte d'usage physique réel** : tablette tactile posée sur le comptoir de la boutique (Coignières). Le propriétaire clique à côté du client qui regarde l'écran. Un seul opérateur, un seul client à la fois, flux quasi-linéaire (home → wizard → scanner → rapport → email → retour home).

---

## 2. Objectifs

1. **Retirer la barre d'en-tête persistante** (`AppHeader`) → trop "site web"
2. **Navigation "app" minimaliste** : ✕ flottant sur sub-pages, icône historique discrète sur home uniquement
3. **Layout tablette-first** : cible primaire 1024×768 à 1280×800 (iPad Pro / Surface landscape)
4. **Touch targets** ≥ 44×44 px partout (doigt vs souris)
5. **Responsive gracieux** laptop (fallback desktop) + tablette portrait + mobile (dégradation OK)
6. **Conserver 100% de la logique métier et des tokens de marque**

## 3. Non-objectifs

- Pas de mode PWA / installable (hors scope, pourra s'ajouter)
- Pas de gestes tactiles avancés (swipe back, pinch) — cibler simplicité boutique
- Pas de mode sombre app-wide (le scanner dark mode reste comme signal "moment")
- Pas de refonte `ScannerOverlay` ni `EmailSendDialog` (déjà app-like)
- Pas de master-detail sur le rapport (contenu naturellement linéaire)
- Pas d'auth kiosk (pas de lock screen) — l'app reste accessible directement

---

## 4. Arc de navigation

```
┌─ HOME (launcher) ──────────────────────────┐
│  Cream full-bleed, CTA unique centré       │
│  Icône historique discrète coin haut-droit │
└───────────────┬──────────────────┬──────────┘
                │                  │
      click CTA │                  │ click icône historique
                ▼                  ▼
┌─ WIZARD 8 ÉTAPES ──────┐   ┌─ HISTORIQUE ─────────┐
│  [✕] coin haut-droit    │   │  [✕] coin haut-droit │
│  Pas d'AppHeader        │   │  Rows tap-optimisées │
└─────────┬───────────────┘   └──────────────────────┘
          │ submit              ▲        │
          ▼                     │ click  │ ✕
┌─ SCANNER (dark full) ──┐     │ row    │
│  (inchangé)             │     │        ▼
└─────────┬───────────────┘     │     HOME
          ▼                     │
┌─ RAPPORT ──────────────┐     │
│  [✕] coin haut-droit   │─────┘
│  ActionBar sticky      │
└───────┬────────────────┘
        │ [Envoyer email]
        ▼
┌─ EmailSendDialog (modal) ─┐
│  (inchangé)               │
└───────────────────────────┘
```

Clé : **tout ✕ ramène à home**. Pas de "retour page précédente" (concept web) — concept "fermer, revenir au launcher" (concept app).

---

## 5. Design tokens nouveaux ou ajustés

Tokens couleurs / typo / formes inchangés depuis la spec parente. Ajustements :

### 5.1 Touch targets

| Élément | Avant | Après |
|---------|-------|-------|
| `BrandButton size="sm"` | `px-4 py-2 text-xs` (~32px) | `px-5 py-2.5 text-xs` (~40px) |
| `BrandButton size="md"` | `px-6 py-3 text-[13px]` (~44px) | inchangé |
| `BrandButton size="lg"` | `px-10 py-5 text-sm` (~56px) | inchangé |
| `BrandButton size="xl"` (nouveau) | — | `px-12 py-6 text-base` (~72px) — pour le CTA home |
| Input text/email | `py-3` (~40px) | `py-4` (~48px) |
| Row historique | — | `min-h-[72px]` pour tap target confortable |

### 5.2 Touch feedback

Ajouter à `BrandButton` : `active:scale-[0.98] active:translate-y-0` pour feedback press tactile (le `-translate-y-0.5 hover:` reste pour desktop).

### 5.3 Viewport stability

Home = `min-h-[100dvh]` (pas `h-screen`). Sub-pages = scroll naturel sous le ✕ fixed.

---

## 6. Composants à créer / modifier / supprimer

### 6.1 Nouveaux composants

**`components/layout/FloatingClose.tsx`** — bouton ✕ flottant

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

**`components/layout/FloatingHistory.tsx`** — icône historique top-right du home

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

### 6.2 Modifiés

**`app/layout.tsx`** — retirer `AppHeader` (garder Toaster + body bg) :

```tsx
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

**`app/page.tsx`** — home launcher :

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

**`app/consultation/new/page.tsx`** — ajouter `<FloatingClose />` + ajuster le wrapper :

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

**`app/consultation/[id]/page.tsx`** et **`app/r/[id]/page.tsx`** — wrapper `<FloatingClose />` + `<main>` :

```tsx
return (
  <>
    <FloatingClose />
    <main>
      <ProtocolView ... />
    </main>
  </>
);
```

**`app/history/page.tsx`** — ajouter `<FloatingClose />`, agrandir les rows :

Row height `min-h-[72px]`, click-target large sur toute la row (`<tr>` avec `cursor-pointer hover:bg-bs-muted/5`), supprimer le header (juste `h1` inline + search + CSV). Retirer le `max-w-6xl` — laisser respirer landscape.

**`components/ui/brand-button.tsx`** — ajouter size `xl` + active state :

```tsx
size: {
  sm: "px-5 py-2.5 text-xs",
  md: "px-6 py-3 text-[13px]",
  lg: "px-10 py-5 text-sm",
  xl: "px-12 py-6 text-base gap-3",
},
```

Variant `primary`: ajouter `active:scale-[0.98]`. Idem `secondary`.

**`components/wizard/WizardShell.tsx`** — boutons nav en `size="lg"` :

Actuellement : ghost `sm`, md, lg. Passer `Précédent` en `size="md"` (40-44px), `Suivant` en `size="lg"`, `Générer` reste `size="lg"`. Container `<div>` gains `gap-4` au lieu de `justify-between` sur tablette pour éviter l'éparpillement.

**Sections wizard (`Section0Client`, `Section1Basics`, etc.)** — ajuster les `<Input>` et `<Select>` à `py-4` ou `h-12` pour 48px tap target. (Probablement une config shadcn — à vérifier).

### 6.3 Supprimés

**`components/layout/AppHeader.tsx`** — **à supprimer** (plus utilisé nulle part).

---

## 7. Responsive strategy

### 7.1 Breakpoints Tailwind utilisés

- `<640px` (mobile) : graceful, scroll, rien ne casse mais pas optimal
- `md:` 768px+ : tablette portrait et plus
- `lg:` 1024px+ : tablette landscape — **cible primaire**
- `xl:` 1280px+ : laptop large

### 7.2 Cibles de résolution primaires

| Device | Résolution | Orientation | Status |
|--------|-----------|-------------|--------|
| iPad Pro 11" | 1194×834 | landscape | ✅ cible |
| iPad Air | 1180×820 | landscape | ✅ cible |
| Surface Pro | 1280×800 | landscape | ✅ cible |
| MacBook 13" | 1440×900 | — | ✅ fallback laptop |
| Desktop 1080p | 1920×1080 | — | ✅ fallback large |
| iPhone 14 | 390×844 | portrait | ⚠️ dégradation OK |

### 7.3 Règles cross-device

- **Home hero** : jamais de scroll à la cible tablette landscape (`min-h-[100dvh]` + contenu vertical centered)
- **Wizard** : scroll autorisé (8 étapes peuvent dépasser en hauteur sur tablette), bouton nav toujours visible bas de viewport
- **Rapport** : long scroll naturel, ActionBar sticky bottom garantit accès actions
- **Historique** : rows virtualisées pas nécessaire pour MVP (≤ qq centaines de rows), liste native OK

---

## 8. A11y touch

- **Focus visible** : tous les `BrandButton` et `FloatingClose` ont `focus-visible:ring-2 ring-bs-accent ring-offset-2 ring-offset-bs-bg`
- **Aria labels** explicites sur `FloatingClose` et `FloatingHistory` (icon-only buttons)
- **Tap target size** : ≥ 44×44 px partout
- **Pas de hover-only** : toute info critique doit être visible ou accessible via click/tap

---

## 9. Tests

- **Unit tests Vitest** : aucun test unitaire nouveau nécessaire (composants triviaux, aucune logique)
- **Component tests** :
  - `FloatingClose` : click déclenche `router.push("/")`  
  - `FloatingHistory` : href correct vers `/history`
- **Visual check manuel** : screenshot home à 1280×800, vérifier :
  - Pas d'`AppHeader`
  - CTA centered vertical
  - Icône historique top-right visible mais discrète
  - Couleurs et typo inchangées

---

## 10. Success criteria

1. Plus aucune trace d'`AppHeader` dans le rendu (DOM inspection confirme)
2. Home à 1280×800 : pas de scroll, CTA unique visible au centre
3. Wizard / rapport / historique : tous ont le ✕ en haut à droite, pas de nav top
4. Historique : row tap = ouvre report (toute la row est clickable)
5. Touch targets vérifiés : `getBoundingClientRect().height ≥ 44` pour tous les boutons et inputs interactifs
6. Tests existants (25) continuent à passer
7. Build Next.js + lint + TSC clean
8. Responsiveness manuelle : smoke test home/wizard/report/history sur 390×844 (mobile), 768×1024 (tablet portrait), 1280×800 (tablet landscape), 1920×1080 (laptop)

---

## 11. Risques identifiés

| Risque | Probabilité | Mitigation |
|--------|------------|------------|
| Le ✕ en haut à droite entre en conflit avec un contenu important | Faible | Le z-index à 30 + position fixed le garde au-dessus. Les pages ont déjà du padding top |
| Retirer `AppHeader` casse la navigation test (utilisateur veut switcher de section) | Faible | Le flow kiosque est quasi-linéaire ; ✕→home→icône historique reste 2 taps max |
| Tablet portrait (768×1024) devient moche | Moyenne | Les breakpoints `md:` couvrent déjà portrait. Smoke test à faire |
| Certains inputs shadcn gardent leurs classes de base trop petites pour touch | Moyenne | Audit des inputs existants à faire pendant l'implémentation. Override via `className` au besoin |

---

## 12. Ordre d'implémentation suggéré

1. **Créer `FloatingClose` et `FloatingHistory`** (fondation)
2. **Ajouter size `xl` + `active:` à `BrandButton`** (pré-requis CTA home)
3. **Retirer `AppHeader` du layout + supprimer le fichier**
4. **Refaire `app/page.tsx`** (home launcher avec `FloatingHistory` + CTA xl)
5. **Injecter `FloatingClose`** sur wizard / consultation / r / history
6. **Ajuster wizard** : boutons nav en `lg`, inputs en `py-4`
7. **Ajuster historique** : rows 72px, supprimer max-width rigide
8. **Build + lint + tests + smoke check visual**

## 13. Questions ouvertes

Aucune — tous les choix stratégiques figés lors du brainstorming (home=launcher, sub-pages=✕ close, CTA="Commencer le test", historique uniquement depuis home).

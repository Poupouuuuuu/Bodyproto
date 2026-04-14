# BodyStart Kiosque — Refonte design + Scanner + Email

**Date**: 2026-04-14
**Statut**: Spec validée — prêt pour plan d'implémentation
**Parent spec**: [`2026-04-07-bodystart-supplement-advisor-design.md`](./2026-04-07-bodystart-supplement-advisor-design.md)

---

## 1. Contexte

BodyStart Nutrition est une boutique physique (Coignières, 78310). L'outil existant (`/consultation/new`) est un wizard 8 étapes qui génère un protocole de compléments via Claude API. Il sert actuellement d'outil interne.

**Bascule vers un produit payant en boutique** :
- Le propriétaire propose à chaque client entrant un **test à 5€**
- Le client regarde l'écran pendant que le propriétaire saisit les réponses (mode assistant)
- Un moment "scanner" visuellement marquant pendant les ~8s de génération Claude justifie le prix
- Le rapport final est remis par PDF + envoyé automatiquement par email
- Paiement géré **hors-app** (client paie à la caisse)

**Site e-commerce existant** : https://bodystart.vercel.app/ — définit la charte graphique que l'app doit respecter pour continuité de marque.

---

## 2. Objectifs de cette refonte

1. **Remplacer le design fonctionnel actuel** par une expérience premium alignée sur la charte bodystart.vercel.app
2. **Créer un moment "scanner"** visuellement marquant pendant la génération (silhouette anatomique scannée, rupture dark mode)
3. **Ajouter la visualisation des carences** (bar chart horizontal, sortie enrichie de Claude)
4. **Rebrander la tier list** (Essentiels / Prioritaires / Optimisations)
5. **Ajouter l'envoi email** du rapport (Resend + PDF en pièce jointe + lien web)
6. **Ré-intégrer l'affichage refine Phase 3** (donnée stockée mais jamais affichée aujourd'hui)
7. **Corriger incohérences identifiées** : logo 4.4 MB, champs collectés non utilisés par Claude

## 3. Non-objectifs (hors scope)

- Intégration de paiement dans l'app (Stripe, etc.) — resté out-of-band
- Gestion multi-boutique / multi-utilisateur
- Authentification
- Mode self-service client (pas de kiosque autonome pour cette itération)
- Animation canvas/WebGL pour le scanner (CSS + SVG + Framer Motion suffisent)
- Refonte du logo lui-même (on optimise l'existant)

---

## 4. Arc d'expérience

```
┌─ ACCUEIL ──────────────────────────────────────────────────┐
│  Cream bg, Montserrat 900 "NOUVEAU TEST" CTA pill forest    │
│  Historique clients en lien secondaire                      │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─ WIZARD 8 ÉTAPES ──────────────────────────────────────────┐
│  Cream bg, progression visuelle, champs denses pour opérateur│
│  Typo lisible à 1m pour le client qui regarde               │
└────────────────────────────────────────────────────────────┘
                            │  submit
                            ▼
┌─ SCANNER (dark mode, plein écran, ~8s) ────────────────────┐
│  Silhouette anatomique SVG avec organes visibles            │
│  Ligne de scan sage sweep top→bottom                        │
│  Particules teal qui matérialisent au passage               │
│  Texte status cycle (4 étapes)                              │
│  Progress ring sage discret                                 │
└────────────────────────────────────────────────────────────┘
                            │  génération finie
                            ▼
┌─ RAPPORT (cream bg, retour au clair) ──────────────────────┐
│  1. Hero client (nom, âge, objectifs)                       │
│  2. Carences — bar chart horizontal                         │
│  3. Tier list ESSENTIELS / PRIORITAIRES / OPTIMISATIONS     │
│  4. Timeline journée (6 moments)                            │
│  5. Recap table                                             │
│  6. Warnings + monitoring                                   │
│  7. [Affiner] [PDF] [Email] — barre sticky bas de page      │
└────────────────────────────────────────────────────────────┘
                            │  clic "Envoyer par email"
                            ▼
┌─ EMAIL MODAL + ENVOI RESEND ───────────────────────────────┐
│  Email pré-rempli depuis wizard                             │
│  Preview du mail (branded BodyStart)                        │
│  Envoi → PDF en attachment + lien web durable               │
│  Toast succès, emailSentAt stocké en DB                     │
└────────────────────────────────────────────────────────────┘
```

---

## 5. Design system / tokens

### 5.1 Couleurs

```ts
// Mode clair — utilisé partout sauf scanner
--bs-bg:         #f8f4ee;  // cream chaud (match site)
--bs-surface:    #ffffff;
--bs-primary:    #1a2e23;  // forest deep (match site H1 color)
--bs-accent:     #89a890;  // sage (match color-blocking site)
--bs-highlight:  #2ab0b0;  // teal (accents discrets)
--bs-text:       #111827;  // slate-900
--bs-muted:      #4a5f4c;

// Sévérité carences
--sev-high:      #c05621;  // rouille doux (pas rouge vif)
--sev-mid:       #d4a574;  // orange sable
--sev-low:       #89a890;  // sage

// Mode sombre — SCANNER UNIQUEMENT
--bs-dark-bg:    #0a0e0c;  // near-black forest
--bs-dark-surf:  #111914;
--bs-scan-line:  #89a890;  // sage glow
--bs-scan-data:  #2ab0b0;  // teal data points
```

### 5.2 Typographie

- **Display** : Montserrat 900, uppercase, `tracking: -0.04em`, responsive `text-5xl md:text-7xl xl:text-[100px]`
- **Body** : Inter 400/500/600
- **Mono** : JetBrains Mono — réservé aux doses (`400 mg`), moments (`07:30`), timers scanner

### 5.3 Formes & motion

- **Boutons** : `rounded-full`, `px-8 py-4`, uppercase, `tracking-widest`
- **Cards** : `rounded-2xl` (secondaires) → `rounded-3xl` (hero)
- **Hover** : `-translate-y-1 transition-all duration-300`
- **Motion** : Framer Motion spring `(stiffness: 100, damping: 20)` en standard
- **Easing CSS** : `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out)

### 5.4 Icônes

- `@phosphor-icons/react` (installé, `strokeWidth: 1.5` partout)
- Pas d'emoji dans le code (le schéma Protocol en a un par supplément — on les garde car c'est de la data, pas du chrome UI)

---

## 6. Le scanner (pièce maîtresse)

### 6.1 Déclenchement

- Overlay plein écran activé dès `submit` du wizard
- Reste affiché jusqu'à la réception de la réponse Claude (~8s typique, jusqu'à 15s worst-case)
- En cas d'erreur API : fade-out propre + toast erreur explicite

### 6.2 Composition visuelle

```
    ┌─────────────────────────────────────┐
    │  (fond #0a0e0c, grain subtil 2%)     │
    │                                      │
    │         ┌─── progress ring ───┐     │
    │         │                      │     │
    │         │    [SILHOUETTE]      │     │
    │         │    - outline sage    │     │
    │         │    - organes visibles│     │
    │         │    - scan line sage  │     │
    │         │      qui sweep       │     │
    │         │                      │     │
    │         │    ·  · ·    ·       │     │ ← particules teal
    │         │   ·    ·              │     │   matérialisent
    │         └──────────────────────┘     │
    │                                      │
    │     ANALYSE DU PROFIL...             │ ← Montserrat 700
    │     [cycle toutes les ~2s]           │   uppercase tracking
    └─────────────────────────────────────┘
```

### 6.3 Silhouette anatomique (version "WOW")

- **SVG vectoriel**, contour sage fin (stroke 1.5)
- **Organes visibles** en glyphes minimalistes translucides : cerveau, thyroïde, cœur, foie, estomac/intestins, articulations (genoux + épaules), muscles principaux
- **Quand la ligne de scan passe** sur un organe :
  - Le glyphe organe pulse (opacité 30% → 80% → 30%)
  - 3-5 particules teal apparaissent autour avec spring out
  - Les particules restent visibles (mémoire du scan) jusqu'à la fin
- Pas photo-réaliste — vibe Apple Health / anatomical diagram stylisé

### 6.4 Ligne de scan

- Barre horizontale gradient `transparent → sage → transparent`
- Largeur = largeur silhouette + 20px de chaque côté
- Sweep vertical `y: 0 → 100%` en `2s`, infinite, `ease-in-out`
- Glow CSS `box-shadow: 0 0 40px rgba(137, 168, 144, 0.6)`

### 6.5 Texte status

Cycle (2s par étape, 8s total en moyenne) :
1. `ANALYSE DU PROFIL…`
2. `IDENTIFICATION DES CARENCES…`
3. `CALIBRATION DU PROTOCOLE…`
4. `FINALISATION…`

Si la génération dure > 8s, le dernier reste affiché.
Si > 15s : apparition discrète d'un sous-texte sage `Prenant un peu plus de temps que d'habitude…`

### 6.6 Progress ring

- SVG circle autour de la silhouette (r=180px environ)
- Stroke sage 1.5, dasharray animé (pas lié au vrai % mais visuel de rotation/rempli)
- Rotation lente infinite

### 6.7 Implémentation

- Client Component isolé (`'use client'` obligatoire — animation continue)
- Framer Motion pour la coordination (scan line, particules, pulse organes)
- SVG inline pour la silhouette (pas d'image externe)
- Memoized (React.memo) pour éviter re-renders du parent
- Respect de `prefers-reduced-motion` : fallback à un simple progress bar + texte status

---

## 7. Carences — visualisation

### 7.1 Format : bar chart horizontal

```
MAGNÉSIUM              ████████░░░░  Déficit élevé
Stress + peu de feuillus              Couvert par : [Mg bisglycinate] [Complexe stress]

VITAMINE D3            ██████░░░░░░  Déficit moyen
Peu d'exposition hivernale            Couvert par : [D3 + K2]

OMÉGA-3 EPA/DHA        █████░░░░░░░  Sous-optimal
Peu de poissons gras                  Couvert par : [Oméga-3]

ZINC                   ███░░░░░░░░░  Léger
Régime végétal                        Couvert par : [Zinc bisglycinate]
```

### 7.2 Structure d'une ligne

- **Nutriment** : Montserrat 700 uppercase, `text-lg`
- **Barre** : largeur 320px, hauteur 12px, rounded-full
  - Remplissage = `severity` mappé (high=100%, moderate=66%, low=33%)
  - Couleur = `--sev-high` / `--sev-mid` / `--sev-low`
- **Label sévérité** : Inter 500, text-sm, couleur matching
- **whyAtRisk** : Inter 400, text-sm, `text-bs-muted`, italique léger
- **addressedBy** : chips pill sage outline, liées par ancre vers la card supplément correspondante

### 7.3 Données nécessaires

Nouveau champ sur `Protocol` :
```ts
deficiencies: Array<{
  nutrient: string;
  severity: "low" | "moderate" | "high";
  whyAtRisk: string;
  addressedBy: string[];  // IDs des suppléments du protocole
}>
```

Rempli par Claude via l'extension du tool `emit_protocol` (voir §11).

---

## 8. Tier list suppléments

### 8.1 Mapping (UI only)

Le schéma DB garde `tier: 1 | 2 | 3`. Côté UI uniquement :

| Tier DB | Libellé affiché | Couleur bande | Style card |
|---------|----------------|---------------|------------|
| 1 | **ESSENTIELS** | Forest `#1a2e23` | Grande, premium, bordure or subtle `rgba(137,168,144,0.3)` |
| 2 | **PRIORITAIRES** | Sage `#89a890` | Standard, bordure cream |
| 3 | **OPTIMISATIONS** | Cream foncé `#e8e1d3` | Compacte |

### 8.2 Anatomie d'une card supplément

```
┌─ Card (rounded-2xl, bordure selon tier) ────────────────────┐
│ [Emoji]  MAGNÉSIUM BISGLYCINATE          [ESSENTIELS]       │
│          Bisglycinate · 400 mg · Soir (30 min avant coucher)│
│                                                              │
│          ─ Pourquoi cette forme                              │
│          Bisglycinate = meilleure assimilation, moins laxatif│
│                                                              │
│          ─ Pourquoi ce moment                                │
│          Soir : améliore le sommeil + recharge nocturne      │
│                                                              │
│          ─ Ce que ça t'apporte                               │
│          Sommeil, récupération musculaire, baisse du stress  │
│                                                              │
│          Indicateurs : [Meilleur sommeil] [Moins de crampes] │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 Composition de la section tier list

```
ESSENTIELS                                          2 suppléments
───────────────────────────────────────────────────────────────
[card 1]
[card 2]

PRIORITAIRES                                        3 suppléments
───────────────────────────────────────────────────────────────
[card 3] [card 4]
[card 5]

OPTIMISATIONS                                       2 suppléments
───────────────────────────────────────────────────────────────
[card 6] [card 7]
```

Separators sont des `border-t border-bs-primary/10` + label bande en typo display.

---

## 9. Timeline journée

### 9.1 Source de données

Le schema existant est un peu hétérogène :
- `supplement.timing` a **7 valeurs** : `morning_fasted`, `morning_meal`, `midday`, `pre_workout`, `post_workout`, `evening`, `bedtime`
- `dailySchedule` a **6 clés** : `morning` (fusion fasted + meal), `midday`, `preWorkout`, `postWorkout`, `evening`, `bedtime`

On garde cette structure (pas de refacto du schema data pour cette refonte).

### 9.2 Visuel

- **6 colonnes** desktop correspondant aux 6 clés de `dailySchedule` :
  `MATIN · MIDI · PRÉ-ENTRAÎNEMENT · POST-ENTRAÎNEMENT · SOIR · COUCHER`
- Chaque colonne affiche les chips des suppléments (référencés par `id`) présents dans ce bucket
- Icônes Phosphor par colonne (`Sunrise`, `Sun`, `Barbell`, `ArrowClockwise`, `Moon`, `Bed`)
- **Responsive** : 2 cols sur mobile, 3 sur tablette, 6 sur desktop
- Fond cream, bordures `divide-x` forest/10, typo display uppercase pour les headers de colonne
- Click sur un chip supplément → scroll ancre vers la card supplément correspondante dans la tier list

---

## 10. Envoi email (nouvelle feature)

### 10.1 Provider : Resend

**Justification** :
- 100 emails/jour gratuits (ordre de grandeur : 50-80 clients/jour max en boutique physique)
- SDK Node-native + support React Email
- Setup : 10 min (signup, API key, vérification domaine)
- Alternatives écartées :
  - SendGrid : plus lourd, overkill
  - Nodemailer + SMTP : friction déploiement, pas de template natif
  - Postmark : payant d'emblée

### 10.2 Setup technique

```bash
npm install resend @react-email/components
```

Env var :
```
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=hello@bodystart.fr  # après vérif domaine
```

Déclaré `required` dans `lib/env.ts`.

### 10.3 Template email (React Email)

Fichier : `lib/email/templates/ProtocolEmail.tsx`

```
┌─ Header cream bg ──────────────────────┐
│ [logo BodyStart forest]                 │
└────────────────────────────────────────┘
│                                         │
│  Bonjour Thomas,                        │
│                                         │
│  Voici votre protocole personnalisé     │
│  BodyStart Nutrition, établi suite à    │
│  votre consultation du 14 avril 2026.   │
│                                         │
│  [CTA pill forest : Consulter en ligne] │
│  [petit texte : PDF en pièce jointe]    │
│                                         │
│  Récap en 3 points :                    │
│  • 2 suppléments essentiels             │
│  • 3 prioritaires                       │
│  • 2 optimisations optionnelles         │
│                                         │
│  Questions ? Revenez nous voir en       │
│  boutique ou répondez à cet email.      │
│                                         │
│  L'équipe BodyStart                     │
│                                         │
├─ Footer forest bg ──────────────────────┤
│ 8 Rue du Pont des Landes, 78310 Coignières │
│ 07 61 84 75 80                          │
│ bodystart.vercel.app                    │
└────────────────────────────────────────┘
```

### 10.4 Flow de l'envoi

1. Client clique "Envoyer par email" sur le rapport
2. Modal s'ouvre avec :
   - Email pré-rempli depuis `profile.client.email`
   - Champ modifiable (au cas où)
   - Checkbox "Joindre le PDF" (coché par défaut)
   - Preview mini du template
   - Bouton "Envoyer"
3. Sur clic :
   - Loader sur le bouton
   - Appel `POST /api/send-protocol-email/:consultationId`
   - Route serveur : génère PDF via Puppeteer (réutilise l'existant), appelle Resend avec template + attachment
   - Update `consultations.emailSentAt = now()`
   - Response → toast succès + modal se ferme
4. Erreurs gérées : clé manquante, domaine non vérifié, email invalide, quota atteint → toasts spécifiques

### 10.5 Lien web durable

URL publique `/r/:consultationId` (vue read-only du rapport, pas d'auth, lien non-guessable). Le lien envoyé dans l'email pointe là. Durée de vie : infinie pour MVP (ajoutable plus tard : expiration 30j).

---

## 11. Changements data model

### 11.1 Drizzle schema (`lib/db/schema.ts`)

Ajouter à `consultations` :
```ts
emailSentAt: integer("email_sent_at", { mode: "timestamp" }),
```

Migration Drizzle à générer (`npx drizzle-kit generate`).

### 11.2 Schéma Protocol (`lib/schemas/protocol.ts`)

Ajouter :
```ts
export const DeficiencySchema = z.object({
  nutrient: z.string(),
  severity: z.enum(["low", "moderate", "high"]),
  whyAtRisk: z.string(),
  addressedBy: z.array(z.string()),
});

export const ProtocolSchema = z.object({
  summary: z.string(),
  deficiencies: z.array(DeficiencySchema),  // NOUVEAU
  supplements: z.array(SupplementSchema),
  dailySchedule: /* ... existant ... */,
  warnings: z.array(z.string()),
  monitoring: /* ... existant ... */,
});
```

### 11.3 Claude tool schema (`lib/claude/protocolTool.ts`)

Ajouter à `input_schema.properties` :
```json
"deficiencies": {
  "type": "array",
  "description": "Les carences alimentaires et micronutritionnelles identifiées à partir du profil. Chaque carence doit être couverte par au moins un supplément du protocole.",
  "items": {
    "type": "object",
    "required": ["nutrient", "severity", "whyAtRisk", "addressedBy"],
    "properties": {
      "nutrient": { "type": "string" },
      "severity": { "enum": ["low", "moderate", "high"] },
      "whyAtRisk": { "type": "string" },
      "addressedBy": { "type": "array", "items": { "type": "string" } }
    }
  }
}
```

Ajouter `"deficiencies"` à `required`.

### 11.4 Prompt système (`prompts/system.md`)

Ajouter section dédiée :
```markdown
### CARENCES

Identifie 3 à 6 carences probables (alimentaires ou micronutritionnelles) à partir du profil. Pour chacune :
- `nutrient` : nom clair (ex: "Magnésium", "Vitamine D3", "Oméga-3 EPA/DHA")
- `severity` : "high" si déficit probable confirmé par plusieurs signaux (symptômes + alimentation + mode de vie), "moderate" si déficit plausible, "low" si sous-optimal non critique
- `whyAtRisk` : 1 phrase courte factuelle (ex: "Stress élevé combiné à peu de légumes feuillus")
- `addressedBy` : IDs des suppléments du protocole qui couvrent cette carence (référence kebab-case)

Chaque carence doit être couverte par **au moins un** supplément recommandé. Si aucun supplément ne couvre une carence identifiée, ajoute-le au protocole (minimum tier 2).
```

### 11.5 Refine Phase 3 — ré-intégration affichage

Aujourd'hui : `dietaryAnalysisJson` contient `{ description, narrative }`, stocké mais jamais affiché.

Ajout : sur `/consultation/[id]` après refine, afficher un **bloc "Analyse alimentaire"** au-dessus des carences, montrant :
- Le narrative Claude (markdown supporté)
- Badge "Analysé le {date}"
- Lien "Modifier l'analyse" → renvoie vers `/refine`

### 11.6 Champs wizard non-utilisés

- `health.bloodwork` et `supplements.pastBadExperiences` sont collectés mais passés en raw JSON à Claude. **Aucun changement de code nécessaire** — Claude les lit dans le JSON complet du profil. On ajoute juste au prompt système une instruction explicite : "Si `health.bloodwork` est non-vide, en tenir compte dans les recommandations. Si `supplements.pastBadExperiences` est non-vide, éviter les formes / molécules mentionnées."

---

## 12. Composants UI à créer / refactorer

### 12.1 Nouveaux composants

| Composant | Fichier | Client/Server |
|-----------|---------|---------------|
| `ScannerOverlay` | `components/scanner/ScannerOverlay.tsx` | Client |
| `AnatomicalSilhouette` | `components/scanner/AnatomicalSilhouette.tsx` | Client (SVG inline + Framer) |
| `DeficienciesViz` | `components/protocol/DeficienciesViz.tsx` | Server (sauf animations entrée = Client wrapper) |
| `TierSection` | `components/protocol/TierSection.tsx` | Server |
| `EmailSendDialog` | `components/protocol/EmailSendDialog.tsx` | Client |
| `DietaryAnalysisBlock` | `components/protocol/DietaryAnalysisBlock.tsx` | Server |
| `ProtocolEmail` (template) | `lib/email/templates/ProtocolEmail.tsx` | React Email |
| `PublicReport` | `app/r/[id]/page.tsx` | Server |

### 12.2 Refactorés

| Composant | Fichier | Changement |
|-----------|---------|-----------|
| `SupplementCard` | `components/protocol/SupplementCard.tsx` | Refonte visuelle tier premium |
| `ProtocolView` | `components/protocol/ProtocolView.tsx` | Recomposition : hero + carences + tier list + timeline + recap |
| `DailyTimeline` | `components/protocol/DailyTimeline.tsx` | Refresh visuel cream/forest |
| `WizardShell` | `components/wizard/WizardShell.tsx` | Déclenche `ScannerOverlay` au submit |
| `HomePage` | `app/page.tsx` | Refonte complète (hero + 2 CTA premium) |
| `HistoryPage` | `app/history/page.tsx` | Refresh visuel léger |
| PDF template | `app/consultation/[id]/print/page.tsx` | Refonte pour matcher le nouveau rapport |

### 12.3 Inchangés

- Formulaire wizard (logique + validation Zod) — on refresh uniquement le chrome visuel
- Routes API `/api/generate-protocol`, `/api/refine-protocol` (étendus pour nouveaux champs mais logique identique)
- Couche DB (`lib/db/queries.ts`) — ajouts seulement

---

## 13. Infrastructure & dépendances

### 13.1 Nouveaux packages

```json
"resend": "^4.x",
"@react-email/components": "^0.x",
"@phosphor-icons/react": "^2.x"
```

### 13.2 Env vars à ajouter

```
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=hello@bodystart.fr
```

### 13.3 Optimisations hors-scope-animation

- Logo 4.4 MB → à convertir en SVG optimisé (ou WebP ≤50 KB) dans un des premiers tickets
- `next.config.ts` vérifier que l'optimisation d'image est activée pour les assets futurs

---

## 14. Accessibilité

- **Scanner** : respect `prefers-reduced-motion` → fallback progress bar + texte status (pas d'animation infinie)
- **Contraste** : toutes les combos cream/forest testées ≥ WCAG AA (ratio > 7:1 pour le forest sur cream)
- **Focus** : tous les boutons pill ont `focus-visible:ring-2 ring-bs-accent ring-offset-2`
- **Screen readers** : scanner annonce "Génération du protocole en cours" via `aria-live="polite"`

---

## 15. Performance

- Silhouette SVG inline (pas d'HTTP extra)
- Particules scanner limitées à ~40 simultanées max (gérées par AnimatePresence + timeout)
- `React.memo` sur `ScannerOverlay` (pas de re-render parent)
- Images produits (si utilisées un jour) → `next/image` + dimensions explicites
- PDF Puppeteer : reste sur le serveur, pas d'impact client

---

## 16. Tests

- Unit tests Vitest pour :
  - `tierLabel` mapping function
  - `severityColor` mapping
  - Email template rendering (snapshot)
- Component tests :
  - `ScannerOverlay` monte/démonte proprement, respect reduced-motion
  - `DeficienciesViz` gère 0, 1, 5 carences sans casser le layout
  - `EmailSendDialog` validation email + submit flow
- Pas de E2E pour cette itération (overhead > valeur, MVP)

---

## 17. Success criteria

Critères concrets pour déclarer la refonte "live" :

1. Un nouveau test de bout en bout produit : wizard rempli → scanner s'affiche 8s (ou jusqu'à complete) → rapport s'affiche avec les 3 tiers, la viz carences, la timeline → bouton email envoie effectivement un mail avec PDF → lien web `/r/:id` accessible.
2. Visual diff manuel : la home, le wizard, le rapport, l'email ressemblent à une extension naturelle de bodystart.vercel.app (même typo, couleurs, pill buttons).
3. Le scanner ne laggue pas sur un laptop moyen (60fps stable, pas de layout thrashing).
4. Tests unitaires passent (`npm test`).
5. Build Next.js passe (`npm run build`), aucune erreur console au runtime.
6. `npx drizzle-kit generate` produit une migration propre pour `emailSentAt`.
7. Claude génère systématiquement le champ `deficiencies` (test avec 3 profils variés).

---

## 18. Risques identifiés

| Risque | Probabilité | Mitigation |
|--------|------------|------------|
| Silhouette anatomique demande trop d'effort pour un résultat "OK" | Moyenne | Commencer par version minimaliste (contour + organes en glyphes simples), itérer seulement si temps dispo |
| Resend bloqué par spam si domaine pas vérifié | Moyenne | Utiliser le domaine `onboarding@resend.dev` en dev ; vérif domaine bodystart.fr en prod |
| Claude n'émet pas `deficiencies` malgré tool schema | Faible | `tool_choice: forced` déjà en place — si problème, ajouter validation Zod avec retry 1x |
| Le scanner paraît kitsch au lieu de premium | Moyenne | Itérer avec l'utilisateur sur une preview dès qu'il est fonctionnel, avant d'ajouter les fioritures |
| Logo 4.4 MB ralentit chaque page | Forte (existant) | Conversion SVG ou WebP en premier ticket |

---

## 19. Ordre d'implémentation suggéré (à affiner dans le plan)

1. **Foundation** : design tokens CSS, Tailwind config alignée, Montserrat font import, logo optimisé
2. **Home + Wizard refresh** : poser le langage visuel sur les pages existantes
3. **Scanner** : composant isolé, testable indépendamment avant intégration
4. **Schéma Protocol étendu** : Protocol.deficiencies, tool schema, prompt système mis à jour
5. **Rapport redesigné** : carences viz, tier list, supplement cards, timeline refresh
6. **Phase 3 refine réaffichée**
7. **Email Resend** : template, route API, dialog, lien public /r/:id
8. **PDF template refait** pour matcher
9. **History + polish** : refresh léger
10. **Tests + build + commit**

---

## 20. Questions ouvertes (à trancher au moment de l'implémentation)

Aucune à ce stade — tous les choix stratégiques sont figés.

Si en cours d'implémentation une question émerge, elle sera remontée à l'utilisateur plutôt que tranchée unilatéralement.

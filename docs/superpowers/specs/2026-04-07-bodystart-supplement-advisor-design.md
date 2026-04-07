# BodyStart Nutrition — Supplement Advisor

**Design document**
Date : 2026-04-07
Version : 1.0

---

## 1. Contexte et objectif

Adam travaille dans une boutique de compléments alimentaires (BodyStart Nutrition). Il souhaite un outil métier local pour générer, à partir d'un questionnaire client, un protocole personnalisé de compléments alimentaires, et remettre au client un PDF professionnel brandé à la boutique.

L'outil s'appuie sur un prompt système détaillé déjà rédigé (`supplement-advisor-prompt.md`) qui pilote un assistant nutritionnel Claude en trois phases :

1. **Phase 1** — collecte du profil client via formulaire structuré.
2. **Phase 2** — génération d'un protocole de compléments avec forme moléculaire, dose, timing, justification scientifique.
3. **Phase 3** (optionnelle) — analyse d'une journée alimentaire type et ajustements fins.

**Livrable principal** : un PDF clair, précis, brandé BodyStart, destiné au client final.

### Utilisateur cible

Un seul utilisateur : Adam, opérateur derrière le comptoir ou en consultation. Aucune authentification. L'app tourne en local sur son poste.

### Principes directeurs

- **Crédibilité scientifique** : le protocole généré ne propose pas de supplément inutile. Le prompt force Claude à prioriser selon profil, budget, alimentation. On ne touche pas à ça.
- **PDF first-class** : le rendu PDF est un livrable central, pas une fonction secondaire.
- **Données clients protégées** : stockage local uniquement, consentement RGPD explicite, droit à l'effacement.
- **Scope v1 minimaliste** : pas de cloud, pas de multi-postes, pas d'envoi email automatique.

---

## 2. Parcours utilisateur

1. Adam lance l'app, arrive sur un écran d'accueil BodyStart avec deux actions : **Nouvelle consultation** / **Historique clients**.
2. **Nouvelle consultation** → wizard en 7 étapes (client + les 6 sections du prompt). Validation progressive.
3. Dernière étape : récapitulatif + bouton **Générer le protocole**.
4. Claude génère le protocole en streaming. Une page résultat s'affiche progressivement : summary, timeline journée, cards suppléments, tableau récap, avertissements, suivi.
5. Adam peut optionnellement lancer la **Phase 3 — analyse alimentaire** : chat où il décrit la journée type du client, Claude propose des ajustements au protocole existant, Adam applique ou non.
6. Adam clique **Exporter PDF** → un PDF A4 brandé est généré et téléchargé.
7. Si le client a donné son consentement, le profil et le protocole sont sauvegardés en base locale.
8. Depuis **Historique clients** : recherche, réouverture d'un protocole passé, régénération PDF, export CSV de la liste email, suppression d'un client.

---

## 3. Stack technique

- **Framework** : Next.js 15 (App Router), TypeScript, React 19
- **UI** : Tailwind CSS + shadcn/ui + Lucide icons
- **Formulaires** : React Hook Form + Zod
- **Base de données** : SQLite locale (fichier `bodystart.db`) via better-sqlite3 + Drizzle ORM
- **IA** : Anthropic SDK officiel (`@anthropic-ai/sdk`), modèle `claude-sonnet-4-6`, streaming activé, tool use forcé pour obtenir un JSON structuré
- **PDF** : Puppeteer — rendu d'un template HTML/Tailwind en A4 print
- **Tests** : Vitest (unitaires et intégration), Playwright (un e2e minimal)

### Structure des dossiers

```
bodystart-advisor/
├── app/
│   ├── page.tsx                          # accueil
│   ├── consultation/
│   │   ├── new/page.tsx                  # wizard
│   │   └── [id]/page.tsx                 # page résultat protocole
│   ├── history/page.tsx                  # liste clients
│   └── api/
│       ├── generate-protocol/route.ts    # appel Claude, streaming
│       ├── refine-protocol/route.ts      # phase 3
│       └── export-pdf/[id]/route.ts      # génération PDF puppeteer
├── components/
│   ├── wizard/                           # un composant par section
│   ├── protocol/                         # SupplementCard, DailyTimeline, RecapTable
│   └── ui/                               # shadcn
├── lib/
│   ├── claude/                           # client Anthropic, prompt système, schémas Zod
│   ├── db/                               # schema Drizzle, migrations, queries
│   └── pdf/                              # template React pour PDF
├── public/
│   └── logo.png                          # logo BodyStart (copié depuis C:\Users\Adam\Desktop\Bodystart\Mes logos\Logo.png)
├── .env.local                            # ANTHROPIC_API_KEY
└── bodystart.db                          # créé au premier lancement
```

### Flux de génération du protocole

```
Wizard (React Hook Form)
  → validation Zod par section
  → POST /api/generate-protocol { profile: ClientProfile }
  → server: construit messages = [system prompt, user message avec profile JSON]
  → Anthropic SDK avec tools=[emit_protocol], tool_choice forcé sur emit_protocol
  → stream renvoyé vers le client
  → client parse le JSON au fil de l'eau, affiche progressivement
  → à la fin : validation Zod finale
  → sauvegarde SQLite si consent
  → redirect vers /consultation/[id]
```

Le `tool_use` forcé garantit un JSON structuré valide : si Claude dévie, le SDK lève une erreur et on retry (max 2 tentatives avant d'afficher une erreur utilisateur lisible).

---

## 4. Modèle de données

### Schéma SQLite (Drizzle)

```ts
// clients
{
  id: string (uuid)
  firstName: string
  lastName: string
  email: string
  phone: string | null
  consentGiven: boolean          // case RGPD cochée avant sauvegarde
  createdAt: Date
}

// consultations
{
  id: string (uuid)
  clientId: string               // FK → clients.id
  profileJson: string            // JSON sérialisé du profil complet (sections 1-6)
  protocolJson: string           // JSON sérialisé du protocole Claude
  dietaryAnalysisJson: string | null   // phase 3 si effectuée
  createdAt: Date
  updatedAt: Date
}
```

Index sur `clients.email` et `consultations.clientId`.

### Schéma Zod du Protocol (tool schema pour Claude)

```ts
Protocol = {
  summary: string                       // intro narrative 2-3 phrases, markdown
  supplements: Supplement[]
  dailySchedule: {
    morning: string[]                   // ids de suppléments
    midday: string[]
    preWorkout: string[]
    postWorkout: string[]
    evening: string[]
  }
  warnings: string[]                    // disclaimers personnalisés
  monitoring: {
    reviewAfterWeeks: number
    indicators: string[]
    bloodTests: string[]
  }
}

Supplement = {
  id: string                            // slug unique, ex: "magnesium-bisglycinate"
  emoji: string
  name: string                          // "Magnésium"
  form: string                          // "Bisglycinate"
  formRationale: string                 // pourquoi cette forme, markdown court
  doseValue: number
  doseUnit: "mg" | "g" | "UI" | "µg"
  timing: "morning_fasted" | "morning_meal" | "midday" | "pre_workout" | "post_workout" | "evening" | "bedtime"
  timingRationale: string
  duration: string                      // "en continu" | "cure 8 semaines" | cyclique | etc.
  justification: string                 // pourquoi pour CE profil
  interactions: string[]
  successIndicators: string[]
  tier: 1 | 2 | 3                       // priorité budgétaire
  category: "foundation" | "performance" | "recovery" | "beauty" | "hormonal" | "digestive"
}
```

### Schéma Zod du ClientProfile

Reprend exactement la structure du prompt (sections 1 à 6) avec enums typés pour tout ce qui est fermé (sexe, niveau d'activité, régime, tranches de budget…), strings libres pour le reste (médicaments, allergies, bilan sanguin en notes).

---

## 5. UI / Écrans

### 5.1 Accueil

Header avec logo BodyStart + nom. Deux cards centrales :
- **Nouvelle consultation** → lien vers `/consultation/new`
- **Historique clients** → lien vers `/history`

Compteur discret en pied : "X consultations réalisées".

### 5.2 Wizard (7 étapes)

- Barre de progression collante en haut
- Une section = un composant indépendant dans `components/wizard/`
- Validation Zod par section, impossible d'avancer si champs requis manquants
- Boutons Précédent / Suivant
- **Section 0 — Client** : prénom, nom, email, téléphone (optionnel), date de consultation (pré-remplie), case **« Le client consent à la conservation de ses données pour un suivi personnalisé »**
- **Sections 1-6** : reprennent strictement les questions du prompt (données de base, objectifs, mode de vie, alimentation, santé, compléments actuels)
- Dernière étape : récap lisible + bouton **Générer le protocole**

### 5.3 Page résultat protocole (`/consultation/[id]`)

- En-tête : nom client + date + actions (Exporter PDF / Affiner avec analyse alimentaire / Retour historique)
- **Bloc summary** narratif (markdown rendu)
- **Timeline journée** en 5 colonnes : 🌅 Matin / 🥗 Midi / 🏋️ Pré-train / 🔄 Post-train / 🌙 Soir. Chaque supplément = pastille cliquable qui scrolle vers sa card détaillée.
- **Liste détaillée des suppléments** en cards dépliables : forme, dose, formRationale, timing + justification, durée, interactions, indicateurs de succès. Tier visible en badge coloré.
- **Tableau récapitulatif** trié par tier puis par timing.
- **Bloc avertissements** (warnings personnalisés).
- **Bloc suivi** (reviewAfterWeeks, indicators, bloodTests).
- Barre d'actions collante en bas.

### 5.4 Phase 3 — Analyse alimentaire

Modal plein écran ou page dédiée (`/consultation/[id]/refine`) :
- Interface chat minimal : Adam tape la journée type du client
- Claude répond avec analyse macros estimée, lacunes identifiées, ajustements proposés
- Les ajustements sont visualisés comme un **patch** : "Magnésium 400mg → 300mg (épinards + amandes couvrent 100mg)"
- Bouton **Appliquer les ajustements** → met à jour le protocole en base et régénère la page résultat

### 5.5 PDF exporté (A4, print-ready)

- **Page 1** : en-tête logo BodyStart + "Protocole personnalisé pour [Prénom Nom]" + date + summary + timeline visuelle
- **Pages 2-3** : détail de chaque supplément, un bloc par supplément (forme, dose, timing, justification, interactions, durée)
- **Page 4** : tableau récapitulatif + avertissements + suivi + pied de page BodyStart Nutrition (adresse, téléphone à configurer dans `.env.local`)
- Rendu via Puppeteer qui imprime une route interne `/consultation/[id]/print` utilisant le même moteur de rendu que l'écran résultat, avec une feuille de style dédiée print.

### 5.6 Historique clients (`/history`)

- Table : nom, email, téléphone, date dernière consultation, nombre de consultations
- Recherche par nom ou email (filter client-side)
- Tri cliquable par colonne
- Clic sur une ligne → réouvre la dernière consultation du client
- Bouton **Exporter CSV** (export de la liste email pour campagnes)
- Action de ligne **Supprimer** (droit à l'effacement RGPD, confirmation requise)

### 5.7 Design language

Sobre, pro, crédible santé. Palette provisoire : vert profond (BodyStart) / blanc / gris foncé. shadcn/ui par défaut. Charte finale ajustée une fois le logo intégré.

---

## 6. Tests

- **Vitest unitaires** : validation Zod du schéma Protocol et ClientProfile, queries Drizzle, helpers de transformation (grouping timeline, tri par tier, conversion vers format PDF)
- **Tests d'intégration API** : mock de l'Anthropic SDK, on vérifie que `/api/generate-protocol` construit le bon payload et valide la réponse
- **Un e2e Playwright minimal** : remplir le wizard avec un profil témoin, générer un protocole (Claude mocké), exporter le PDF, retrouver le client dans l'historique, supprimer le client
- Pas d'over-testing du rendu : on teste la logique métier et les boundaries, pas chaque bouton

---

## 7. Sécurité, privacy, déploiement

### Sécurité
- `ANTHROPIC_API_KEY` en `.env.local`, jamais exposée au client
- Tous les appels Claude passent par les API routes Next.js
- App non exposée à Internet en v1 — exécution locale uniquement (`npm run start` sur le poste boutique)

### Privacy / RGPD
- Base SQLite en local uniquement, aucune donnée envoyée ailleurs que chez Anthropic pour le prompt
- Case consentement obligatoire avant sauvegarde d'un client
- Bouton suppression dans l'historique (droit à l'effacement)
- Disclaimer médical automatique dans chaque protocole (géré par le prompt système)
- Le profil client envoyé à Claude ne contient pas de PII inutile : prénom seul, pas email ni téléphone (PII conservée côté base pour le PDF et l'historique uniquement)

### Déploiement v1
- Exécution locale sur le poste d'Adam
- `README.md` fourni avec les commandes : `npm install`, `npm run build`, `npm run start`
- Mode dev : `npm run dev`
- `bodystart.db` créé automatiquement au premier lancement via `drizzle-kit push`
- Script `npm run db:backup` : copie horodatée de `bodystart.db` dans `./backups/`

---

## 8. Hors scope v1

Ces items sont volontairement écartés et pourront être envisagés dans des itérations futures :

- Déploiement cloud / multi-postes
- Authentification
- Envoi email automatique du PDF au client
- Intégration du stock boutique (recommander une marque précise selon disponibilité)
- Statistiques d'usage (suppléments les plus recommandés, etc.)
- Mode offline / fallback sans Claude
- Application mobile

---

## 9. Récapitulatif des décisions de design

| Décision | Choix retenu | Raison |
|---|---|---|
| Type d'outil | Outil métier mono-utilisateur | Adam est seul opérateur, en boutique |
| Plateforme | Web app Next.js locale | Rapide à prototyper, stack maîtrisée, PDF facile |
| UX du formulaire | Wizard multi-étapes structuré | Données propres envoyées à Claude, meilleure UX mobile plus tard |
| Format de sortie Claude | JSON structuré via tool_use + markdown narratif | PDF propre et UI riche impossibles à faire proprement à partir de markdown brut |
| Persistence | SQLite locale + Drizzle | Pas de cloud, RGPD simple, backup trivial |
| Infos client | Complètes (nom, email, téléphone, consentement) | Permettre un suivi futur et campagnes email |
| Branding PDF | Logo BodyStart + charte provisoire | Livrable central, doit être présentable |
| Génération PDF | Puppeteer sur template HTML/Tailwind | Rendu pixel-perfect, réutilise les composants React |

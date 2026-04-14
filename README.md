# BodyStart Nutrition — Supplement Advisor

Outil local de génération de protocoles de compléments personnalisés pour la boutique BodyStart Nutrition.

## Prérequis

- Node.js 20+
- Une clé API Anthropic

## Installation

```bash
npm install
cp .env.local.example .env.local
# Éditer .env.local et renseigner ANTHROPIC_API_KEY + coordonnées boutique
```

## Variables d'environnement

```
ANTHROPIC_API_KEY=sk-ant-xxx      # Requis — génération Claude
RESEND_API_KEY=re_xxx             # Optionnel — envoi email (omettre bloque l'envoi mais pas l'app)
RESEND_FROM_EMAIL=...             # Optionnel — défaut: onboarding@resend.dev
BODYSTART_SHOP_ADDRESS=...        # Optionnel — défaut: 8 Rue du Pont des Landes, 78310 Coignières
BODYSTART_SHOP_PHONE=...          # Optionnel — défaut: 07 61 84 75 80
APP_ORIGIN=http://localhost:3000  # Optionnel — pour liens email et PDF
```

## Utilisation

```bash
npm run dev       # mode développement
npm run build     # build production
npm run start     # lancement production
npm test          # tests unitaires
```

La base SQLite `bodystart.db` est créée automatiquement au premier lancement.

## Parcours

1. **Nouvelle consultation** — wizard 7 étapes pour collecter le profil client
2. **Génération du protocole** — Claude renvoie un protocole structuré (compléments, timing, justification)
3. **Affinage Phase 3** (optionnel) — analyse alimentaire qui ré-ajuste le protocole
4. **Export PDF** — document branded BodyStart à remettre au client
5. **Historique** — recherche, export CSV, suppression RGPD

## Sauvegarde

```bash
cp bodystart.db "backups/bodystart-$(date +%Y%m%d-%H%M%S).db"
```

## Nouveautés — refonte kiosque (avril 2026)

- Design aligné sur bodystart.vercel.app (cream + forest green + Montserrat 900)
- Moment "scanner" pendant la génération Claude (~8s) : silhouette anatomique, scan line, particules
- Visualisation des carences en bar chart horizontal (nouveau champ `Protocol.deficiencies`)
- Tier list rebrandée : Essentiels / Prioritaires / Optimisations
- Envoi email via Resend avec PDF en pièce jointe + lien web durable `/r/:id`
- Réintégration de l'analyse Phase 3 dans le rapport
- Logo optimisé (4.4 MB PNG → 14 KB WebP)

Voir `docs/superpowers/specs/2026-04-14-bodystart-kiosque-redesign-design.md` pour le spec complet.

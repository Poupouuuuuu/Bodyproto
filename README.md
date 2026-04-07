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

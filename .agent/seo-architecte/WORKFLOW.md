---
description: Workflow SEO Architecte - Analyse et génération de stratégie SEO killer
---

# 🚀 SEO Architecte - Workflow IDE

Ce workflow permet de lancer une analyse SEO complète directement depuis l'IDE, avec visibilité totale sur le processus IA.

## Prérequis

1. Clé API Gemini configurée dans `.env` (`VITE_GEMINI_API_KEY`)
2. Informations business du client

---

## 🎯 Étape 1: Préparation du Brief

Avant de lancer l'analyse, prépare un fichier `brief.md` dans `.agent/seo-architecte/inputs/`:

```markdown
# Brief Client

## Informations Business
- **Nom du projet**: 
- **URL du site** (si existant): 
- **Type de site**: WordPress / Shopify / Custom / Nouveau site

## Secteur & Positionnement
- **Secteur d'activité**: (ex: "Formation professionnelle sécurité incendie")
- **Sous-secteur/Spécialité**: (ex: "SSIAP, habilitation électrique")
- **Zone géographique**: (ex: "Île-de-France", "National")
- **Ville principale** (si local): 

## Cible & Objectifs
- **Audience cible**: B2B / B2C / Mixte
- **Objectif principal**: Leads / Ventes / Notoriété
- **Budget estimé**: < 1000€ / 1000-5000€ / > 5000€ par mois

## Vocabulaire Métier
- **Termes techniques du métier**: (liste séparée par virgules)
- **Comment les clients décrivent leur problème**: 
- **Certifications/Normes du secteur**: 

## Concurrence
- **URLs concurrents principaux** (3-5 max):
  - https://...
  - https://...

## Contraintes
- **Contraintes spécifiques**: (légales, techniques, etc.)
```

---

## 🔄 Étape 2: Lancer l'Analyse

// turbo-all

### Option A: Analyse Complète (Pipeline complet)

```bash
# Depuis la racine du projet
npx ts-node .agent/seo-architecte/scripts/run-full-analysis.ts
```

### Option B: Agent par Agent (Debug/Contrôle)

```bash
# 1. Strategic Analyzer
npx ts-node .agent/seo-architecte/scripts/run-agent.ts strategic

# 2. Cluster Architect (nécessite strategic)
npx ts-node .agent/seo-architecte/scripts/run-agent.ts cluster

# 3. Content Designer (nécessite strategic + cluster)
npx ts-node .agent/seo-architecte/scripts/run-agent.ts content

# 4-6. Parallel agents
npx ts-node .agent/seo-architecte/scripts/run-agent.ts technical
npx ts-node .agent/seo-architecte/scripts/run-agent.ts snippet
npx ts-node .agent/seo-architecte/scripts/run-agent.ts authority

# 7. SERP Analyzer (nouveau - analyse SERPs réelles)
npx ts-node .agent/seo-architecte/scripts/run-agent.ts serp

# 8. Coordinator (synthèse finale)
npx ts-node .agent/seo-architecte/scripts/run-agent.ts coordinator
```

---

## 📊 Étape 3: Consulter les Résultats

Les outputs sont générés dans `.agent/seo-architecte/outputs/`:

```
outputs/
├── 01-strategic-analysis.json    # Contexte, vocabulaire, avatar
├── 02-cluster-architecture.json  # Clusters, roadmap 90 jours
├── 03-content-table.json         # Tableau 25-30 articles
├── 04-technical-optimization.json
├── 05-snippet-strategy.json
├── 06-authority-strategy.json
├── 07-serp-analysis.json         # Données SERPs réelles
├── 08-coordinator-summary.json   # Synthèse finale
├── competitive-intel.json        # Intelligence concurrentielle
├── roi-predictions.json          # Prédictions ROI par article
└── full-report.md                # Rapport complet formaté
```

---

## 📝 Étape 4: Générer un Article

Pour générer les instructions de rédaction d'un article:

```bash
npx ts-node .agent/seo-architecte/scripts/generate-article-brief.ts --article "Titre de l'article"
```

Output: `outputs/article-briefs/[slug-article].md`

---

## 🔄 Étape 5: Exporter vers l'App

Pour synchroniser les résultats avec le dashboard web:

```bash
npx ts-node .agent/seo-architecte/scripts/export-to-firebase.ts --project "Nom du projet"
```

---

## ⚙️ Configuration des Prompts

Les prompts sont éditables dans `.agent/seo-architecte/prompts/`:

| Fichier | Agent | Ce que tu peux customiser |
|---------|-------|---------------------------|
| `strategic.md` | Strategic Analyzer | Critères d'analyse, format vocabulaire |
| `cluster.md` | Cluster Architect | Nombre clusters, règles funnel |
| `content.md` | Content Designer | Nombre articles, colonnes tableau |
| `serp.md` | SERP Analyzer | Patterns à détecter, scoring |

---

## 💡 Tips

1. **Debug un agent** → Regarde le JSON dans `outputs/` après chaque étape
2. **Modifier un prompt** → Édite le fichier `.md` correspondant et relance
3. **Comparer les résultats** → Git track les outputs pour voir l'évolution
4. **Coûts** → Chaque agent affiche les tokens utilisés en console

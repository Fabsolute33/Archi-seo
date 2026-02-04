---
description: Lance une analyse SEO complète à partir d'un brief collé par l'utilisateur
---

# SEO Analysis Workflow

Ce workflow permet de lancer une analyse SEO complète depuis un brief généré par l'app.

## Prérequis
- Brief SEO (contenu markdown généré par l'app)
- Clé API Gemini dans `.env`

## Étapes

### 1. Créer le dossier projet
Créer le dossier de sortie basé sur le nom du projet extrait du brief:
```
.agent/seo-architecte/outputs/{nom_projet}/
```

### 2. Sauvegarder le brief
Sauvegarder le brief dans le dossier projet:
```
.agent/seo-architecte/outputs/{nom_projet}/brief.md
```

### 3. Lancer Agent Strategic Analyzer
// turbo
```bash
npx ts-node .agent/seo-architecte/scripts/run-agent.ts strategic
```

### 4. Lancer Agent Cluster Architect
// turbo
```bash
npx ts-node .agent/seo-architecte/scripts/run-agent.ts cluster
```

### 5. Lancer Agent Content Designer
// turbo
```bash
npx ts-node .agent/seo-architecte/scripts/run-agent.ts content
```

### 6. Lancer Agents Parallèles (Technical, Snippet, Authority)
// turbo
```bash
npx ts-node .agent/seo-architecte/scripts/run-agent.ts technical
npx ts-node .agent/seo-architecte/scripts/run-agent.ts snippet
npx ts-node .agent/seo-architecte/scripts/run-agent.ts authority
```

### 7. Lancer Agent SGE Optimizer
// turbo
```bash
npx ts-node .agent/seo-architecte/scripts/run-agent.ts sge
```

### 8. Lancer Agent SERP Analyzer (nouveau)
// turbo
```bash
npx ts-node .agent/seo-architecte/scripts/run-agent.ts serp
```

### 9. Lancer Agent ROI Predictor (nouveau)
// turbo
```bash
npx ts-node .agent/seo-architecte/scripts/run-agent.ts roi
```

### 10. Lancer Agent Coordinator (synthèse finale)
// turbo
```bash
npx ts-node .agent/seo-architecte/scripts/run-agent.ts coordinator
```

### 11. Copier les résultats
Copier tous les fichiers de `.agent/seo-architecte/outputs/*.json` vers le dossier projet.

### 12. Notifier l'utilisateur
Informer l'utilisateur que l'analyse est terminée et lui donner le chemin des résultats.

---

## Notes
- Les résultats sont sauvegardés dans le dossier du projet
- L'app peut importer ces résultats via "Import IDE"
- Chaque agent peut être relancé individuellement si besoin

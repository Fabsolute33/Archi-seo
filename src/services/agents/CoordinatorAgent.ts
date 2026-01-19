import { generateWithGemini } from '../GeminiService';
import type {
  CoordinatorSummary,
  StrategicAnalysis,
  ClusterArchitecture,
  ContentDesign,
  TechnicalOptimization,
  SnippetStrategy,
  AuthorityStrategy
} from '../../types/agents';

const SYSTEM_PROMPT = `Tu es l'AGENT 7 : "COORDINATOR" - Coordinateur et synthétiseur final du système multi-agents.

MISSIONS:

1. **Consolider tous les livrables**
   - Vérifier la cohérence inter-agents
   - Identifier les manques ou contradictions
   - Ajuster les priorités

2. **Créer le plan d'action immédiat**
   - 3 Quick Wins (opportunités rapides avec délai et cible)
   - Priorité absolue (cluster BOFU critique à traiter en premier)
   - Actions immédiates à effectuer

3. **Générer les 6 options interactives**
   Les options OBLIGATOIRES à proposer:
   1️⃣ RÉDACTION → Choisir un article à rédiger (2000-2500 mots)
   2️⃣ BACKLINKS → Stratégie netlinking complète + prospection
   3️⃣ TECHNIQUE → Checklist on-page + Schema.org + maillage
   4️⃣ META & CTR → Meta-titles + descriptions pour 10 articles
   5️⃣ REFRESH → Analyser un nouveau business
   6️⃣ CONCURRENCE → Analyser un concurrent (fournir URL)

VALIDATION FINALE OBLIGATOIRE:
- [ ] Tous les agents ont produit leur livrable
- [ ] Aucune contradiction entre les recommandations
- [ ] Les tableaux contiennent toutes les colonnes requises (12)
- [ ] Les Quick Wins sont réalistes et chiffrés
- [ ] Le maillage interne est cohérent avec l'architecture
- [ ] Les Schema Markup sont adaptés aux formats de contenu
- [ ] La roadmap 90 jours est équilibrée (BOFU → MOFU → TOFU)

FORMAT DE RÉPONSE OBLIGATOIRE (JSON):
{
  "resumeArchitecture": {
    "nombreClusters": 5,
    "repartition": {"bofu": 2, "mofu": 2, "tofu": 1},
    "nombreArticles": 18,
    "prioriteAbsolue": {"cluster": "Nom du cluster BOFU critique", "raison": "Pourquoi c'est prioritaire"}
  },
  "synthese": "Synthèse globale de la stratégie en 3-4 paragraphes. Inclure les points forts, les opportunités identifiées, et la logique de la roadmap.",
  "quickWins": [
    {
      "rang": 1,
      "titre": "Titre du Quick Win",
      "requete": "Requête cible exacte",
      "description": "Description détaillée de l'action",
      "cible": "Objectif mesurable (Top 3, Position 0, X leads)",
      "impact": "élevé|moyen|rapide",
      "effort": "Estimation en heures/jours",
      "delai": "Délai estimé pour résultats"
    }
  ],
  "validationCroisee": [
    {
      "agent": "Nom de l'agent",
      "statut": "validé|attention|conflit",
      "notes": "Notes de validation ou problèmes identifiés"
    }
  ],
  "checklistValidation": {
    "tousLivrables": true,
    "pasDeContradiction": true,
    "tableaux12Colonnes": true,
    "quickWinsRealistes": true,
    "maillageCoherent": true,
    "schemaMarkupAdaptes": true,
    "roadmapEquilibree": true
  },
  "recommandationsFinales": [
    "Recommandation stratégique 1",
    "Recommandation 2",
    "Recommandation 3"
  ],
  "conseilPrioritaire": "💡 Conseil: Commencez par les articles BOFU pour ROI rapide.",
  "optionsInteractives": [
    {"id": "redaction", "numero": "1️⃣", "label": "RÉDACTION", "description": "Choisissez un article à rédiger (2000-2500 mots)", "icon": "📝"},
    {"id": "backlinks", "numero": "2️⃣", "label": "BACKLINKS", "description": "Stratégie netlinking complète + prospection", "icon": "🔗"},
    {"id": "technique", "numero": "3️⃣", "label": "TECHNIQUE", "description": "Checklist on-page + Schema.org + maillage", "icon": "⚙️"},
    {"id": "meta-ctr", "numero": "4️⃣", "label": "META & CTR", "description": "Meta-titles + descriptions pour 10 articles", "icon": "🏷️"},
    {"id": "refresh", "numero": "5️⃣", "label": "REFRESH", "description": "Analyser un nouveau business", "icon": "🔄"},
    {"id": "concurrence", "numero": "6️⃣", "label": "CONCURRENCE", "description": "Analyser un concurrent (fournir URL)", "icon": "🔍"}
  ]
}`;

export async function runCoordinator(
  businessDescription: string,
  strategicAnalysis: StrategicAnalysis,
  clusterArchitecture: ClusterArchitecture,
  contentDesign: ContentDesign,
  technicalOptimization: TechnicalOptimization,
  snippetStrategy: SnippetStrategy | null,
  authorityStrategy: AuthorityStrategy
): Promise<CoordinatorSummary> {
  const userPrompt = `BUSINESS:
${businessDescription}

=== RÉSUMÉ DES LIVRABLES DES 6 AGENTS ===

📊 AGENT 1 - STRATEGIC ANALYZER:
- Avatar: ${strategicAnalysis?.avatar?.segment || 'Non défini'}
- Top 3 douleurs: ${(strategicAnalysis?.douleursTop5 || []).slice(0, 3).map(d => d.douleur).join(', ') || 'Aucune'}
- Super-pouvoir: ${strategicAnalysis?.levierDifferentiation?.angle || 'Non défini'}
- Niveau E-E-A-T: ${strategicAnalysis?.niveauEEAT?.requis || 'Non défini'}

🏗️ AGENT 2 - CLUSTER ARCHITECT:
- Nombre de clusters: ${(clusterArchitecture?.clusters || []).length}
- Répartition: BOFU(${(clusterArchitecture?.clusters || []).filter(c => c.funnel === 'BOFU').length}) / MOFU(${(clusterArchitecture?.clusters || []).filter(c => c.funnel === 'MOFU').length}) / TOFU(${(clusterArchitecture?.clusters || []).filter(c => c.funnel === 'TOFU').length})
- Semaines de roadmap: ${(clusterArchitecture?.roadmap90Jours || []).length}

✍️ AGENT 3 - CONTENT DESIGNER:
- Nombre d'articles planifiés: ${(contentDesign?.tableauContenu || []).length}
- Articles BOFU: ${(contentDesign?.tableauContenu || []).filter(c => c.intent === 'BOFU').length}
- Articles MOFU: ${(contentDesign?.tableauContenu || []).filter(c => c.intent === 'MOFU').length}
- Articles TOFU: ${(contentDesign?.tableauContenu || []).filter(c => c.intent === 'TOFU').length}

⚙️ AGENT 4 - TECHNICAL OPTIMIZER:
- Items Core Web Vitals: ${(technicalOptimization?.coreWebVitals?.checklist || []).length}
- Silos créés: ${(technicalOptimization?.maillageSchema?.silos || []).length}
- JSON-LD exemples: ${(technicalOptimization?.jsonLdExemples || []).length}

🎯 AGENT 5 - SNIPPET MASTER:
- Templates créés: ${(snippetStrategy?.snippetsParArticle || []).length}
- Questions Voice: ${(snippetStrategy?.questionsVoice || []).length}
- Opportunités P0: ${(snippetStrategy?.opportunitesTop5 || []).length}

🏆 AGENT 6 - AUTHORITY BUILDER:
- Certifications: ${(authorityStrategy?.certifications || []).length}
- Cibles backlinks: ${(authorityStrategy?.ciblesBacklinks || []).length}

OBJECTIF: Consolider, valider la cohérence, et générer:
1. Résumé de l'architecture
2. Synthèse stratégique
3. 3 Quick Wins avec requête, cible et délai
4. Validation croisée de tous les agents
5. Checklist de validation finale
6. Les 6 options interactives obligatoires

→ Livrable final pour l'utilisateur.`;

  return generateWithGemini<CoordinatorSummary>(
    SYSTEM_PROMPT,
    userPrompt,
    (text) => {
      const parsed = JSON.parse(text);
      return {
        synthese: parsed.synthese || '',
        quickWins: parsed.quickWins || [],
        validationCroisee: parsed.validationCroisee || [],
        recommandationsFinales: parsed.recommandationsFinales || [],
        optionsInteractives: parsed.optionsInteractives || [
          { id: 'redaction', label: 'RÉDACTION', description: 'Choisissez un article à rédiger', icon: '📝' },
          { id: 'backlinks', label: 'BACKLINKS', description: 'Stratégie netlinking complète', icon: '🔗' },
          { id: 'technique', label: 'TECHNIQUE', description: 'Checklist on-page + Schema.org', icon: '⚙️' },
          { id: 'meta-ctr', label: 'META & CTR', description: 'Meta-titles et descriptions', icon: '🏷️' },
          { id: 'refresh', label: 'REFRESH', description: 'Analyser un nouveau business', icon: '🔄' },
          { id: 'concurrence', label: 'CONCURRENCE', description: 'Analyser un concurrent', icon: '🔍' }
        ],
        resumeArchitecture: parsed.resumeArchitecture,
        checklistValidation: parsed.checklistValidation,
        conseilPrioritaire: parsed.conseilPrioritaire
      } as CoordinatorSummary;
    }
  );
}

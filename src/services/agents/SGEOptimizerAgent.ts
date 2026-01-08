import { generateWithGemini } from '../GeminiService';
import type { SGEOptimization, ContentTableRow, StrategicAnalysis } from '../../types/agents';

const SYSTEM_PROMPT = `Tu es l'AGENT SGE OPTIMIZER - Expert en optimisation pour Google SGE (Search Generative Experience) et AI Overviews 2026.

Ta mission est d'analyser chaque article et de calculer son potentiel d'être cité par l'IA de Google.

CRITÈRES D'ÉVALUATION SGE/AI OVERVIEWS:

1. **Score de Citabilité (0-100)**
   - Clarté des réponses aux questions principales (30 pts)
   - Couverture des entités Google reconnues (25 pts)
   - Structure adaptée à l'extraction IA (25 pts)
   - Autorité et fiabilité estimées (20 pts)

2. **Patterns de Citabilité SGE**
   - ✅ Réponses directes et factuelles (40-60 mots)
   - ✅ Définitions claires dès le premier paragraphe
   - ✅ Listes numérotées ou à puces structurées
   - ✅ Tableaux comparatifs bien formatés
   - ✅ Faits vérifiables avec sources
   - ✅ Questions/Réponses format FAQ

3. **Entity-First Content Structure**
   - Identifier les entités Google liées au sujet
   - Assurer une couverture complète des entités principales
   - Relier les entités entre elles de manière logique

4. **Structured Answers**
   - Générer 2-3 réponses structurées prêtes à être citées
   - Formats: concise (40 mots), detailed (100+ mots), list (5-8 items), comparison (tableau)

FORMAT DE RÉPONSE OBLIGATOIRE (JSON):
{
  "articlesOptimized": [
    {
      "articleTitle": "Titre de l'article",
      "citabilityScore": 75,
      "entityCoverage": ["Entité 1", "Entité 2", "Entité 3"],
      "structuredAnswers": [
        {
          "question": "Question principale liée au sujet",
          "answer": "Réponse directe et factuelle de 40-60 mots optimisée pour SGE",
          "format": "concise",
          "wordCount": 48
        }
      ],
      "aiOverviewPotential": "high|medium|low",
      "optimizationTips": [
        "Conseil spécifique pour améliorer le score SGE"
      ],
      "keyFactsExtracted": [
        "Fait clé 1 citable par l'IA",
        "Fait clé 2 citable par l'IA"
      ]
    }
  ]
}

RÈGLES CRITIQUES:
- Score > 70: HIGH potential (contenu bien structuré pour SGE)
- Score 40-70: MEDIUM potential (optimisations nécessaires)
- Score < 40: LOW potential (restructuration majeure requise)
- Chaque article doit avoir au moins 2 structured answers
- Les entités doivent être des termes reconnus par Google Knowledge Graph`;

export interface SGEArticleOptimization {
    articleTitle: string;
    citabilityScore: number;
    entityCoverage: string[];
    structuredAnswers: {
        question: string;
        answer: string;
        format: 'concise' | 'detailed' | 'list' | 'comparison';
        wordCount: number;
    }[];
    aiOverviewPotential: 'high' | 'medium' | 'low';
    optimizationTips: string[];
    keyFactsExtracted: string[];
}

export interface SGEOptimizerResult {
    articlesOptimized: SGEArticleOptimization[];
}

export async function runSGEOptimizer(
    businessDescription: string,
    strategicAnalysis: StrategicAnalysis,
    contentTableRows: ContentTableRow[]
): Promise<Map<string, SGEOptimization>> {
    const userPrompt = `BUSINESS:
${businessDescription}

AVATAR CLIENT:
- Segment: ${strategicAnalysis.avatar.segment}
- Douleurs: ${strategicAnalysis.douleursTop5.map(d => d.douleur).join(', ')}

ARTICLES À OPTIMISER POUR SGE/AI OVERVIEWS:
${contentTableRows.map((row, idx) => `
${idx + 1}. **${row.titreH1}**
   - Cluster: ${row.cluster}
   - Intent: ${row.intent}
   - PAA: ${row.paa}
   - Angle: ${row.angle}
   - Format Snippet actuel: ${row.snippetFormat}
   - Carburant: ${row.carburant?.termeAutoritaire || 'N/A'}, ${row.carburant?.entiteGoogle || 'N/A'}
`).join('\n')}

OBJECTIF: Analyser chaque article et calculer son potentiel de citation par Google SGE.
Génère une optimisation SGE complète pour CHAQUE article listé ci-dessus.`;

    const result = await generateWithGemini<SGEOptimizerResult>(
        SYSTEM_PROMPT,
        userPrompt,
        (text) => {
            const parsed = JSON.parse(text);
            return parsed as SGEOptimizerResult;
        }
    );

    // Créer une Map pour associer chaque titre d'article à son optimisation SGE
    const optimizationsMap = new Map<string, SGEOptimization>();

    for (const opt of result.articlesOptimized) {
        optimizationsMap.set(opt.articleTitle, {
            citabilityScore: opt.citabilityScore,
            entityCoverage: opt.entityCoverage,
            structuredAnswers: opt.structuredAnswers,
            aiOverviewPotential: opt.aiOverviewPotential,
            optimizationTips: opt.optimizationTips,
            keyFactsExtracted: opt.keyFactsExtracted
        });
    }

    return optimizationsMap;
}

// Fonction pour enrichir les articles avec les données SGE
export function enrichArticlesWithSGE(
    articles: ContentTableRow[],
    sgeOptimizations: Map<string, SGEOptimization>
): ContentTableRow[] {
    return articles.map(article => {
        const sgeOpt = sgeOptimizations.get(article.titreH1);
        if (sgeOpt) {
            return {
                ...article,
                sgeOptimization: sgeOpt
            };
        }
        return article;
    });
}

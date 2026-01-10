import { generateWithGemini } from '../GeminiService';
import type { ScrapedContent, ContentAuditResult, AuditScores, AuditRecommendation, ContentGap } from '../../types/auditTypes';
import type { ContentTableRow } from '../../types/agents';

const SYSTEM_PROMPT = `Tu es l'AGENT 9 : "CONTENT AUDITOR" - Expert en audit de contenu SEO.

⚠️ RÈGLE FONDAMENTALE: Tu DOIS analyser EN PROFONDEUR le contenu COMPLET de la page fournie. 
Lis attentivement CHAQUE titre, CHAQUE paragraphe, CHAQUE section pour comprendre le sujet EXACT traité.

MISSIONS:
1. **Analyser le contenu existant** d'une page web
   - Structure des titres (H1-H6) - LIS TOUS LES TITRES
   - Qualité sémantique et densité de mots-clés
   - Couverture des entités Google
   - Signaux E-E-A-T
   - **IDENTIFICATION DU SUJET PRINCIPAL** : Détermine précisément le thème central de la page

2. **Calculer les scores SEO** (0-100)
   - Score global
   - Structure
   - Sémantique
   - Technique
   - E-E-A-T
   - Lisibilité

3. **Générer des recommandations priorisées**
   - Actions concrètes et actionnables
   - Impact estimé de chaque action
   - Catégorisées par type

4. **Détecter les Content Gaps**
   - Sujets manquants par rapport aux concurrents
   - Opportunités de nouveaux articles
   - **STRICTEMENT dans la même thématique que la page auditée**

5. **Proposer des articles complémentaires**
   - Format compatible avec le tableau de contenu existant
   - Incluant H1, angle, triggers, mots-clés LSI, PAA
   - **IMPORTANT: Inclure un Appât SXO** (calculateur, checklist, infographie, template, quiz, comparateur, simulateur, etc.)
   
   ⛔ CONTRAINTE CRITIQUE POUR LES ARTICLES SUGGÉRÉS:
   - Les articles proposés DOIVENT être 100% liés au sujet EXACT de la page auditée
   - INTERDICTION de proposer des sujets tangentiels, tendance ou hors-sujet
   - Si la page parle de "sécurité au travail" ou "accidents du travail", NE PAS proposer d'articles sur l'IA, l'IoT, ou autres technologies sauf si explicitement mentionnées dans le contenu original
   - Reste dans le champ lexical et thématique EXACT de la page analysée

FORMAT DE RÉPONSE OBLIGATOIRE (JSON):
{
  "scores": {
    "global": 75,
    "structure": 80,
    "semantique": 70,
    "technique": 75,
    "eeat": 65,
    "lisibilite": 85
  },
  "resumeExecutif": "Résumé en 2-3 phrases de l'état de la page",
  "pointsForts": ["Point fort 1", "Point fort 2", "Point fort 3"],
  "pointsFaibles": ["Point faible 1", "Point faible 2", "Point faible 3"],
  "recommandations": [
    {
      "category": "structure|semantique|technique|eeat|contenu",
      "priority": "haute|moyenne|basse",
      "titre": "Titre de la recommandation",
      "description": "Description détaillée",
      "actionnable": "Action précise à effectuer",
      "impact": "Impact estimé sur le SEO"
    }
  ],
  "contentGaps": [
    {
      "sujet": "Sujet manquant",
      "raison": "Pourquoi ce sujet est important",
      "potentiel": "élevé|moyen|faible",
      "motsCles": ["mot-clé 1", "mot-clé 2"]
    }
  ],
  "suggestedArticles": [
    {
      "cluster": "Nom du cluster thématique",
      "titreH1": "Titre H1 optimisé Position 0",
      "angle": "Angle unique et différenciant",
      "trigger": "Émotion ou déclencheur psychologique",
      "carburant": {
        "termeAutoritaire": "Terme qui inspire confiance",
        "entiteGoogle": "Entité reconnue par Google",
        "lsi": ["mot LSI 1", "mot LSI 2", "mot LSI 3"]
      },
      "paa": ["Question PAA 1?", "Question PAA 2?", "Question PAA 3?"],
      "snippetFormat": "paragraphe|liste|tableau",
      "schema": "HowTo|FAQ|Article|Review",
      "appatSXO": "Calculateur de X | Checklist gratuite | Quiz interactif | Template téléchargeable | Infographie | Comparateur | Simulateur",
      "intent": "BOFU|MOFU|TOFU",
      "score": { "volume": 1000, "difficulte": 30, "impact": 8 },
      "maillage": {
        "vers": ["Article cible 1"],
        "depuis": ["Article source 1"]
      },
      "metaDescription": "Meta description optimisée < 155 caractères"
    }
  ]
}`;

export async function runContentAuditor(
  scrapedContent: ScrapedContent,
  targetKeyword?: string
): Promise<Omit<ContentAuditResult, 'url' | 'scrapedContent'>> {
  // Extraction du sujet principal basé sur le titre et les H1
  const titreComplet = scrapedContent.title || '';
  const h1Principal = scrapedContent.h1.length > 0 ? scrapedContent.h1[0] : '';
  const sujetPrincipal = h1Principal || titreComplet || 'Non identifié';

  // Lecture complète des titres (tous les H2 et H3)
  const tousLesH2 = scrapedContent.h2.join('\n   • ') || 'Aucun H2';
  const tousLesH3 = scrapedContent.h3.join('\n   • ') || 'Aucun H3';

  const contentSummary = `
🎯 SUJET PRINCIPAL DE LA PAGE: "${sujetPrincipal}"
(Toutes les suggestions d'articles DOIVENT être directement liées à ce sujet)

URL ANALYSÉE: ${scrapedContent.url}

TITRE DE LA PAGE: ${scrapedContent.title}
META DESCRIPTION: ${scrapedContent.metaDescription}

═══════════════════════════════════════════════════════════════
STRUCTURE COMPLÈTE DES TITRES (LIS TOUT ATTENTIVEMENT):
═══════════════════════════════════════════════════════════════

📌 H1 (${scrapedContent.h1.length}): 
   ${scrapedContent.h1.join('\n   ') || 'Aucun H1 trouvé'}

📌 H2 (${scrapedContent.h2.length}): 
   • ${tousLesH2}

📌 H3 (${scrapedContent.h3.length}): 
   • ${tousLesH3}

═══════════════════════════════════════════════════════════════
MÉTRIQUES:
═══════════════════════════════════════════════════════════════
- Nombre de mots: ${scrapedContent.wordCount}
- Images: ${scrapedContent.images.length} (${scrapedContent.images.filter(i => i.hasAlt).length} avec alt)
- Liens internes: ${scrapedContent.internalLinks.length}
- Liens externes: ${scrapedContent.externalLinks.length}
- Données structurées: ${scrapedContent.structuredData.length > 0 ? 'Oui' : 'Non'}

═══════════════════════════════════════════════════════════════
CONTENU TEXTUEL COMPLET DE LA PAGE (8000 caractères):
═══════════════════════════════════════════════════════════════
${scrapedContent.bodyText.substring(0, 8000)}
${scrapedContent.bodyText.length > 8000 ? '\n[...contenu tronqué...]' : ''}

${targetKeyword ? `\n🔑 MOT-CLÉ CIBLE FOURNI PAR L'UTILISATEUR: ${targetKeyword}` : ''}
`;

  const userPrompt = `AUDIT DE CONTENU SEO À RÉALISER:

${contentSummary}

═══════════════════════════════════════════════════════════════
⚠️ RAPPEL CRITIQUE: Le sujet de cette page est "${sujetPrincipal}"
═══════════════════════════════════════════════════════════════

Analyse cette page et génère:
1. Les scores SEO détaillés (0-100)
2. Un résumé exécutif
3. Les points forts et faibles
4. Des recommandations priorisées (minimum 5)
5. Les content gaps détectés (minimum 3) - UNIQUEMENT sur le thème "${sujetPrincipal}"
6. Des suggestions d'articles complémentaires (minimum 3) au format tableau de contenu
   
   ⛔ CONTRAINTE ABSOLUE POUR LES ARTICLES:
   - TOUS les articles suggérés doivent traiter DIRECTEMENT de "${sujetPrincipal}"
   - NE PAS proposer d'articles sur l'IA, l'IoT, la tech, ou des sujets tendance SAUF s'ils sont explicitement mentionnés dans le contenu original
   - Rester dans le champ sémantique EXACT de la page analysée

Sois précis, actionnable et orienté résultats.`;

  return generateWithGemini(
    SYSTEM_PROMPT,
    userPrompt,
    (text) => {
      const parsed = JSON.parse(text);

      return {
        scores: parsed.scores as AuditScores || {
          global: 50,
          structure: 50,
          semantique: 50,
          technique: 50,
          eeat: 50,
          lisibilite: 50
        },
        resumeExecutif: parsed.resumeExecutif || 'Audit en cours...',
        pointsForts: parsed.pointsForts || [],
        pointsFaibles: parsed.pointsFaibles || [],
        recommandations: (parsed.recommandations || []) as AuditRecommendation[],
        contentGaps: (parsed.contentGaps || []) as ContentGap[],
        suggestedArticles: (parsed.suggestedArticles || []).map((article: Partial<ContentTableRow>) => ({
          cluster: article.cluster || 'Non classé',
          titreH1: article.titreH1 || '',
          angle: article.angle || '',
          trigger: article.trigger || '',
          carburant: article.carburant || { termeAutoritaire: '', entiteGoogle: '', lsi: [] },
          paa: Array.isArray(article.paa) ? article.paa.join(' | ') : (article.paa || ''),
          snippetFormat: article.snippetFormat || 'definition',
          schema: article.schema || 'Article',
          appatSXO: article.appatSXO || '',
          intent: article.intent || 'TOFU',
          score: article.score || { volume: 0, difficulte: 0, impact: 0 },
          maillage: article.maillage || { vers: [], depuis: [] },
          metaDescription: article.metaDescription || '',
          validated: false
        })) as ContentTableRow[],
        competiteursCibles: parsed.competiteursCibles
      };
    }
  );
}

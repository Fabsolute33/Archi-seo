import { generateWithGemini } from '../GeminiService';
import type { SnippetStrategy, ContentDesign } from '../../types/agents';

const SYSTEM_PROMPT = `Tu es l'AGENT 5 : "SNIPPET MASTER" - Spécialiste Featured Snippets et optimisation Position 0.

🎯 ACTIVATION : Tu reçois les tableaux de contenu de l'Agent Content Designer.

MISSIONS:

1. **Identifier les opportunités Snippet POUR CHAQUE ARTICLE**
   - Analyser les questions PAA de chaque article reçu
   - Déterminer LE format optimal pour CHAQUE ARTICLE (définition/liste/tableau)
   - Évaluer la difficulté Position 0 pour chaque article
   - Critères de choix du format:
     * DÉFINITION: Questions "Qu'est-ce que", "Définition de", concepts à expliquer
     * LISTE: Questions "Comment", "Étapes", "Top X", processus, méthodes
     * TABLEAU: Comparaisons, caractéristiques, données chiffrées, versus

2. **Créer UN template de Snippet PAR ARTICLE**
   Formats selon le type choisi:
   - DÉFINITION: 35-50 mots exactement, commence par "[Sujet] est..."
   - LISTE NUMÉROTÉE: 5-8 items avec phrase d'intro
   - TABLEAU HTML: 3-5 lignes, 2-4 colonnes, données comparatives

3. **Optimiser pour Voice Search**
   - 3 questions naturelles (comme on parle à un assistant vocal)
   - Réponses directes en 2-3 phrases maximum
   - Format conversationnel adapté aux assistants vocaux

FORMAT DE RÉPONSE OBLIGATOIRE (JSON):
{
  "snippetsParArticle": [
    {
      "article": "Titre H1 de l'article",
      "cluster": "Nom du cluster parent",
      "paaAnalysee": "Question PAA principale analysée",
      "formatChoisi": "definition|liste|tableau",
      "justificationFormat": "Pourquoi ce format est optimal pour cet article",
      "difficultéPosition0": "facile|moyenne|difficile",
      "potentielVoiceSearch": true|false,
      "template": {
        "type": "definition",
        "reponse": "Réponse optimisée 35-50 mots",
        "nombreMots": 42
      }
    },
    {
      "article": "Autre article",
      "cluster": "Cluster",
      "paaAnalysee": "Question",
      "formatChoisi": "liste",
      "justificationFormat": "Format liste car question 'Comment...'",
      "difficultéPosition0": "moyenne",
      "potentielVoiceSearch": true,
      "template": {
        "type": "liste",
        "intro": "Phrase d'introduction",
        "items": ["1. Item 1", "2. Item 2", "3. Item 3", "4. Item 4", "5. Item 5"]
      }
    },
    {
      "article": "Article comparatif",
      "cluster": "Cluster",
      "paaAnalysee": "Question comparative",
      "formatChoisi": "tableau",
      "justificationFormat": "Format tableau pour comparer",
      "difficultéPosition0": "difficile",
      "potentielVoiceSearch": false,
      "template": {
        "type": "tableau",
        "colonnes": ["Critère", "Option A", "Option B"],
        "lignes": [
          ["Critère 1", "Valeur A1", "Valeur B1"],
          ["Critère 2", "Valeur A2", "Valeur B2"]
        ],
        "htmlOptimized": "<table><thead><tr><th>Critère</th><th>Option A</th><th>Option B</th></tr></thead><tbody><tr><td>Critère 1</td><td>Valeur A1</td><td>Valeur B1</td></tr></tbody></table>"
      }
    }
  ],
  "opportunitesTop5": [
    {
      "rang": 1,
      "article": "Titre de l'article avec meilleur potentiel",
      "question": "Question PAA ciblée",
      "formatOptimal": "definition|liste|tableau",
      "difficultéEstimée": "facile|moyenne|difficile",
      "volumeRecherche": "Volume mensuel estimé",
      "concurrentActuel": "Type de site actuellement en Position 0"
    }
  ],
  "questionsVoice": [
    {
      "question": "Question naturelle comme on la poserait à voix haute ?",
      "reponse": "Réponse conversationnelle en 2-3 phrases maximum.",
      "article": "Article source",
      "intentVocale": "informationnelle|transactionnelle|locale"
    }
  ],
  "syntheseStrategie": {
    "totalArticles": 12,
    "repartitionFormats": {
      "definitions": 4,
      "listes": 5,
      "tableaux": 3
    },
    "articlesFactiles": ["Article 1", "Article 2"],
    "conseilsPrioritaires": [
      "Conseil 1 pour maximiser les chances de Position 0",
      "Conseil 2",
      "Conseil 3"
    ]
  }
}`;

export async function runSnippetMaster(
  businessDescription: string,
  contentDesign: ContentDesign
): Promise<SnippetStrategy> {
  const userPrompt = `BUSINESS:
${businessDescription}

📊 ARTICLES À ANALYSER (de l'Agent CONTENT DESIGNER):
${contentDesign.tableauContenu.map((c, i) => `
${i + 1}. 📝 ${c.titreH1}
   - Cluster: ${c.cluster}
   - PAA: ${c.paa}
   - Intent: ${c.intent}
   - Format suggéré initial: ${c.snippetFormat}`).join('\n')}

🎯 OBJECTIF PRINCIPAL:
Analyser CHAQUE ARTICLE ci-dessus et déterminer le format de snippet optimal (définition/liste/tableau).

📋 LIVRABLES ATTENDUS:
1. UN snippet par article avec template prêt à l'emploi
2. Top 5 opportunités Position 0 parmi tous les articles
3. 3 questions Voice Search avec réponses conversationnelles
4. Synthèse de la stratégie globale

⚠️ IMPORTANT: 
- Chaque article doit avoir SON snippet défini
- Justifie le choix du format pour chaque article
- Les templates doivent être prêts à copier-coller

→ Transmission à l'Agent AUTHORITY BUILDER après ton livrable.`;

  return generateWithGemini<SnippetStrategy>(
    SYSTEM_PROMPT,
    userPrompt,
    (text) => {
      const parsed = JSON.parse(text);
      return {
        snippetsParArticle: parsed.snippetsParArticle || [],
        questionsVoice: parsed.questionsVoice || [],
        opportunitesTop5: parsed.opportunitesTop5 || [],
        syntheseStrategie: parsed.syntheseStrategie || {
          totalArticles: 0,
          repartitionFormats: { definitions: 0, listes: 0, tableaux: 0 },
          articlesFactiles: [],
          conseilsPrioritaires: []
        }
      } as SnippetStrategy;
    }
  );
}

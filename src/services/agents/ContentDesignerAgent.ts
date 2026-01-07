import { generateWithGemini } from '../GeminiService';
import type { ContentDesign, ClusterArchitecture, StrategicAnalysis } from '../../types/agents';

const SYSTEM_PROMPT = `Tu es l'AGENT 3 : "CONTENT DESIGNER" - Designer de contenu et spécialiste SEO on-page.

MISSIONS:

1. **Créer les tableaux détaillés par cluster**
   Pour chaque article, définir OBLIGATOIREMENT les 12 colonnes:
   
   1. Cluster (Thème du groupe)
   2. Titre H1 "Click-Magnet" avec chiffres/année
   3A. Angle Différenciant (information absente chez concurrents)
   3B. Trigger Émotionnel (peur, curiosité, urgence, espoir)
   4. Carburant Sémantique (Terme autoritaire + Entité Google + LSI Killer)
   5. Question PAA pour H2 principal
   6. Format Snippet (Position 0: tableau/liste/définition)
   7. Schema Markup approprié (Article, FAQ, HowTo, Product, Review)
   8. Appât SXO (calculateur, checklist, infographie, template, quiz)
   9. Intent & Funnel (BOFU/MOFU/TOFU)
   10. Score de Priorité (Volume 1-10, Difficulté 1-10, Impact Business 1-10)
   11. Maillage Interne (Liens VERS 2-3 articles + Liens DEPUIS 1-2 articles)
   12. Meta-Description CTR Booster (150-155 caractères max)

2. **Optimiser pour la visibilité**
   - Meta-descriptions avec CTA et chiffres
   - Appâts SXO pour augmenter le temps sur page
   - Score de priorité calculé

3. **Planifier le maillage interne**
   - Respect de la logique de silo (80% intra-cluster)
   - Ancres optimisées et variées

FORMATS OBLIGATOIRES POUR LES TITRES:
✅ "Comment [Action Précise] grâce à [Méthode] en [Délai]"
✅ "[Chiffre] Erreurs Que [X%] Font en [Domaine] (2026)"
✅ "[Service] : Prix Réels, Arnaques à Éviter, Guide [Année]"

FORMATS INTERDITS:
❌ "Les avantages de X"
❌ "Tout savoir sur Y"
❌ "Introduction à Z"

FORMAT DE RÉPONSE OBLIGATOIRE (JSON):
{
  "tableauContenu": [
    {
      "cluster": "Nom du cluster",
      "titreH1": "Titre Click-Magnet avec chiffre et année",
      "angle": "Information unique absente chez concurrents",
      "trigger": "Émotion ciblée (peur/curiosité/urgence/espoir)",
      "carburant": {
        "termeAutoritaire": "Terme expert du domaine",
        "entiteGoogle": "Entité reconnue par Google",
        "lsi": ["LSI Killer 1", "LSI 2", "LSI 3"]
      },
      "paa": "Question People Also Ask pour H2 principal",
      "snippetFormat": "definition|liste|tableau|voice",
      "schema": "Article|FAQ|HowTo|Product|Review|LocalBusiness",
      "appatSXO": "Type d'outil interactif (calculateur de X / checklist Y / template Z)",
      "intent": "BOFU|MOFU|TOFU",
      "score": {"volume": 8, "difficulte": 5, "impact": 9, "prioriteGlobale": 22},
      "maillage": {
        "vers": [{"article": "Titre article cible", "ancre": "texte d'ancre"}],
        "depuis": [{"article": "Titre article source", "ancre": "texte d'ancre"}]
      },
      "metaDescription": "Description CTR <155 caractères avec CTA et chiffre"
    }
  ],
  "planningPublication": [
    {"mois": 1, "focus": "BOFU - Conversion", "articles": ["Titre 1", "Titre 2", "Titre 3"], "objectif": "X leads/mois"}
  ],
  "resumeParCluster": [
    {"cluster": "Nom", "nombreArticles": 5, "focusPrincipal": "BOFU|MOFU|TOFU", "prioriteMoyenne": 7.5}
  ]
}`;

export async function runContentDesigner(
  businessDescription: string,
  strategicAnalysis: StrategicAnalysis,
  clusterArchitecture: ClusterArchitecture
): Promise<ContentDesign> {
  const userPrompt = `BUSINESS:
${businessDescription}

CLUSTERS DE L'AGENT 2 (CLUSTER ARCHITECT):
${clusterArchitecture.clusters.map(c => `
📦 ${c.nom} [${c.funnel}]
- Objectif: ${c.description}
- Pages piliers: ${c.pagesPiliers.join(', ')}
- Mots-clés: ${c.motsCles.join(', ')}`).join('\n')}

DOULEURS À ADRESSER (AGENT 1):
${strategicAnalysis.douleursTop5.map(d => `- ${d.douleur} (${d.intensite})`).join('\n')}

CONTENT GAPS À COMBLER:
${strategicAnalysis.contentGaps.map(c => `- ${c.sujet}: ${c.opportunite}`).join('\n')}

OBJECTIF: Générer un tableau de contenu COMPLET avec les 12 colonnes pour chaque article.
Génère 2-4 articles par cluster minimum.

→ Transmission à l'Agent TECHNICAL OPTIMIZER après ton livrable.`;

  return generateWithGemini<ContentDesign>(
    SYSTEM_PROMPT,
    userPrompt,
    (text) => {
      const parsed = JSON.parse(text);
      return parsed as ContentDesign;
    }
  );
}

import { generateWithGemini } from '../GeminiService';
import type { TechnicalOptimization, ClusterArchitecture, StrategicAnalysis } from '../../types/agents';

const SYSTEM_PROMPT = `Tu es l'AGENT 4 : "TECHNICAL OPTIMIZER" - Expert technique SEO et optimisateur de performance.

MISSIONS:

1. **Core Web Vitals**
   - Optimisations LCP (CDN, lazy loading, preload critical resources)
   - Réduction FID (defer JavaScript, web workers)
   - Stabilisation CLS (dimensions fixes images/vidéos, font-display)
   - Recommandations spécifiques au type de site (WordPress/Shopify/Custom)

2. **Architecture technique**
   - Schéma de maillage en silo (ASCII art)
   - Pages à exclure de l'indexation (robots.txt complet)
   - Stratégie d'indexation (Search Console)
   - Fréquence de publication optimale

3. **Schema.org et données structurées**
   - Code JSON-LD COMPLET pour 3 articles prioritaires
   - Implémentation FAQ, HowTo, Product, Review, LocalBusiness
   - Validation et test des schemas

FORMAT DE RÉPONSE OBLIGATOIRE (JSON):
{
  "typeSiteDetecte": "WordPress|Shopify|Custom|Neuf",
  "coreWebVitals": {
    "lcp": {
      "objectif": "< 2.5s",
      "checklist": [
        {"item": "Action spécifique", "priorite": "haute|moyenne|basse", "action": "Code ou étape concrète", "impact": "Gain estimé en ms"}
      ]
    },
    "fid": {
      "objectif": "< 100ms",
      "checklist": [
        {"item": "Action spécifique", "priorite": "haute|moyenne|basse", "action": "Code ou étape concrète"}
      ]
    },
    "cls": {
      "objectif": "< 0.1",
      "checklist": [
        {"item": "Action spécifique", "priorite": "haute|moyenne|basse", "action": "Code ou étape concrète"}
      ]
    }
  },
  "maillageSchema": {
    "schemaASCII": "Représentation ASCII du maillage en silo",
    "description": "Description de la logique de maillage",
    "silos": [
      {
        "nom": "Nom du silo/cluster",
        "pagePilier": "URL ou titre de la page pilier",
        "pages": ["Page 1", "Page 2", "Page 3"],
        "liensInternes": ["Description des liens internes"]
      }
    ],
    "regles": ["Règle de maillage 1", "Règle 2"]
  },
  "robotsTxt": "User-agent: *\\nAllow: /\\nDisallow: /admin/\\nDisallow: /panier/\\nDisallow: /*?*\\nSitemap: https://example.com/sitemap.xml",
  "pagesNoindex": ["Liste des pages à mettre en noindex"],
  "strategieIndexation": {
    "frequencePublication": "X articles/semaine",
    "processPostPublication": ["Étape 1: Soumettre à Search Console", "Étape 2: Partager réseaux", "Étape 3: Maillage"],
    "regles": ["Règle indexation 1", "Règle 2"],
    "pagesAIndexer": ["Pages prioritaires"],
    "pagesAExclure": ["Pages à exclure"]
  },
  "jsonLdExemples": [
    {
      "titre": "Titre de l'article",
      "typeSchema": "Article|FAQ|HowTo|Product|Review|LocalBusiness",
      "code": "{\\\"@context\\\": \\\"https://schema.org\\\", \\\"@type\\\": \\\"Article\\\", ...}"
    }
  ]
}`;

export async function runTechnicalOptimizer(
  businessDescription: string,
  clusterArchitecture: ClusterArchitecture,
  strategicAnalysis?: StrategicAnalysis
): Promise<TechnicalOptimization> {
  const userPrompt = `BUSINESS:
${businessDescription}

TYPE DE SITE DÉTECTÉ: ${strategicAnalysis?.contexteBusiness?.typeSite || 'À déterminer'}

ARCHITECTURE DE CLUSTERS (AGENT 2):
${clusterArchitecture.clusters.map(c => `
SILO: ${c.nom} [${c.funnel}]
- Pages piliers: ${c.pagesPiliers.join(', ')}
- Mots-clés: ${c.motsCles.join(', ')}`).join('\n')}

MAILLAGE PRÉVU:
${clusterArchitecture.maillageInterne.slice(0, 10).map(m => `- ${m.de} → ${m.vers} (${m.typeDeLink})`).join('\n')}

OBJECTIF: Générer un kit technique SEO complet avec:
1. Checklist Core Web Vitals (LCP, FID, CLS) avec actions concrètes
2. Schéma de maillage en silo (ASCII)
3. robots.txt optimisé
4. JSON-LD complet pour 3 articles clés

→ Transmission à l'Agent SNIPPET MASTER après ton livrable.`;

  return generateWithGemini<TechnicalOptimization>(
    SYSTEM_PROMPT,
    userPrompt,
    (text) => {
      const parsed = JSON.parse(text);
      return {
        coreWebVitals: {
          checklist: [
            ...(parsed.coreWebVitals?.lcp?.checklist || []),
            ...(parsed.coreWebVitals?.fid?.checklist || []),
            ...(parsed.coreWebVitals?.cls?.checklist || [])
          ]
        },
        maillageSchema: parsed.maillageSchema || { description: '', silos: [] },
        robotsTxt: parsed.robotsTxt || '',
        strategieIndexation: parsed.strategieIndexation || { regles: [], pagesAIndexer: [], pagesAExclure: [] },
        jsonLdExemples: parsed.jsonLdExemples || []
      } as TechnicalOptimization;
    }
  );
}

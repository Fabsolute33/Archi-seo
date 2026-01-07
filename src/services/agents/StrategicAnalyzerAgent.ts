import { generateWithGemini } from '../GeminiService';
import type { StrategicAnalysis } from '../../types/agents';

const SYSTEM_PROMPT = `Tu es l'AGENT 1 : "STRATEGIC ANALYZER" - Analyste stratégique et auditeur de marché.

MISSIONS:

1. **Identifier le contexte business**
   - Type de site (WordPress/Shopify/Custom/Neuf)
   - Secteur d'activité et positionnement
   - Autorité estimée (DA < 10 / 10-40 / > 40)
   - Budget inféré selon le secteur

2. **Analyser le marché selon 6 dimensions**
   - Avatar client & douleurs primaires (B2B/B2C, émotions dominantes)
   - Niveau d'expertise requis (E-E-A-T, normes, certifications)
   - Content Gap concurrent (faiblesses Top 3)
   - Intentions de recherche dominantes
   - Micro-niches inexploitées
   - Levier de différenciation unique

3. **Produire le diagnostic flash**
   - Angle d'attaque principal
   - Faiblesse concurrent exploitée
   - Levier de croissance prioritaire
   - Délai estimé pour résultats

CONTRAINTES SEO UNIVERSELLES:
- Adaptation totale au secteur (B2B/B2C/Local/E-commerce/SaaS)
- Zéro généralité : données spécifiques, chiffrées, actionnables

FORMAT DE RÉPONSE OBLIGATOIRE (JSON):
{
  "contexteBusiness": {
    "typeSite": "WordPress|Shopify|Custom|Neuf",
    "secteur": "Description du secteur",
    "positionnement": "Positionnement sur le marché",
    "autoritéEstimée": "DA < 10|DA 10-40|DA > 40",
    "budgetInféré": "Estimation budget mensuel SEO"
  },
  "diagnosticFlash": {
    "angleAttaque": "Angle d'attaque principal",
    "faiblèsseExploitée": "Faiblesse concurrent à exploiter",
    "levierCroissance": "Levier de croissance prioritaire",
    "délaiRésultats": "Estimation délai pour premiers résultats"
  },
  "avatar": {
    "segment": "B2B|B2C|Mixte - Description du segment cible",
    "demographique": "Âge, genre, localisation, revenus",
    "psychographique": "Valeurs, aspirations, craintes",
    "comportemental": "Habitudes d'achat, canaux préférés",
    "emotionsDominantes": "Émotions principales (peur, espoir, frustration...)"
  },
  "douleursTop5": [
    {"douleur": "Description précise", "intensite": "haute|moyenne|basse", "frequence": "Quotidienne|Hebdomadaire|Mensuelle", "emotion": "Émotion associée"}
  ],
  "niveauEEAT": {
    "requis": "basique|moderé|élevé|expert",
    "justification": "Pourquoi ce niveau est requis",
    "normes": ["Norme/certification 1", "Norme 2"],
    "actionsPrioritaires": ["Action E-E-A-T 1", "Action 2", "Action 3"]
  },
  "contentGaps": [
    {"sujet": "Sujet manquant chez concurrents", "concurrent": "Nom du concurrent", "opportunite": "Description opportunité", "difficulte": "facile|moyenne|difficile"}
  ],
  "intentionsRecherche": [
    {"type": "informationnelle|navigationnelle|transactionnelle|commerciale", "pourcentage": 30, "exemples": ["Requête exemple 1", "Requête 2"]}
  ],
  "microNiches": [
    {"niche": "Requête spécifique", "volumeEstimé": "Volume mensuel", "potentiel": "Description potentiel", "concurrence": "faible|moyenne|forte"}
  ],
  "levierDifferentiation": {
    "superPouvoir": "Le super-pouvoir unique du site",
    "angle": "Angle différenciant",
    "messageUnique": "Message différenciateur en 1-2 phrases",
    "preuves": ["Preuve 1", "Preuve 2", "Preuve 3"]
  }
}`;

export async function runStrategicAnalyzer(businessDescription: string): Promise<StrategicAnalysis> {
  const userPrompt = `BUSINESS À ANALYSER:
${businessDescription}

Génère une analyse stratégique SEO complète selon les 6 dimensions du marché.
Sois précis, chiffré et actionnable. Zéro généralité.

RAPPEL DES FORMATS OBLIGATOIRES POUR LES TITRES:
✅ "Comment [Action Précise] grâce à [Méthode] en [Délai]"
✅ "[Chiffre] Erreurs Que [X%] Font en [Domaine] (2026)"
✅ "[Service] : Prix Réels, Arnaques à Éviter, Guide [Année]"

FORMATS INTERDITS:
❌ "Les avantages de X"
❌ "Tout savoir sur Y"
❌ "Introduction à Z"`;

  return generateWithGemini<StrategicAnalysis>(
    SYSTEM_PROMPT,
    userPrompt,
    (text) => {
      const parsed = JSON.parse(text);
      // Map the response to the expected StrategicAnalysis type
      return {
        avatar: parsed.avatar || {
          segment: parsed.avatar?.segment || '',
          demographique: parsed.avatar?.demographique || '',
          psychographique: parsed.avatar?.psychographique || '',
          comportemental: parsed.avatar?.comportemental || ''
        },
        douleursTop5: parsed.douleursTop5 || [],
        niveauEEAT: parsed.niveauEEAT || { requis: 'moderé', justification: '', actionsPrioritaires: [] },
        contentGaps: parsed.contentGaps || [],
        intentionsRecherche: parsed.intentionsRecherche || [],
        microNiches: parsed.microNiches || [],
        levierDifferentiation: parsed.levierDifferentiation || { angle: '', messageUnique: '', preuves: [] },
        contexteBusiness: parsed.contexteBusiness,
        diagnosticFlash: parsed.diagnosticFlash
      } as StrategicAnalysis;
    }
  );
}

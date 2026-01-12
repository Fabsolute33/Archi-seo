import { generateWithGemini } from '../GeminiService';
import type { StrategicAnalysis } from '../../types/agents';

const SYSTEM_PROMPT = `Tu es l'AGENT 1 : "STRATEGIC ANALYZER" - Analyste stratégique et auditeur de marché.

⚠️ RÈGLE CRITIQUE : SPÉCIFICITÉ THÉMATIQUE ABSOLUE ⚠️
Tu dois analyser le business avec une précision chirurgicale. INTERDICTION FORMELLE de produire des analyses génériques ou applicables à n'importe quel secteur. Chaque élément de ta réponse DOIT être 100% spécifique au secteur d'activité analysé.

MISSIONS:

1. **Identifier et FORMALISER le contexte business**
   - Type de site (WordPress/Shopify/Custom/Neuf)
   - Secteur d'activité PRÉCIS (pas "services", mais "plomberie d'urgence Paris", "cabinet d'architecture résidentielle", etc.)
   - Sous-secteur ou spécialité
   - Autorité estimée (DA < 10 / 10-40 / > 40)
   - Budget inféré selon le secteur
   - Zone géographique cible (locale/nationale/internationale)

2. **Extraire le VOCABULAIRE SECTORIEL** (OBLIGATOIRE)
   - 10-15 termes techniques SPÉCIFIQUES au métier (jargon professionnel)
   - 5-10 termes que les clients utilisent pour rechercher ces services
   - Entités Google reconnues dans ce secteur (marques, normes, certifications, personnalités)

3. **Analyser le marché selon 6 dimensions**
   - Avatar client & douleurs primaires (B2B/B2C, émotions dominantes)
   - Niveau d'expertise requis (E-E-A-T, normes, certifications)
   - Content Gap concurrent (faiblesses Top 3)
   - Intentions de recherche dominantes AVEC EXEMPLES SPÉCIFIQUES
   - Micro-niches inexploitées ULTRA-SPÉCIFIQUES au secteur
   - Levier de différenciation unique

4. **Produire le diagnostic flash**
   - Angle d'attaque principal
   - Faiblesse concurrent exploitée
   - Levier de croissance prioritaire
   - Délai estimé pour résultats

CONTRAINTES ANTI-GÉNÉRICITÉ:
- ❌ INTERDIT : "améliorer la visibilité", "attirer des clients", "augmenter le trafic"
- ✅ OBLIGATOIRE : termes métier, exemples concrets, chiffres sectoriels
- Chaque micro-niche doit contenir un terme du vocabulaire sectoriel
- Les douleurs doivent être formulées avec le langage des clients du secteur

FORMAT DE RÉPONSE OBLIGATOIRE (JSON):
{
  "contexteBusiness": {
    "typeSite": "WordPress|Shopify|Custom|Neuf",
    "secteur": "Secteur d'activité PRÉCIS (ex: plomberie d'urgence Paris 16ème)",
    "sousSecteur": "Sous-secteur ou spécialité précise",
    "positionnement": "Positionnement précis sur le marché local/national",
    "zoneGeographique": "Zone cible (ex: Île-de-France, National, etc.)",
    "autoritéEstimée": "DA < 10|DA 10-40|DA > 40",
    "budgetInféré": "Estimation budget mensuel SEO"
  },
  "vocabulaireSectoriel": {
    "termesMetier": ["10-15 termes techniques du jargon professionnel"],
    "termesClients": ["5-10 termes que les clients utilisent pour rechercher"],
    "entitesGoogle": ["Marques, normes, certifications, personnalités du secteur"]
  },
  "diagnosticFlash": {
    "angleAttaque": "Angle d'attaque principal SPÉCIFIQUE au secteur",
    "faiblèsseExploitée": "Faiblesse concrète du concurrent avec nom si possible",
    "levierCroissance": "Levier de croissance prioritaire avec métriques",
    "délaiRésultats": "Estimation délai pour premiers résultats"
  },
  "avatar": {
    "segment": "B2B|B2C|Mixte - Description PRÉCISE du segment cible avec exemples de profils",
    "demographique": "Âge, genre, localisation, revenus - SPÉCIFIQUE au secteur",
    "psychographique": "Valeurs, aspirations, craintes - avec langage du secteur",
    "comportemental": "Habitudes d'achat, canaux préférés - exemples concrets",
    "emotionsDominantes": "Émotions principales formulées avec le vocabulaire du client"
  },
  "douleursTop5": [
    {"douleur": "Description AVEC TERMES DU SECTEUR - ex: 'fuite d'eau en pleine nuit' pas 'problème urgent'", "intensite": "haute|moyenne|basse", "frequence": "Quotidienne|Hebdomadaire|Mensuelle", "emotion": "Émotion associée"}
  ],
  "niveauEEAT": {
    "requis": "basique|moderé|élevé|expert",
    "justification": "Pourquoi ce niveau est requis - avec références légales/sectorielles",
    "normes": ["Norme/certification SPÉCIFIQUE au secteur", "Décret/Loi applicable"],
    "actionsPrioritaires": ["Action E-E-A-T 1 avec exemple concret", "Action 2", "Action 3"]
  },
  "contentGaps": [
    {"sujet": "Sujet ULTRA-SPÉCIFIQUE manquant chez concurrents", "concurrent": "Nom réel du concurrent", "opportunite": "Description opportunité avec volume estimé", "difficulte": "facile|moyenne|difficile"}
  ],
  "intentionsRecherche": [
    {"type": "informationnelle|navigationnelle|transactionnelle|commerciale", "pourcentage": 30, "exemples": ["Requête EXACTE que tape le client dans Google", "Requête 2"]}
  ],
  "microNiches": [
    {"niche": "Requête LONG-TAIL ultra-spécifique avec terme métier", "volumeEstimé": "Volume mensuel", "potentiel": "Description potentiel", "concurrence": "faible|moyenne|forte"}
  ],
  "levierDifferentiation": {
    "superPouvoir": "Le super-pouvoir UNIQUE basé sur une vraie force du business",
    "angle": "Angle différenciant INÉDIT - pas 'qualité' ou 'expertise'",
    "messageUnique": "Message différenciateur en 1-2 phrases avec vocabulaire sectoriel",
    "preuves": ["Preuve CONCRÈTE 1", "Chiffre vérifiable 2", "Certification 3"]
  }
}`;

export async function runStrategicAnalyzer(businessDescription: string): Promise<StrategicAnalysis> {
  const userPrompt = `BUSINESS À ANALYSER:
${businessDescription}

⚠️ RÈGLES ANTI-GÉNÉRICITÉ - CRITIQUE ⚠️
1. Analyse ce business comme si tu étais un expert du secteur depuis 20 ans
2. Utilise UNIQUEMENT le vocabulaire technique du métier
3. Les douleurs doivent être formulées comme le client les exprimerait
4. Chaque micro-niche doit contenir un terme spécifique au secteur
5. Les exemples de requêtes doivent être des vraies recherches Google (long-tail)

❌ INTERDITS ABSOLUS:
- "améliorer la visibilité" → remplacer par action concrète du secteur
- "attirer des clients" → remplacer par le type précis de client
- "augmenter le trafic" → remplacer par l'objectif business réel
- Termes génériques comme "qualité", "expertise", "professionnalisme"

✅ OBLIGATOIRE:
- Termes métier techniques
- Noms de normes/certifications du secteur
- Exemples de requêtes EXACTES que les clients tapent
- Références aux entités Google du secteur

Génère une analyse stratégique SEO ULTRA-SPÉCIFIQUE à ce secteur.
Sois précis, chiffré et actionnable. Zéro généralité.`;

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
        vocabulaireSectoriel: parsed.vocabulaireSectoriel,
        diagnosticFlash: parsed.diagnosticFlash
      } as StrategicAnalysis;
    }
  );
}

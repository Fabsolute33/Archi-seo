import { generateWithGemini } from '../GeminiService';
import type { NewsTransformerInput, NewsTransformerResult, SEOAngle } from '../../types/agents';

const SYSTEM_PROMPT = `# PROMPT SYSTÈME - NEWS TO SEO TRANSFORMER

## RÔLE
Tu es un "News Transformation Expert", spécialisé en stratégie de contenu SEO avancée.
Ta mission : analyser un article d'actualité et générer des angles d'exploitation uniques pour transformer cette news en contenu SEO dominateur.

## CONTEXTE D'UTILISATION
L'utilisateur te fournira :
1. L'URL d'un article d'actualité ou de blog concurrent
2. Son secteur d'activité / expertise
3. Son mot-clé principal (optionnel)

## MÉTHODOLOGIE "ANGLE EXPERT"

### PHASE 1 : ANALYSE DE LA SOURCE
Extrais silencieusement de l'article source :
- Le sujet principal et les informations factuelles
- Le ton et l'angle adopté par l'auteur original
- Les données chiffrées, dates, entités mentionnées
- Les lacunes ou manques évidents (ce qui n'est PAS traité)

### PHASE 2 : DÉTECTION DES OPPORTUNITÉS
Évalue le potentiel de transformation selon 4 critères :

1. **Impact Durable** : La news aura-t-elle un impact au-delà de 3 mois ? (Oui/Non)
2. **Complexité** : Le sujet nécessite-t-il une expertise pour être compris ? (Faible/Moyen/Élevé)
3. **Potentiel de Recherche** : Volume estimé de requêtes liées (Faible/Moyen/Fort)
4. **Niveau de Concurrence** : Combien de sites traiteront ce sujet ? (Faible/Moyen/Saturé)

**Affiche un score global :**
- 🔴 Non rentable (0-2 critères positifs)
- 🟡 Rentable avec effort (3 critères positifs)
- 🟢 Très rentable (4 critères positifs)

### PHASE 3 : GÉNÉRATION DES ANGLES

Si le score est 🟡 ou 🟢, génère exactement **5 angles d'exploitation uniques**.

## RÈGLES ABSOLUES

1. Ne JAMAIS proposer de simplement "résumer" ou "reformuler" l'article source
2. Chaque angle doit apporter **3x plus de valeur** que la source
3. Privilégier les angles "comment faire" et "outils pratiques" vs "informations générales"
4. Intégrer systématiquement un élément interactif ou téléchargeable
5. Adapter le vocabulaire au niveau d'expertise du secteur de l'utilisateur
6. Éviter les angles déjà saturés par les gros médias
7. Viser des niches à forte intention commerciale ou informationnelle précise

## ADAPTATION PAR SECTEUR

### Pour secteur LOCAL (plombier, avocat, restaurant) :
- Intégrer systématiquement l'angle géographique
- Mentionner les réglementations locales/régionales
- Proposer un élément "devis/tarif transparent"

### Pour secteur B2B/SaaS :
- Focus sur ROI chiffré
- Comparatifs de solutions
- Études de cas avec métriques précises

### Pour secteur E-commerce :
- Guides d'achat détaillés
- Comparatifs produits avec tableau
- FAQ produit exhaustive

## FORMAT DE RÉPONSE OBLIGATOIRE (JSON)

{
  "scoreRentabilite": "🟢",
  "justificationScore": "Justification détaillée du score",
  "angles": [
    {
      "numero": 1,
      "titre": "Titre H1 SEO optimisé",
      "typeIntention": "Info|Commercial|Transac",
      "elementDifferenciateur": "Ce qui rend cet angle unique",
      "motCleCible": "Requête précise ciblée",
      "difficulteSEO": "Facile|Moyen|Difficile",
      "promesseUnique": "Promesse impossible à copier",
      "contenuObligatoire": ["Élément 1", "Élément 2", "Élément 3"],
      "requetesLSI": ["mot-clé longue traîne 1", "mot-clé 2", "mot-clé 3", "mot-clé 4", "mot-clé 5"],
      "featuredSnippet": {
        "formatRecommande": "Liste numérotée|Tableau|Définition courte|Paragraphe court",
        "questionPAA": "Question People Also Ask exacte"
      },
      "strategiePublication": {
        "timing": "Immédiat < 24h|Approfondi 3-5 jours|Long-terme 1-2 semaines",
        "longueurCible": "800-1200|2000-3000|4000+ mots",
        "miseAJour": "Aucune|Mensuelle|Trimestrielle"
      },
      "potentielConversion": "Description du potentiel de conversion",
      "visuels": ["Type visuel 1", "Type visuel 2", "Type visuel 3"]
    }
  ],
  "planAction": {
    "priorite1": {
      "angle": 1,
      "titre": "Titre de l'angle prioritaire",
      "raison": "Pourquoi cet angle en priorité",
      "roi": "Élevé|Moyen",
      "tempsProduction": "X heures/jours"
    },
    "priorite2": {
      "angle": 2,
      "titre": "Titre",
      "raison": "Raison",
      "roi": "Élevé|Moyen",
      "tempsProduction": "X heures/jours"
    },
    "priorite3": {
      "angle": 3,
      "titre": "Titre",
      "raison": "Raison",
      "roi": "Moyen|Faible",
      "tempsProduction": "X heures/jours"
    }
  },
  "maillageInterne": {
    "articlesALier": ["Description lien 1", "Description lien 2", "Description lien 3"],
    "architecture": "Recommandation d'architecture de cluster"
  },
  "quickWin": "Conseil rapide pour exploiter l'actualité sous 48h"
}

## SI LE SCORE EST 🔴 (Non rentable)

{
  "scoreRentabilite": "🔴",
  "justificationScore": "Explication pourquoi non rentable",
  "angles": [],
  "planAction": null,
  "maillageInterne": null,
  "quickWin": null,
  "nonRentable": {
    "raisons": ["Raison 1", "Raison 2", "Raison 3"],
    "typesAPrilegier": ["Type d'actualités 1 avec exemple", "Type 2 avec exemple"],
    "recommandationAlternative": "Suggestion stratégique adaptée au secteur"
  }
}`;

export async function runNewsTransformer(
    input: NewsTransformerInput
): Promise<NewsTransformerResult> {
    const userPrompt = `
Transforme cet article en opportunités SEO :

**URL de l'article source :**
${input.url}

**Mon secteur d'activité :**
${input.secteur}

**Mon expertise principale :**
${input.expertise}

**Mot-clé que je cible :**
${input.motCle || 'Non spécifié'}

**Type de contenu souhaité :**
${input.typeContenu.length > 0 ? input.typeContenu.join(', ') : 'Article de blog informatif'}

**Audience cible :**
${input.audience}

**Niveau de technicité attendu :**
${input.technicite}

**Objectif principal :**
${input.objectif || 'Générer du trafic organique'}

**Contraintes spécifiques :**
${input.contraintes || 'Aucune'}

**Articles existants à lier :**
${input.articlesExistants || 'Aucun'}

Analyse cette actualité et génère les 5 angles SEO stratégiques selon le format JSON défini.
  `.trim();

    return generateWithGemini(
        SYSTEM_PROMPT,
        userPrompt,
        (text) => {
            const parsed = JSON.parse(text);

            // Handle non-rentable case
            if (parsed.scoreRentabilite === '🔴') {
                return {
                    scoreRentabilite: '🔴' as const,
                    justificationScore: parsed.justificationScore || 'Article non rentable',
                    angles: [],
                    planAction: null,
                    maillageInterne: null,
                    quickWin: null,
                    nonRentable: {
                        raisons: parsed.nonRentable?.raisons || [],
                        typesAPrilegier: parsed.nonRentable?.typesAPrilegier || [],
                        recommandationAlternative: parsed.nonRentable?.recommandationAlternative || ''
                    }
                };
            }

            // Parse angles
            const angles: SEOAngle[] = (parsed.angles || []).map((angle: Partial<SEOAngle>, index: number) => ({
                numero: angle.numero || index + 1,
                titre: angle.titre || '',
                typeIntention: angle.typeIntention || 'Info',
                elementDifferenciateur: angle.elementDifferenciateur || '',
                motCleCible: angle.motCleCible || '',
                difficulteSEO: angle.difficulteSEO || 'Moyen',
                promesseUnique: angle.promesseUnique || '',
                contenuObligatoire: angle.contenuObligatoire || [],
                requetesLSI: angle.requetesLSI || [],
                featuredSnippet: {
                    formatRecommande: angle.featuredSnippet?.formatRecommande || 'Liste numérotée',
                    questionPAA: angle.featuredSnippet?.questionPAA || ''
                },
                strategiePublication: {
                    timing: angle.strategiePublication?.timing || 'Approfondi 3-5 jours',
                    longueurCible: angle.strategiePublication?.longueurCible || '2000-3000',
                    miseAJour: angle.strategiePublication?.miseAJour || 'Trimestrielle'
                },
                potentielConversion: angle.potentielConversion || '',
                visuels: angle.visuels || []
            }));

            return {
                scoreRentabilite: parsed.scoreRentabilite || '🟡',
                justificationScore: parsed.justificationScore || '',
                angles,
                planAction: parsed.planAction ? {
                    priorite1: {
                        angle: parsed.planAction.priorite1?.angle || 1,
                        titre: parsed.planAction.priorite1?.titre || '',
                        raison: parsed.planAction.priorite1?.raison || '',
                        roi: parsed.planAction.priorite1?.roi || 'Moyen',
                        tempsProduction: parsed.planAction.priorite1?.tempsProduction || ''
                    },
                    priorite2: {
                        angle: parsed.planAction.priorite2?.angle || 2,
                        titre: parsed.planAction.priorite2?.titre || '',
                        raison: parsed.planAction.priorite2?.raison || '',
                        roi: parsed.planAction.priorite2?.roi || 'Moyen',
                        tempsProduction: parsed.planAction.priorite2?.tempsProduction || ''
                    },
                    priorite3: {
                        angle: parsed.planAction.priorite3?.angle || 3,
                        titre: parsed.planAction.priorite3?.titre || '',
                        raison: parsed.planAction.priorite3?.raison || '',
                        roi: parsed.planAction.priorite3?.roi || 'Moyen',
                        tempsProduction: parsed.planAction.priorite3?.tempsProduction || ''
                    }
                } : null,
                maillageInterne: parsed.maillageInterne ? {
                    articlesALier: parsed.maillageInterne.articlesALier || [],
                    architecture: parsed.maillageInterne.architecture || ''
                } : null,
                quickWin: parsed.quickWin || null,
                nonRentable: null
            };
        }
    );
}

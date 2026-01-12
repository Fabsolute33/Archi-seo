import { generateWithGemini } from '../GeminiService';
import type { ClusterArchitecture, StrategicAnalysis } from '../../types/agents';

const SYSTEM_PROMPT = `Tu es l'AGENT 2 : "CLUSTER ARCHITECT" - Architecte de l'information et concepteur de clusters.

⚠️ RÈGLE CRITIQUE : SPÉCIFICITÉ THÉMATIQUE ABSOLUE ⚠️
Tous les clusters, titres d'articles et mots-clés DOIVENT être 100% spécifiques au secteur d'activité.
INTERDICTION de produire des clusters ou titres génériques applicables à n'importe quel secteur.
Chaque titre DOIT contenir au moins un terme du VOCABULAIRE SECTORIEL fourni.

MISSIONS:

1. **Définir l'architecture globale SPÉCIFIQUE AU SECTEUR**
   - Créer 5 à 7 clusters thématiques ULTRA-SPÉCIFIQUES au métier (MINIMUM 5 !)
   - Répartir selon le funnel (2-3 BOFU, 2-3 MOFU, 2 TOFU)
   - Les noms de clusters doivent utiliser le jargon du secteur

2. **Pour chaque cluster, définir** 
   - Nom du cluster avec TERME MÉTIER + positionnement funnel
   - Objectif stratégique mesurable
   - 6 à 8 articles avec titres utilisant le VOCABULAIRE SECTORIEL (MINIMUM 6 !)
   - Structure de maillage interne
   
   🚨 IMPORTANT: Chaque cluster doit avoir AU MOINS 6 titres d'articles dans pagesPiliers

3. **Créer la roadmap 90 jours**
   - Mois 1 : Articles BOFU (6-8 articles) → Objectif: Conversions rapides
   - Mois 2 : Articles MOFU (8-10 articles) → Objectif: Nurturing & considération
   - Mois 3 : Articles TOFU (6-8 articles) → Objectif: Volume & autorité

RÈGLES IMPÉRATIVES:
- Cannibalisation zéro (1 URL = 1 Intent)
- Titres avec chiffres, années (2025/2026), promesses mesurables
- CHAQUE TITRE doit contenir un terme spécifique au secteur

CONTRAINTES ANTI-GÉNÉRICITÉ:
❌ INTERDITS : "améliorer", "optimiser", "les avantages", "tout savoir", "guide complet"
✅ OBLIGATOIRES : termes métier, noms de procédures, normes sectorielles, types de clients spécifiques

FORMATS OBLIGATOIRES POUR LES TITRES:
✅ "Comment [Action Métier Précise] grâce à [Technique du Secteur] en [Délai]"
✅ "[Chiffre] Erreurs de [Type Client Spécifique] en [Domaine Métier] (2026)"
✅ "[Service Spécifique] : Prix Réels, Arnaques à Éviter, Guide [Année] [Zone]"

FORMATS INTERDITS:
❌ "Les avantages de X"
❌ "Tout savoir sur Y"
❌ "Introduction à Z"
❌ Titres sans terme métier spécifique

FORMAT DE RÉPONSE OBLIGATOIRE (JSON):
{
  "schemaVisuel": "Représentation ASCII de l'architecture (ex: Page Accueil → Cluster 1 → Articles)",
  "clusters": [
    {
      "id": "cluster-1",
      "nom": "Nom du cluster",
      "funnel": "BOFU|MOFU|TOFU",
      "objectifStrategique": "Objectif précis et mesurable",
      "description": "Description courte du cluster",
      "motsCles": ["mot-clé principal", "mot-clé 2", "mot-clé 3"],
      "volumeEstime": "Volume mensuel total estimé",
      "priorite": 1,
      "pagesPiliers": ["Titre article 1", "Titre article 2", "Titre article 3", "Titre article 4"],
      "maillageVers": ["cluster-2", "cluster-3"],
      "maillageDepuis": ["cluster-4"]
    }
  ],
  "roadmap90Jours": [
    {
      "semaine": 1,
      "mois": 1,
      "cluster": "Nom du cluster",
      "focus": "BOFU|MOFU|TOFU",
      "actions": ["Rédiger article X", "Optimiser page Y"],
      "livrables": ["Article publié 1", "Article publié 2"],
      "kpis": ["KPI à suivre"]
    }
  ],
  "maillageInterne": [
    {
      "de": "Titre article source",
      "vers": "Titre article destination",
      "ancre": "Texte d'ancre optimisé",
      "typeDeLink": "contextuel|navigation|footer",
      "cluster": "intra-cluster|inter-cluster"
    }
  ],
  "kpisParPhase": {
    "mois1": {"objectif": "Conversions rapides", "kpis": ["Taux de conversion", "Leads générés"]},
    "mois2": {"objectif": "Nurturing", "kpis": ["Temps sur page", "Pages par session"]},
    "mois3": {"objectif": "Volume & autorité", "kpis": ["Trafic organique", "Backlinks acquis"]}
  }
}`;

export async function runClusterArchitect(
  businessDescription: string,
  strategicAnalysis: StrategicAnalysis
): Promise<ClusterArchitecture> {
  // Récupérer le vocabulaire sectoriel
  const vocabMetier = strategicAnalysis.vocabulaireSectoriel?.termesMetier?.join(', ') || '';
  const vocabClients = strategicAnalysis.vocabulaireSectoriel?.termesClients?.join(', ') || '';
  const entitesGoogle = strategicAnalysis.vocabulaireSectoriel?.entitesGoogle?.join(', ') || '';
  const secteur = strategicAnalysis.contexteBusiness?.secteur || 'non défini';

  const userPrompt = `BUSINESS:
${businessDescription}

⚠️ SECTEUR D'ACTIVITÉ : ${secteur} ⚠️

📖 VOCABULAIRE SECTORIEL OBLIGATOIRE (UTILISE CES TERMES DANS LES TITRES):
- Termes métier : ${vocabMetier}
- Termes clients : ${vocabClients}
- Entités Google : ${entitesGoogle}

DIAGNOSTIC DE L'AGENT 1 (STRATEGIC ANALYZER):
- Avatar: ${strategicAnalysis.avatar.segment}
- Douleurs principales: ${strategicAnalysis.douleursTop5.map(d => d.douleur).join(', ')}
- Niveau E-E-A-T requis: ${strategicAnalysis.niveauEEAT.requis}
- Content Gaps identifiés: ${strategicAnalysis.contentGaps.map(c => c.sujet).join(', ')}
- Micro-niches: ${strategicAnalysis.microNiches.map(m => m.niche).join(', ')}
- Super-pouvoir: ${strategicAnalysis.levierDifferentiation.angle}

❌ INTERDITS ABSOLUS:
- Titres sans terme métier du secteur
- Clusters génériques comme "Services", "Conseils", "Actualités"
- Mots-clés vagues comme "meilleur", "qualité", "professionnel"

✅ OBJECTIF: Créer une architecture de 4-7 clusters thématiques ULTRA-SPÉCIFIQUES au secteur "${secteur}".
Chaque titre d'article doit contenir au moins un terme du vocabulaire sectoriel ci-dessus.
Répartition: 2-3 BOFU + 2-3 MOFU + 1-2 TOFU

→ Transmission au prochain agent après ton livrable.`;

  return generateWithGemini<ClusterArchitecture>(
    SYSTEM_PROMPT,
    userPrompt,
    (text) => {
      const parsed = JSON.parse(text);
      return {
        clusters: parsed.clusters || [],
        roadmap90Jours: parsed.roadmap90Jours || [],
        maillageInterne: parsed.maillageInterne || [],
        schemaVisuel: parsed.schemaVisuel,
        kpisParPhase: parsed.kpisParPhase
      } as ClusterArchitecture;
    }
  );
}

import { generateWithGemini } from '../GeminiService';
import type { ClusterArchitecture, StrategicAnalysis } from '../../types/agents';

const SYSTEM_PROMPT = `Tu es l'AGENT 2 : "CLUSTER ARCHITECT" - Architecte de l'information et concepteur de clusters.

MISSIONS:

1. **Définir l'architecture globale**
   - Créer 4 à 7 clusters thématiques
   - Répartir selon le funnel (2-3 BOFU, 2-3 MOFU, 1-2 TOFU)
   - Établir la hiérarchie et les relations entre clusters

2. **Pour chaque cluster, définir**
   - Nom du cluster + positionnement funnel
   - Objectif stratégique
   - 4 à 8 articles avec titres optimisés
   - Structure de maillage interne

3. **Créer la roadmap 90 jours**
   - Mois 1 : Articles BOFU (4-6 articles) → Objectif: Conversions rapides
   - Mois 2 : Articles MOFU (6-8 articles) → Objectif: Nurturing & considération
   - Mois 3 : Articles TOFU (4-6 articles) → Objectif: Volume & autorité
   - KPIs par phase

RÈGLES IMPÉRATIVES:
- Cannibalisation zéro (1 URL = 1 Intent)
- Titres avec chiffres, années (2025/2026), promesses mesurables
- Mobile-first (paragraphes courts)

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
  const userPrompt = `BUSINESS:
${businessDescription}

DIAGNOSTIC DE L'AGENT 1 (STRATEGIC ANALYZER):
- Avatar: ${strategicAnalysis.avatar.segment}
- Douleurs principales: ${strategicAnalysis.douleursTop5.map(d => d.douleur).join(', ')}
- Niveau E-E-A-T requis: ${strategicAnalysis.niveauEEAT.requis}
- Content Gaps identifiés: ${strategicAnalysis.contentGaps.map(c => c.sujet).join(', ')}
- Micro-niches: ${strategicAnalysis.microNiches.map(m => m.niche).join(', ')}
- Super-pouvoir: ${strategicAnalysis.levierDifferentiation.angle}

OBJECTIF: Créer une architecture de 4-7 clusters thématiques avec roadmap 90 jours.
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

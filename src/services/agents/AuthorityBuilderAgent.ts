import { generateWithGemini } from '../GeminiService';
import type { AuthorityStrategy, StrategicAnalysis } from '../../types/agents';

const SYSTEM_PROMPT = `Tu es l'AGENT 6 : "AUTHORITY BUILDER" - Constructeur d'autorité et spécialiste E-E-A-T.

MISSIONS:

1. **Identifier les signaux d'autorité E-E-A-T**
   - Experience: Preuves d'expérience pratique (photos terrain, études de cas)
   - Expertise: 3-5 certifications/qualifications sectorielles
   - Authoritativeness: 3-5 organismes de référence à citer
   - Trustworthiness: Sources officielles (.gouv, .edu, .org)

2. **Stratégie de Freshness**
   - Plan de mise à jour par type d'article (BOFU/MOFU/TOFU)
   - Format des dates de mise à jour visible
   - Statistiques récentes à intégrer (2025/2026)
   - Section "Nouveautés" à ajouter

3. **Preuves sociales**
   - Citations d'experts du domaine
   - Études de cas chiffrées (résultats clients)
   - Structure des témoignages efficaces

4. **Stratégie de backlinks**
   - 10 sites cibles prioritaires avec DA estimé
   - Templates d'emails de prospection PERSONNALISÉS
   - Calendrier de netlinking 90 jours
   - Stratégies: annuaires, blogs invités, presse, forums, broken links

FORMAT DE RÉPONSE OBLIGATOIRE (JSON):
{
  "signauxEEAT": {
    "experience": {
      "preuves": ["Preuve d'expérience 1", "Preuve 2"],
      "actionsRecommandees": ["Action 1 pour démontrer l'expérience"]
    },
    "expertise": {
      "certifications": [
        {"nom": "Nom certification", "organisme": "Organisme délivrant", "pertinence": "Pourquoi c'est important", "urlObtention": "Lien pour obtenir"}
      ]
    },
    "authoritativeness": {
      "organismesReference": [
        {"nom": "Organisme officiel", "type": "Institution|Association|Fédération", "actionRecommandee": "Comment obtenir mention/lien"}
      ]
    },
    "trustworthiness": {
      "sourcesOfficielles": [
        {"url": "Type de source (.gouv, .edu, etc.)", "utilisation": "Comment l'intégrer dans le contenu", "articlesCibles": ["Article où l'utiliser"]}
      ]
    }
  },
  "planFreshness": [
    {
      "typeArticle": "BOFU|MOFU|TOFU",
      "frequenceMiseAJour": "Tous les 3 mois|6 mois|12 mois",
      "formatDateVisible": "Format recommandé (ex: 'Mis à jour le DD/MM/YYYY')",
      "sectionsAMettre": ["Section Nouveautés 2026", "Statistiques récentes"],
      "indicateurs": ["Élément à surveiller pour déclencheur de MAJ"]
    }
  ],
  "preuvesSociales": {
    "expertsACiter": [
      {"nom": "Nom de l'expert", "titre": "Fonction/Titre", "citation": "Citation utilisable", "source": "Où trouver"}
    ],
    "etudesCas": [
      {"titre": "Titre de l'étude de cas", "resultatsChiffres": "X% d'amélioration, Y€ économisés", "structure": "Problème → Solution → Résultat"}
    ],
    "templateTemoignage": "Structure type: [Nom] + [Fonction] + [Problème avant] + [Solution] + [Résultat chiffré] + [Recommandation]"
  },
  "ciblesBacklinks": [
    {
      "site": "Nom du site cible",
      "url": "URL ou type de page cible",
      "da": 45,
      "type": "Annuaire|Blog|Presse|Forum|BrokenLink",
      "approche": "Stratégie d'approche personnalisée",
      "templateProspection": "Objet: [Objet accrocheur]\\n\\nBonjour [Prénom],\\n\\n[Corps du message personnalisé]\\n\\n[CTA]\\n\\n[Signature]",
      "chancesSucces": "élevées|moyennes|faibles"
    }
  ],
  "calendrierNetlinking": [
    {
      "semaine": 1,
      "actions": ["Action netlinking 1", "Action 2"],
      "objectif": "X backlinks",
      "cibles": ["Site 1", "Site 2"]
    }
  ]
}`;

export async function runAuthorityBuilder(
  businessDescription: string,
  strategicAnalysis: StrategicAnalysis
): Promise<AuthorityStrategy> {
  const userPrompt = `BUSINESS:
${businessDescription}

ANALYSE AGENT 1 (STRATEGIC ANALYZER):
- Niveau E-E-A-T requis: ${strategicAnalysis.niveauEEAT.requis}
- Justification: ${strategicAnalysis.niveauEEAT.justification}
- Normes sectorielles: ${strategicAnalysis.niveauEEAT.normes?.join(', ') || 'À identifier'}
- Actions prioritaires: ${strategicAnalysis.niveauEEAT.actionsPrioritaires.join(', ')}

POSITIONNEMENT DIFFÉRENCIANT:
- Super-pouvoir: ${strategicAnalysis.levierDifferentiation.superPouvoir || strategicAnalysis.levierDifferentiation.angle}
- Message unique: ${strategicAnalysis.levierDifferentiation.messageUnique}

AVATAR CLIENT:
- Segment: ${strategicAnalysis.avatar.segment}

OBJECTIF: Construire une stratégie E-E-A-T complète avec:
1. Signaux d'autorité par dimension (Experience, Expertise, Authority, Trust)
2. Plan Freshness par type d'article
3. 10 cibles backlinks avec templates email PERSONNALISÉS prêts à envoyer
4. Calendrier netlinking 90 jours

→ Transmission à l'Agent COORDINATOR après ton livrable.`;

  return generateWithGemini<AuthorityStrategy>(
    SYSTEM_PROMPT,
    userPrompt,
    (text) => {
      const parsed = JSON.parse(text);
      return {
        certifications: parsed.signauxEEAT?.expertise?.certifications || [],
        organismesReference: parsed.signauxEEAT?.authoritativeness?.organismesReference || [],
        sourcesOfficielles: parsed.signauxEEAT?.trustworthiness?.sourcesOfficielles || [],
        planFreshness: parsed.planFreshness || [],
        ciblesBacklinks: parsed.ciblesBacklinks || [],
        signauxEEAT: parsed.signauxEEAT,
        preuvesSociales: parsed.preuvesSociales,
        calendrierNetlinking: parsed.calendrierNetlinking
      } as AuthorityStrategy;
    }
  );
}

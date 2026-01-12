import { generateWithGemini } from '../GeminiService';
import type { ContentDesign, ClusterArchitecture, StrategicAnalysis } from '../../types/agents';

const SYSTEM_PROMPT = `Tu es l'AGENT 3 : "CONTENT DESIGNER" - Designer de contenu et spécialiste SEO on-page.

🚨🚨🚨 RÈGLE VOLUME OBLIGATOIRE 🚨🚨🚨
Tu DOIS générer entre 20 et 30 articles au MINIMUM.
Répartition OBLIGATOIRE :
- 4 à 6 articles par cluster (pas moins !)
- Couvrir TOUS les clusters fournis par l'Agent 2
- Si tu as 5 clusters → génère MINIMUM 25 articles
ÉCHEC = moins de 20 articles. SUCCÈS = 25-30 articles.

⚠️ RÈGLE CRITIQUE : SPÉCIFICITÉ THÉMATIQUE ABSOLUE ⚠️
Tous les éléments générés DOIVENT être 100% spécifiques au secteur d'activité.
INTERDICTION de produire du contenu générique.

MISSIONS:

1. **Créer les tableaux détaillés par cluster avec VOCABULAIRE MÉTIER**
   Pour chaque article, définir OBLIGATOIREMENT les 13 colonnes:
   
   1. Cluster (Thème du groupe - utiliser jargon métier)
   2. Titre H1 "Click-Magnet" avec chiffres/année ET TERME MÉTIER
   3A. Angle Différenciant (information absente chez concurrents - SPÉCIFIQUE au secteur)
   3B. Trigger Émotionnel formulé avec le LANGAGE DU CLIENT du secteur
   4. Promesse Unique (Hook principal avec vocabulaire client)
   5. Contenu Obligatoire (3-5 points techniques MÉTIER)
   6. Carburant Sémantique (Terme autoritaire DU SECTEUR + Entité Google + LSI spécifiques)
   7. Question PAA pour H2 principal (question que POSE le client dans ce secteur)
   8. Format Snippet (Position 0: tableau/liste/définition)
   9. Schema Markup approprié (Article, FAQ, HowTo, Product, Review, LocalBusiness)
   10. Appât SXO (calculateur/checklist/template SPÉCIFIQUE au métier)
   11. Intent & Funnel (BOFU/MOFU/TOFU)
   12. Score de Priorité (Volume 1-10, Difficulté 1-10, Impact Business 1-10)
   13. Suggestions d'Images IA (2 à 5 visuels SPÉCIFIQUES au sujet de l'article)

2. **Optimiser pour la visibilité SECTORIELLE**
   - Appâts SXO utilisant la terminologie client
   - Questions PAA formulées comme les clients du secteur

CONTRAINTES ANTI-GÉNÉRICITÉ - ABSOLUMENT CRITIQUE:
❌ INTERDITS FORMELS:
- "améliorer", "optimiser", "augmenter", "booster" sans contexte métier
- "les avantages de", "tout savoir sur", "guide complet"
- Termes génériques : "qualité", "expertise", "professionnel", "meilleur"
- Triggers émotionnels génériques sans lien avec le secteur
- Carburants sémantiques non spécifiques au métier

✅ OBLIGATOIRES:
- Chaque titre contient au moins 1 terme du vocabulaire sectoriel
- Les douleurs sont formulées comme le CLIENT les exprime
- Les appâts SXO sont spécifiques au métier (calculateur de devis, checklist normes, etc.)
- Les questions PAA reflètent les vraies recherches du secteur

FORMATS OBLIGATOIRES POUR LES TITRES:
✅ "Comment [Action Métier Technique] grâce à [Méthode du Secteur] en [Délai]"
✅ "[Chiffre] Erreurs de [Type Client Spécifique] en [Domaine Métier Précis] (2026)"
✅ "[Service Métier Précis] [Zone] : Prix Réels, Arnaques, Guide [Année]"

FORMATS INTERDITS:
❌ "Les avantages de X"
❌ "Tout savoir sur Y"
❌ "Introduction à Z"
❌ Tout titre sans terme métier spécifique

═══════════════════════════════════════════════════════════════════════════════
INSTRUCTIONS DÉTAILLÉES POUR LES PROMPTS D'IMAGES (Google Gemini)
═══════════════════════════════════════════════════════════════════════════════

## CHOISIR LA CATÉGORIE D'IMAGE

### PHOTOGRAPHIE (category: "photography")
Pour : articles lifestyle, témoignages, cas pratiques, guides visuels
Quand : besoin d'authenticité, d'émotion, de contexte réel

### INFOGRAPHIE (category: "infographic")
Pour : statistiques, comparaisons, processus étape par étape, données chiffrées
Quand : besoin de clarifier des informations complexes, visualiser des données

### ILLUSTRATION (category: "illustration")
Pour : concepts abstraits, explications pédagogiques, contenu créatif
Quand : besoin de simplification, de storytelling visuel, d'originalité

### SCHÉMA/DIAGRAMME (category: "schema")
Pour : processus techniques, architectures, flux de travail, relations entre éléments
Quand : besoin de précision, de logique, d'explication structurée

---

## STYLES VISUELS PAR CATÉGORIE

### Styles PHOTOGRAPHIE:
- "professional photography" → rendu corporate/professionnel
- "editorial style photography" → articles de presse/magazine
- "high-quality stock photo aesthetic" → look propre et universel
- "modern minimalist photography" → contenu tech/design
- "lifestyle photography" → contenu bien-être/quotidien
- "documentary style" → contenu informatif/éducatif

### Styles INFOGRAPHIE:
- "modern infographic design" → style contemporain et clair
- "minimalist data visualization" → épuré, focus sur les données
- "professional business infographic" → corporate et sérieux
- "flat design infographic" → style flat moderne
- "isometric infographic illustration" → perspective 3D stylisée

### Styles ILLUSTRATION:
- "flat vector illustration" → style plat, moderne
- "line art illustration" → épuré, minimaliste
- "hand-drawn illustration style" → chaleureux, humain
- "digital art illustration" → contemporain, détaillé
- "minimalist geometric illustration" → abstrait, simple
- "editorial illustration style" → sophistiqué, magazine

### Styles SCHÉMA/DIAGRAMME:
- "clean technical diagram" → précis et professionnel
- "flowchart visualization" → flux logique clair
- "system architecture diagram" → technique structuré
- "minimalist process diagram" → simple et efficace
- "blueprint style schematic" → technique détaillé

---

## STRUCTURE DU PROMPT (tous les éléments)

1. **STYLE VISUEL** (obligatoire) - choisi parmi les styles ci-dessus
2. **SUJET PRINCIPAL** (obligatoire) - description spécifique et concrète
3. **COMPOSITION** - angle, layout, point focal, format (16:9, square, vertical)
4. **ÉCLAIRAGE/RENDU** - natural daylight, soft diffused, flat lighting, etc.
5. **PALETTE DE COULEURS** - blue and white, earth tones, vibrant colors, etc.
6. **ATMOSPHÈRE** - professional, innovative, calm, dynamic, etc.
7. **CONTEXTE** - modern office, outdoor, minimalist setting, etc.
8. **QUALITÉ** - ajouter "Professional quality, sharp focus, high resolution"

---

## ÉLÉMENTS NÉGATIFS OBLIGATOIRES (negativePrompt)

### Pour PHOTOGRAPHIE:
"text, watermark, logo, signature, blurry faces, distorted hands, low quality, pixelated, oversaturated, cartoon style, amateur photography, cluttered composition, harsh shadows"

### Pour INFOGRAPHIE:
"photorealistic, photograph, cluttered, too much text, unreadable fonts, complex 3D rendering, messy layout, low contrast, blurry, pixelated, watermark"

### Pour ILLUSTRATION:
"photorealistic, photograph, 3D render, blurry, pixelated, overdetailed, cluttered, text, watermark, low quality, inconsistent style"

### Pour SCHÉMA/DIAGRAMME:
"decorative elements, artistic flourishes, photorealistic, complex textures, gradients, shadows, 3D effects, cluttered, illegible text, watermark"

---

## TEMPLATES DE PROMPTS PAR CATÉGORIE

### TEMPLATE PHOTOGRAPHIE:
"[STYLE], [SUJET PRINCIPAL], [COMPOSITION], [ÉCLAIRAGE], [PALETTE], [ATMOSPHÈRE], [CONTEXTE]. Professional quality, sharp focus, high resolution, 8K detail."

### TEMPLATE INFOGRAPHIE:
"[STYLE], [DONNÉES À VISUALISER], [LAYOUT], [PALETTE], [ÉLÉMENTS VISUELS] (icons, charts), minimal text, clean organized design, professional quality, high contrast."

### TEMPLATE ILLUSTRATION:
"[STYLE], [CONCEPT À ILLUSTRER], [COMPOSITION], [PALETTE], [AMBIANCE], clean lines, professional quality, suitable for editorial use."

### TEMPLATE SCHÉMA/DIAGRAMME:
"[STYLE], [SYSTÈME/PROCESSUS], [TYPE DE STRUCTURE] (flowchart, hierarchy), [PALETTE SIMPLE], clear labels and connections, minimalist design, technical precision."

---

## RÈGLES CRITIQUES POUR LES PROMPTS IMAGES

⚠️ OBLIGATOIRE - RESPECTE CES RÈGLES ABSOLUMENT :

1. **RÉDIGÉ EN FRANÇAIS** - Tous les prompts doivent être écrits en français
2. **2 À 5 IMAGES PAR ARTICLE** - Varie les types et les angles
3. **DIRECTEMENT LIÉ AU SUJET** - Chaque prompt doit être SPÉCIFIQUE au titre H1 et au contenu de l'article
4. **VARIER LES VISUELS** - Ne pas répéter le même type d'image, alterner entre photographie, infographie, illustration, schéma
5. **DESCRIPTIF ET CONCRET** - Décris précisément la scène, les objets, les personnes, le contexte
6. **PAS DE VISUELS GÉNÉRIQUES** - Chaque image doit être unique et pertinente pour l'article spécifique
7. **COHÉRENCE AVEC LE FUNNEL** - BOFU = images plus commerciales, TOFU = images éducatives

### STRUCTURE D'UN BON PROMPT (en français) :
"[Style visuel], [description précise de la scène liée au sujet de l'article], [composition], [éclairage], [palette de couleurs], [atmosphère]. Qualité professionnelle, netteté parfaite, haute résolution."

### Exemple pour un article sur "Comment choisir son architecte" :
✅ BON : "Photographie professionnelle, un architecte concentré examine des plans de construction sur une grande table lumineuse dans un cabinet moderne, vue de trois-quarts, lumière naturelle douce, tons blancs et bois clair, atmosphère professionnelle et créative. Qualité professionnelle, netteté parfaite."
❌ MAUVAIS : "Photo professionnelle d'un bureau moderne" (trop générique, pas lié au sujet)

═══════════════════════════════════════════════════════════════════════════════

FORMAT DE RÉPONSE OBLIGATOIRE (JSON):
{
  "tableauContenu": [
    {
      "cluster": "Nom du cluster",
      "titreH1": "Titre Click-Magnet avec chiffre et année",
      "angle": "Information unique absente chez concurrents",
      "trigger": "Émotion ciblée (peur/curiosité/urgence/espoir)",
      "promesseUnique": "Hook principal: pourquoi cet article va changer la donne pour le lecteur (1 phrase impactante)",
      "contenuObligatoire": ["Point incontournable 1", "Point incontournable 2", "Point incontournable 3", "Point incontournable 4"],
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
      "imageSuggestions": [
        {
          "type": "photo-produit",
          "category": "photography",
          "style": "photographie professionnelle",
          "description": "Photo illustrant le sujet principal de l'article",
          "generationPrompt": "Photographie professionnelle, [DESCRIPTION PRÉCISE DE LA SCÈNE LIÉE AU TITRE H1], cadrage à hauteur des yeux avec faible profondeur de champ, éclairage naturel doux depuis de grandes fenêtres, palette de couleurs harmonieuse, atmosphère professionnelle et inspirante. Qualité professionnelle, netteté parfaite, haute résolution.",
          "negativePrompt": "texte, filigrane, logo, visages flous, mains déformées, basse qualité, pixelisé, photographie amateur, composition encombrée",
          "placement": "Introduction - accroche visuelle",
          "altText": "[Mot-clé principal] - illustration réaliste"
        },
        {
          "type": "infographie",
          "category": "infographic",
          "style": "infographie moderne",
          "description": "Infographie des étapes ou données clés liées au sujet",
          "generationPrompt": "Infographie moderne et professionnelle, visualisation des [ÉTAPES/DONNÉES SPÉCIFIQUES AU SUJET] avec icônes numérotées et flèches de progression, représentation basée sur des icônes plutôt que du texte, palette bleu et blanc avec accents orangés, fond blanc épuré, disposition horizontale équilibrée, texte minimal. Qualité professionnelle, contraste élevé.",
          "negativePrompt": "photoréaliste, photographie, encombré, trop de texte, polices illisibles, rendu 3D complexe, mise en page désordonnée, filigrane",
          "placement": "Après H2 - synthèse du processus",
          "altText": "[Sujet] - infographie des étapes clés"
        },
        {
          "type": "illustration",
          "category": "illustration",
          "style": "illustration vectorielle flat",
          "description": "Illustration conceptuelle du thème de l'article",
          "generationPrompt": "Illustration vectorielle flat design, représentation visuelle de [CONCEPT CLÉ DE L'ARTICLE] avec personnages stylisés et éléments graphiques modernes, composition équilibrée, palette de couleurs vives et harmonieuses, style éditorial professionnel, adapté au web. Qualité professionnelle, lignes nettes.",
          "negativePrompt": "photoréaliste, photographie, rendu 3D, flou, pixelisé, trop détaillé, encombré, texte, filigrane, style incohérent",
          "placement": "Section conseil - appui visuel",
          "altText": "[Concept] - illustration explicative"
        },
        {
          "type": "schema",
          "category": "schema",
          "style": "diagramme technique épuré",
          "description": "Schéma explicatif du processus ou concept clé",
          "generationPrompt": "Diagramme technique épuré, architecture visuelle de [PROCESSUS/SYSTÈME LIÉ AU SUJET] avec formes géométriques simples reliées par des flèches directionnelles, disposition hiérarchique, palette bleu et gris sur fond blanc, connexions claires et logiques, design minimaliste, précision technique.",
          "negativePrompt": "éléments décoratifs, fioritures artistiques, photoréaliste, textures complexes, dégradés, ombres, effets 3D, encombré, filigrane",
          "placement": "Section technique - explication du fonctionnement",
          "altText": "[Sujet] - schéma du processus"
        }
      ]
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
  // Récupérer le vocabulaire sectoriel complet
  const vocabMetier = strategicAnalysis.vocabulaireSectoriel?.termesMetier?.join(', ') || '';
  const vocabClients = strategicAnalysis.vocabulaireSectoriel?.termesClients?.join(', ') || '';
  const entitesGoogle = strategicAnalysis.vocabulaireSectoriel?.entitesGoogle?.join(', ') || '';
  const secteur = strategicAnalysis.contexteBusiness?.secteur || 'non défini';
  const sousSecteur = strategicAnalysis.contexteBusiness?.sousSecteur || '';

  const userPrompt = `BUSINESS:
${businessDescription}

⚠️ ⚠️ ⚠️ SECTEUR D'ACTIVITÉ : ${secteur} ${sousSecteur ? `- ${sousSecteur}` : ''} ⚠️ ⚠️ ⚠️

📖 VOCABULAIRE SECTORIEL À UTILISER DANS CHAQUE ÉLÉMENT:
🛠️ Termes métier (jargon pro) : ${vocabMetier}
🗣️ Termes clients (ce qu'ils cherchent) : ${vocabClients}
🎯 Entités Google (marques, normes, certifications) : ${entitesGoogle}

CLUSTERS DE L'AGENT 2 (CLUSTER ARCHITECT):
${clusterArchitecture.clusters.map(c => `
📦 ${c.nom} [${c.funnel}]
- Objectif: ${c.description}
- Pages piliers: ${c.pagesPiliers.join(', ')}
- Mots-clés: ${c.motsCles.join(', ')}`).join('\n')}

DOULEURS CLIENT À ADRESSER (avec langage sectoriel):
${strategicAnalysis.douleursTop5.map(d => `- ${d.douleur} (${d.intensite}) - Émotion: ${d.emotion || 'N/A'}`).join('\n')}

CONTENT GAPS À COMBLER (opportunités spécifiques):
${strategicAnalysis.contentGaps.map(c => `- ${c.sujet}: ${c.opportunite} [${c.difficulte}]`).join('\n')}

MICRO-NICHES À EXPLOITER:
${strategicAnalysis.microNiches.map(m => `- ${m.niche} (${m.volumeEstimé || 'N/A'}) - ${m.potentiel}`).join('\n')}

LEVIER DE DIFFÉRENCIATION:
- Super-pouvoir: ${strategicAnalysis.levierDifferentiation.superPouvoir || 'N/A'}
- Angle: ${strategicAnalysis.levierDifferentiation.angle}
- Message: ${strategicAnalysis.levierDifferentiation.messageUnique}

❌ INTERDITS ABSOLUS - VÉRIFICATION CRITIQUE:
- Aucun titre sans terme métier du secteur "${secteur}"
- Aucun trigger émotionnel générique (utilise le langage client)
- Aucun carburant sémantique hors-secteur
- Aucun appât SXO générique (doit être spécifique au métier)

✅ OBJECTIF VOLUME IMPÉRATIF: 
- Générer MINIMUM 25 articles (4-6 par cluster)
- Tableau 100% SPÉCIFIQUE au secteur "${secteur}"
- Chaque élément utilise le vocabulaire sectoriel ci-dessus

🚨 RAPPEL: Moins de 20 articles = ÉCHEC. Vise 25-30 articles.

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

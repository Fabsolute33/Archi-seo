import { generateWithGemini } from '../GeminiService';
import { scrapeUrl } from '../WebScraperService';
import type { CompetitorAnalysis, CompetitorSEOProfile } from '../../types/competitorTypes';
import type { ScrapedContent } from '../../types/auditTypes';

const SYSTEM_PROMPT = `Tu es l'AGENT 8 : "COMPETITOR ANALYZER" - Analyste concurrentiel SEO expert.

⚠️ RÈGLE CRITIQUE : ANALYSE BASÉE SUR LES DONNÉES RÉELLES ⚠️
Tu reçois les données scrapées RÉELLES des sites concurrents. Base ton analyse UNIQUEMENT sur ces données.

MISSIONS:

1. **Analyser chaque concurrent scrapé**
   - Estimer leur Domain Authority (DA) basé sur les signaux SEO visibles
   - Évaluer la qualité de leur contenu (longueur, structure, H1/H2)
   - Analyser leur profil de liens internes/externes

2. **Identifier les forces et faiblesses SEO**
   - Forces: ce qu'ils font bien (structure, contenu, mots-clés)
   - Faiblesses: leurs lacunes exploitables

3. **Repérer les opportunités**
   - Content gaps: sujets non couverts par les concurrents
   - Backlinks potentiels: sources de liens qu'ils utilisent
   - Stratégies de surclassement spécifiques

4. **Synthèse comparative**
   - Classement des concurrents par force SEO
   - Niveau de concurrence global
   - Opportunités prioritaires

ESTIMATION DU DA (basée sur les signaux):
- < 20: Site récent, peu de contenu, structure basique
- 20-35: Site établi, contenu moyen, quelques liens
- 35-50: Site mature, bon contenu, profil de liens solide
- > 50: Site leader, contenu excellent, nombreux backlinks

FORMAT DE RÉPONSE OBLIGATOIRE (JSON):
{
  "competitors": [
    {
      "url": "URL complète du concurrent",
      "daEstime": 35,
      "motsClesPrincipaux": ["mot-clé 1", "mot-clé 2", "mot-clé 3"],
      "forces": ["Force SEO identifiée 1", "Force 2"],
      "faiblesses": ["Faiblesse exploitable 1", "Faiblesse 2"],
      "contentGapsIdentifies": ["Sujet non couvert 1", "Sujet non couvert 2"],
      "backlinksARecuperer": ["Type de source de backlink à viser"],
      "strategieSurclassement": "Stratégie en 2-3 phrases pour surpasser ce concurrent"
    }
  ],
  "syntheseGlobale": {
    "concurrentLePlusFort": "domain.com",
    "concurrentLePlusFaible": "autre.fr",
    "niveauConcurrence": "faible|moyenne|forte",
    "opportunitesPrioritaires": ["Opportunité 1", "Opportunité 2", "Opportunité 3"]
  },
  "recommandations": [
    "Recommandation stratégique 1 basée sur l'analyse",
    "Recommandation 2",
    "Recommandation 3"
  ]
}`;

interface AICompetitorResult {
    daEstime: number;
    motsClesPrincipaux: string[];
    forces: string[];
    faiblesses: string[];
    contentGapsIdentifies: string[];
    backlinksARecuperer: string[];
    strategieSurclassement: string;
}

interface AIAnalysisResult {
    competitors: (AICompetitorResult & { url: string })[];
    syntheseGlobale: {
        concurrentLePlusFort: string;
        concurrentLePlusFaible: string;
        niveauConcurrence: 'faible' | 'moyenne' | 'forte';
        opportunitesPrioritaires: string[];
    };
    recommandations: string[];
}

/**
 * Agent 8 : Analyse concurrentielle avec scraping
 * S'exécute après l'Agent 1 et en parallèle avec les Agents 3-6
 */
export async function runCompetitorAnalyzer(
    competitorUrls: string[],
    businessDescription: string,
    sector: string
): Promise<CompetitorAnalysis> {
    console.log('🔍 Agent 8 - Competitor Analyzer: Démarrage...');
    console.log(`📊 ${competitorUrls.length} concurrent(s) à analyser`);

    // Étape 1: Scraper chaque concurrent (max 5)
    const urlsToScrape = competitorUrls.slice(0, 5);
    const scrapedCompetitors: { url: string; data: ScrapedContent | null; error?: string }[] = [];

    for (const url of urlsToScrape) {
        console.log(`🌐 Scraping: ${url}`);
        try {
            const cleanUrl = url.trim();
            // Vérifier que l'URL est valide
            if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
                throw new Error('URL invalide - doit commencer par http:// ou https://');
            }
            const data = await scrapeUrl(cleanUrl);
            scrapedCompetitors.push({ url: cleanUrl, data });
            console.log(`✅ Scrapé: ${data.title} (${data.wordCount} mots)`);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
            console.warn(`⚠️ Échec scraping ${url}: ${errorMsg}`);
            scrapedCompetitors.push({
                url,
                data: null,
                error: errorMsg
            });
        }
    }

    // Vérifier qu'on a au moins un concurrent scrapé avec succès
    const successfulScrapes = scrapedCompetitors.filter(c => c.data !== null);
    if (successfulScrapes.length === 0) {
        console.warn('❌ Aucun concurrent scrapé avec succès');
        return {
            analysedAt: Date.now(),
            competitors: scrapedCompetitors.map(c => createEmptyProfile(c.url, c.error)),
            syntheseGlobale: {
                concurrentLePlusFort: 'N/A',
                concurrentLePlusFaible: 'N/A',
                niveauConcurrence: 'faible',
                opportunitesPrioritaires: ['Aucun concurrent analysé - vérifiez les URLs']
            },
            recommandations: ['Fournissez des URLs de concurrents valides et accessibles']
        };
    }

    // Étape 2: Préparer le prompt avec les données scrapées
    const competitorDataSummary = scrapedCompetitors.map((c, i) => {
        if (!c.data) {
            return `\n❌ CONCURRENT ${i + 1}: ${c.url}\n   Erreur: ${c.error || 'Impossible de scraper'}`;
        }
        return `
📊 CONCURRENT ${i + 1}: ${c.url}
   - Titre: ${c.data.title || 'Non trouvé'}
   - H1: ${c.data.h1.join(' | ') || 'Aucun'}
   - Nombre de H2: ${c.data.h2.length}
   - H2 principaux: ${c.data.h2.slice(0, 5).join(' | ')}
   - Nombre de mots: ${c.data.wordCount}
   - Liens internes: ${c.data.internalLinks.length}
   - Liens externes: ${c.data.externalLinks.length}
   - Images: ${c.data.images.length} (avec alt: ${c.data.images.filter(img => img.hasAlt).length})
   - Données structurées: ${c.data.structuredData?.length || 0} schema(s)
   - Extrait du contenu: ${c.data.bodyText.slice(0, 500)}...`;
    }).join('\n');

    const userPrompt = `NOTRE BUSINESS:
${businessDescription}

SECTEUR: ${sector}

═══════════════════════════════════════════════════════
DONNÉES SCRAPÉES DES CONCURRENTS (DONNÉES RÉELLES)
═══════════════════════════════════════════════════════
${competitorDataSummary}

═══════════════════════════════════════════════════════

OBJECTIF: Analyse chaque concurrent et identifie:
1. Leur niveau SEO estimé (DA)
2. Leurs forces et faiblesses
3. Les opportunités pour nous les surpasser
4. Une synthèse comparative globale

Génère le JSON d'analyse.`;

    console.log('🤖 Analyse IA des concurrents...');

    // Étape 3: Analyse IA
    const aiAnalysis = await generateWithGemini<AIAnalysisResult>(
        SYSTEM_PROMPT,
        userPrompt,
        (text) => {
            const parsed = JSON.parse(text);
            return parsed as AIAnalysisResult;
        }
    );

    console.log('✅ Analyse IA terminée');

    // Étape 4: Enrichir avec les données scrapées
    const enrichedCompetitors: CompetitorSEOProfile[] = scrapedCompetitors.map((scraped, index) => {
        const aiData = aiAnalysis.competitors.find(c => c.url === scraped.url) || aiAnalysis.competitors[index];
        const domain = extractDomain(scraped.url);

        if (!scraped.data) {
            return {
                ...createEmptyProfile(scraped.url, scraped.error),
                ...(aiData && {
                    daEstime: aiData.daEstime || 0,
                    forces: aiData.forces || [],
                    faiblesses: aiData.faiblesses || [],
                    contentGapsIdentifies: aiData.contentGapsIdentifies || [],
                    backlinksARecuperer: aiData.backlinksARecuperer || [],
                    strategieSurclassement: aiData.strategieSurclassement || ''
                })
            };
        }

        return {
            url: scraped.url,
            domain,
            scrapedData: scraped.data,
            daEstime: aiData?.daEstime || estimateDA(scraped.data),
            titreH1: scraped.data.h1[0] || scraped.data.title || '',
            nombreH2: scraped.data.h2.length,
            wordCount: scraped.data.wordCount,
            nombreLiensInternes: scraped.data.internalLinks.length,
            nombreLiensExternes: scraped.data.externalLinks.length,
            backlinksEstimes: aiData?.backlinksARecuperer || [],
            motsClesPrincipaux: aiData?.motsClesPrincipaux || extractKeywords(scraped.data),
            densiteMotsCles: {},
            forces: aiData?.forces || [],
            faiblesses: aiData?.faiblesses || [],
            contentGapsIdentifies: aiData?.contentGapsIdentifies || [],
            backlinksARecuperer: aiData?.backlinksARecuperer || [],
            strategieSurclassement: aiData?.strategieSurclassement || ''
        };
    });

    console.log(`✅ Agent 8 terminé: ${enrichedCompetitors.length} concurrent(s) analysé(s)`);

    return {
        analysedAt: Date.now(),
        competitors: enrichedCompetitors,
        syntheseGlobale: aiAnalysis.syntheseGlobale || {
            concurrentLePlusFort: enrichedCompetitors.reduce((a, b) => a.daEstime > b.daEstime ? a : b).domain,
            concurrentLePlusFaible: enrichedCompetitors.reduce((a, b) => a.daEstime < b.daEstime ? a : b).domain,
            niveauConcurrence: 'moyenne',
            opportunitesPrioritaires: []
        },
        recommandations: aiAnalysis.recommandations || []
    };
}

/**
 * Crée un profil vide pour un concurrent non scrapé
 */
function createEmptyProfile(url: string, error?: string): CompetitorSEOProfile {
    return {
        url,
        domain: extractDomain(url),
        scrapedData: null,
        scrapeError: error,
        daEstime: 0,
        titreH1: '',
        nombreH2: 0,
        wordCount: 0,
        nombreLiensInternes: 0,
        nombreLiensExternes: 0,
        backlinksEstimes: [],
        motsClesPrincipaux: [],
        densiteMotsCles: {},
        forces: [],
        faiblesses: ['Impossible d\'analyser - URL inaccessible'],
        contentGapsIdentifies: [],
        backlinksARecuperer: [],
        strategieSurclassement: ''
    };
}

/**
 * Extrait le domaine d'une URL
 */
function extractDomain(url: string): string {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}

/**
 * Estimation basique du DA basée sur les signaux SEO
 */
function estimateDA(data: ScrapedContent): number {
    let score = 10; // Base

    // Contenu
    if (data.wordCount > 2000) score += 10;
    else if (data.wordCount > 1000) score += 5;

    // Structure
    if (data.h2.length >= 5) score += 5;
    if (data.h1.length === 1) score += 3;

    // Liens
    if (data.internalLinks.length > 20) score += 5;
    if (data.externalLinks.length > 5) score += 3;

    // Données structurées
    if (data.structuredData && data.structuredData.length > 0) score += 5;

    // Images optimisées
    const altRatio = data.images.length > 0
        ? data.images.filter(img => img.hasAlt).length / data.images.length
        : 0;
    if (altRatio > 0.8) score += 3;

    return Math.min(score, 60); // Max 60 car on ne peut pas vraiment estimer plus haut
}

/**
 * Extraction basique des mots-clés depuis le contenu
 */
function extractKeywords(data: ScrapedContent): string[] {
    const text = [data.title, ...data.h1, ...data.h2].join(' ').toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 4);
    const frequency: Record<string, number> = {};

    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word);
}

/**
 * Competitive Intelligence Agent
 * 
 * Analyse approfondie des concurrents pour identifier
 * des opportunités de les dépasser.
 */

import { generateWithGrounding } from '../GroundedGeminiService';
import type { StrategicAnalysis } from '../../types/agents';
import * as fs from 'fs';
import * as path from 'path';

// Load prompt from file if available
function loadPrompt(): string {
    const promptPath = path.join(__dirname, '../../..', '.agent/seo-architecte/prompts/competitive-intel.md');
    if (fs.existsSync(promptPath)) {
        return fs.readFileSync(promptPath, 'utf-8');
    }
    return DEFAULT_PROMPT;
}

const DEFAULT_PROMPT = `Tu es l'AGENT COMPETITIVE INTELLIGENCE - Expert en analyse concurrentielle SEO.

Mission: Analyser les concurrents pour trouver des opportunités de les dépasser.

Pour chaque concurrent, analyse:
1. Profil (DA, pages indexées, trafic estimé)
2. Forces et faiblesses SEO
3. Content gaps (ce qu'ils ont qu'on n'a pas)
4. Backlink opportunities
5. Stratégie pour les battre

FORMAT: JSON avec competitors[], contentGaps{}, backlinkOpportunities[], winStrategy{}`;

export interface CompetitorProfile {
    url: string;
    domain: string;
    profile: {
        estimatedDA: number;
        estimatedTraffic: number;
        indexedPages: number;
        topPages: Array<{
            url: string;
            keyword: string;
            position: number;
        }>;
    };
    strengths: string[];
    weaknesses: string[];
    contentMetrics: {
        averageWordCount: number;
        publishingFrequency: string;
        lastUpdate: string;
    };
}

export interface ContentGap {
    topic: string;
    competitors: string[];
    opportunity: 'high' | 'medium' | 'low';
}

export interface BacklinkOpportunity {
    source: string;
    type: 'guest-post' | 'mention' | 'resource' | 'directory';
    competitorsWithLink: string[];
    approachSuggestion: string;
}

export interface CompetitiveIntelResult {
    competitors: CompetitorProfile[];
    contentGaps: {
        theyHaveWeNot: ContentGap[];
        weHaveTheyNot: Array<{
            topic: string;
            advantage: string;
        }>;
        untapped: Array<{
            topic: string;
            estimatedVolume: number;
            difficulty: 'low' | 'medium' | 'high';
        }>;
    };
    backlinkOpportunities: BacklinkOpportunity[];
    winStrategy: {
        quickWins: string[];
        mediumTerm: string[];
        longTerm: string[];
        differentiators: string[];
    };
}

export async function runCompetitiveIntelligence(
    competitorUrls: string[],
    _businessContext: string,
    strategicAnalysis: StrategicAnalysis
): Promise<CompetitiveIntelResult> {
    const systemPrompt = loadPrompt();

    const secteur = strategicAnalysis.contexteBusiness?.secteur || 'Non défini';

    const userPrompt = `CONTEXTE BUSINESS:
Secteur: ${secteur}
Positionnement: ${strategicAnalysis.contexteBusiness?.positionnement || 'N/A'}

NOS FORCES ACTUELLES:
- Super-pouvoir: ${strategicAnalysis.levierDifferentiation?.superPouvoir || 'N/A'}
- Angle différenciant: ${strategicAnalysis.levierDifferentiation?.angle || 'N/A'}

CONCURRENTS À ANALYSER:
${competitorUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}

MICRO-NICHES IDENTIFIÉES:
${strategicAnalysis.microNiches?.map(m => `- ${m.niche}`).join('\n') || 'Aucune'}

CONTENT GAPS DÉJÀ IDENTIFIÉS:
${strategicAnalysis.contentGaps?.map(g => `- ${g.sujet}: ${g.opportunite}`).join('\n') || 'Aucun'}

INSTRUCTIONS:
1. Analyse CHAQUE concurrent en profondeur via recherche Google
2. Identifie leurs pages qui rankent le mieux
3. Compare leur stratégie à la nôtre
4. Trouve des opportunités de backlinks
5. Propose une stratégie pour les dépasser

⚠️ Utilise la recherche Google pour obtenir des données RÉELLES sur ces concurrents.`;

    const result = await generateWithGrounding<CompetitiveIntelResult>(
        systemPrompt,
        userPrompt,
        (text) => {
            const parsed = JSON.parse(text);
            return parsed as CompetitiveIntelResult;
        }
    );

    console.log(`🔍 Competitive Intel: ${result.result.competitors.length} competitors analyzed`);
    console.log(`📊 Content Gaps trouvés: ${result.result.contentGaps.theyHaveWeNot.length}`);
    console.log(`🔗 Backlink opportunities: ${result.result.backlinkOpportunities.length}`);

    return result.result;
}

/**
 * Génère un score de compétitivité global
 */
export function calculateCompetitiveScore(intel: CompetitiveIntelResult): {
    score: number;
    interpretation: string;
    topPriority: string;
} {
    // Factors
    const avgCompetitorDA = intel.competitors.reduce((sum, c) => sum + c.profile.estimatedDA, 0) / intel.competitors.length;
    const highOppGaps = intel.contentGaps.theyHaveWeNot.filter(g => g.opportunity === 'high').length;
    const lowDiffUntapped = intel.contentGaps.untapped.filter(u => u.difficulty === 'low').length;
    const backlinkOpps = intel.backlinkOpportunities.length;

    // Score calculation (0-100)
    let score = 50; // Base score

    // Lower competitor DA = easier = higher score
    if (avgCompetitorDA < 30) score += 20;
    else if (avgCompetitorDA < 50) score += 10;
    else score -= 10;

    // More high opportunity gaps = higher score
    score += Math.min(highOppGaps * 5, 15);

    // More easy untapped niches = higher score
    score += Math.min(lowDiffUntapped * 5, 15);

    // More backlink opportunities = higher score
    score += Math.min(backlinkOpps * 2, 10);

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Interpretation
    let interpretation: string;
    if (score >= 70) interpretation = '🟢 Marché accessible - Forte probabilité de succès rapide';
    else if (score >= 50) interpretation = '🟡 Marché compétitif - Succès possible avec stratégie solide';
    else interpretation = '🔴 Marché difficile - Stratégie long terme nécessaire';

    // Top priority
    let topPriority: string;
    if (lowDiffUntapped > 0) {
        topPriority = `Exploiter les ${lowDiffUntapped} niches non couvertes (faible difficulté)`;
    } else if (highOppGaps > 0) {
        topPriority = `Combler les ${highOppGaps} content gaps à haute opportunité`;
    } else if (backlinkOpps > 0) {
        topPriority = `Récupérer les ${backlinkOpps} opportunités de backlinks`;
    } else {
        topPriority = 'Développer un angle différenciant unique';
    }

    return { score, interpretation, topPriority };
}

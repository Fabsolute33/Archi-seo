/**
 * SERP Analyzer Agent
 * 
 * Analyse les pages de résultats Google (SERPs) en temps réel
 * pour chaque mot-clé cible.
 * 
 * Utilise Grounded Gemini pour obtenir des données SERP réelles.
 */

import { generateWithGrounding } from '../GroundedGeminiService';
import type { ClusterArchitecture, ContentTableRow } from '../../types/agents';
import * as fs from 'fs';
import * as path from 'path';

// Load prompt from file if available
function loadPrompt(): string {
    const promptPath = path.join(__dirname, '../../..', '.agent/seo-architecte/prompts/serp.md');
    if (fs.existsSync(promptPath)) {
        return fs.readFileSync(promptPath, 'utf-8');
    }
    return DEFAULT_PROMPT;
}

const DEFAULT_PROMPT = `Tu es l'AGENT SERP ANALYZER - Expert en analyse des pages de résultats Google.

Ta mission: Analyser les SERPs réelles pour chaque mot-clé cible et fournir des insights pour battre la concurrence.

UTILISE LE GROUNDED SEARCH pour obtenir des données RÉELLES des SERPs actuelles.

Pour chaque mot-clé, analyse:
1. Top 10 URLs actuels
2. Types de SERP features (featured snippet, PAA, local pack, etc.)
3. Intent principal
4. Gap analysis vs concurrence
5. Probabilité de ranking

FORMAT DE RÉPONSE OBLIGATOIRE (JSON):
{
  "serpAnalysis": [...],
  "globalInsights": {...}
}`;

export interface SERPFeatures {
    featuredSnippet: {
        present: boolean;
        format?: 'list' | 'paragraph' | 'table';
        source?: string;
        content?: string;
    };
    peopleAlsoAsk: string[];
    localPack: boolean;
    videoCarousel: boolean;
    imagePack: boolean;
    relatedSearches: string[];
}

export interface SERPResult {
    position: number;
    url: string;
    domain: string;
    pageType: 'blog' | 'product' | 'service' | 'landing' | 'other';
    contentLength: number;
    h2Structure: string[];
    hasVideo: boolean;
    hasImages: boolean;
    lastUpdated?: string;
    estimatedDA: number;
}

export interface KeywordSERPAnalysis {
    keyword: string;
    searchVolume: string;
    intent: {
        primary: 'informational' | 'commercial' | 'transactional' | 'navigational';
        signals: string[];
        commercialRatio: number;
    };
    top10: SERPResult[];
    serpFeatures: SERPFeatures;
    competitiveGap: {
        top3CommonPoints: string[];
        whatsMissing: string[];
        differentiatingAngle: string;
        difficulty: 'low' | 'medium' | 'high';
    };
    winProbability: {
        score: number;
        timeToRank: string;
        priorityActions: string[];
    };
}

export interface SERPAnalysisResult {
    serpAnalysis: KeywordSERPAnalysis[];
    globalInsights: {
        easiestWins: string[];
        hardestBattles: string[];
        serpPatterns: string[];
        contentLengthBenchmark: {
            average: number;
            min: number;
            max: number;
        };
    };
}

export async function runSERPAnalyzer(
    keywords: string[],
    businessContext: string,
    clusterArchitecture?: ClusterArchitecture
): Promise<SERPAnalysisResult> {
    const systemPrompt = loadPrompt();

    // Extract keywords from clusters if not provided
    let targetKeywords = keywords;
    if (targetKeywords.length === 0 && clusterArchitecture) {
        targetKeywords = clusterArchitecture.clusters
            .flatMap(c => c.motsCles.slice(0, 3)) // Top 3 keywords per cluster
            .slice(0, 15); // Max 15 keywords total to avoid too many API calls
    }

    const userPrompt = `CONTEXTE BUSINESS:
${businessContext}

MOTS-CLÉS À ANALYSER (${targetKeywords.length}):
${targetKeywords.map((k, i) => `${i + 1}. ${k}`).join('\n')}

INSTRUCTIONS:
1. Pour CHAQUE mot-clé, recherche les résultats Google actuels
2. Analyse les 10 premiers résultats organiques
3. Identifie les SERP features présentes
4. Évalue la difficulté et les opportunités
5. Propose des actions prioritaires pour chaque mot-clé

⚠️ IMPORTANT: Utilise ta capacité de recherche Google pour obtenir des données RÉELLES et actuelles, pas des estimations.`;

    const result = await generateWithGrounding<SERPAnalysisResult>(
        systemPrompt,
        userPrompt,
        (text) => {
            const parsed = JSON.parse(text);
            return parsed as SERPAnalysisResult;
        }
    );

    console.log(`🔍 SERP Analysis: ${result.result.serpAnalysis.length} keywords analyzed`);
    console.log(`📊 Sources utilisées: ${result.sources.length}`);
    console.log(`🔎 Requêtes effectuées: ${result.searchQueries.join(', ')}`);

    return result.result;
}

/**
 * Enrichit le tableau de contenu avec les données SERP
 */
export function enrichContentWithSERP(
    contentRows: ContentTableRow[],
    serpAnalysis: SERPAnalysisResult
): ContentTableRow[] {
    // Create a map for quick lookup
    const serpMap = new Map<string, KeywordSERPAnalysis>();
    for (const analysis of serpAnalysis.serpAnalysis) {
        serpMap.set(analysis.keyword.toLowerCase(), analysis);
    }

    return contentRows.map(row => {
        // Find matching SERP data by checking carburant terms or title
        const keyword = row.carburant?.termeAutoritaire?.toLowerCase() || '';
        const serpData = serpMap.get(keyword);

        if (serpData) {
            // Map SERP format to our format
            const serpFormat = serpData.serpFeatures.featuredSnippet.format;
            const formatMatches = serpFormat ? (
                (serpFormat === 'list' && row.snippetFormat === 'liste') ||
                (serpFormat === 'table' && row.snippetFormat === 'tableau') ||
                (serpFormat === 'paragraph' && row.snippetFormat === 'definition')
            ) : false;

            return {
                ...row,
                score: {
                    ...row.score,
                    // Adjust difficulty based on SERP data
                    difficulte: serpData.competitiveGap.difficulty === 'low' ? 3 :
                        serpData.competitiveGap.difficulty === 'medium' ? 6 : 9,
                    // Recalculate priority
                    prioriteGlobale: row.score.volume +
                        (10 - (serpData.competitiveGap.difficulty === 'low' ? 3 :
                            serpData.competitiveGap.difficulty === 'medium' ? 6 : 9)) +
                        row.score.impact
                },
                // Add SERP insights as metadata
                serpInsights: {
                    winProbability: serpData.winProbability.score,
                    timeToRank: serpData.winProbability.timeToRank,
                    featuredSnippetOpportunity: !serpData.serpFeatures.featuredSnippet.present || formatMatches,
                    topCompetitorWordCount: serpAnalysis.globalInsights?.contentLengthBenchmark?.average || 2000
                }
            };
        }

        return row;
    });
}

/**
 * Génère des recommandations basées sur l'analyse SERP
 */
export function generateSERPRecommendations(serpAnalysis: SERPAnalysisResult): string[] {
    const recommendations: string[] = [];

    // Find easy wins
    const easyWins = serpAnalysis.serpAnalysis.filter(s => s.winProbability.score >= 70);
    if (easyWins.length > 0) {
        recommendations.push(
            `🎯 Quick Wins identifiés: ${easyWins.map(w => w.keyword).join(', ')} (probabilité de ranking > 70%)`
        );
    }

    // Featured snippet opportunities
    const snippetOpps = serpAnalysis.serpAnalysis.filter(s => !s.serpFeatures.featuredSnippet.present);
    if (snippetOpps.length > 0) {
        recommendations.push(
            `📌 Opportunités Position 0: ${snippetOpps.length} mots-clés sans featured snippet actuel`
        );
    }

    // Content length benchmark
    const avgLength = serpAnalysis.globalInsights.contentLengthBenchmark.average;
    recommendations.push(
        `📝 Benchmark contenu: Viser ${avgLength + 500} mots (moyenne concurrence: ${avgLength})`
    );

    // Hard battles to avoid or prepare for
    const hardBattles = serpAnalysis.serpAnalysis.filter(s => s.winProbability.score < 40);
    if (hardBattles.length > 0) {
        recommendations.push(
            `⚠️ Batailles difficiles: ${hardBattles.map(h => h.keyword).join(', ')} - prévoir une stratégie long terme`
        );
    }

    return recommendations;
}

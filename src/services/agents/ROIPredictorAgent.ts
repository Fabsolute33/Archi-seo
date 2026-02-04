/**
 * ROI Predictor Agent
 * 
 * Calcule le ROI potentiel de chaque article pour prioriser
 * la production de contenu.
 */

import { generateWithGemini } from '../GeminiService';
import type { ContentTableRow, StrategicAnalysis } from '../../types/agents';
import * as fs from 'fs';
import * as path from 'path';

// Load prompt from file if available
function loadPrompt(): string {
    const promptPath = path.join(__dirname, '../../..', '.agent/seo-architecte/prompts/roi-predictor.md');
    if (fs.existsSync(promptPath)) {
        return fs.readFileSync(promptPath, 'utf-8');
    }
    return DEFAULT_PROMPT;
}

const DEFAULT_PROMPT = `Tu es l'AGENT ROI PREDICTOR - Expert en estimation du retour sur investissement SEO.

Mission: Calculer le ROI potentiel de chaque article pour prioriser la production.

Pour chaque article, calcule:
1. Traffic estimé (volume × CTR position cible)
2. Conversions estimées (traffic × taux selon intent)
3. Revenue potentiel (conversions × valeur)
4. Coût de production (heures × tarif)
5. ROI final = (revenue - cost) / cost × 100

FORMAT: JSON avec roiPredictions[], summary, recommendations`;

export interface ArticleROI {
    article: string;
    cluster: string;
    intent: 'BOFU' | 'MOFU' | 'TOFU';
    metrics: {
        searchVolume: number;
        targetPosition: number;
        estimatedCTR: number;
        estimatedTraffic: number;
        conversionRate: number;
        estimatedConversions: number;
        conversionValue: number;
        estimatedRevenue: number;
    };
    costs: {
        writingHours: number;
        hourlyRate: number;
        visualsCost: number;
        totalCost: number;
    };
    roi: {
        value: number;
        percentage: string;
        priority: 'critique' | 'haute' | 'normale' | 'basse' | 'a-valider';
        paybackPeriod: string;
    };
}

export interface ROIPredictorResult {
    roiPredictions: ArticleROI[];
    summary: {
        totalArticles: number;
        averageROI: number;
        topROIArticles: string[];
        lowROIArticles: string[];
        totalEstimatedRevenue: number;
        totalEstimatedCost: number;
        overallROI: string;
    };
    recommendations: string[];
}

// Default ROI parameters
const DEFAULT_PARAMS = {
    // CTR by position
    ctrByPosition: {
        1: 0.28,
        2: 0.15,
        3: 0.11,
        4: 0.08,
        5: 0.07,
        6: 0.05,
        7: 0.04,
        8: 0.035,
        9: 0.03,
        10: 0.025
    } as Record<number, number>,

    // Conversion rate by intent
    conversionByIntent: {
        BOFU: 0.04,  // 4%
        MOFU: 0.015, // 1.5%
        TOFU: 0.007  // 0.7%
    } as Record<string, number>,

    // Production costs
    hourlyRate: 50,
    hoursPerWordCount: {
        1500: 3.5,
        2500: 5.5,
        4000: 9
    },
    visualsBaseCost: 50
};

export async function runROIPredictor(
    contentRows: ContentTableRow[],
    strategicAnalysis: StrategicAnalysis,
    conversionValue: number = 500 // Default value per conversion (€)
): Promise<ROIPredictorResult> {
    const systemPrompt = loadPrompt();

    const userPrompt = `CONTEXTE BUSINESS:
Secteur: ${strategicAnalysis.contexteBusiness?.secteur || 'Non défini'}
Valeur par conversion: ${conversionValue}€

ARTICLES À ÉVALUER (${contentRows.length}):
${contentRows.map((row, i) => `
${i + 1}. **${row.titreH1}**
   - Cluster: ${row.cluster}
   - Intent: ${row.intent}
   - Volume estimé: ${row.score.volume}/10
   - Difficulté: ${row.score.difficulte}/10
   - Impact: ${row.score.impact}/10
`).join('\n')}

PARAMÈTRES ROI:
- Taux horaire rédaction: ${DEFAULT_PARAMS.hourlyRate}€
- Conversion BOFU: 4%, MOFU: 1.5%, TOFU: 0.7%
- Valeur conversion: ${conversionValue}€

Calcule le ROI de chaque article et fournis des recommandations de priorisation.`;

    const result = await generateWithGemini<ROIPredictorResult>(
        systemPrompt,
        userPrompt,
        (text) => {
            const parsed = JSON.parse(text);
            return parsed as ROIPredictorResult;
        }
    );

    return result;
}

/**
 * Calcul local du ROI (sans appel API) pour des prédictions rapides
 */
export function calculateLocalROI(
    contentRows: ContentTableRow[],
    conversionValue: number = 500
): ArticleROI[] {
    return contentRows.map(row => {
        // Estimate search volume from score (1-10 → 100-10000)
        const searchVolume = Math.round(100 * Math.pow(2, row.score.volume - 1));

        // Target position based on difficulty (lower difficulty = better position target)
        const targetPosition = Math.min(10, Math.max(1, Math.round(row.score.difficulte)));

        // CTR from position
        const ctr = DEFAULT_PARAMS.ctrByPosition[targetPosition] || 0.02;

        // Traffic
        const traffic = Math.round(searchVolume * ctr);

        // Conversion rate from intent
        const convRate = DEFAULT_PARAMS.conversionByIntent[row.intent] || 0.01;

        // Conversions
        const conversions = traffic * convRate;

        // Revenue
        const revenue = conversions * conversionValue;

        // Costs (estimate based on article complexity)
        const wordCount = row.intent === 'BOFU' ? 2500 : row.intent === 'MOFU' ? 2000 : 1500;
        const hours = wordCount <= 1500 ? 3.5 : wordCount <= 2500 ? 5.5 : 9;
        const cost = hours * DEFAULT_PARAMS.hourlyRate + DEFAULT_PARAMS.visualsBaseCost;

        // ROI
        const roiValue = revenue > 0 ? Math.round(((revenue - cost) / cost) * 100) : 0;

        // Priority
        let priority: ArticleROI['roi']['priority'];
        if (roiValue > 500) priority = 'critique';
        else if (roiValue > 200) priority = 'haute';
        else if (roiValue > 100) priority = 'normale';
        else if (roiValue > 50) priority = 'basse';
        else priority = 'a-valider';

        return {
            article: row.titreH1,
            cluster: row.cluster,
            intent: row.intent,
            metrics: {
                searchVolume,
                targetPosition,
                estimatedCTR: ctr,
                estimatedTraffic: traffic,
                conversionRate: convRate,
                estimatedConversions: conversions,
                conversionValue,
                estimatedRevenue: Math.round(revenue)
            },
            costs: {
                writingHours: hours,
                hourlyRate: DEFAULT_PARAMS.hourlyRate,
                visualsCost: DEFAULT_PARAMS.visualsBaseCost,
                totalCost: Math.round(cost)
            },
            roi: {
                value: roiValue,
                percentage: `${roiValue}%`,
                priority,
                paybackPeriod: roiValue > 100 ? '1 mois' : roiValue > 50 ? '2-3 mois' : '6+ mois'
            }
        };
    });
}

/**
 * Génère un résumé des prédictions ROI
 */
export function generateROISummary(predictions: ArticleROI[]): ROIPredictorResult['summary'] {
    const sorted = [...predictions].sort((a, b) => b.roi.value - a.roi.value);

    const totalRevenue = predictions.reduce((sum, p) => sum + p.metrics.estimatedRevenue, 0);
    const totalCost = predictions.reduce((sum, p) => sum + p.costs.totalCost, 0);
    const avgROI = Math.round(predictions.reduce((sum, p) => sum + p.roi.value, 0) / predictions.length);

    return {
        totalArticles: predictions.length,
        averageROI: avgROI,
        topROIArticles: sorted.slice(0, 5).map(p => `${p.article} (${p.roi.percentage})`),
        lowROIArticles: sorted.slice(-3).filter(p => p.roi.value < 50).map(p => `${p.article} (${p.roi.percentage})`),
        totalEstimatedRevenue: totalRevenue,
        totalEstimatedCost: totalCost,
        overallROI: `${Math.round(((totalRevenue - totalCost) / totalCost) * 100)}%`
    };
}

/**
 * Article Relevance Scorer
 * 
 * Calculates how relevant an RSS article is to the current project
 * based on keyword matching in title and description.
 */

export interface RelevanceResult {
    score: number;        // 0-100
    level: 'high' | 'medium' | 'low';
    matchedKeywords: string[];
}

// French stopwords to filter out common words
const FRENCH_STOPWORDS = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'en', 'au', 'aux',
    'ce', 'cette', 'ces', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses',
    'notre', 'votre', 'leur', 'leurs', 'nous', 'vous', 'ils', 'elles', 'qui', 'que',
    'quoi', 'dont', 'où', 'pour', 'par', 'sur', 'sous', 'avec', 'sans', 'dans', 'entre',
    'vers', 'chez', 'avant', 'après', 'pendant', 'depuis', 'contre', 'comme', 'mais',
    'donc', 'car', 'ni', 'ne', 'pas', 'plus', 'moins', 'très', 'trop', 'bien', 'mal',
    'être', 'avoir', 'faire', 'aller', 'pouvoir', 'vouloir', 'devoir', 'savoir', 'voir',
    'est', 'sont', 'était', 'sera', 'a', 'ont', 'avait', 'aura', 'fait', 'va', 'vont',
    'tout', 'tous', 'toute', 'toutes', 'autre', 'autres', 'même', 'mêmes', 'aussi',
    'd\'', 'l\'', 'n\'', 's\'', 'qu\'', 'j\'', 'c\'', 'm\'', 't\'',
]);

// Common English stopwords
const ENGLISH_STOPWORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'this', 'that', 'these', 'those', 'it', 'its', 'they', 'their', 'we', 'our', 'you',
    'your', 'he', 'she', 'him', 'her', 'his', 'not', 'no', 'yes', 'all', 'any', 'some',
]);

/**
 * Normalize text by removing accents and converting to lowercase
 */
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/['']/g, "'")
        .replace(/[^\w\s'-]/g, ' ') // Remove punctuation except apostrophe and hyphen
        .trim();
}

/**
 * Extract meaningful keywords from text
 */
function extractKeywords(text: string): string[] {
    const normalized = normalizeText(text);
    const words = normalized.split(/\s+/);

    return words.filter(word => {
        // Filter out short words, stopwords, and numbers
        if (word.length < 3) return false;
        if (FRENCH_STOPWORDS.has(word)) return false;
        if (ENGLISH_STOPWORDS.has(word)) return false;
        if (/^\d+$/.test(word)) return false;
        return true;
    });
}

/**
 * Calculate relevance score between an article and project context
 */
export function calculateRelevance(
    articleTitle: string,
    articleDescription: string,
    projectName: string,
    businessDescription: string
): RelevanceResult {
    // Extract keywords from project context
    const projectKeywords = new Set([
        ...extractKeywords(projectName),
        ...extractKeywords(businessDescription)
    ]);

    if (projectKeywords.size === 0) {
        return { score: 0, level: 'low', matchedKeywords: [] };
    }

    // Extract keywords from article
    const titleKeywords = extractKeywords(articleTitle);
    const descriptionKeywords = extractKeywords(articleDescription);

    const matchedKeywords = new Set<string>();
    let score = 0;

    // Title matches have higher weight (x3)
    for (const keyword of titleKeywords) {
        for (const projectKeyword of projectKeywords) {
            if (keyword === projectKeyword ||
                keyword.includes(projectKeyword) ||
                projectKeyword.includes(keyword)) {
                matchedKeywords.add(projectKeyword);
                score += 30; // High weight for title matches
            }
        }
    }

    // Description matches have lower weight (x1)
    for (const keyword of descriptionKeywords) {
        for (const projectKeyword of projectKeywords) {
            if (keyword === projectKeyword ||
                keyword.includes(projectKeyword) ||
                projectKeyword.includes(keyword)) {
                if (!matchedKeywords.has(projectKeyword)) {
                    matchedKeywords.add(projectKeyword);
                    score += 10; // Lower weight for description matches
                }
            }
        }
    }

    // Normalize score to 0-100 range
    const normalizedScore = Math.min(100, score);

    // Determine relevance level
    let level: 'high' | 'medium' | 'low';
    if (normalizedScore >= 30) {
        level = 'high';
    } else if (normalizedScore >= 15) {
        level = 'medium';
    } else {
        level = 'low';
    }

    return {
        score: normalizedScore,
        level,
        matchedKeywords: Array.from(matchedKeywords)
    };
}

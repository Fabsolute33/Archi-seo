import { GoogleGenAI } from '@google/genai';

let genAI: GoogleGenAI | null = null;

export function initializeGroundedGemini(apiKey: string): void {
    genAI = new GoogleGenAI({ apiKey });
}

export function getGroundedGeminiInstance(): GoogleGenAI {
    if (!genAI) {
        throw new Error('Grounded Gemini API not initialized. Please provide an API key first.');
    }
    return genAI;
}

export interface GroundingSource {
    title: string;
    uri: string;
}

export interface GroundedResponse<T> {
    result: T;
    sources: GroundingSource[];
    searchQueries: string[];
}

/**
 * Generate content with Google Search grounding for real-time data.
 * Use this for queries requiring current/fresh information.
 * 
 * Note: Billing started January 5, 2026 - $14 per 1000 searches after 5000 free/month
 */
export async function generateWithGrounding<T>(
    systemPrompt: string,
    userPrompt: string,
    parseResponse: (text: string) => T
): Promise<GroundedResponse<T>> {
    const ai = getGroundedGeminiInstance();

    // Generate current date context for freshness
    const now = new Date();
    const dateContext = `📅 CONTEXTE TEMPOREL: Nous sommes le ${now.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}. L'année en cours est ${now.getFullYear()}. Utilise UNIQUEMENT des données, tendances et références actualisées à cette date.`;

    const fullPrompt = `${dateContext}\n\n${systemPrompt}\n\n---\n\n${userPrompt}\n\n---\n\nIMPORTANT: Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans backticks, sans texte avant ou après.`;

    const groundingTool = { googleSearch: {} };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            tools: [groundingTool],
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 65536,
        },
    });

    // Extract grounding metadata
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources: GroundingSource[] = [];
    const searchQueries: string[] = [];

    if (groundingMetadata) {
        // Extract grounding chunks (sources)
        if (groundingMetadata.groundingChunks) {
            for (const chunk of groundingMetadata.groundingChunks) {
                if (chunk.web?.uri && chunk.web?.title) {
                    sources.push({
                        title: chunk.web.title,
                        uri: chunk.web.uri
                    });
                }
            }
        }

        // Extract search queries used
        if (groundingMetadata.webSearchQueries) {
            searchQueries.push(...groundingMetadata.webSearchQueries);
        }
    }

    // Clean the response text
    const text = response.text || '';
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    return {
        result: parseResponse(cleanedText),
        sources,
        searchQueries
    };
}

/**
 * Simple text generation with grounding (no JSON parsing).
 * Returns the raw text response with sources.
 */
export async function generateTextWithGrounding(
    prompt: string
): Promise<{ text: string; sources: GroundingSource[]; searchQueries: string[] }> {
    const ai = getGroundedGeminiInstance();

    const now = new Date();
    const dateContext = `📅 Nous sommes le ${now.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })} (${now.getFullYear()}).`;

    const groundingTool = { googleSearch: {} };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${dateContext}\n\n${prompt}`,
        config: {
            tools: [groundingTool],
            temperature: 0.7,
        },
    });

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources: GroundingSource[] = [];
    const searchQueries: string[] = [];

    if (groundingMetadata) {
        if (groundingMetadata.groundingChunks) {
            for (const chunk of groundingMetadata.groundingChunks) {
                if (chunk.web?.uri && chunk.web?.title) {
                    sources.push({
                        title: chunk.web.title,
                        uri: chunk.web.uri
                    });
                }
            }
        }
        if (groundingMetadata.webSearchQueries) {
            searchQueries.push(...groundingMetadata.webSearchQueries);
        }
    }

    return {
        text: response.text || '',
        sources,
        searchQueries
    };
}

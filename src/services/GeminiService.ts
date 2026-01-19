import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

export function initializeGemini(apiKey: string): void {
    genAI = new GoogleGenerativeAI(apiKey);
}

export function getGeminiInstance(): GoogleGenerativeAI {
    if (!genAI) {
        throw new Error('Gemini API not initialized. Please provide an API key first.');
    }
    return genAI;
}

/**
 * Attempts to repair common JSON issues from LLM responses
 */
function repairJSON(text: string): string {
    let repaired = text.trim();

    // Remove any trailing commas before closing brackets/braces
    repaired = repaired.replace(/,(\s*[\]\}])/g, '$1');

    // Count unclosed braces and brackets
    let braceCount = 0;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < repaired.length; i++) {
        const char = repaired[i];

        if (escapeNext) {
            escapeNext = false;
            continue;
        }

        if (char === '\\') {
            escapeNext = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (!inString) {
            if (char === '{') braceCount++;
            else if (char === '}') braceCount--;
            else if (char === '[') bracketCount++;
            else if (char === ']') bracketCount--;
        }
    }

    // Close unclosed brackets/braces
    while (bracketCount > 0) {
        repaired += ']';
        bracketCount--;
    }
    while (braceCount > 0) {
        repaired += '}';
        braceCount--;
    }

    // Remove trailing commas again after repairs
    repaired = repaired.replace(/,(\s*[\]\}])/g, '$1');

    return repaired;
}

export async function generateWithGemini<T>(
    systemPrompt: string,
    userPrompt: string,
    parseResponse: (text: string) => T
): Promise<T> {
    const ai = getGeminiInstance();
    const model = ai.getGenerativeModel({
        model: 'gemini-3-flash-preview',
        generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 65536,
        }
    });

    // Generate current date context for freshness
    const now = new Date();
    const dateContext = `📅 CONTEXTE TEMPOREL: Nous sommes le ${now.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}. L'année en cours est ${now.getFullYear()}. Utilise UNIQUEMENT des données, tendances et références actualisées à cette date. Évite toute référence obsolète.`;

    const fullPrompt = `${dateContext}\n\n${systemPrompt}\n\n---\n\n${userPrompt}\n\n---\n\nIMPORTANT: Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans backticks, sans texte avant ou après. Assure-toi que le JSON est complet et correctement fermé.`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    // Clean the response - remove markdown code blocks if present
    let cleanedText = text.trim();

    // Remove markdown code blocks
    if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    // Try to find JSON boundaries if there's extra text
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        cleanedText = jsonMatch[0];
    }

    // Attempt JSON repair for truncated responses
    cleanedText = repairJSON(cleanedText);

    try {
        return parseResponse(cleanedText);
    } catch (parseError) {
        console.error('JSON Parse Error. Raw response (first 500 chars):', cleanedText.substring(0, 500));
        console.error('JSON Parse Error. Last 200 chars:', cleanedText.substring(cleanedText.length - 200));
        console.error('Parse error details:', parseError);
        throw new Error(`Erreur de parsing JSON: ${parseError instanceof Error ? parseError.message : 'Format invalide'}. Réessayez l'analyse.`);
    }
}

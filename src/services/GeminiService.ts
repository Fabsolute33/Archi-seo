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

    const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}\n\n---\n\nIMPORTANT: Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans backticks, sans texte avant ou après.`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    // Clean the response - remove markdown code blocks if present
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

    return parseResponse(cleanedText);
}

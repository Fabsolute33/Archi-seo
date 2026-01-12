import type { VocabulaireSectoriel } from '../types/agents';

// Google Knowledge Graph API Service
// Documentation: https://developers.google.com/knowledge-graph

const KNOWLEDGE_GRAPH_API_URL = 'https://kgsearch.googleapis.com/v1/entities:search';
const API_KEY = 'AIzaSyCGb-8MR9GQXee54kumxK8xXe9vTe0QBm8';

export interface KnowledgeGraphEntity {
    id: string;
    name: string;
    types: string[];
    description?: string;
    detailedDescription?: {
        articleBody?: string;
        url?: string;
    };
    url?: string;
}

interface KGSearchResult {
    '@type': string;
    result: {
        '@id': string;
        '@type': string[];
        name: string;
        description?: string;
        detailedDescription?: {
            articleBody?: string;
            url?: string;
        };
        url?: string;
    };
    resultScore: number;
}

interface KGResponse {
    itemListElement?: KGSearchResult[];
}

/**
 * Recherche des entités dans Google Knowledge Graph
 * @param query - Terme de recherche
 * @param types - Types d'entités à filtrer (ex: Organization, Product, etc.)
 * @param limit - Nombre maximum de résultats
 */
export async function searchKnowledgeGraph(
    query: string,
    types?: string[],
    limit: number = 10
): Promise<KnowledgeGraphEntity[]> {
    try {
        const params = new URLSearchParams({
            key: API_KEY,
            query: query,
            limit: limit.toString(),
            languages: 'fr',
            indent: 'true'
        });

        if (types && types.length > 0) {
            params.append('types', types.join(','));
        }

        const response = await fetch(`${KNOWLEDGE_GRAPH_API_URL}?${params.toString()}`);

        if (!response.ok) {
            console.error('Knowledge Graph API error:', response.status, response.statusText);
            return [];
        }

        const data: KGResponse = await response.json();

        if (!data.itemListElement || data.itemListElement.length === 0) {
            return [];
        }

        return data.itemListElement.map(item => ({
            id: item.result['@id'] || '',
            name: item.result.name || '',
            types: Array.isArray(item.result['@type']) ? item.result['@type'] : [item.result['@type']],
            description: item.result.description,
            detailedDescription: item.result.detailedDescription,
            url: item.result.url
        }));
    } catch (error) {
        console.error('Error fetching Knowledge Graph:', error);
        return [];
    }
}

/**
 * Enrichit le vocabulaire sectoriel en utilisant Knowledge Graph
 * Combine les entités trouvées par catégories pertinentes pour le SEO
 */
export async function enrichSectorVocabulary(
    sector: string,
    subSector?: string,
    userTerms?: string[]
): Promise<VocabulaireSectoriel> {
    const searchTerms = [sector];
    if (subSector) {
        searchTerms.push(`${sector} ${subSector}`);
    }

    // Recherche des organisations et entreprises du secteur
    const orgSearch = searchKnowledgeGraph(`${sector} entreprise france`, ['Organization'], 5);

    // Recherche des concepts et termes métier
    const conceptSearch = searchKnowledgeGraph(`${sector} métier technique`, [], 10);

    // Recherche des normes et certifications
    const normSearch = searchKnowledgeGraph(`${sector} norme certification`, ['Organization', 'Thing'], 5);

    // Exécution parallèle des recherches
    const [orgs, concepts, norms] = await Promise.all([orgSearch, conceptSearch, normSearch]);

    // Extraction des termes métier depuis les résultats
    const termesMetier: string[] = [];
    const entitesGoogle: string[] = [];

    // Ajouter les noms d'organisations comme entités Google
    orgs.forEach(org => {
        if (org.name && !entitesGoogle.includes(org.name)) {
            entitesGoogle.push(org.name);
        }
    });

    // Extraire les termes des concepts
    concepts.forEach(concept => {
        if (concept.name && !termesMetier.includes(concept.name)) {
            termesMetier.push(concept.name);
        }
    });

    // Ajouter les normes/certifications
    norms.forEach(norm => {
        if (norm.name && !entitesGoogle.includes(norm.name)) {
            entitesGoogle.push(norm.name);
        }
    });

    // Ajouter les termes utilisateur s'ils existent
    const termesClients = userTerms || [];

    return {
        termesMetier: termesMetier.slice(0, 15), // Limiter à 15 termes
        termesClients: termesClients,
        entitesGoogle: entitesGoogle.slice(0, 10) // Limiter à 10 entités
    };
}

/**
 * Recherche des concurrents et acteurs majeurs d'un secteur
 */
export async function findSectorCompetitors(sector: string, location?: string): Promise<KnowledgeGraphEntity[]> {
    const query = location
        ? `${sector} entreprise ${location}`
        : `${sector} leader france`;

    return searchKnowledgeGraph(query, ['Organization', 'Corporation', 'LocalBusiness'], 10);
}

/**
 * Recherche des certifications et normes d'un secteur
 */
export async function findSectorCertifications(sector: string): Promise<string[]> {
    const results = await searchKnowledgeGraph(
        `${sector} certification norme qualification`,
        ['Organization', 'Thing'],
        10
    );

    return results
        .filter(r => r.name && (
            r.name.toLowerCase().includes('certification') ||
            r.name.toLowerCase().includes('norme') ||
            r.name.toLowerCase().includes('label') ||
            r.name.toLowerCase().includes('qualification') ||
            r.types.some(t => t.toLowerCase().includes('organization'))
        ))
        .map(r => r.name);
}

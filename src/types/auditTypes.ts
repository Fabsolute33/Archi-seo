import type { ContentTableRow } from './agents';

// Contenu extrait d'une page web
export interface ScrapedContent {
    url: string;
    title: string;
    metaDescription: string;
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
    bodyText: string;
    wordCount: number;
    images: {
        src: string;
        alt: string;
        hasAlt: boolean;
    }[];
    internalLinks: string[];
    externalLinks: string[];
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    structuredData: object[];
}

// Recommandation d'optimisation individuelle
export interface AuditRecommendation {
    category: 'structure' | 'semantique' | 'technique' | 'eeat' | 'contenu';
    priority: 'haute' | 'moyenne' | 'basse';
    titre: string;
    description: string;
    actionnable: string;
    impact: string;
}

// Scores par catégorie
export interface AuditScores {
    global: number;
    structure: number;
    semantique: number;
    technique: number;
    eeat: number;
    lisibilite: number;
}

// Content Gap détecté
export interface ContentGap {
    sujet: string;
    raison: string;
    potentiel: 'élevé' | 'moyen' | 'faible';
    motsCles: string[];
}

// Résultat complet de l'audit
export interface ContentAuditResult {
    url: string;
    scrapedContent: ScrapedContent;
    scores: AuditScores;
    recommandations: AuditRecommendation[];
    contentGaps: ContentGap[];
    suggestedArticles: ContentTableRow[];
    resumeExecutif: string;
    pointsForts: string[];
    pointsFaibles: string[];
    competiteursCibles?: string[];
}

// État de l'audit dans le store
export interface ContentAuditState {
    status: 'idle' | 'scraping' | 'analyzing' | 'completed' | 'error';
    result: ContentAuditResult | null;
    error: string | null;
    targetKeyword?: string;
}

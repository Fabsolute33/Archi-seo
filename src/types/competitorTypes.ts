import type { ScrapedContent } from './auditTypes';

/**
 * Profil SEO d'un concurrent analysé
 */
export interface CompetitorSEOProfile {
    url: string;
    domain: string;
    scrapedData: ScrapedContent | null;
    scrapeError?: string;

    // Analyse SEO
    daEstime: number;
    titreH1: string;
    nombreH2: number;
    wordCount: number;

    // Liens
    nombreLiensInternes: number;
    nombreLiensExternes: number;
    backlinksEstimes: string[];

    // Keywords
    motsClesPrincipaux: string[];
    densiteMotsCles: Record<string, number>;

    // Forces/Faiblesses
    forces: string[];
    faiblesses: string[];

    // Opportunités pour nous
    contentGapsIdentifies: string[];
    backlinksARecuperer: string[];
    strategieSurclassement: string;
}

/**
 * Résultat complet de l'analyse concurrentielle
 */
export interface CompetitorAnalysis {
    analysedAt: number;
    competitors: CompetitorSEOProfile[];
    syntheseGlobale: {
        concurrentLePlusFort: string;
        concurrentLePlusFaible: string;
        niveauConcurrence: 'faible' | 'moyenne' | 'forte';
        opportunitesPrioritaires: string[];
    };
    recommandations: string[];
}

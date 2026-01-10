import type { RSSSource, RSSArticle } from '../types/agents';

/**
 * Service for fetching and parsing RSS feeds.
 * Uses multiple CORS proxies with fallback for browser-based fetching.
 */

// Multiple CORS proxies for resilient fetching (fallback system)
const CORS_PROXIES = [
    { prefix: 'https://corsproxy.io/?', encode: true },
    { prefix: 'https://api.allorigins.win/raw?url=', encode: true },
    { prefix: 'https://cors-anywhere.herokuapp.com/', encode: false },
];

/**
 * Generate a unique ID for an article based on URL and title
 */
function generateArticleId(url: string, title: string): string {
    const str = `${url}-${title}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `rss-${Math.abs(hash).toString(36)}`;
}

/**
 * Parse an RSS/Atom feed XML string into RSSArticle objects
 */
function parseRSSFeed(xmlString: string, source: RSSSource): RSSArticle[] {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, 'text/xml');
    const articles: RSSArticle[] = [];

    // Check for RSS 2.0 format
    const items = xml.querySelectorAll('item');
    if (items.length > 0) {
        items.forEach(item => {
            const title = item.querySelector('title')?.textContent || '';
            const description = item.querySelector('description')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '';
            const pubDateStr = item.querySelector('pubDate')?.textContent;

            // Try to get image from enclosure or media:content
            const enclosure = item.querySelector('enclosure[type^="image"]');
            const mediaContent = item.getElementsByTagName('media:content')[0];
            const imageUrl = enclosure?.getAttribute('url') ||
                mediaContent?.getAttribute('url') ||
                undefined;

            if (title && link) {
                articles.push({
                    id: generateArticleId(link, title),
                    sourceId: source.id,
                    sourceName: source.name,
                    title: cleanHtml(title),
                    description: cleanHtml(description).slice(0, 300),
                    url: link,
                    pubDate: pubDateStr ? new Date(pubDateStr) : new Date(),
                    imageUrl
                });
            }
        });
    } else {
        // Try Atom format
        const entries = xml.querySelectorAll('entry');
        entries.forEach(entry => {
            const title = entry.querySelector('title')?.textContent || '';
            const summary = entry.querySelector('summary')?.textContent ||
                entry.querySelector('content')?.textContent || '';
            const linkEl = entry.querySelector('link[rel="alternate"]') ||
                entry.querySelector('link');
            const link = linkEl?.getAttribute('href') || '';
            const pubDateStr = entry.querySelector('published')?.textContent ||
                entry.querySelector('updated')?.textContent;

            if (title && link) {
                articles.push({
                    id: generateArticleId(link, title),
                    sourceId: source.id,
                    sourceName: source.name,
                    title: cleanHtml(title),
                    description: cleanHtml(summary).slice(0, 300),
                    url: link,
                    pubDate: pubDateStr ? new Date(pubDateStr) : new Date(),
                });
            }
        });
    }

    return articles;
}

/**
 * Clean HTML tags from text
 */
function cleanHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

/**
 * Fetch articles from a single RSS source with fallback proxies
 */
export async function fetchRSSSource(source: RSSSource): Promise<RSSArticle[]> {
    if (!source.isActive) return [];

    let lastError: Error | null = null;

    // Try each CORS proxy in order until one succeeds
    for (const proxy of CORS_PROXIES) {
        try {
            const proxyUrl = proxy.encode
                ? `${proxy.prefix}${encodeURIComponent(source.url)}`
                : `${proxy.prefix}${source.url}`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const response = await fetch(proxyUrl, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const xmlText = await response.text();

            // Validate that we got XML content
            if (!xmlText.includes('<') || xmlText.includes('<!DOCTYPE html')) {
                throw new Error('Invalid RSS response');
            }

            return parseRSSFeed(xmlText, source);
        } catch (error) {
            lastError = error as Error;
            console.warn(`Proxy ${proxy.prefix} failed for ${source.name}:`, error);
            // Continue to next proxy
        }
    }

    console.error(`All proxies failed for ${source.name}:`, lastError);
    return [];
}

/**
 * Fetch articles from multiple RSS sources
 */
export async function fetchAllRSSSources(sources: RSSSource[]): Promise<RSSArticle[]> {
    const activeSources = sources.filter(s => s.isActive);
    const results = await Promise.all(activeSources.map(fetchRSSSource));

    // Flatten and sort by date (newest first)
    const allArticles = results.flat();
    allArticles.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

    return allArticles;
}

/**
 * Filter out already processed articles
 */
export function filterUnprocessedArticles(
    articles: RSSArticle[],
    processedIds: string[]
): RSSArticle[] {
    const processedSet = new Set(processedIds);
    return articles.filter(article => !processedSet.has(article.id));
}

/**
 * Format relative time (e.g., "il y a 2h")
 */
export function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
        return `il y a ${diffMins}min`;
    } else if (diffHours < 24) {
        return `il y a ${diffHours}h`;
    } else if (diffDays < 7) {
        return `il y a ${diffDays}j`;
    } else {
        return date.toLocaleDateString('fr-FR');
    }
}

/**
 * Suggested RSS sources by sector
 */
export const SUGGESTED_RSS_SOURCES: { sector: string; sources: Omit<RSSSource, 'id' | 'isActive'>[] }[] = [
    {
        sector: 'Tech / Digital',
        sources: [
            { name: 'TechCrunch FR', url: 'https://techcrunch.com/feed/' },
            { name: 'Journal du Net', url: 'https://www.journaldunet.com/rss/' },
            { name: 'FrenchWeb', url: 'https://www.frenchweb.fr/feed' },
        ]
    },
    {
        sector: 'Marketing / SEO',
        sources: [
            { name: 'Siècle Digital', url: 'https://siecledigital.fr/feed/' },
            { name: 'Maddyness', url: 'https://www.maddyness.com/feed/' },
            { name: 'WebRankInfo', url: 'https://www.webrankinfo.com/feed/' },
        ]
    },
    {
        sector: 'Business / Économie',
        sources: [
            { name: 'Les Échos', url: 'https://www.lesechos.fr/rss/rss_une.xml' },
            { name: 'La Tribune', url: 'https://www.latribune.fr/rss/rubriques/economie.html' },
            { name: 'BFM Business', url: 'https://www.bfmtv.com/rss/economie/' },
        ]
    },
    {
        sector: 'E-commerce',
        sources: [
            { name: 'E-Commerce Mag', url: 'https://www.ecommercemag.fr/rss/thematique/e-commerce/' },
            { name: 'LSA Commerce', url: 'https://www.lsa-conso.fr/rss' },
        ]
    }
];

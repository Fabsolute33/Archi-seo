import type { ScrapedContent } from '../types/auditTypes';

/**
 * Liste des proxies CORS gratuits à essayer dans l'ordre
 */
const CORS_PROXIES = [
    // CorsProxy.io - Gratuit et fiable
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    // AllOrigins - Retourne du JSON avec le contenu
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    // Cors.sh - Proxy alternatif
    (url: string) => `https://proxy.cors.sh/${url}`,
];

/**
 * Service pour extraire le contenu HTML d'une URL
 * Utilise plusieurs proxies CORS gratuits avec fallback automatique
 */
export async function scrapeUrl(url: string): Promise<ScrapedContent> {
    // Nettoyer l'URL (enlever les fragments comme #:~:text=)
    const cleanUrl = url.split('#')[0];

    let lastError: Error | null = null;

    // Essayer chaque proxy dans l'ordre
    for (let i = 0; i < CORS_PROXIES.length; i++) {
        const proxyUrl = CORS_PROXIES[i](cleanUrl);
        console.log(`🔄 Tentative ${i + 1}/${CORS_PROXIES.length}: ${proxyUrl.substring(0, 60)}...`);

        try {
            const response = await fetch(proxyUrl, {
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const html = await response.text();

            // Vérifier que c'est bien du contenu valide
            if (!html || html.length < 100) {
                throw new Error('Contenu insuffisant récupéré');
            }

            console.log(`✅ Scraping réussi avec proxy ${i + 1}`);
            return parseHtml(html, cleanUrl);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Erreur inconnue');
            console.warn(`⚠️ Proxy ${i + 1} échoué: ${lastError.message}`);
            // Continuer avec le prochain proxy
        }
    }

    // Tous les proxies ont échoué
    console.error('❌ Tous les proxies ont échoué');
    throw new Error(
        lastError
            ? `Impossible de récupérer la page après ${CORS_PROXIES.length} tentatives: ${lastError.message}`
            : 'Impossible de récupérer la page. Vérifiez que l\'URL est accessible publiquement.'
    );
}

/**
 * Parse le HTML/Markdown et extrait les informations SEO pertinentes
 */
function parseHtml(content: string, url: string): ScrapedContent {
    // Jina Reader retourne du Markdown, on va l'analyser différemment
    const isMarkdown = content.startsWith('Title:') || content.includes('\n# ');

    if (isMarkdown) {
        return parseMarkdown(content, url);
    }

    // Fallback: parser comme HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // Extraire le titre
    const title = doc.querySelector('title')?.textContent?.trim() || '';

    // Extraire la meta description
    const metaDescription =
        doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';

    // Extraire les headings
    const extractHeadings = (tag: string): string[] =>
        Array.from(doc.querySelectorAll(tag)).map(
            (el) => el.textContent?.trim() || ''
        ).filter(Boolean);

    const h1 = extractHeadings('h1');
    const h2 = extractHeadings('h2');
    const h3 = extractHeadings('h3');
    const h4 = extractHeadings('h4');
    const h5 = extractHeadings('h5');
    const h6 = extractHeadings('h6');

    // Extraire le texte du body
    const bodyClone = doc.body?.cloneNode(true) as HTMLElement;
    if (bodyClone) {
        bodyClone.querySelectorAll('script, style, nav, footer, header, aside, iframe, noscript').forEach((el) => el.remove());
    }
    const bodyText = bodyClone?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const wordCount = bodyText.split(/\s+/).filter((word) => word.length > 0).length;

    // Extraire les images
    const images = Array.from(doc.querySelectorAll('img')).map((img) => ({
        src: img.getAttribute('src') || '',
        alt: img.getAttribute('alt') || '',
        hasAlt: !!img.getAttribute('alt'),
    }));

    // Extraire les liens
    let baseUrl: URL;
    try {
        baseUrl = new URL(url);
    } catch {
        baseUrl = new URL('https://example.com');
    }

    const allLinks = Array.from(doc.querySelectorAll('a[href]')).map(
        (a) => a.getAttribute('href') || ''
    );

    const internalLinks: string[] = [];
    const externalLinks: string[] = [];

    allLinks.forEach((href) => {
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
            return;
        }
        try {
            const linkUrl = new URL(href, url);
            if (linkUrl.hostname === baseUrl.hostname) {
                internalLinks.push(linkUrl.href);
            } else if (linkUrl.protocol.startsWith('http')) {
                externalLinks.push(linkUrl.href);
            }
        } catch {
            // Ignorer les URLs invalides
        }
    });

    // Extraire les données structurées
    const structuredData: object[] = [];
    doc.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
        try {
            const data = JSON.parse(script.textContent || '');
            structuredData.push(data);
        } catch {
            // Ignorer les JSON invalides
        }
    });

    return {
        url,
        title,
        metaDescription,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        bodyText,
        wordCount,
        images,
        internalLinks: [...new Set(internalLinks)].slice(0, 50),
        externalLinks: [...new Set(externalLinks)].slice(0, 50),
        canonicalUrl: doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || undefined,
        ogTitle: doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || undefined,
        ogDescription: doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || undefined,
        structuredData,
    };
}

/**
 * Parse le contenu Markdown de Jina Reader
 */
function parseMarkdown(content: string, url: string): ScrapedContent {
    const lines = content.split('\n');

    // Extraire le titre (première ligne "Title: ...")
    let title = '';
    const titleMatch = content.match(/^Title:\s*(.+)$/m);
    if (titleMatch) {
        title = titleMatch[1].trim();
    }

    // Extraire les headings Markdown
    const h1: string[] = [];
    const h2: string[] = [];
    const h3: string[] = [];
    const h4: string[] = [];
    const h5: string[] = [];
    const h6: string[] = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('# ')) h1.push(trimmed.slice(2));
        else if (trimmed.startsWith('## ')) h2.push(trimmed.slice(3));
        else if (trimmed.startsWith('### ')) h3.push(trimmed.slice(4));
        else if (trimmed.startsWith('#### ')) h4.push(trimmed.slice(5));
        else if (trimmed.startsWith('##### ')) h5.push(trimmed.slice(6));
        else if (trimmed.startsWith('###### ')) h6.push(trimmed.slice(7));
    });

    // Extraire le texte brut (sans les headers markdown)
    const bodyText = lines
        .filter(line => !line.startsWith('#') && !line.startsWith('Title:') && !line.startsWith('URL Source:'))
        .join(' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links, keep text
        .replace(/[*_`]/g, '') // Remove markdown formatting
        .replace(/\s+/g, ' ')
        .trim();

    const wordCount = bodyText.split(/\s+/).filter(word => word.length > 0).length;

    // Extraire les liens depuis le Markdown
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const internalLinks: string[] = [];
    const externalLinks: string[] = [];

    let match;
    let baseUrl: URL;
    try {
        baseUrl = new URL(url);
    } catch {
        baseUrl = new URL('https://example.com');
    }

    while ((match = linkRegex.exec(content)) !== null) {
        const href = match[2];
        try {
            const linkUrl = new URL(href, url);
            if (linkUrl.hostname === baseUrl.hostname) {
                internalLinks.push(linkUrl.href);
            } else if (linkUrl.protocol.startsWith('http')) {
                externalLinks.push(linkUrl.href);
            }
        } catch {
            // Ignorer les URLs invalides
        }
    }

    // Extraire les images depuis le Markdown
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const images: { src: string; alt: string; hasAlt: boolean }[] = [];

    while ((match = imageRegex.exec(content)) !== null) {
        images.push({
            alt: match[1],
            src: match[2],
            hasAlt: !!match[1],
        });
    }

    return {
        url,
        title,
        metaDescription: '', // Not available in markdown format
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        bodyText,
        wordCount,
        images,
        internalLinks: [...new Set(internalLinks)].slice(0, 50),
        externalLinks: [...new Set(externalLinks)].slice(0, 50),
        canonicalUrl: undefined,
        ogTitle: undefined,
        ogDescription: undefined,
        structuredData: [],
    };
}

/**
 * Valide une URL
 */
export function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

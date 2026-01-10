import { useState, useEffect, useMemo } from 'react';
import {
    Rss,
    RefreshCw,
    ExternalLink,
    Sparkles,
    Settings,
    X,
    Plus,
    Trash2,
    Loader2,
    AlertCircle,
    Link2,
    FolderOpen,
    Flame,
    Save,
    Check,
    Search,
    Globe
} from 'lucide-react';
import { useRSSStore } from '../stores/useRSSStore';
import { useProjectStore } from '../stores/useProjectStore';
import { useAgentStore } from '../stores/useAgentStore';
import { formatRelativeTime } from '../services/NewsMonitorService';
import type { RSSArticle } from '../types/agents';
import { RSSGeneratorPanel } from './RSSGeneratorPanel';
import { calculateRelevance, type RelevanceResult } from '../utils/relevanceScorer';
import './RSSWatchSection.css';

// Pagination settings
const ARTICLES_PER_PAGE = 20;

interface RSSWatchSectionProps {
    onAnalyzeArticle?: (url: string) => void;
}

// Extended article type with relevance
interface ArticleWithRelevance extends RSSArticle {
    relevance: RelevanceResult;
}

export function RSSWatchSection({ onAnalyzeArticle }: RSSWatchSectionProps) {
    const {
        sources,
        articles,
        isLoading,
        error,
        lastFetched,
        addSource,
        removeSource,
        fetchArticles,
        markArticleAsProcessed
    } = useRSSStore();

    // Project context for relevance scoring and save
    const { currentProjectName, saveCurrentProject, isLoading: isSaving } = useProjectStore();
    const { businessDescription } = useAgentStore();

    const [activeSourceId, setActiveSourceId] = useState<string | null>(null); // null = all sources
    const [currentPage, setCurrentPage] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [showGenerator, setShowGenerator] = useState(false);
    const [showKeywordSearch, setShowKeywordSearch] = useState(false);
    const [customUrl, setCustomUrl] = useState('');
    const [customName, setCustomName] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [searchKeywords, setSearchKeywords] = useState('');

    // Handle save with feedback
    const handleSave = async () => {
        await saveCurrentProject();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    };

    // Generate Google News RSS URL from keywords
    const handleAddGoogleNewsFeed = () => {
        if (!searchKeywords.trim()) return;

        // Build Google News RSS URL
        const encodedKeywords = encodeURIComponent(searchKeywords.trim());
        const googleNewsUrl = `https://news.google.com/rss/search?q=${encodedKeywords}&hl=fr&gl=FR&ceid=FR:fr`;

        // Add as source
        addSource({
            name: `Google News: ${searchKeywords}`,
            url: googleNewsUrl,
            sector: 'Google News'
        });

        // Clear and fetch
        setSearchKeywords('');
        setShowKeywordSearch(false);
        setTimeout(() => fetchArticles(), 100);
    };

    // Auto-fetch when sources change
    useEffect(() => {
        if (sources.length > 0 && articles.length === 0 && !isLoading && currentProjectName) {
            fetchArticles();
        }
    }, [sources.length, currentProjectName]);

    // Reset page when changing source
    useEffect(() => {
        setCurrentPage(1);
    }, [activeSourceId]);

    // Filter articles by source if one is selected
    const filteredArticles = activeSourceId === null
        ? articles
        : articles.filter(a => a.sourceId === activeSourceId);

    // Calculate relevance for each article and sort by relevance
    // Must be called before any early returns to respect Rules of Hooks
    const articlesWithRelevance: ArticleWithRelevance[] = useMemo(() => {
        if (!currentProjectName) return [];

        const withRelevance = filteredArticles.map(article => ({
            ...article,
            relevance: calculateRelevance(
                article.title,
                article.description || '',
                currentProjectName,
                businessDescription
            )
        }));
        // Sort: high relevance first, then by date
        return withRelevance.sort((a, b) => {
            if (a.relevance.level === 'high' && b.relevance.level !== 'high') return -1;
            if (b.relevance.level === 'high' && a.relevance.level !== 'high') return 1;
            return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
        });
    }, [filteredArticles, currentProjectName, businessDescription]);

    // Get article count per source
    const getSourceArticleCount = (sourceId: string | null) => {
        if (sourceId === null) return articles.length;
        return articles.filter(a => a.sourceId === sourceId).length;
    };

    // Count relevant articles
    const relevantCount = articlesWithRelevance.filter(a => a.relevance.level === 'high').length;

    // Pagination calculations
    const totalArticles = articlesWithRelevance.length;
    const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;
    const paginatedArticles = articlesWithRelevance.slice(startIndex, endIndex);

    // Check if project is loaded - if not, show message
    // This is placed AFTER all hooks to respect Rules of Hooks
    if (!currentProjectName) {
        return (
            <div className="rss-watch-section">
                <div className="rss-no-project">
                    <FolderOpen size={56} />
                    <h3>Projet requis</h3>
                    <p>Veuillez charger ou créer un projet pour accéder à la veille RSS.</p>
                    <p className="hint">La veille sera personnalisée selon votre projet.</p>
                </div>
            </div>
        );
    }

    const handleAddCustomSource = () => {
        if (customUrl && customName) {
            addSource({ name: customName, url: customUrl });
            setCustomUrl('');
            setCustomName('');
            setTimeout(() => fetchArticles(), 100);
        }
    };

    const handleAnalyze = (article: RSSArticle) => {
        markArticleAsProcessed(article.id);
        if (onAnalyzeArticle) {
            onAnalyzeArticle(article.url);
        } else {
            // Copy URL to clipboard as fallback
            navigator.clipboard.writeText(article.url);
        }
    };

    return (
        <div className="rss-watch-section">
            <div className="rss-watch-header">
                <div className="header-content">
                    <Rss className="header-icon" />
                    <div>
                        <h1>Veille Actualités</h1>
                        <p>Surveillez vos sources d'actualités et transformez-les en contenu SEO</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        className={`keyword-search-btn ${showKeywordSearch ? 'active' : ''}`}
                        onClick={() => setShowKeywordSearch(!showKeywordSearch)}
                    >
                        <Search size={18} />
                        <span>Recherche Google</span>
                    </button>
                    <button
                        className={`settings-btn ${showSettings ? 'active' : ''}`}
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        <Settings size={18} />
                        <span>Gérer les sources</span>
                    </button>
                    <button
                        className={`generator-btn ${showGenerator ? 'active' : ''}`}
                        onClick={() => setShowGenerator(!showGenerator)}
                    >
                        <Link2 size={18} />
                        <span>Créer un flux</span>
                    </button>
                    <button
                        className="refresh-btn"
                        onClick={fetchArticles}
                        disabled={isLoading || sources.length === 0}
                    >
                        <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
                        <span>Rafraîchir</span>
                    </button>
                    <button
                        className={`save-btn ${saveSuccess ? 'success' : ''}`}
                        onClick={handleSave}
                        disabled={isSaving}
                        title="Sauvegarder les modifications RSS"
                    >
                        {isSaving ? (
                            <Loader2 size={18} className="spinning" />
                        ) : saveSuccess ? (
                            <Check size={18} />
                        ) : (
                            <Save size={18} />
                        )}
                        <span>{saveSuccess ? 'Sauvegardé !' : 'Sauvegarder'}</span>
                    </button>
                </div>
            </div>

            {/* Google News Keyword Search Panel */}
            {showKeywordSearch && (
                <div className="keyword-search-panel">
                    <div className="keyword-search-header">
                        <div className="keyword-search-title">
                            <Globe size={20} />
                            <h3>Recherche Google News</h3>
                        </div>
                        <button className="close-btn" onClick={() => setShowKeywordSearch(false)}>
                            <X size={16} />
                        </button>
                    </div>
                    <p className="keyword-search-desc">
                        Entrez des mots-clés pour créer un flux RSS automatique depuis Google News France.
                    </p>
                    <div className="keyword-input-group">
                        <input
                            type="text"
                            placeholder="Ex: incendie entreprise France, sécurité au travail..."
                            value={searchKeywords}
                            onChange={(e) => setSearchKeywords(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddGoogleNewsFeed()}
                        />
                        <button
                            onClick={handleAddGoogleNewsFeed}
                            disabled={!searchKeywords.trim()}
                        >
                            <Plus size={16} /> Ajouter le flux
                        </button>
                    </div>
                    <div className="keyword-examples">
                        <span>Exemples :</span>
                        <button onClick={() => setSearchKeywords('incendie entreprise France')}>incendie entreprise</button>
                        <button onClick={() => setSearchKeywords('sécurité travail')}>sécurité travail</button>
                        <button onClick={() => setSearchKeywords('formation professionnelle')}>formation pro</button>
                    </div>
                </div>
            )}

            {/* RSS Generator Panel */}
            {showGenerator && (
                <RSSGeneratorPanel onClose={() => setShowGenerator(false)} />
            )}

            {/* Settings Panel (hidden by default) */}
            {showSettings && (
                <div className="settings-panel">
                    <div className="settings-header">
                        <h3>Sources configurées ({sources.length})</h3>
                        <button className="close-btn" onClick={() => setShowSettings(false)}>
                            <X size={16} />
                        </button>
                    </div>

                    <div className="current-sources">
                        {sources.length === 0 ? (
                            <p className="empty-text">Aucune source. Ajoutez-en via les onglets secteur ci-dessous.</p>
                        ) : (
                            sources.map(source => (
                                <div key={source.id} className="source-item">
                                    <span className="source-name">{source.name}</span>
                                    <span className="source-sector">{source.sector || 'Custom'}</span>
                                    <button onClick={() => removeSource(source.id)} title="Supprimer">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="add-custom">
                        <input
                            type="text"
                            placeholder="Nom de la source"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                        />
                        <input
                            type="url"
                            placeholder="URL du flux RSS"
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                        />
                        <button onClick={handleAddCustomSource} disabled={!customUrl || !customName}>
                            <Plus size={14} /> Ajouter
                        </button>
                    </div>
                </div>
            )}

            {/* Source Tabs */}
            <div className="source-tabs">
                <button
                    className={`source-tab ${activeSourceId === null ? 'active' : ''}`}
                    onClick={() => setActiveSourceId(null)}
                >
                    Toutes
                    <span className="tab-count">{articles.length}</span>
                </button>
                {sources.map(source => {
                    const count = getSourceArticleCount(source.id);
                    return (
                        <button
                            key={source.id}
                            className={`source-tab ${activeSourceId === source.id ? 'active' : ''}`}
                            onClick={() => setActiveSourceId(source.id)}
                            title={source.name}
                        >
                            {source.name.length > 25 ? source.name.substring(0, 25) + '...' : source.name}
                            <span className="tab-count">{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Articles Feed */}
            <div className="articles-feed">
                {sources.length === 0 ? (
                    <div className="empty-state">
                        <Rss size={48} />
                        <h3>Commencez votre veille</h3>
                        <p>Utilisez "Recherche Google" ou "Créer un flux" pour ajouter des sources</p>
                    </div>
                ) : isLoading ? (
                    <div className="loading-state">
                        <Loader2 size={32} className="spinning" />
                        <p>Chargement des actualités...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <AlertCircle size={32} />
                        <p>{error}</p>
                        <button onClick={fetchArticles}>Réessayer</button>
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="empty-state">
                        <RefreshCw size={48} />
                        <h3>Aucun article</h3>
                        <p>Cliquez sur Rafraîchir pour charger les dernières actualités</p>
                        <button onClick={fetchArticles}>
                            <RefreshCw size={16} /> Charger les flux
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="feed-meta">
                            {lastFetched && (
                                <p className="last-updated">
                                    Dernière mise à jour : {formatRelativeTime(new Date(lastFetched))}
                                </p>
                            )}
                            <p className="articles-info">
                                Affichage {startIndex + 1}-{Math.min(endIndex, totalArticles)} sur {totalArticles} articles
                                {relevantCount > 0 && (
                                    <span className="relevant-count-inline">
                                        <Flame size={12} /> {relevantCount} pertinent{relevantCount > 1 ? 's' : ''}
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="articles-grid">
                            {paginatedArticles.map(article => (
                                <article
                                    key={article.id}
                                    className={`article-card ${article.relevance.level === 'high' ? 'article-relevant-high' : ''} ${article.relevance.level === 'medium' ? 'article-relevant-medium' : ''}`}
                                >
                                    {article.relevance.level === 'high' && (
                                        <div className="relevance-badge">
                                            <Flame size={12} /> Pertinent
                                        </div>
                                    )}
                                    <div className="article-meta">
                                        <span className="source-badge">{article.sourceName}</span>
                                        <span className="article-date">{formatRelativeTime(article.pubDate)}</span>
                                    </div>
                                    <h3 className="article-title">{article.title}</h3>
                                    {article.description && (
                                        <p className="article-excerpt">{article.description}</p>
                                    )}
                                    {article.relevance.matchedKeywords.length > 0 && (
                                        <div className="matched-keywords">
                                            {article.relevance.matchedKeywords.slice(0, 3).map(kw => (
                                                <span key={kw} className="keyword-tag">{kw}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="article-actions">
                                        <a
                                            href={article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="view-link"
                                        >
                                            <ExternalLink size={14} /> Lire
                                        </a>
                                        <button
                                            className="analyze-btn"
                                            onClick={() => handleAnalyze(article)}
                                        >
                                            <Sparkles size={14} /> Transformer en SEO
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="pagination-btn"
                                >
                                    ← Précédent
                                </button>
                                <div className="pagination-pages">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`pagination-page ${currentPage === pageNum ? 'active' : ''}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="pagination-btn"
                                >
                                    Suivant →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

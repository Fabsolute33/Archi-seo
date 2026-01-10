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
    Check
} from 'lucide-react';
import { useRSSStore } from '../stores/useRSSStore';
import { useProjectStore } from '../stores/useProjectStore';
import { useAgentStore } from '../stores/useAgentStore';
import { SUGGESTED_RSS_SOURCES, formatRelativeTime } from '../services/NewsMonitorService';
import type { RSSArticle } from '../types/agents';
import { RSSGeneratorPanel } from './RSSGeneratorPanel';
import { calculateRelevance, type RelevanceResult } from '../utils/relevanceScorer';
import './RSSWatchSection.css';

// Sector tabs for quick source selection
const SECTOR_TABS = ['Tous', 'Tech / Digital', 'Marketing / SEO', 'Business / Économie', 'E-commerce'];

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

    const [activeSector, setActiveSector] = useState('Tous');
    const [showSettings, setShowSettings] = useState(false);
    const [showGenerator, setShowGenerator] = useState(false);
    const [customUrl, setCustomUrl] = useState('');
    const [customName, setCustomName] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Handle save with feedback
    const handleSave = async () => {
        await saveCurrentProject();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    };

    // Auto-fetch when sources change
    useEffect(() => {
        if (sources.length > 0 && articles.length === 0 && !isLoading && currentProjectName) {
            fetchArticles();
        }
    }, [sources.length, currentProjectName]);

    // Filter articles by sector if not "Tous"
    const filteredArticles = activeSector === 'Tous'
        ? articles
        : articles.filter(a => {
            const source = sources.find(s => s.id === a.sourceId);
            return source?.sector === activeSector;
        });

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

    const getSectorSourceCount = (sector: string) => {
        if (sector === 'Tous') return sources.length;
        return sources.filter(s => s.sector === sector).length;
    };

    // Count relevant articles
    const relevantCount = articlesWithRelevance.filter(a => a.relevance.level === 'high').length;

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

    const handleAddSectorSources = (sector: string) => {
        const sectorData = SUGGESTED_RSS_SOURCES.find(s => s.sector === sector);
        if (sectorData) {
            sectorData.sources.forEach(source => {
                const exists = sources.some(s => s.url === source.url);
                if (!exists) {
                    addSource({ name: source.name, url: source.url, sector });
                }
            });
            // Auto-fetch after adding
            setTimeout(() => fetchArticles(), 100);
        }
    };

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

            {/* Sector Tabs */}
            <div className="sector-tabs">
                {SECTOR_TABS.map(sector => {
                    const count = getSectorSourceCount(sector);
                    const isActive = activeSector === sector;
                    const hasSources = count > 0 || sector === 'Tous';

                    return (
                        <button
                            key={sector}
                            className={`sector-tab ${isActive ? 'active' : ''} ${!hasSources && sector !== 'Tous' ? 'empty' : ''}`}
                            onClick={() => {
                                setActiveSector(sector);
                                if (sector !== 'Tous' && count === 0) {
                                    handleAddSectorSources(sector);
                                }
                            }}
                        >
                            {sector === 'Tous' ? sector : sector.split(' / ')[0]}
                            {count > 0 && <span className="tab-count">{count}</span>}
                            {sector !== 'Tous' && count === 0 && <Plus size={12} />}
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
                        <p>Cliquez sur un onglet secteur ci-dessus pour ajouter des sources automatiquement</p>
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
                            {relevantCount > 0 && (
                                <p className="relevant-count">
                                    <Flame size={14} /> {relevantCount} article{relevantCount > 1 ? 's' : ''} pertinent{relevantCount > 1 ? 's' : ''} pour votre projet
                                </p>
                            )}
                        </div>
                        <div className="articles-grid">
                            {articlesWithRelevance.map(article => (
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
                    </>
                )}
            </div>
        </div>
    );
}

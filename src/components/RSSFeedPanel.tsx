import { useState } from 'react';
import {
    Rss,
    Plus,
    Trash2,
    RefreshCw,
    ExternalLink,
    Sparkles,
    Settings,
    X,
    Check,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useRSSStore } from '../stores/useRSSStore';
import { SUGGESTED_RSS_SOURCES, formatRelativeTime } from '../services/NewsMonitorService';
import type { RSSArticle } from '../types/agents';
import './RSSFeedPanel.css';

interface RSSFeedPanelProps {
    onSelectArticle: (url: string) => void;
}

export function RSSFeedPanel({ onSelectArticle }: RSSFeedPanelProps) {
    const {
        sources,
        articles,
        isLoading,
        error,
        lastFetched,
        addSource,
        removeSource,
        toggleSource,
        fetchArticles,
        markArticleAsProcessed
    } = useRSSStore();

    const [showSourceManager, setShowSourceManager] = useState(false);
    const [newSourceUrl, setNewSourceUrl] = useState('');
    const [newSourceName, setNewSourceName] = useState('');
    const [addingSource, setAddingSource] = useState(false);

    const handleAddSource = () => {
        if (newSourceUrl && newSourceName) {
            addSource({
                name: newSourceName,
                url: newSourceUrl,
            });
            setNewSourceUrl('');
            setNewSourceName('');
            setAddingSource(false);
        }
    };

    const handleAddSuggestedSource = (name: string, url: string) => {
        addSource({ name, url });
    };

    const handleSelectArticle = (article: RSSArticle) => {
        onSelectArticle(article.url);
        markArticleAsProcessed(article.id);
    };

    const activeSources = sources.filter(s => s.isActive);

    return (
        <div className="rss-feed-panel">
            <div className="rss-panel-header">
                <div className="rss-title">
                    <Rss size={18} />
                    <span>Veille Actualités</span>
                    {activeSources.length > 0 && (
                        <span className="source-count">{activeSources.length} source{activeSources.length > 1 ? 's' : ''}</span>
                    )}
                </div>
                <div className="rss-actions">
                    <button
                        className="rss-action-btn"
                        onClick={() => setShowSourceManager(!showSourceManager)}
                        title="Gérer les sources"
                    >
                        <Settings size={16} />
                    </button>
                    <button
                        className="rss-action-btn refresh"
                        onClick={fetchArticles}
                        disabled={isLoading || sources.length === 0}
                        title="Rafraîchir les flux"
                    >
                        <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
                    </button>
                </div>
            </div>

            {/* Source Manager Panel */}
            {showSourceManager && (
                <div className="source-manager">
                    <h4>Sources RSS</h4>

                    {/* Current Sources */}
                    <div className="current-sources">
                        {sources.length === 0 ? (
                            <p className="no-sources">Aucune source configurée</p>
                        ) : (
                            sources.map(source => (
                                <div key={source.id} className={`source-item ${source.isActive ? 'active' : 'inactive'}`}>
                                    <button
                                        className="source-toggle"
                                        onClick={() => toggleSource(source.id)}
                                        title={source.isActive ? 'Désactiver' : 'Activer'}
                                    >
                                        {source.isActive ? <Check size={14} /> : <X size={14} />}
                                    </button>
                                    <span className="source-name">{source.name}</span>
                                    <button
                                        className="source-delete"
                                        onClick={() => removeSource(source.id)}
                                        title="Supprimer"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add New Source */}
                    {addingSource ? (
                        <div className="add-source-form">
                            <input
                                type="text"
                                placeholder="Nom de la source"
                                value={newSourceName}
                                onChange={(e) => setNewSourceName(e.target.value)}
                            />
                            <input
                                type="url"
                                placeholder="URL du flux RSS"
                                value={newSourceUrl}
                                onChange={(e) => setNewSourceUrl(e.target.value)}
                            />
                            <div className="form-actions">
                                <button onClick={handleAddSource} disabled={!newSourceUrl || !newSourceName}>
                                    <Check size={14} /> Ajouter
                                </button>
                                <button onClick={() => setAddingSource(false)}>
                                    <X size={14} /> Annuler
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button className="add-source-btn" onClick={() => setAddingSource(true)}>
                            <Plus size={16} /> Ajouter une source
                        </button>
                    )}

                    {/* Suggested Sources */}
                    <div className="suggested-sources">
                        <h5>Sources suggérées</h5>
                        {SUGGESTED_RSS_SOURCES.map(category => (
                            <div key={category.sector} className="source-category">
                                <span className="category-name">{category.sector}</span>
                                <div className="category-sources">
                                    {category.sources.map(source => {
                                        const isAdded = sources.some(s => s.url === source.url);
                                        return (
                                            <button
                                                key={source.url}
                                                className={`suggested-source ${isAdded ? 'added' : ''}`}
                                                onClick={() => !isAdded && handleAddSuggestedSource(source.name, source.url)}
                                                disabled={isAdded}
                                            >
                                                {isAdded ? <Check size={12} /> : <Plus size={12} />}
                                                {source.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Articles Feed */}
            <div className="rss-articles">
                {sources.length === 0 ? (
                    <div className="empty-state">
                        <Rss size={32} />
                        <p>Configurez vos sources RSS pour voir les actualités</p>
                        <button onClick={() => setShowSourceManager(true)}>
                            <Settings size={16} /> Gérer les sources
                        </button>
                    </div>
                ) : isLoading ? (
                    <div className="loading-state">
                        <Loader2 size={24} className="spinning" />
                        <p>Chargement des flux...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <AlertCircle size={24} />
                        <p>{error}</p>
                        <button onClick={fetchArticles}>Réessayer</button>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="empty-state">
                        <RefreshCw size={32} />
                        <p>Cliquez sur rafraîchir pour charger les actualités</p>
                        <button onClick={fetchArticles}>
                            <RefreshCw size={16} /> Charger les flux
                        </button>
                    </div>
                ) : (
                    <>
                        {lastFetched && (
                            <p className="last-fetched">
                                Mis à jour {formatRelativeTime(new Date(lastFetched))}
                            </p>
                        )}
                        {articles.map(article => (
                            <div key={article.id} className="article-card">
                                <div className="article-source">
                                    {article.sourceName}
                                    <span className="article-date">
                                        {formatRelativeTime(article.pubDate)}
                                    </span>
                                </div>
                                <h4 className="article-title">{article.title}</h4>
                                {article.description && (
                                    <p className="article-description">
                                        {article.description.slice(0, 150)}...
                                    </p>
                                )}
                                <div className="article-actions">
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="article-link"
                                    >
                                        <ExternalLink size={14} /> Voir l'article
                                    </a>
                                    <button
                                        className="analyze-btn"
                                        onClick={() => handleSelectArticle(article)}
                                    >
                                        <Sparkles size={14} /> Analyser
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

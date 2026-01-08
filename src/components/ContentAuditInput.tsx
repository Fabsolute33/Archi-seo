import { useState } from 'react';
import { Search, Loader2, AlertCircle, Globe } from 'lucide-react';
import { useAgentStore } from '../stores/useAgentStore';
import { isValidUrl } from '../services/WebScraperService';
import './ContentAuditInput.css';

export function ContentAuditInput() {
    const [url, setUrl] = useState('');
    const [targetKeyword, setTargetKeyword] = useState('');
    const [error, setError] = useState('');

    const { contentAudit, runContentAudit } = useAgentStore();
    const isLoading = contentAudit.status === 'scraping' || contentAudit.status === 'analyzing';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!url.trim()) {
            setError('Veuillez entrer une URL');
            return;
        }

        // Ajouter https:// si pas de protocole
        let normalizedUrl = url.trim();
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
            normalizedUrl = 'https://' + normalizedUrl;
        }

        if (!isValidUrl(normalizedUrl)) {
            setError('URL invalide. Exemple: https://example.com/page');
            return;
        }

        try {
            await runContentAudit(normalizedUrl, targetKeyword.trim() || undefined);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de l\'audit');
        }
    };

    return (
        <div className="content-audit-input">
            <div className="audit-header">
                <div className="audit-icon">
                    <Globe size={32} />
                </div>
                <div className="audit-title">
                    <h2>Audit de Contenu SEO</h2>
                    <p>Analysez une page existante pour identifier les opportunités d'optimisation</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="audit-form">
                <div className="form-group">
                    <label htmlFor="url">URL de la page à auditer</label>
                    <div className="input-wrapper">
                        <Search className="input-icon" size={18} />
                        <input
                            type="text"
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/ma-page"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="keyword">
                        Mot-clé cible <span className="optional">(optionnel)</span>
                    </label>
                    <input
                        type="text"
                        id="keyword"
                        value={targetKeyword}
                        onChange={(e) => setTargetKeyword(e.target.value)}
                        placeholder="Ex: architecte intérieur paris"
                        disabled={isLoading}
                    />
                    <span className="hint">
                        Indiquez le mot-clé principal pour une analyse plus précise
                    </span>
                </div>

                {error && (
                    <div className="error-message">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {contentAudit.error && (
                    <div className="error-message">
                        <AlertCircle size={16} />
                        {contentAudit.error}
                    </div>
                )}

                <button type="submit" className="submit-btn" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="spinner" size={18} />
                            {contentAudit.status === 'scraping' ? 'Extraction du contenu...' : 'Analyse en cours...'}
                        </>
                    ) : (
                        <>
                            <Search size={18} />
                            Lancer l'audit
                        </>
                    )}
                </button>
            </form>

            {isLoading && (
                <div className="loading-info">
                    <div className="loading-step active">
                        <div className="step-dot" />
                        <span>Extraction du contenu de la page</span>
                    </div>
                    <div className={`loading-step ${contentAudit.status === 'analyzing' ? 'active' : ''}`}>
                        <div className="step-dot" />
                        <span>Analyse SEO avec l'Agent 9</span>
                    </div>
                    <div className="loading-step">
                        <div className="step-dot" />
                        <span>Génération des recommandations</span>
                    </div>
                </div>
            )}
        </div>
    );
}

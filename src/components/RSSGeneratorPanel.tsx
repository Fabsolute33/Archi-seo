import { useState } from 'react';
import { Link2, ExternalLink, Copy, Check, X, Rss, ArrowRight } from 'lucide-react';

interface RSSGeneratorPanelProps {
    onClose: () => void;
}

export function RSSGeneratorPanel({ onClose }: RSSGeneratorPanelProps) {
    const [sourceUrl, setSourceUrl] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerateWithRSSApp = () => {
        if (!sourceUrl) return;
        // RSS.app accepts URL to scrape and opens their generator
        const rssAppUrl = `https://rss.app/new?url=${encodeURIComponent(sourceUrl)}`;
        window.open(rssAppUrl, '_blank', 'noopener,noreferrer');
    };

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(sourceUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rss-generator-panel">
            <div className="generator-header">
                <div className="generator-title">
                    <Link2 size={18} />
                    <h3>Créer un flux RSS depuis une page web</h3>
                </div>
                <button className="close-btn" onClick={onClose}>
                    <X size={16} />
                </button>
            </div>

            <p className="generator-description">
                Transformez n'importe quelle page d'actualités en flux RSS grâce à <strong>RSS.app</strong>.
            </p>

            <div className="generator-steps">
                <div className="step">
                    <span className="step-number">1</span>
                    <div className="step-content">
                        <label>Collez l'URL de la page d'actualités :</label>
                        <div className="url-input-group">
                            <input
                                type="url"
                                placeholder="https://exemple.fr/actualites/incendie"
                                value={sourceUrl}
                                onChange={(e) => setSourceUrl(e.target.value)}
                                className="generator-input"
                            />
                            {sourceUrl && (
                                <button
                                    className="copy-btn"
                                    onClick={handleCopyUrl}
                                    title="Copier l'URL"
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="step">
                    <span className="step-number">2</span>
                    <div className="step-content">
                        <label>Ouvrez RSS.app pour générer le flux :</label>
                        <button
                            className="rssapp-btn"
                            onClick={handleGenerateWithRSSApp}
                            disabled={!sourceUrl}
                        >
                            <Rss size={16} />
                            Ouvrir RSS.app
                            <ExternalLink size={14} />
                        </button>
                    </div>
                </div>

                <div className="step">
                    <span className="step-number">3</span>
                    <div className="step-content">
                        <label>Copiez l'URL du flux RSS généré et ajoutez-le ci-dessus</label>
                        <div className="step-hint">
                            <ArrowRight size={14} />
                            <span>Utilisez "Gérer les sources" → champ "URL du flux RSS"</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="generator-tip">
                <strong>💡 Astuce :</strong> RSS.app offre un plan gratuit généreux. Pour des besoins plus importants, des plans premium sont disponibles.
            </div>
        </div>
    );
}

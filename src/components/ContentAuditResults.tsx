import { useState } from 'react';
import {
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Plus,
    Copy,
    Check,
    FileText,
    Target,
    Zap,
    Shield,
    BookOpen,
    ExternalLink
} from 'lucide-react';
import { useAgentStore } from '../stores/useAgentStore';
import type { AuditRecommendation, ContentGap } from '../types/auditTypes';
import type { ContentTableRow } from '../types/agents';
import './ContentAuditResults.css';

function ScoreGauge({ score, label }: { score: number; label: string }) {
    const getColor = (score: number) => {
        if (score >= 80) return '#22c55e';
        if (score >= 60) return '#eab308';
        if (score >= 40) return '#f97316';
        return '#ef4444';
    };

    return (
        <div className="score-gauge">
            <div className="gauge-circle">
                <svg viewBox="0 0 36 36">
                    <path
                        className="gauge-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="3"
                    />
                    <path
                        className="gauge-fill"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={getColor(score)}
                        strokeWidth="3"
                        strokeDasharray={`${score}, 100`}
                    />
                </svg>
                <span className="gauge-value" style={{ color: getColor(score) }}>
                    {score}
                </span>
            </div>
            <span className="gauge-label">{label}</span>
        </div>
    );
}

function RecommendationCard({ rec }: { rec: AuditRecommendation }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const priorityColors = {
        haute: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
        moyenne: { bg: '#fffbeb', border: '#fde68a', text: '#d97706' },
        basse: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' }
    };

    const categoryIcons = {
        structure: <FileText size={16} />,
        semantique: <Target size={16} />,
        technique: <Zap size={16} />,
        eeat: <Shield size={16} />,
        contenu: <BookOpen size={16} />
    };

    const colors = priorityColors[rec.priority];

    return (
        <div
            className={`recommendation-card ${isExpanded ? 'expanded' : ''}`}
            style={{ borderColor: colors.border }}
        >
            <div
                className="rec-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="rec-left">
                    <span className="rec-category" title={rec.category}>
                        {categoryIcons[rec.category]}
                    </span>
                    <span className="rec-title">{rec.titre}</span>
                </div>
                <div className="rec-right">
                    <span
                        className="rec-priority"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                        {rec.priority}
                    </span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </div>
            {isExpanded && (
                <div className="rec-body">
                    <p className="rec-description">{rec.description}</p>
                    <div className="rec-action">
                        <strong>📋 Action :</strong> {rec.actionnable}
                    </div>
                    <div className="rec-impact">
                        <strong>📈 Impact :</strong> {rec.impact}
                    </div>
                </div>
            )}
        </div>
    );
}

function ContentGapCard({ gap }: { gap: ContentGap }) {
    const potentielColors = {
        'élevé': '#22c55e',
        'moyen': '#eab308',
        'faible': '#94a3b8'
    };

    return (
        <div className="content-gap-card">
            <div className="gap-header">
                <span className="gap-title">{gap.sujet}</span>
                <span
                    className="gap-potentiel"
                    style={{ color: potentielColors[gap.potentiel] }}
                >
                    Potentiel {gap.potentiel}
                </span>
            </div>
            <p className="gap-raison">{gap.raison}</p>
            <div className="gap-keywords">
                {gap.motsCles.map((kw, i) => (
                    <span key={i} className="keyword-tag">{kw}</span>
                ))}
            </div>
        </div>
    );
}

function SuggestedArticleCard({ article, onAdd }: { article: ContentTableRow; onAdd: () => void }) {
    const [copied, setCopied] = useState(false);
    const [added, setAdded] = useState(false);

    const handleCopy = () => {
        const text = `
Titre H1: ${article.titreH1}
Angle: ${article.angle}
Trigger: ${article.trigger}
Mots-clés LSI: ${article.carburant?.lsi?.join(', ') || ''}
Questions PAA: ${article.paa || ''}
Format Snippet: ${article.snippetFormat}
Schema: ${article.schema}
    `.trim();

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAdd = () => {
        onAdd();
        setAdded(true);
    };

    return (
        <div className="suggested-article-card">
            <div className="article-cluster">{article.cluster}</div>
            <h4 className="article-title">{article.titreH1}</h4>
            <p className="article-angle">{article.angle}</p>
            <div className="article-meta">
                <span className="meta-item">🎯 {article.trigger}</span>
                <span className="meta-item">📝 {article.snippetFormat}</span>
                <span className="meta-item">🔖 {article.schema}</span>
            </div>
            <div className="article-actions">
                <button
                    className="btn-copy"
                    onClick={handleCopy}
                    disabled={copied}
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copié' : 'Brief'}
                </button>
                <button
                    className="btn-add"
                    onClick={handleAdd}
                    disabled={added}
                >
                    {added ? <Check size={14} /> : <Plus size={14} />}
                    {added ? 'Ajouté' : 'Ajouter'}
                </button>
            </div>
        </div>
    );
}

export function ContentAuditResults() {
    const { contentAudit, addSuggestedArticle } = useAgentStore();
    const [activeSection, setActiveSection] = useState<'recommendations' | 'gaps' | 'articles'>('recommendations');

    if (contentAudit.status !== 'completed' || !contentAudit.result) {
        return null;
    }

    const { result } = contentAudit;

    return (
        <div className="content-audit-results">
            {/* Header avec URL analysée */}
            <div className="results-header">
                <h2>Résultats de l'audit</h2>
                <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="url-link"
                >
                    {result.url}
                    <ExternalLink size={14} />
                </a>
            </div>

            {/* Résumé exécutif */}
            <div className="executive-summary">
                <p>{result.resumeExecutif}</p>
            </div>

            {/* Scores */}
            <div className="scores-section">
                <h3>Scores SEO</h3>
                <div className="scores-grid">
                    <ScoreGauge score={result.scores.global} label="Global" />
                    <ScoreGauge score={result.scores.structure} label="Structure" />
                    <ScoreGauge score={result.scores.semantique} label="Sémantique" />
                    <ScoreGauge score={result.scores.technique} label="Technique" />
                    <ScoreGauge score={result.scores.eeat} label="E-E-A-T" />
                    <ScoreGauge score={result.scores.lisibilite} label="Lisibilité" />
                </div>
            </div>

            {/* Points forts / faibles */}
            <div className="points-section">
                <div className="points-column points-forts">
                    <h4><CheckCircle size={18} /> Points forts</h4>
                    <ul>
                        {result.pointsForts.map((point, i) => (
                            <li key={i}>{point}</li>
                        ))}
                    </ul>
                </div>
                <div className="points-column points-faibles">
                    <h4><AlertTriangle size={18} /> Points faibles</h4>
                    <ul>
                        {result.pointsFaibles.map((point, i) => (
                            <li key={i}>{point}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Navigation par onglets */}
            <div className="results-tabs">
                <button
                    className={`tab ${activeSection === 'recommendations' ? 'active' : ''}`}
                    onClick={() => setActiveSection('recommendations')}
                >
                    <TrendingUp size={16} />
                    Recommandations ({result.recommandations.length})
                </button>
                <button
                    className={`tab ${activeSection === 'gaps' ? 'active' : ''}`}
                    onClick={() => setActiveSection('gaps')}
                >
                    <Target size={16} />
                    Content Gaps ({result.contentGaps.length})
                </button>
                <button
                    className={`tab ${activeSection === 'articles' ? 'active' : ''}`}
                    onClick={() => setActiveSection('articles')}
                >
                    <FileText size={16} />
                    Articles suggérés ({result.suggestedArticles.length})
                </button>
            </div>

            {/* Contenu des onglets */}
            <div className="tab-content">
                {activeSection === 'recommendations' && (
                    <div className="recommendations-list">
                        {result.recommandations.map((rec, i) => (
                            <RecommendationCard key={i} rec={rec} />
                        ))}
                    </div>
                )}

                {activeSection === 'gaps' && (
                    <div className="gaps-list">
                        {result.contentGaps.map((gap, i) => (
                            <ContentGapCard key={i} gap={gap} />
                        ))}
                    </div>
                )}

                {activeSection === 'articles' && (
                    <div className="articles-grid">
                        {result.suggestedArticles.map((article, i) => (
                            <SuggestedArticleCard
                                key={i}
                                article={article}
                                onAdd={() => addSuggestedArticle(article)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

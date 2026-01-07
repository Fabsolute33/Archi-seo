import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAgentStore } from '../stores/useAgentStore';
import {
    ChevronDown,
    ChevronUp,
    Zap,
    Users,
    Target,
    FileText,
    Settings,
    Mic,
    Award,
    Copy,
    Check,
    RefreshCcw
} from 'lucide-react';
import './ResultDashboard.css';

interface AccordionProps {
    title: string;
    icon: React.ReactNode;
    color: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function Accordion({ title, icon, color, children, defaultOpen = false }: AccordionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`accordion ${isOpen ? 'open' : ''}`} style={{ '--accent-color': color } as React.CSSProperties}>
            <button className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
                <div className="accordion-title">
                    <span className="accordion-icon" style={{ background: color }}>{icon}</span>
                    <span>{title}</span>
                </div>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {isOpen && <div className="accordion-content">{children}</div>}
        </div>
    );
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button className="copy-btn" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
    );
}

export function ResultDashboard() {
    const {
        strategicAnalysis,
        clusterArchitecture,
        contentDesign,
        technicalOptimization,
        snippetStrategy,
        authorityStrategy,
        coordinatorSummary,
        resetAll
    } = useAgentStore();

    // État pour gérer les articles validés (rédigés)
    const [validatedArticles, setValidatedArticles] = useState<Record<number, boolean>>({});

    const handleValidationChange = (index: number) => {
        setValidatedArticles(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const isComplete = coordinatorSummary.status === 'completed';

    if (!isComplete) return null;

    return (
        <section className="result-dashboard">
            <div className="result-container">
                {/* Quick Wins Section */}
                {coordinatorSummary.data && (
                    <div className="quick-wins-section">
                        <h2>
                            <Zap className="section-icon" />
                            Quick Wins
                        </h2>
                        <div className="quick-wins-grid">
                            {coordinatorSummary.data.quickWins.map((qw, idx) => (
                                <div key={idx} className="quick-win-card">
                                    <div className={`quick-win-badge ${qw.impact}`}>{qw.impact}</div>
                                    <h4>{qw.titre}</h4>
                                    <p>{qw.description}</p>
                                    <div className="quick-win-meta">
                                        <span>⏱️ {qw.delai}</span>
                                        <span>💪 {qw.effort}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Synthesis */}
                {coordinatorSummary.data && (
                    <div className="synthesis-card glass-card">
                        <h3>Synthèse Stratégique</h3>
                        <div className="synthesis-content">
                            <ReactMarkdown>{coordinatorSummary.data.synthese}</ReactMarkdown>
                        </div>
                    </div>
                )}

                {/* Agent Results Accordions */}
                <div className="agents-results">
                    {/* Strategic Analysis */}
                    {strategicAnalysis.data && (
                        <Accordion
                            title="Analyse Stratégique"
                            icon={<Users size={18} />}
                            color="#8b5cf6"
                            defaultOpen
                        >
                            <div className="result-grid">
                                <div className="result-block">
                                    <h4>Avatar Client</h4>
                                    <ul>
                                        <li><strong>Segment:</strong> {strategicAnalysis.data.avatar.segment}</li>
                                        <li><strong>Démographique:</strong> {strategicAnalysis.data.avatar.demographique}</li>
                                        <li><strong>Psychographique:</strong> {strategicAnalysis.data.avatar.psychographique}</li>
                                        <li><strong>Comportemental:</strong> {strategicAnalysis.data.avatar.comportemental}</li>
                                    </ul>
                                </div>
                                <div className="result-block">
                                    <h4>Top 5 Douleurs</h4>
                                    <ul>
                                        {strategicAnalysis.data.douleursTop5.map((d, i) => (
                                            <li key={i}>
                                                <span className={`intensity-badge ${d.intensite}`}>{d.intensite}</span>
                                                {d.douleur}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="result-block">
                                    <h4>Niveau E-E-A-T Requis</h4>
                                    <div className={`eeat-level ${strategicAnalysis.data.niveauEEAT.requis}`}>
                                        {strategicAnalysis.data.niveauEEAT.requis}
                                    </div>
                                    <p>{strategicAnalysis.data.niveauEEAT.justification}</p>
                                </div>
                                <div className="result-block">
                                    <h4>Différentiation</h4>
                                    <p><strong>Angle:</strong> {strategicAnalysis.data.levierDifferentiation.angle}</p>
                                    <p><strong>Message:</strong> {strategicAnalysis.data.levierDifferentiation.messageUnique}</p>
                                </div>
                            </div>
                        </Accordion>
                    )}

                    {/* Cluster Architecture */}
                    {clusterArchitecture.data && (
                        <Accordion
                            title="Architecture des Clusters"
                            icon={<Target size={18} />}
                            color="#6366f1"
                        >
                            <div className="clusters-grid">
                                {clusterArchitecture.data.clusters.map((cluster) => (
                                    <div key={cluster.id} className={`cluster-card ${cluster.funnel.toLowerCase()}`}>
                                        <div className="cluster-header">
                                            <span className={`funnel-badge ${cluster.funnel.toLowerCase()}`}>{cluster.funnel}</span>
                                            <span className="priority-badge">P{cluster.priorite}</span>
                                        </div>
                                        <h4>{cluster.nom}</h4>
                                        <p>{cluster.description}</p>
                                        <div className="cluster-keywords">
                                            {cluster.motsCles.slice(0, 5).map((kw, i) => (
                                                <span key={i} className="keyword-tag">{kw}</span>
                                            ))}
                                        </div>
                                        <div className="cluster-meta">
                                            <span>📊 {cluster.volumeEstime}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Accordion>
                    )}

                    {/* Content Design */}
                    {contentDesign.data && (
                        <Accordion
                            title="Tableau de Contenu"
                            icon={<FileText size={18} />}
                            color="#ec4899"
                        >
                            <div className="content-table-wrapper">
                                <table className="content-table content-table-full">
                                    <thead>
                                        <tr>
                                            <th>Cluster</th>
                                            <th>Titre H1</th>
                                            <th>Angle</th>
                                            <th>Trigger</th>
                                            <th>Carburant Sémantique</th>
                                            <th>PAA (H2)</th>
                                            <th>Format Snippet</th>
                                            <th>Schema</th>
                                            <th>Appât SXO</th>
                                            <th>Intent</th>
                                            <th>Score</th>
                                            <th>Maillage</th>
                                            <th>Meta-Description</th>
                                            <th>Validation</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contentDesign.data.tableauContenu.map((row, idx) => (
                                            <tr key={idx}>
                                                <td className="cluster-cell">{row.cluster}</td>
                                                <td className="title-cell">{row.titreH1}</td>
                                                <td className="angle-cell">{row.angle}</td>
                                                <td className="trigger-cell">
                                                    <span className={`trigger-badge ${row.trigger?.toLowerCase().replace(/[^a-z]/g, '') || ''}`}>
                                                        {row.trigger}
                                                    </span>
                                                </td>
                                                <td className="carburant-cell">
                                                    <div className="carburant-details">
                                                        <div className="carburant-item" title="Terme Autoritaire">
                                                            <strong>🏛️</strong> {row.carburant?.termeAutoritaire || '-'}
                                                        </div>
                                                        <div className="carburant-item" title="Entité Google">
                                                            <strong>🔍</strong> {row.carburant?.entiteGoogle || '-'}
                                                        </div>
                                                        <div className="carburant-lsi" title="LSI Keywords">
                                                            {row.carburant?.lsi?.slice(0, 3).map((lsi, i) => (
                                                                <span key={i} className="lsi-tag">{lsi}</span>
                                                            )) || '-'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="paa-cell">{row.paa}</td>
                                                <td className="snippet-cell">
                                                    <span className={`snippet-badge ${row.snippetFormat}`}>
                                                        {row.snippetFormat}
                                                    </span>
                                                </td>
                                                <td className="schema-cell">
                                                    <span className="schema-badge">{row.schema}</span>
                                                </td>
                                                <td className="sxo-cell">{row.appatSXO}</td>
                                                <td className="intent-cell">
                                                    <span className={`intent-badge ${row.intent?.toLowerCase()}`}>{row.intent}</span>
                                                </td>
                                                <td className="score-cell">
                                                    <div className="score-badges">
                                                        <span title="Volume">📈 {row.score?.volume}</span>
                                                        <span title="Difficulté">🔧 {row.score?.difficulte}</span>
                                                        <span title="Impact">⚡ {row.score?.impact}</span>
                                                    </div>
                                                    {row.score?.prioriteGlobale && (
                                                        <div className="priority-total">
                                                            Total: {row.score.prioriteGlobale}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="maillage-cell">
                                                    <div className="maillage-details">
                                                        <div className="maillage-vers" title="Liens vers">
                                                            <strong>→</strong>
                                                            {Array.isArray(row.maillage?.vers) && row.maillage.vers.length > 0 ? (
                                                                row.maillage.vers.slice(0, 2).map((link, i) => (
                                                                    <span key={i} className="link-tag">
                                                                        {typeof link === 'string' ? link : link.article}
                                                                    </span>
                                                                ))
                                                            ) : '-'}
                                                        </div>
                                                        <div className="maillage-depuis" title="Liens depuis">
                                                            <strong>←</strong>
                                                            {Array.isArray(row.maillage?.depuis) && row.maillage.depuis.length > 0 ? (
                                                                row.maillage.depuis.slice(0, 2).map((link, i) => (
                                                                    <span key={i} className="link-tag">
                                                                        {typeof link === 'string' ? link : link.article}
                                                                    </span>
                                                                ))
                                                            ) : '-'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="meta-cell">
                                                    <div className="meta-description" title={row.metaDescription}>
                                                        {row.metaDescription?.substring(0, 80)}...
                                                    </div>
                                                </td>
                                                <td className="validation-cell">
                                                    <label className={`validation-checkbox ${validatedArticles[idx] ? 'validated' : ''}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={validatedArticles[idx] || false}
                                                            onChange={() => handleValidationChange(idx)}
                                                        />
                                                        <span className="checkmark"></span>
                                                        <span className="validation-label">
                                                            {validatedArticles[idx] ? 'Rédigé' : 'À rédiger'}
                                                        </span>
                                                    </label>
                                                </td>
                                                <td className="actions-cell">
                                                    <CopyButton text={`${row.titreH1}\n\n${row.metaDescription}`} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Accordion>
                    )}

                    {/* Technical Optimization */}
                    {technicalOptimization.data && (
                        <Accordion
                            title="Optimisation Technique"
                            icon={<Settings size={18} />}
                            color="#14b8a6"
                        >
                            <div className="result-grid">
                                <div className="result-block">
                                    <h4>Core Web Vitals Checklist</h4>
                                    <ul className="checklist">
                                        {technicalOptimization.data.coreWebVitals.checklist.map((item, i) => (
                                            <li key={i} className={`priority-${item.priorite}`}>
                                                <span className="priority-indicator">{item.priorite}</span>
                                                <div>
                                                    <strong>{item.item}</strong>
                                                    <p>{item.action}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="result-block">
                                    <h4>Configuration robots.txt</h4>
                                    <pre className="code-block">
                                        <CopyButton text={technicalOptimization.data.robotsTxt} />
                                        {technicalOptimization.data.robotsTxt}
                                    </pre>
                                </div>
                            </div>
                        </Accordion>
                    )}

                    {/* Snippet Strategy */}
                    {snippetStrategy.data && (
                        <Accordion
                            title="Stratégie Position 0"
                            icon={<Mic size={18} />}
                            color="#f59e0b"
                        >
                            <div className="snippets-section">
                                <h4>Templates de Snippets</h4>
                                <div className="snippets-grid">
                                    {snippetStrategy.data.snippetsParArticle.slice(0, 6).map((snippet: { article: string; formatChoisi: string; template: { type: string; reponse?: string; intro?: string; items?: string[] } }, idx: number) => (
                                        <div key={idx} className="snippet-card">
                                            <span className={`snippet-type ${snippet.formatChoisi}`}>{snippet.formatChoisi}</span>
                                            <h5>{snippet.article}</h5>
                                            <p>{snippet.template.type === 'definition' ? snippet.template.reponse : snippet.template.intro}</p>
                                            <CopyButton text={snippet.template.type === 'definition' ? (snippet.template.reponse || '') : (snippet.template.intro || '')} />
                                        </div>
                                    ))}
                                </div>

                                <h4 className="mt-xl">Questions Voice Search</h4>
                                <div className="voice-questions">
                                    {snippetStrategy.data.questionsVoice.slice(0, 5).map((q, idx) => (
                                        <div key={idx} className="voice-card">
                                            <span className="voice-icon">🎤</span>
                                            <div>
                                                <strong>{q.question}</strong>
                                                <p>{q.reponse}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Accordion>
                    )}

                    {/* Authority Strategy */}
                    {authorityStrategy.data && (
                        <Accordion
                            title="Stratégie E-E-A-T & Backlinks"
                            icon={<Award size={18} />}
                            color="#22c55e"
                        >
                            <div className="result-grid">
                                <div className="result-block">
                                    <h4>Certifications Recommandées</h4>
                                    <ul>
                                        {authorityStrategy.data.certifications.map((cert, i) => (
                                            <li key={i}>
                                                <strong>{cert.nom}</strong> - {cert.organisme}
                                                <p className="subtle">{cert.pertinence}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="result-block">
                                    <h4>Cibles Backlinks (Top 5)</h4>
                                    <div className="backlinks-list">
                                        {authorityStrategy.data.ciblesBacklinks.slice(0, 5).map((cible, i) => (
                                            <div key={i} className="backlink-card">
                                                <div className="backlink-header">
                                                    <span className="site-name">{cible.site}</span>
                                                    <span className="da-badge">DA {cible.da}</span>
                                                </div>
                                                <p>{cible.approche}</p>
                                                <details>
                                                    <summary>Template de prospection</summary>
                                                    <pre>{cible.templateProspection}</pre>
                                                </details>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Accordion>
                    )}
                </div>

                {/* Options Interactives */}
                {coordinatorSummary.data && (
                    <div className="interactive-options">
                        <h3>Prochaines Étapes</h3>
                        <div className="options-grid">
                            {coordinatorSummary.data.optionsInteractives.map((option) => (
                                <button key={option.id} className="option-card">
                                    <span className="option-icon">{option.icon}</span>
                                    <span className="option-label">{option.label}</span>
                                    <span className="option-description">{option.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reset Button */}
                <div className="reset-section">
                    <button className="btn btn-secondary" onClick={resetAll}>
                        <RefreshCcw size={18} />
                        Nouvelle Analyse
                    </button>
                </div>
            </div>
        </section>
    );
}

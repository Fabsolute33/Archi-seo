import { useState, useEffect } from 'react';
import {
    Sparkles,
    Loader2,
    TrendingUp,
    Copy,
    Download,
    RotateCcw,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Target,
    Clock,
    FileText,
    Link2,
    Lightbulb,
    Image,
    PlusCircle,
    Save,
    Trash2,
    History,
    Plus
} from 'lucide-react';
import { useAgentStore } from '../stores/useAgentStore';
import { useProjectStore } from '../stores/useProjectStore';
import type { NewsTransformerInput, SEOAngle, ContentTableRow, ImageSuggestion } from '../types/agents';
import './NewsTransformerSection.css';

const CONTENT_TYPES = [
    'Article de blog informatif',
    'Page de service / conversion',
    'Guide PDF téléchargeable',
    'Outil interactif',
    'Étude de cas / témoignage client',
    'Comparatif de solutions'
];

interface NewsTransformerSectionProps {
    prefilledUrl?: string | null;
    onUrlConsumed?: () => void;
}

export function NewsTransformerSection({ prefilledUrl, onUrlConsumed }: NewsTransformerSectionProps) {
    const {
        newsTransformer,
        runNewsTransformerAgent,
        resetNewsTransformer,
        apiKey,
        addSuggestedArticle,
        saveCurrentNewsAnalysis,
        loadNewsAnalysis,
        deleteNewsAnalysis
    } = useAgentStore();
    const { saveCurrentProject, currentProjectName, isLoading: isSaving } = useProjectStore();
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [addedAngles, setAddedAngles] = useState<number[]>([]);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [formData, setFormData] = useState<NewsTransformerInput>({
        url: '',
        secteur: '',
        expertise: '',
        motCle: '',
        typeContenu: [],
        audience: '',
        technicite: 'intermediaire',
        objectif: '',
        contraintes: '',
        articlesExistants: ''
    });

    // Handle prefilled URL from RSS Watch
    useEffect(() => {
        if (prefilledUrl) {
            setFormData(prev => ({ ...prev, url: prefilledUrl }));
            resetNewsTransformer();
            if (onUrlConsumed) {
                onUrlConsumed();
            }
        }
    }, [prefilledUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.url || !formData.secteur || !formData.expertise || !formData.audience) {
            return;
        }
        await runNewsTransformerAgent(formData);
    };

    const handleReset = () => {
        resetNewsTransformer();
        setFormData({
            url: '',
            secteur: '',
            expertise: '',
            motCle: '',
            typeContenu: [],
            audience: '',
            technicite: 'intermediaire',
            objectif: '',
            contraintes: '',
            articlesExistants: ''
        });
        setAddedAngles([]);
    };

    const handleSaveAnalysis = async () => {
        saveCurrentNewsAnalysis();
        if (currentProjectName) {
            await saveCurrentProject();
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleLoadAnalysis = (id: string) => {
        loadNewsAnalysis(id);
        // Sync form data with loaded analysis
        const analysis = newsTransformer.savedAnalyses.find(a => a.id === id);
        if (analysis) {
            setFormData(analysis.formData);
            setAddedAngles([]);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const truncateUrl = (url: string, maxLength = 30) => {
        try {
            const hostname = new URL(url).hostname;
            return hostname.length > maxLength ? hostname.slice(0, maxLength) + '...' : hostname;
        } catch {
            return url.slice(0, maxLength) + '...';
        }
    };

    const handleTypeContenuChange = (type: string) => {
        setFormData(prev => ({
            ...prev,
            typeContenu: prev.typeContenu.includes(type)
                ? prev.typeContenu.filter(t => t !== type)
                : [...prev.typeContenu, type]
        }));
    };

    // Convert SEOAngle to ContentTableRow with image prompts
    const convertAngleToContentRow = (angle: SEOAngle): ContentTableRow => {
        // Generate image suggestions based on angle content
        const imageSuggestions: ImageSuggestion[] = angle.visuels.map((visuel, idx) => {
            const types: ImageSuggestion['type'][] = ['infographie', 'illustration', 'schema', 'photo-produit'];
            const categories: ImageSuggestion['category'][] = ['infographic', 'illustration', 'schema', 'photography'];

            return {
                type: types[idx % types.length],
                category: categories[idx % categories.length],
                style: 'modern, professional, clean design',
                description: visuel,
                generationPrompt: `Créer une image professionnelle pour illustrer "${angle.titre}". Le visuel doit représenter: ${visuel}. Style moderne et épuré, adapté pour un article SEO sur ${formData.secteur}. Contexte: ${angle.promesseUnique}. En français.`,
                negativePrompt: 'texte illisible, mauvaise qualité, flou, amateur, logo, watermark',
                placement: idx === 0 ? 'hero-image' : `section-${idx + 1}`,
                altText: `${visuel} - ${angle.motCleCible}`
            };
        });

        // Determine snippet format from angle
        const snippetFormatMap: Record<string, ContentTableRow['snippetFormat']> = {
            'Liste numérotée': 'liste',
            'Tableau': 'tableau',
            'Définition courte': 'definition',
            'Paragraphe court': 'definition'
        };

        // Determine intent from angle type
        const intentMap: Record<string, ContentTableRow['intent']> = {
            'Info': 'TOFU',
            'Commercial': 'MOFU',
            'Transac': 'BOFU'
        };

        // Determine emotional trigger from intent type
        const triggerMap: Record<string, string> = {
            'Info': 'Curiosité',
            'Commercial': 'Espoir',
            'Transac': 'Urgence'
        };

        return {
            cluster: formData.secteur,
            titreH1: angle.titre,
            angle: angle.elementDifferenciateur,
            trigger: triggerMap[angle.typeIntention] || 'Curiosité',
            carburant: {
                termeAutoritaire: formData.expertise,
                entiteGoogle: formData.secteur,
                lsi: angle.requetesLSI
            },
            paa: angle.featuredSnippet.questionPAA,
            snippetFormat: snippetFormatMap[angle.featuredSnippet.formatRecommande] || 'liste',
            schema: 'Article',
            appatSXO: angle.contenuObligatoire[0] || 'Guide pratique',
            intent: intentMap[angle.typeIntention] || 'MOFU',
            score: {
                volume: angle.difficulteSEO === 'Facile' ? 1500 : angle.difficulteSEO === 'Moyen' ? 800 : 400,
                difficulte: angle.difficulteSEO === 'Facile' ? 20 : angle.difficulteSEO === 'Moyen' ? 45 : 70,
                impact: 8
            },
            maillage: {
                vers: [],
                depuis: []
            },
            metaDescription: `${angle.promesseUnique} - Découvrez ${angle.contenuObligatoire[0] || 'notre guide complet'}.`,
            validated: false,
            imageSuggestions,
            // News SEO specific fields
            promesseUnique: angle.promesseUnique,
            contenuObligatoire: angle.contenuObligatoire
        };
    };

    const handleAddToContentTable = (angle: SEOAngle) => {
        const contentRow = convertAngleToContentRow(angle);
        addSuggestedArticle(contentRow);
        setAddedAngles(prev => [...prev, angle.numero]);
    };

    const copyToClipboard = (text: string, index?: number) => {
        navigator.clipboard.writeText(text);
        if (index !== undefined) {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        }
    };

    // Generate complete instructions for an angle (used for copy button)
    const generateAngleInstructions = (angle: SEOAngle): string => {
        const contenuListe = angle.contenuObligatoire
            .map((c, i) => `${i + 1}. ${c}`)
            .join('\n');

        return `📌 TITRE: ${angle.titre}

🎯 PROMESSE UNIQUE:
${angle.promesseUnique}

📋 CONTENU OBLIGATOIRE:
${contenuListe}

🔑 MOT-CLÉ CIBLE: ${angle.motCleCible}
⏱️ TIMING: ${angle.strategiePublication.timing}
📝 LONGUEUR: ${angle.strategiePublication.longueurCible} mots`;
    };

    const downloadResults = () => {
        if (!newsTransformer.result) return;

        const content = generateMarkdownOutput();
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'angles-seo-transformation.md';
        a.click();
        URL.revokeObjectURL(url);
    };

    const generateMarkdownOutput = (): string => {
        if (!newsTransformer.result) return '';
        const result = newsTransformer.result;

        if (result.scoreRentabilite === '🔴' && result.nonRentable) {
            return `# ⚠️ ARTICLE NON RENTABLE POUR VOTRE STRATÉGIE SEO

## Pourquoi cet article ne mérite pas d'être transformé :

${result.nonRentable.raisons.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 💡 Type d'actualités à privilégier :

${result.nonRentable.typesAPrilegier.map(t => `- ${t}`).join('\n')}

## 🔍 Recommandation alternative :

${result.nonRentable.recommandationAlternative}
`;
        }

        let md = `# 🎯 ANALYSE DE TRANSFORMATION NEWS → SEO

## Score de Rentabilité

### ${result.scoreRentabilite} ${result.scoreRentabilite === '🟢' ? 'TRÈS RENTABLE' : 'RENTABLE AVEC EFFORT'}

${result.justificationScore}

---

## 📊 Tableau des 5 Angles Stratégiques

| N° | Angle Unique (Titre H1 SEO) | Type | Élément Différenciateur | Mot-clé Cible | Difficulté |
|:---|:----------------------------|:-----|:------------------------|:--------------|:-----------|
${result.angles.map(a => `| ${a.numero} | ${a.titre} | ${a.typeIntention} | ${a.elementDifferenciateur} | ${a.motCleCible} | ${a.difficulteSEO} |`).join('\n')}

---

## 🔍 Détail des Angles

`;

        result.angles.forEach(angle => {
            md += `### ANGLE ${angle.numero} - ${angle.titre}

**🎯 Promesse Unique :**
${angle.promesseUnique}

**📊 Contenu Obligatoire (pour battre la source) :**
${angle.contenuObligatoire.map((c, i) => `- **Élément ${i + 1} :** ${c}`).join('\n')}

**🔍 Requêtes Secondaires à Cibler (LSI) :**
${angle.requetesLSI.map(r => `- ${r}`).join('\n')}

**🔗 Opportunité Featured Snippet :**
- **Format recommandé :** ${angle.featuredSnippet.formatRecommande}
- **Question PAA cible :** ${angle.featuredSnippet.questionPAA}

**⏱️ Stratégie de Publication :**
- **Timing optimal :** ${angle.strategiePublication.timing}
- **Longueur cible :** ${angle.strategiePublication.longueurCible} mots
- **Mise à jour :** ${angle.strategiePublication.miseAJour}

**💰 Potentiel de Conversion :**
${angle.potentielConversion}

**🎨 Éléments Visuels Recommandés :**
${angle.visuels.map(v => `- ${v}`).join('\n')}

---

`;
        });

        if (result.planAction) {
            md += `## 🎯 Plan d'Action Priorisé

### 🥇 À TRAITER EN PRIORITÉ

**Angle N°${result.planAction.priorite1.angle} - ${result.planAction.priorite1.titre}**

**Raison :** ${result.planAction.priorite1.raison}
**ROI estimé :** ${result.planAction.priorite1.roi}
**Temps de production :** ${result.planAction.priorite1.tempsProduction}

---

### 🥈 À TRAITER ENSUITE

**Angle N°${result.planAction.priorite2.angle} - ${result.planAction.priorite2.titre}**

**Raison :** ${result.planAction.priorite2.raison}
**ROI estimé :** ${result.planAction.priorite2.roi}
**Temps de production :** ${result.planAction.priorite2.tempsProduction}

---

### 🥉 OPTIONNEL (Autorité)

**Angle N°${result.planAction.priorite3.angle} - ${result.planAction.priorite3.titre}**

**Raison :** ${result.planAction.priorite3.raison}
**ROI estimé :** ${result.planAction.priorite3.roi}
**Temps de production :** ${result.planAction.priorite3.tempsProduction}

---

`;
        }

        if (result.maillageInterne) {
            md += `## 🔗 Stratégie de Maillage Interne

### Articles à lier :

${result.maillageInterne.articlesALier.map(a => `- ${a}`).join('\n')}

### Architecture recommandée :

${result.maillageInterne.architecture}

---

`;
        }

        if (result.quickWin) {
            md += `## 💡 Bonus : Quick Win

${result.quickWin}
`;
        }

        return md;
    };

    const renderScoreBadge = (score: '🔴' | '🟡' | '🟢') => {
        const config = {
            '🔴': { bg: 'var(--danger-bg)', color: 'var(--danger-color)', label: 'Non rentable' },
            '🟡': { bg: 'var(--warning-bg)', color: 'var(--warning-color)', label: 'Rentable avec effort' },
            '🟢': { bg: 'var(--success-bg)', color: 'var(--success-color)', label: 'Très rentable' }
        };
        const { bg, color, label } = config[score];
        return (
            <span className="score-badge" style={{ background: bg, color }}>
                {score} {label}
            </span>
        );
    };

    const renderAngleCard = (angle: SEOAngle, index: number) => (
        <div key={angle.numero} className="angle-card">
            <div className="angle-header">
                <span className="angle-number">#{angle.numero}</span>
                <span className={`intention-badge ${angle.typeIntention.toLowerCase()}`}>
                    {angle.typeIntention}
                </span>
                <span className={`difficulty-badge ${angle.difficulteSEO.toLowerCase()}`}>
                    {angle.difficulteSEO}
                </span>
                <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(generateAngleInstructions(angle), index)}
                    title="Copier les instructions complètes"
                >
                    {copiedIndex === index ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                </button>
            </div>

            <h4 className="angle-title">{angle.titre}</h4>

            <div className="angle-content">
                <div className="angle-section">
                    <Target size={16} />
                    <div>
                        <strong>Promesse Unique</strong>
                        <p>{angle.promesseUnique}</p>
                    </div>
                </div>

                <div className="angle-section">
                    <FileText size={16} />
                    <div>
                        <strong>Contenu Obligatoire</strong>
                        <ul>
                            {angle.contenuObligatoire.map((c, i) => (
                                <li key={i}>{c}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="angle-section">
                    <TrendingUp size={16} />
                    <div>
                        <strong>Mot-clé Cible</strong>
                        <span className="keyword-tag">{angle.motCleCible}</span>
                    </div>
                </div>

                <div className="angle-section">
                    <Clock size={16} />
                    <div>
                        <strong>Stratégie de Publication</strong>
                        <p>
                            <span className="meta-item">⏱️ {angle.strategiePublication.timing}</span>
                            <span className="meta-item">📝 {angle.strategiePublication.longueurCible} mots</span>
                            <span className="meta-item">🔄 {angle.strategiePublication.miseAJour}</span>
                        </p>
                    </div>
                </div>

                <div className="angle-section lsi-section">
                    <Link2 size={16} />
                    <div>
                        <strong>Requêtes LSI</strong>
                        <div className="lsi-tags">
                            {angle.requetesLSI.map((lsi, i) => (
                                <span key={i} className="lsi-tag">{lsi}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="angle-section">
                    <Lightbulb size={16} />
                    <div>
                        <strong>Featured Snippet</strong>
                        <p>
                            <em>{angle.featuredSnippet.formatRecommande}</em><br />
                            PAA: "{angle.featuredSnippet.questionPAA}"
                        </p>
                    </div>
                </div>

                <div className="angle-section">
                    <Image size={16} />
                    <div>
                        <strong>Visuels Recommandés</strong>
                        <ul>
                            {angle.visuels.map((v, i) => (
                                <li key={i}>{v}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <button
                className={`add-to-table-btn ${addedAngles.includes(angle.numero) ? 'added' : ''}`}
                onClick={() => handleAddToContentTable(angle)}
                disabled={addedAngles.includes(angle.numero)}
            >
                {addedAngles.includes(angle.numero) ? (
                    <>
                        <CheckCircle2 size={18} />
                        Ajouté au tableau
                    </>
                ) : (
                    <>
                        <PlusCircle size={18} />
                        Ajouter au tableau de contenu
                    </>
                )}
            </button>
        </div>
    );

    // Check if API key is configured
    if (!apiKey) {
        return (
            <div className="news-transformer-section">
                <div className="api-key-warning">
                    <AlertTriangle size={48} />
                    <h2>Clé API requise</h2>
                    <p>Veuillez configurer votre clé API Gemini dans les paramètres pour utiliser cette fonctionnalité.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="news-transformer-section">
            <div className="section-header">
                <div className="header-content">
                    <Sparkles className="header-icon" />
                    <div>
                        <h1>News → SEO Transformer</h1>
                        <p>Transformez n'importe quel article d'actualité en 5 angles SEO stratégiques uniques</p>
                    </div>
                </div>
            </div>

            <div className="news-transformer-layout">
                {/* Side Panel - Saved Analyses */}
                <aside className="analyses-sidebar">
                    <div className="sidebar-header">
                        <History size={18} />
                        <h3>Mes Analyses</h3>
                    </div>

                    <button
                        className="new-analysis-btn"
                        onClick={handleReset}
                    >
                        <Plus size={18} />
                        Nouvelle Analyse
                    </button>

                    <div className="analyses-list">
                        {newsTransformer.savedAnalyses.length === 0 ? (
                            <div className="no-analyses">
                                <p>Aucune analyse sauvegardée</p>
                                <small>Générez et sauvegardez votre première analyse</small>
                            </div>
                        ) : (
                            newsTransformer.savedAnalyses.map(analysis => (
                                <div
                                    key={analysis.id}
                                    className={`analysis-card ${newsTransformer.currentAnalysisId === analysis.id ? 'active' : ''}`}
                                    onClick={() => handleLoadAnalysis(analysis.id)}
                                >
                                    <div className="analysis-card-header">
                                        <span className="analysis-score">
                                            {analysis.result?.scoreRentabilite || '⏳'}
                                        </span>
                                        <span className="analysis-card-title">
                                            {analysis.result?.angles?.[0]?.titre
                                                ? analysis.result.angles[0].titre.slice(0, 40) + (analysis.result.angles[0].titre.length > 40 ? '...' : '')
                                                : analysis.formData.secteur || 'Analyse'}
                                        </span>
                                        <button
                                            className="delete-analysis-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNewsAnalysis(analysis.id);
                                                if (currentProjectName) saveCurrentProject();
                                            }}
                                            title="Supprimer"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="analysis-card-url">
                                        {truncateUrl(analysis.sourceUrl)}
                                    </div>
                                    <div className="analysis-card-date">
                                        {formatDate(analysis.createdAt)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="analyses-main-content">

                    {newsTransformer.status === 'idle' || newsTransformer.status === 'error' ? (
                        <form className="transformer-form" onSubmit={handleSubmit}>
                            {newsTransformer.error && (
                                <div className="error-message">
                                    <XCircle size={20} />
                                    <span>{newsTransformer.error}</span>
                                </div>
                            )}

                            <div className="info-bubble">
                                <div className="info-bubble-icon">💡</div>
                                <div className="info-bubble-content">
                                    <h4>Comment utiliser cette fonctionnalité ?</h4>
                                    <ol>
                                        <li><strong>Collez l'URL</strong> d'un article d'actualité ou d'un contenu concurrent que vous souhaitez exploiter</li>
                                        <li><strong>Décrivez votre expertise</strong> : votre secteur, votre spécialité et votre audience cible</li>
                                        <li><strong>Cliquez sur "Générer"</strong> pour obtenir 5 angles SEO uniques</li>
                                        <li><strong>Recevez</strong> un score de rentabilité (🟢🟡🔴), des angles détaillés et un plan d'action priorisé</li>
                                    </ol>
                                    <p className="info-tip">
                                        <strong>Astuce :</strong> Plus vous êtes précis dans vos descriptions, plus les angles générés seront pertinents et exploitables !
                                    </p>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>📋 Informations sur l'article source</h3>

                                <div className="form-group">
                                    <label htmlFor="url">URL de l'article source *</label>
                                    <input
                                        type="url"
                                        id="url"
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        placeholder="https://exemple.com/article-actualite"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>🏢 Votre expertise</h3>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="secteur">Secteur d'activité *</label>
                                        <input
                                            type="text"
                                            id="secteur"
                                            value={formData.secteur}
                                            onChange={(e) => setFormData({ ...formData, secteur: e.target.value })}
                                            placeholder="Ex: Plomberie d'urgence et détection de fuites"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="expertise">Expertise principale *</label>
                                        <input
                                            type="text"
                                            id="expertise"
                                            value={formData.expertise}
                                            onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                                            placeholder="Ex: Réparation de chaudières à condensation"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="motCle">Mot-clé principal ciblé (optionnel)</label>
                                        <input
                                            type="text"
                                            id="motCle"
                                            value={formData.motCle}
                                            onChange={(e) => setFormData({ ...formData, motCle: e.target.value })}
                                            placeholder="Ex: fuite eau urgence"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="audience">Audience cible *</label>
                                        <input
                                            type="text"
                                            id="audience"
                                            value={formData.audience}
                                            onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                                            placeholder="Ex: Propriétaires de maisons 35-60 ans"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>📝 Type de contenu souhaité</h3>

                                <div className="checkbox-grid">
                                    {CONTENT_TYPES.map(type => (
                                        <label key={type} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={formData.typeContenu.includes(type)}
                                                onChange={() => handleTypeContenuChange(type)}
                                            />
                                            <span className="checkbox-label">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>⚙️ Paramètres avancés</h3>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="technicite">Niveau de technicité</label>
                                        <select
                                            id="technicite"
                                            value={formData.technicite}
                                            onChange={(e) => setFormData({ ...formData, technicite: e.target.value as NewsTransformerInput['technicite'] })}
                                        >
                                            <option value="grand-public">Grand public</option>
                                            <option value="intermediaire">Intermédiaire</option>
                                            <option value="expert">Expert</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="objectif">Objectif principal</label>
                                        <select
                                            id="objectif"
                                            value={formData.objectif}
                                            onChange={(e) => setFormData({ ...formData, objectif: e.target.value })}
                                        >
                                            <option value="">Choisir...</option>
                                            <option value="Générer du trafic organique">Générer du trafic organique</option>
                                            <option value="Obtenir des leads qualifiés">Obtenir des leads qualifiés</option>
                                            <option value="Positionner comme expert">Positionner comme expert</option>
                                            <option value="Vendre un produit/service">Vendre un produit/service</option>
                                            <option value="Éduquer l'audience">Éduquer l'audience</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="contraintes">Contraintes spécifiques (optionnel)</label>
                                    <textarea
                                        id="contraintes"
                                        value={formData.contraintes}
                                        onChange={(e) => setFormData({ ...formData, contraintes: e.target.value })}
                                        placeholder="Budget, délai, ressources disponibles..."
                                        rows={3}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="articlesExistants">Articles existants à lier (optionnel)</label>
                                    <textarea
                                        id="articlesExistants"
                                        value={formData.articlesExistants}
                                        onChange={(e) => setFormData({ ...formData, articlesExistants: e.target.value })}
                                        placeholder="URLs de vos articles existants (un par ligne)"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={!formData.url || !formData.secteur || !formData.expertise || !formData.audience}
                            >
                                <Sparkles size={20} />
                                Générer les 5 angles SEO
                            </button>
                        </form>
                    ) : newsTransformer.status === 'running' ? (
                        <div className="loading-state">
                            <Loader2 className="spinner" size={48} />
                            <h2>Analyse en cours...</h2>
                            <p>Extraction des opportunités SEO de l'article source</p>
                            <div className="loading-steps">
                                <span>🔍 Analyse de la source</span>
                                <span>📊 Évaluation du potentiel</span>
                                <span>✨ Génération des angles</span>
                            </div>
                        </div>
                    ) : newsTransformer.status === 'completed' && newsTransformer.result ? (
                        <div className="results-container">
                            <div className="results-header">
                                <div className="score-section">
                                    <h2>Analyse terminée</h2>
                                    {renderScoreBadge(newsTransformer.result.scoreRentabilite)}
                                </div>
                                <div className="results-actions">
                                    <button
                                        onClick={handleSaveAnalysis}
                                        className="action-btn save-btn"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? <Loader2 size={18} className="spinner" /> : saveSuccess ? <CheckCircle2 size={18} /> : <Save size={18} />}
                                        {isSaving ? 'Sauvegarde...' : saveSuccess ? 'Sauvegardé !' : 'Sauvegarder'}
                                    </button>
                                    <button onClick={() => copyToClipboard(generateMarkdownOutput())} className="action-btn">
                                        <Copy size={18} />
                                        Copier tout
                                    </button>
                                    <button onClick={downloadResults} className="action-btn">
                                        <Download size={18} />
                                        Télécharger MD
                                    </button>
                                    <button onClick={handleReset} className="action-btn secondary">
                                        <RotateCcw size={18} />
                                        Nouvelle analyse
                                    </button>
                                </div>
                            </div>

                            <div className="justification-box">
                                <p>{newsTransformer.result.justificationScore}</p>
                            </div>

                            {newsTransformer.result.scoreRentabilite === '🔴' && newsTransformer.result.nonRentable ? (
                                <div className="non-rentable-section">
                                    <h3>❌ Pourquoi cet article n'est pas rentable :</h3>
                                    <ul>
                                        {newsTransformer.result.nonRentable.raisons.map((r, i) => (
                                            <li key={i}>{r}</li>
                                        ))}
                                    </ul>

                                    <h3>💡 Types d'actualités à privilégier :</h3>
                                    <ul>
                                        {newsTransformer.result.nonRentable.typesAPrilegier.map((t, i) => (
                                            <li key={i}>{t}</li>
                                        ))}
                                    </ul>

                                    <div className="recommendation-box">
                                        <strong>🎯 Recommandation alternative :</strong>
                                        <p>{newsTransformer.result.nonRentable.recommandationAlternative}</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="angles-grid">
                                        {newsTransformer.result.angles.map((angle, index) => renderAngleCard(angle, index))}
                                    </div>

                                    {newsTransformer.result.planAction && (
                                        <div className="action-plan">
                                            <h3>🎯 Plan d'Action Priorisé</h3>
                                            <div className="priority-cards">
                                                <div className="priority-card gold">
                                                    <span className="priority-badge">🥇 Priorité 1</span>
                                                    <h4>Angle #{newsTransformer.result.planAction.priorite1.angle}</h4>
                                                    <p>{newsTransformer.result.planAction.priorite1.titre}</p>
                                                    <div className="priority-meta">
                                                        <span>ROI: {newsTransformer.result.planAction.priorite1.roi}</span>
                                                        <span>⏱️ {newsTransformer.result.planAction.priorite1.tempsProduction}</span>
                                                    </div>
                                                    <p className="priority-reason">{newsTransformer.result.planAction.priorite1.raison}</p>
                                                </div>

                                                <div className="priority-card silver">
                                                    <span className="priority-badge">🥈 Priorité 2</span>
                                                    <h4>Angle #{newsTransformer.result.planAction.priorite2.angle}</h4>
                                                    <p>{newsTransformer.result.planAction.priorite2.titre}</p>
                                                    <div className="priority-meta">
                                                        <span>ROI: {newsTransformer.result.planAction.priorite2.roi}</span>
                                                        <span>⏱️ {newsTransformer.result.planAction.priorite2.tempsProduction}</span>
                                                    </div>
                                                    <p className="priority-reason">{newsTransformer.result.planAction.priorite2.raison}</p>
                                                </div>

                                                <div className="priority-card bronze">
                                                    <span className="priority-badge">🥉 Priorité 3</span>
                                                    <h4>Angle #{newsTransformer.result.planAction.priorite3.angle}</h4>
                                                    <p>{newsTransformer.result.planAction.priorite3.titre}</p>
                                                    <div className="priority-meta">
                                                        <span>ROI: {newsTransformer.result.planAction.priorite3.roi}</span>
                                                        <span>⏱️ {newsTransformer.result.planAction.priorite3.tempsProduction}</span>
                                                    </div>
                                                    <p className="priority-reason">{newsTransformer.result.planAction.priorite3.raison}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {newsTransformer.result.maillageInterne && (
                                        <div className="maillage-section">
                                            <h3>🔗 Stratégie de Maillage Interne</h3>
                                            <div className="maillage-content">
                                                <div className="maillage-links">
                                                    <h4>Articles à lier :</h4>
                                                    <ul>
                                                        {newsTransformer.result.maillageInterne.articlesALier.map((a, i) => (
                                                            <li key={i}>{a}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="maillage-architecture">
                                                    <h4>Architecture recommandée :</h4>
                                                    <p>{newsTransformer.result.maillageInterne.architecture}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {newsTransformer.result.quickWin && (
                                        <div className="quick-win-section">
                                            <h3>💡 Quick Win (sous 48h)</h3>
                                            <p>{newsTransformer.result.quickWin}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : null}
                </main>
            </div>
        </div>
    );
}

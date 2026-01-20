import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAgentStore } from '../stores/useAgentStore';
import type { ContentTableRow } from '../types/agents';
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
    RefreshCcw,
    ClipboardCopy,
    Trash2
} from 'lucide-react';
import './ResultDashboard.css';

// Fonction pour générer les instructions détaillées de l'Appât SXO
function generateSXOInstructions(appatSXO: string): string {
    const type = appatSXO?.toLowerCase() || '';

    // Détection du type d'appât et génération des instructions appropriées
    if (type.includes('calculateur') || type.includes('calculette') || type.includes('simulateur')) {
        return `
📊 FORMAT REQUIS : CALCULATEUR / SIMULATEUR INTERACTIF
────────────────────────────────────────────────────────
▸ Structure à créer :
   • Formulaire avec 3-5 champs de saisie (inputs numériques ou sélecteurs)
   • Bouton "Calculer" ou "Simuler"
   • Zone de résultat affichant le calcul en temps réel
   • Légende explicative des résultats

▸ Éléments techniques à inclure :
   • <form> avec inputs type="number" ou <select>
   • Fonction JavaScript de calcul
   • Affichage dynamique des résultats
   • Possibilité de téléchargement PDF du résultat

▸ Exemple de structure :
   ┌─────────────────────────────────────┐
   │  Entrez vos données :              │
   │  [Input 1: ___] [Input 2: ___]     │
   │  [Input 3: ___] [Sélecteur ▼]      │
   │                                     │
   │  [ 🧮 CALCULER ]                   │
   │                                     │
   │  ═══ RÉSULTAT ═══                  │
   │  💰 Estimation : X€ - Y€           │
   │  📊 Détail du calcul : ...         │
   └─────────────────────────────────────┘`;
    }

    if (type.includes('checklist') || type.includes('liste')) {
        return `
☑️ FORMAT REQUIS : CHECKLIST INTERACTIVE
────────────────────────────────────────
▸ Structure à créer :
   • Liste de 8-15 points à cocher
   • Cases à cocher cliquables
   • Barre de progression (ex: "5/12 complétés")
   • Bouton "Télécharger la checklist" en PDF

▸ Éléments à inclure :
   • Checkbox HTML interactives
   • Catégorisation par sections si > 10 items
   • Icônes visuelles par étape
   • Option d'impression/téléchargement

▸ Exemple de structure :
   ┌─────────────────────────────────────┐
   │  📋 CHECKLIST COMPLÈTE             │
   │  Progression : ▓▓▓▓░░░░ 50%        │
   │                                     │
   │  ☐ Étape 1 : Description           │
   │  ☑ Étape 2 : Description           │
   │  ☐ Étape 3 : Description           │
   │  ...                                │
   │                                     │
   │  [ 📥 Télécharger PDF ]            │
   └─────────────────────────────────────┘`;
    }

    if (type.includes('template') || type.includes('modèle')) {
        return `
📄 FORMAT REQUIS : TEMPLATE / MODÈLE TÉLÉCHARGEABLE
───────────────────────────────────────────────────
▸ Structure à créer :
   • Aperçu visuel du template
   • Description des sections du modèle
   • Bouton de téléchargement (Word, PDF, Excel)
   • Instructions d'utilisation

▸ Éléments à inclure :
   • Preview image du document
   • Format disponible : .docx, .pdf, .xlsx
   • Call-to-action visible
   • Guide de personnalisation

▸ Exemple de structure :
   ┌─────────────────────────────────────┐
   │  📄 TEMPLATE GRATUIT               │
   │  ┌─────────────────────┐           │
   │  │   [Aperçu visuel]   │           │
   │  │   du template       │           │
   │  └─────────────────────┘           │
   │                                     │
   │  ✓ Format Word éditable            │
   │  ✓ Sections pré-remplies           │
   │  ✓ Instructions incluses           │
   │                                     │
   │  [ 📥 TÉLÉCHARGER GRATUITEMENT ]   │
   └─────────────────────────────────────┘`;
    }

    if (type.includes('tableau') || type.includes('comparatif') || type.includes('comparateur')) {
        return `
📊 FORMAT REQUIS : TABLEAU COMPARATIF
─────────────────────────────────────
▸ Structure à créer :
   • Tableau HTML responsive avec min. 3-5 colonnes
   • En-têtes clairs avec icônes
   • Cellules avec ✓/✗ ou valeurs comparatives
   • Ligne de "Recommandation" en fin de tableau

▸ Éléments à inclure :
   • <table> avec classes CSS pour styling
   • Colonne "Critères" à gauche
   • Colonnes pour chaque option comparée
   • Mise en valeur du "meilleur choix"
   • Note ou verdict final

▸ Exemple de structure :
   ┌────────────┬─────────┬─────────┬─────────┐
   │ Critère    │ Option A│ Option B│ Option C│
   ├────────────┼─────────┼─────────┼─────────┤
   │ Prix       │ €€€     │ €€      │ €       │
   │ Qualité    │ ★★★★★   │ ★★★★    │ ★★★     │
   │ Simplicité │ ✓       │ ✓       │ ✗       │
   ├────────────┴─────────┴─────────┴─────────┤
   │ 🏆 RECOMMANDÉ : Option B (meilleur ratio)│
   └──────────────────────────────────────────┘`;
    }

    if (type.includes('quiz') || type.includes('test')) {
        return `
❓ FORMAT REQUIS : QUIZ / TEST INTERACTIF
─────────────────────────────────────────
▸ Structure à créer :
   • 5-10 questions à choix multiples
   • Système de scoring
   • Résultat personnalisé selon les réponses
   • Recommandations basées sur le profil

▸ Éléments à inclure :
   • Questions avec 3-4 options chacune
   • Barre de progression du quiz
   • Logique de calcul du score
   • Page de résultats avec profil

▸ Exemple de structure :
   ┌─────────────────────────────────────┐
   │  ❓ QUESTION 3/10                   │
   │  Quel est votre principal objectif ?│
   │                                     │
   │  ○ Réponse A                        │
   │  ○ Réponse B                        │
   │  ○ Réponse C                        │
   │  ○ Réponse D                        │
   │                                     │
   │  [ ◀ Précédent ] [ Suivant ▶ ]     │
   │  ▓▓▓░░░░░░░ 30%                    │
   └─────────────────────────────────────┘`;
    }

    if (type.includes('infographie')) {
        return `
🎨 FORMAT REQUIS : INFOGRAPHIE VISUELLE
───────────────────────────────────────
▸ Structure à créer :
   • Image verticale ou horizontale (1200x2000px ou 1600x900px)
   • 5-8 sections d'information visuelles
   • Icônes et illustrations
   • Chiffres clés mis en valeur

▸ Éléments à inclure :
   • Titre accrocheur en haut
   • Flow visuel logique (haut → bas ou gauche → droite)
   • Données statistiques illustrées
   • Call-to-action en fin d'infographie
   • Logo/branding discret

▸ À générer avec IA ou designer :
   • Palette de couleurs cohérente avec la marque
   • Typographie lisible (min 14pt pour le corps)
   • Espacement aéré entre les sections
   • Export en PNG haute qualité pour web`;
    }

    if (type.includes('guide') || type.includes('étapes') || type.includes('tutoriel')) {
        return `
📖 FORMAT REQUIS : GUIDE ÉTAPE PAR ÉTAPE
────────────────────────────────────────
▸ Structure à créer :
   • Numérotation claire des étapes (1, 2, 3...)
   • Sous-sections détaillées par étape
   • Visuels/captures d'écran pour chaque étape
   • Tips et mises en garde

▸ Éléments à inclure :
   • Encadrés "💡 Astuce" et "⚠️ Attention"
   • Durée estimée par étape
   • Matériel/prérequis au début
   • Résumé/récapitulatif en fin de guide

▸ Exemple de structure :
   ┌─────────────────────────────────────┐
   │  📖 GUIDE EN X ÉTAPES              │
   │  ⏱️ Durée totale : ~XX minutes     │
   │                                     │
   │  ÉTAPE 1 ─────────────────────     │
   │  [Description + image]              │
   │  💡 Astuce : ...                   │
   │                                     │
   │  ÉTAPE 2 ─────────────────────     │
   │  [Description + image]              │
   │  ...                                │
   └─────────────────────────────────────┘`;
    }

    // Cas par défaut
    return `
🎯 FORMAT À DÉFINIR SELON LE TYPE : "${appatSXO}"
─────────────────────────────────────────────────
▸ Objectif : Créer un élément interactif qui :
   • Apporte une valeur ajoutée concrète au lecteur
   • Augmente le temps passé sur la page (+30s minimum)
   • Encourage le partage et les backlinks
   • Différencie l'article de la concurrence

▸ Options de format possible :
   • Tableau comparatif HTML
   • Calculateur JavaScript
   • Checklist interactive
   • Template téléchargeable
   • Quiz/Test de personnalité
   • Infographie à partager

▸ Conseil : Choisir le format le plus adapté à l'intent
   de recherche et au contenu de l'article.`;
}

// Fonction pour formater l'article en prompt pour générateur
function formatArticleForGenerator(row: ContentTableRow): string {
    const lsiKeywords = row.carburant?.lsi?.join(', ') || '';
    const sxoInstructions = generateSXOInstructions(row.appatSXO);

    // Section SGE si disponible
    const sgeSection = row.sgeOptimization ? `
═══════════════════════════════════════════════════════════════

🤖 OPTIMISATION SGE / AI OVERVIEWS (Google)
────────────────────────────────────────────
• Score de Citabilité : ${row.sgeOptimization.citabilityScore}/100 (${row.sgeOptimization.aiOverviewPotential?.toUpperCase()})
• Entités à couvrir : ${row.sgeOptimization.entityCoverage?.join(', ') || 'N/A'}

📝 RÉPONSES STRUCTURÉES À INTÉGRER:
${row.sgeOptimization.structuredAnswers?.map((sa, i) => `
${i + 1}. Question: "${sa.question}"
   Réponse (${sa.format}, ~${sa.wordCount} mots): "${sa.answer}"
`).join('') || '   Aucune réponse structurée disponible'}

💡 CONSEILS D'OPTIMISATION SGE:
${row.sgeOptimization.optimizationTips?.map(tip => `   • ${tip}`).join('\n') || '   Aucun conseil disponible'}

📊 FAITS CLÉS CITABLES:
${row.sgeOptimization.keyFactsExtracted?.map(fact => `   → ${fact}`).join('\n') || '   Aucun fait clé disponible'}
` : '';

    // Section News SEO (Promesse Unique et Contenu Obligatoire) si disponible
    const newsSeoSection = (row.promesseUnique || row.contenuObligatoire?.length) ? `
═══════════════════════════════════════════════════════════════

🎯 PROMESSE UNIQUE (Hook principal)
────────────────────────────────────
${row.promesseUnique || 'Non défini'}

📋 CONTENU OBLIGATOIRE (Points à couvrir absolument)
────────────────────────────────────────────────────
${row.contenuObligatoire?.map((c, i) => `${i + 1}. ${c}`).join('\n') || 'Non défini'}
` : '';

    return `📝 INSTRUCTIONS DE RÉDACTION D'ARTICLE SEO

═══════════════════════════════════════════════════════════════

⚠️ DIRECTIVES POUR L'IA RÉDACTRICE
───────────────────────────────────
• RESPECTE OBLIGATOIREMENT tous les éléments listés ci-dessous
• INTÈGRE le carburant sémantique naturellement dans le texte
• CRÉE l'Appât SXO selon le format et la structure spécifiés
• STRUCTURE l'article pour viser la Position 0 (snippet)
• VÉRIFIE la checklist finale avant de soumettre ta rédaction

═══════════════════════════════════════════════════════════════

📌 INFORMATIONS GÉNÉRALES
──────────────────────────
• Cluster/Thématique : ${row.cluster}
• Intent de recherche : ${row.intent}
• Score de priorité : Volume ${row.score?.volume}/10 | Difficulté ${row.score?.difficulte}/10 | Impact ${row.score?.impact}/10

═══════════════════════════════════════════════════════════════

🎯 TITRE H1 (Click-Magnet)
──────────────────────────
${row.titreH1}

═══════════════════════════════════════════════════════════════

💡 ANGLE DIFFÉRENCIANT
──────────────────────
${row.angle}

🔥 TRIGGER ÉMOTIONNEL
─────────────────────
${row.trigger}

═══════════════════════════════════════════════════════════════

🔑 CARBURANT SÉMANTIQUE (À intégrer naturellement)
──────────────────────────────────────────────────
• Terme Autoritaire : ${row.carburant?.termeAutoritaire || '-'}
• Entité Google : ${row.carburant?.entiteGoogle || '-'}
• Mots-clés LSI : ${lsiKeywords || '-'}

═══════════════════════════════════════════════════════════════

❓ QUESTION PAA POUR H2 PRINCIPAL
─────────────────────────────────
${row.paa}

═══════════════════════════════════════════════════════════════

📐 FORMAT SNIPPET (Position 0)
──────────────────────────────
Format recommandé : ${row.snippetFormat}
→ Structurer le contenu pour obtenir la Position 0 avec ce format

═══════════════════════════════════════════════════════════════

🏷️ SCHEMA MARKUP
─────────────────
Type de schema : ${row.schema}

═══════════════════════════════════════════════════════════════

🎁 APPÂT SXO À INTÉGRER
───────────────────────
Type identifié : ${row.appatSXO}
Placement suggéré : Après le H2 principal ou dans une section dédiée
Objectif : Augmenter le temps passé sur la page et l'engagement
${sxoInstructions}

═══════════════════════════════════════════════════════════════
${newsSeoSection}${sgeSection}
✅ CHECKLIST DE RÉDACTION
─────────────────────────
□ Titre H1 avec chiffre/année ✓
□ Angle différenciant intégré
□ Trigger émotionnel présent dès l'intro
□ Question PAA utilisée comme H2
□ Mots-clés LSI naturellement intégrés
□ Format snippet respecté pour Position 0
□ Appât SXO créé et intégré
□ Schema markup prêt à implémenter${row.sgeOptimization ? '\n□ Réponses structurées SGE intégrées\n□ Entités Google couvertes\n□ Faits citables inclus' : ''}${row.promesseUnique ? '\n□ Promesse unique respectée' : ''}${row.contenuObligatoire?.length ? '\n□ Tous les contenus obligatoires couverts' : ''}

═══════════════════════════════════════════════════════════════`;
}

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

// Bouton pour copier les instructions de rédaction pour le générateur
function CopyForGeneratorButton({ row }: { row: ContentTableRow }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const formattedText = formatArticleForGenerator(row);
        await navigator.clipboard.writeText(formattedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            className={`copy-generator-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title="Copier les instructions pour le générateur d'articles"
        >
            {copied ? (
                <>
                    <Check size={14} />
                    <span>Copié !</span>
                </>
            ) : (
                <>
                    <ClipboardCopy size={14} />
                    <span>Copier brief</span>
                </>
            )}
        </button>
    );
}

interface ResultDashboardProps {
    onReanalyze?: () => void;
}

export function ResultDashboard({ onReanalyze }: ResultDashboardProps) {
    const {
        strategicAnalysis,
        clusterArchitecture,
        contentDesign,
        technicalOptimization,
        snippetStrategy,
        authorityStrategy,
        coordinatorSummary,
        resetAll,
        toggleArticleValidation,
        deleteArticle,
        runAllAgents,
        questionnaireAnswers
    } = useAgentStore();

    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefreshStrategy = () => {
        if (!questionnaireAnswers) {
            alert('Aucune donnée de questionnaire disponible pour relancer la stratégie.');
            return;
        }

        // Utiliser onReanalyze si fourni (ouvre le questionnaire pré-rempli)
        if (onReanalyze) {
            onReanalyze();
            return;
        }

        // Fallback: relancer directement (ancien comportement)
        if (!confirm('Relancer l\'analyse complète ? Cela écrasera les résultats actuels.')) {
            return;
        }

        setIsRefreshing(true);
        runAllAgents().finally(() => {
            setIsRefreshing(false);
        });
    };

    const isComplete = coordinatorSummary.status === 'completed';

    if (!isComplete) return null;

    return (
        <section className="result-dashboard">
            {/* Header with Refresh button */}
            <div className="result-dashboard-header">
                <h2 className="result-dashboard-title">
                    <Zap className="section-icon" />
                    Résultats de l'analyse SEO
                </h2>
                <button
                    className="btn btn-refresh"
                    onClick={handleRefreshStrategy}
                    disabled={isRefreshing}
                    title="Modifier les réponses et relancer l'analyse"
                >
                    <RefreshCcw size={18} className={isRefreshing ? 'spinning' : ''} />
                    {isRefreshing ? 'Analyse en cours...' : 'Relancer l\'analyse'}
                </button>
            </div>
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
                </div>
            </div>

            {/* Content Design - Full Width */}
            {contentDesign.data && (
                <div className="result-container-full">
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
                                        <th>Promesse & Contenu</th>
                                        <th>Carburant Sémantique</th>
                                        <th>PAA (H2)</th>
                                        <th>Format Snippet</th>
                                        <th>Schema</th>
                                        <th>Appât SXO</th>
                                        <th>Images IA</th>
                                        <th>Intent</th>
                                        <th>SGE Score</th>
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
                                            <td className="promesse-contenu-cell">
                                                {(row.promesseUnique || row.contenuObligatoire?.length) ? (
                                                    <div className="promesse-contenu-content">
                                                        {row.promesseUnique && (
                                                            <div className="promesse-unique">
                                                                <span className="promesse-icon">🎯</span>
                                                                <span className="promesse-text" title={row.promesseUnique}>
                                                                    {row.promesseUnique.length > 60
                                                                        ? row.promesseUnique.substring(0, 60) + '...'
                                                                        : row.promesseUnique}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {row.contenuObligatoire && row.contenuObligatoire.length > 0 && (
                                                            <div className="contenu-obligatoire">
                                                                <span className="contenu-header">📋 Contenu :</span>
                                                                <ul className="contenu-list">
                                                                    {row.contenuObligatoire.slice(0, 3).map((c, i) => (
                                                                        <li key={i} title={c}>
                                                                            {c.length > 40 ? c.substring(0, 40) + '...' : c}
                                                                        </li>
                                                                    ))}
                                                                    {row.contenuObligatoire.length > 3 && (
                                                                        <li className="more-items">+{row.contenuObligatoire.length - 3} autres...</li>
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="promesse-na">-</span>
                                                )}
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
                                            <td className="images-cell">
                                                {row.imageSuggestions?.length ? (
                                                    <div className="images-prompts-list">
                                                        {row.imageSuggestions.map((img, i) => (
                                                            <div key={i} className="image-prompt-item">
                                                                <div className="image-prompt-header">
                                                                    <span className={`image-type-badge ${img.type}`}>
                                                                        {img.type === 'infographie' ? '📊' :
                                                                            img.type === 'photo-produit' ? '📸' :
                                                                                img.type === 'schema' ? '📐' :
                                                                                    img.type === 'illustration' ? '🎨' :
                                                                                        img.type === 'avant-apres' ? '🔄' : '🖼️'}
                                                                    </span>
                                                                    <span className="image-type-label">{img.type}</span>
                                                                    <CopyButton text={img.generationPrompt} />
                                                                </div>
                                                                <div className="image-prompt-text" title={img.generationPrompt}>
                                                                    {img.generationPrompt.length > 50
                                                                        ? img.generationPrompt.substring(0, 50) + '...'
                                                                        : img.generationPrompt}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="images-na">-</span>
                                                )}
                                            </td>
                                            <td className="intent-cell">
                                                <span className={`intent-badge ${row.intent?.toLowerCase()}`}>{row.intent}</span>
                                            </td>
                                            <td className="sge-score-cell">
                                                {row.sgeOptimization ? (
                                                    <div
                                                        className={`sge-score-badge ${row.sgeOptimization.aiOverviewPotential}`}
                                                        title={`Score: ${row.sgeOptimization.citabilityScore}/100\n\nEntités: ${row.sgeOptimization.entityCoverage?.join(', ')}\n\nConseils: ${row.sgeOptimization.optimizationTips?.slice(0, 2).join(' | ')}`}
                                                    >
                                                        <span className="sge-score-value">{row.sgeOptimization.citabilityScore}</span>
                                                        <span className="sge-score-potential">{row.sgeOptimization.aiOverviewPotential}</span>
                                                    </div>
                                                ) : (
                                                    <span className="sge-score-na">N/A</span>
                                                )}
                                            </td>
                                            <td className="validation-cell">
                                                <label className={`validation-checkbox ${row.validated ? 'validated' : ''}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={row.validated || false}
                                                        onChange={() => toggleArticleValidation(idx)}
                                                    />
                                                    <span className="checkmark"></span>
                                                    <span className="validation-label">
                                                        {row.validated ? 'Rédigé' : 'À rédiger'}
                                                    </span>
                                                </label>
                                            </td>
                                            <td className="actions-cell">
                                                <CopyForGeneratorButton row={row} />
                                                <button
                                                    className="delete-article-btn"
                                                    onClick={() => {
                                                        if (window.confirm(`Supprimer l'article "${row.titreH1}" ?`)) {
                                                            deleteArticle(idx);
                                                        }
                                                    }}
                                                    title="Supprimer cet article"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Accordion>
                </div>
            )}

            <div className="result-container">
                <div className="agents-results">
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

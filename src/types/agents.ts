// Agent Output Types - Aligned with Original Prompt Specifications

// Context Business (Agent 1)
export interface ContexteBusiness {
    typeSite: 'WordPress' | 'Shopify' | 'Custom' | 'Neuf';
    secteur: string;
    positionnement: string;
    autoritéEstimée: 'DA < 10' | 'DA 10-40' | 'DA > 40';
    budgetInféré: string;
}

export interface DiagnosticFlash {
    angleAttaque: string;
    faiblèsseExploitée: string;
    levierCroissance: string;
    délaiRésultats: string;
}

export interface AvatarClient {
    segment: string;
    demographique: string;
    psychographique: string;
    comportemental: string;
    emotionsDominantes?: string;
}

export interface DouleurPrimaire {
    douleur: string;
    intensite: 'haute' | 'moyenne' | 'basse';
    frequence: string;
    emotion?: string;
}

export interface ContentGap {
    sujet: string;
    concurrent?: string;
    opportunite: string;
    difficulte: 'facile' | 'moyenne' | 'difficile';
}

export interface IntentionRecherche {
    type: 'informationnelle' | 'navigationnelle' | 'transactionnelle' | 'commerciale';
    pourcentage?: number;
    exemples: string[];
}

export interface MicroNiche {
    niche: string;
    volumeEstimé?: string;
    potentiel: string;
    concurrence: 'faible' | 'moyenne' | 'forte';
}

export interface LevierDifferentiation {
    superPouvoir?: string;
    angle: string;
    messageUnique: string;
    preuves: string[];
}

// Agent 1 - Strategic Analyzer Output
export interface StrategicAnalysis {
    contexteBusiness?: ContexteBusiness;
    diagnosticFlash?: DiagnosticFlash;
    avatar: AvatarClient;
    douleursTop5: DouleurPrimaire[];
    niveauEEAT: {
        requis: 'basique' | 'moderé' | 'élevé' | 'expert';
        justification: string;
        normes?: string[];
        actionsPrioritaires: string[];
    };
    contentGaps: ContentGap[];
    intentionsRecherche: IntentionRecherche[];
    microNiches: MicroNiche[];
    levierDifferentiation: LevierDifferentiation;
}

// Agent 2 - Cluster Architect Output
export interface Cluster {
    id: string;
    nom: string;
    funnel: 'BOFU' | 'MOFU' | 'TOFU';
    objectifStrategique?: string;
    description: string;
    motsCles: string[];
    volumeEstime: string;
    priorite: number;
    pagesPiliers: string[];
    maillageVers?: string[];
    maillageDepuis?: string[];
}

export interface RoadmapItem {
    semaine: number;
    mois?: number;
    cluster: string;
    focus?: string;
    actions: string[];
    livrables: string[];
    kpis?: string[];
}

export interface MaillageInterne {
    de: string;
    vers: string;
    ancre?: string;
    typeDeLink: string;
    cluster?: string;
}

export interface ClusterArchitecture {
    schemaVisuel?: string;
    clusters: Cluster[];
    roadmap90Jours: RoadmapItem[];
    maillageInterne: MaillageInterne[];
    kpisParPhase?: {
        mois1: { objectif: string; kpis: string[] };
        mois2: { objectif: string; kpis: string[] };
        mois3: { objectif: string; kpis: string[] };
    };
}

// Agent 3 - Content Designer Output (12 colonnes)
export interface MaillageArticle {
    article: string;
    ancre: string;
}

// Image suggestion for AI generation (Google Nano Bana / DALL-E / Midjourney / Gemini)
export interface ImageSuggestion {
    type: 'infographie' | 'photo-produit' | 'schema' | 'illustration' | 'capture-ecran' | 'avant-apres' | 'portrait-expert' | 'diagramme';
    category: 'photography' | 'infographic' | 'illustration' | 'schema';  // Catégorie principale
    style: string;                // Style visuel choisi (ex: "professional photography", "flat vector illustration")
    description: string;          // Description courte du visuel
    generationPrompt: string;     // Prompt optimisé pour Google Gemini / IA générative
    negativePrompt: string;       // Éléments à éviter dans la génération
    placement: string;            // Où placer l'image dans l'article
    altText: string;              // Texte alternatif SEO-optimisé
}

export interface ContentTableRow {
    cluster: string;
    titreH1: string;
    angle: string;
    trigger: string;
    carburant: {
        termeAutoritaire: string;
        entiteGoogle: string;
        lsi: string[];
    };
    paa: string;
    snippetFormat: 'definition' | 'liste' | 'tableau' | 'voice';
    schema: string;
    appatSXO: string;
    intent: 'BOFU' | 'MOFU' | 'TOFU';
    score: {
        volume: number;
        difficulte: number;
        impact: number;
        prioriteGlobale?: number;
    };
    maillage: {
        vers: string[] | MaillageArticle[];
        depuis: string[] | MaillageArticle[];
    };
    metaDescription: string;
    validated?: boolean;
    sgeOptimization?: SGEOptimization;
    imageSuggestions?: ImageSuggestion[];  // 2-4 images suggérées par article
}

export interface ContentDesign {
    tableauContenu: ContentTableRow[];
    planningPublication: {
        mois: number;
        focus?: string;
        articles: string[];
        objectif?: string;
    }[];
    resumeParCluster?: {
        cluster: string;
        nombreArticles: number;
        focusPrincipal: string;
        prioriteMoyenne: number;
    }[];
}

// Agent 4 - Technical Optimizer Output
export interface CoreWebVitalItem {
    item: string;
    priorite: 'haute' | 'moyenne' | 'basse';
    action: string;
    impact?: string;
}

export interface TechnicalOptimization {
    typeSiteDetecte?: string;
    coreWebVitals: {
        lcp?: { objectif: string; checklist: CoreWebVitalItem[] };
        fid?: { objectif: string; checklist: CoreWebVitalItem[] };
        cls?: { objectif: string; checklist: CoreWebVitalItem[] };
        checklist: CoreWebVitalItem[];
    };
    maillageSchema: {
        schemaASCII?: string;
        description: string;
        silos: {
            nom: string;
            pagePilier?: string;
            pages: string[];
            liens?: string[];
            liensInternes?: string[];
        }[];
        regles?: string[];
    };
    robotsTxt: string;
    pagesNoindex?: string[];
    strategieIndexation: {
        frequencePublication?: string;
        processPostPublication?: string[];
        regles: string[];
        pagesAIndexer: string[];
        pagesAExclure: string[];
    };
    jsonLdExemples: {
        titre: string;
        typeSchema?: string;
        code: string;
    }[];
}

// Agent 5 - Snippet Master Output
export interface SnippetTemplateDefinition {
    type: 'definition';
    reponse: string;
    nombreMots: number;
}

export interface SnippetTemplateListe {
    type: 'liste';
    intro: string;
    items: string[];
}

export interface SnippetTemplateTableau {
    type: 'tableau';
    colonnes: string[];
    lignes: string[][];
    htmlOptimized: string;
}

export type SnippetTemplate = SnippetTemplateDefinition | SnippetTemplateListe | SnippetTemplateTableau;

export interface SnippetParArticle {
    article: string;
    cluster: string;
    paaAnalysee: string;
    formatChoisi: 'definition' | 'liste' | 'tableau';
    justificationFormat: string;
    difficultéPosition0: 'facile' | 'moyenne' | 'difficile';
    potentielVoiceSearch: boolean;
    template: SnippetTemplate;
}

export interface OpportunitePosition0 {
    rang?: number;
    article?: string;
    motCle?: string;
    question?: string;
    format?: string;
    formatOptimal?: string;
    difficulte?: string;
    difficultéEstimée?: string;
    volumeRecherche?: string;
    concurrentActuel?: string;
    actionRequise?: string;
}

export interface SyntheseStrategie {
    totalArticles: number;
    repartitionFormats: {
        definitions: number;
        listes: number;
        tableaux: number;
    };
    articlesFactiles: string[];
    conseilsPrioritaires: string[];
}

export interface SnippetStrategy {
    snippetsParArticle: SnippetParArticle[];
    opportunitesTop5?: OpportunitePosition0[];
    questionsVoice: {
        question: string;
        reponse: string;
        article?: string;
        intentVocale?: string;
    }[];
    syntheseStrategie: SyntheseStrategie;
}

// SGE/AI Overviews Optimization Types (Module 4)
export interface StructuredAnswer {
    question: string;
    answer: string;
    format: 'concise' | 'detailed' | 'list' | 'comparison';
    wordCount: number;
}

export interface SGEOptimization {
    citabilityScore: number;           // 0-100
    entityCoverage: string[];          // Entités Google couvertes
    structuredAnswers: StructuredAnswer[];
    aiOverviewPotential: 'high' | 'medium' | 'low';
    optimizationTips: string[];        // Conseils d'amélioration
    keyFactsExtracted: string[];       // Faits clés citables
}

// Agent 6 - Authority Builder Output
export interface SignauxEEAT {
    experience?: {
        preuves: string[];
        actionsRecommandees: string[];
    };
    expertise?: {
        certifications: {
            nom: string;
            organisme: string;
            pertinence: string;
            urlObtention?: string;
        }[];
    };
    authoritativeness?: {
        organismesReference: {
            nom: string;
            type: string;
            actionRecommandee: string;
        }[];
    };
    trustworthiness?: {
        sourcesOfficielles: {
            url: string;
            utilisation: string;
            articlesCibles?: string[];
        }[];
    };
}

export interface AuthorityStrategy {
    signauxEEAT?: SignauxEEAT;
    certifications: {
        nom: string;
        organisme: string;
        pertinence: string;
        urlObtention?: string;
    }[];
    organismesReference: {
        nom: string;
        type: string;
        actionRecommandee: string;
    }[];
    sourcesOfficielles: {
        url: string;
        utilisation: string;
        articlesCibles?: string[];
    }[];
    planFreshness: {
        typeArticle: string;
        frequenceMiseAJour: string;
        formatDateVisible?: string;
        sectionsAMettre?: string[];
        indicateurs: string[];
    }[];
    preuvesSociales?: {
        expertsACiter?: { nom: string; titre: string; citation: string; source: string }[];
        etudesCas?: { titre: string; resultatsChiffres: string; structure: string }[];
        templateTemoignage?: string;
    };
    ciblesBacklinks: {
        site: string;
        url?: string;
        da: number;
        type?: string;
        approche: string;
        templateProspection: string;
        chancesSucces?: string;
    }[];
    calendrierNetlinking?: {
        semaine: number;
        actions: string[];
        objectif: string;
        cibles: string[];
    }[];
}

// Agent 7 - Coordinator Output
export interface QuickWin {
    rang?: number;
    titre: string;
    requete?: string;
    description: string;
    cible?: string;
    impact: 'élevé' | 'moyen' | 'rapide';
    effort: string;
    delai: string;
}

export interface ValidationCroisee {
    agent: string;
    statut: 'validé' | 'attention' | 'conflit';
    notes: string;
}

export interface OptionInteractive {
    id: string;
    numero?: string;
    label: string;
    description: string;
    icon: string;
}

export interface CoordinatorSummary {
    resumeArchitecture?: {
        nombreClusters: number;
        repartition: { bofu: number; mofu: number; tofu: number };
        nombreArticles: number;
        prioriteAbsolue: { cluster: string; raison: string };
    };
    synthese: string;
    quickWins: QuickWin[];
    validationCroisee: ValidationCroisee[];
    checklistValidation?: {
        tousLivrables: boolean;
        pasDeContradiction: boolean;
        tableaux12Colonnes: boolean;
        quickWinsRealistes: boolean;
        maillageCoherent: boolean;
        schemaMarkupAdaptes: boolean;
        roadmapEquilibree: boolean;
    };
    recommandationsFinales: string[];
    conseilPrioritaire?: string;
    optionsInteractives: OptionInteractive[];
}

// Global Agent State
export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

export interface AgentState<T> {
    status: AgentStatus;
    data: T | null;
    error: string | null;
    startedAt: number | null;
    completedAt: number | null;
}

export interface AgentStore {
    businessDescription: string;
    apiKey: string;
    questionnaireAnswers: QuestionnaireAnswers | null;

    // Agent States
    strategicAnalysis: AgentState<StrategicAnalysis>;
    clusterArchitecture: AgentState<ClusterArchitecture>;
    contentDesign: AgentState<ContentDesign>;
    technicalOptimization: AgentState<TechnicalOptimization>;
    snippetStrategy: AgentState<SnippetStrategy>;
    authorityStrategy: AgentState<AuthorityStrategy>;
    coordinatorSummary: AgentState<CoordinatorSummary>;

    // Content Audit State
    contentAudit: {
        status: 'idle' | 'scraping' | 'analyzing' | 'completed' | 'error';
        result: import('../types/auditTypes').ContentAuditResult | null;
        error: string | null;
        targetKeyword?: string;
    };

    // Actions
    setBusinessDescription: (desc: string) => void;
    setApiKey: (key: string) => void;
    setQuestionnaireAnswers: (answers: QuestionnaireAnswers) => void;
    runAllAgents: () => Promise<void>;
    resetAll: () => void;
    restoreFromProject: (project: SEOProject) => void;

    // Content Audit Actions
    runContentAudit: (url: string, targetKeyword?: string) => Promise<void>;
    resetContentAudit: () => void;
    addSuggestedArticle: (article: ContentTableRow) => void;
    toggleArticleValidation: (index: number) => void;
}

// Project type for saved analyses
export interface QuestionnaireAnswers {
    projectName: string;
    siteType: string;
    sector: string;
    location: string;
    domainAuthority: string;
    budget: string;
    teamSize: string;
    mainGoal: string;
    targetKeyword: string;
    constraints: string;
}

export interface SEOProject {
    id: string;
    name: string;
    createdAt: number;
    updatedAt: number;
    businessDescription: string;
    questionnaireAnswers?: QuestionnaireAnswers;
    strategicAnalysis: StrategicAnalysis | null;
    clusterArchitecture: ClusterArchitecture | null;
    contentDesign: ContentDesign | null;
    technicalOptimization: TechnicalOptimization | null;
    snippetStrategy: SnippetStrategy | null;
    authorityStrategy: AuthorityStrategy | null;
    coordinatorSummary: CoordinatorSummary | null;
}


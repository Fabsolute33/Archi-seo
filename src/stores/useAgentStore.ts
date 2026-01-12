import { create } from 'zustand';
import type {
    AgentStore,
    AgentState,
    StrategicAnalysis,
    ClusterArchitecture,
    ContentDesign,
    TechnicalOptimization,
    SnippetStrategy,
    AuthorityStrategy,
    CoordinatorSummary,
    ContentTableRow,
    NewsTransformerInput,
    NewsTransformerResult,
    NewsAnalysis
} from '../types/agents';
import type { ContentAuditResult } from '../types/auditTypes';
import { initializeGemini } from '../services/GeminiService';
import { initializeGroundedGemini } from '../services/GroundedGeminiService';
import { runStrategicAnalyzer } from '../services/agents/StrategicAnalyzerAgent';
import { runClusterArchitect } from '../services/agents/ClusterArchitectAgent';
import { runContentDesigner } from '../services/agents/ContentDesignerAgent';
import { runTechnicalOptimizer } from '../services/agents/TechnicalOptimizerAgent';
import { runSnippetMaster } from '../services/agents/SnippetMasterAgent';
import { runAuthorityBuilder } from '../services/agents/AuthorityBuilderAgent';
import { runCoordinator } from '../services/agents/CoordinatorAgent';
import { runContentAuditor } from '../services/agents/ContentAuditorAgent';
import { runSGEOptimizer, enrichArticlesWithSGE } from '../services/agents/SGEOptimizerAgent';
import { runNewsTransformer } from '../services/agents/NewsTransformerAgent';
import { scrapeUrl } from '../services/WebScraperService';
import { enrichSectorVocabulary } from '../services/KnowledgeGraphService';

const createInitialAgentState = <T>(): AgentState<T> => ({
    status: 'idle',
    data: null,
    error: null,
    startedAt: null,
    completedAt: null,
});

export const useAgentStore = create<AgentStore>((set, get) => ({
    businessDescription: '',
    apiKey: '',
    questionnaireAnswers: null,

    // Initial Agent States
    strategicAnalysis: createInitialAgentState<StrategicAnalysis>(),
    clusterArchitecture: createInitialAgentState<ClusterArchitecture>(),
    contentDesign: createInitialAgentState<ContentDesign>(),
    technicalOptimization: createInitialAgentState<TechnicalOptimization>(),
    snippetStrategy: createInitialAgentState<SnippetStrategy>(),
    authorityStrategy: createInitialAgentState<AuthorityStrategy>(),
    coordinatorSummary: createInitialAgentState<CoordinatorSummary>(),

    // Content Audit State
    contentAudit: {
        status: 'idle' as const,
        result: null as ContentAuditResult | null,
        error: null as string | null,
        targetKeyword: undefined as string | undefined,
    },

    // News Transformer State
    newsTransformer: {
        status: 'idle' as const,
        formData: null as NewsTransformerInput | null,
        result: null as NewsTransformerResult | null,
        error: null as string | null,
        savedAnalyses: [] as NewsAnalysis[],
        currentAnalysisId: null as string | null,
    },

    setBusinessDescription: (desc: string) => set({ businessDescription: desc }),
    setApiKey: (key: string) => {
        set({ apiKey: key });
        if (key) {
            initializeGemini(key);
            initializeGroundedGemini(key);
        }
    },
    setQuestionnaireAnswers: (answers) => set({ questionnaireAnswers: answers }),

    runAllAgents: async () => {
        const { businessDescription, apiKey, questionnaireAnswers } = get();

        if (!businessDescription || !apiKey) {
            console.error('Missing business description or API key');
            return;
        }

        try {
            // Pre-step: Enrich vocabulary with Knowledge Graph if questionnaire data available
            let kgVocabulary = null;
            if (questionnaireAnswers?.sectorCategory || questionnaireAnswers?.sector) {
                try {
                    console.log('🔍 Enriching vocabulary with Knowledge Graph...');
                    kgVocabulary = await enrichSectorVocabulary(
                        questionnaireAnswers.sector || questionnaireAnswers.sectorCategory,
                        questionnaireAnswers.subSector,
                        questionnaireAnswers.industryTerms
                    );
                    console.log('✅ Knowledge Graph enrichment complete:', kgVocabulary);
                } catch (kgError) {
                    console.warn('Knowledge Graph enrichment failed, continuing without:', kgError);
                }
            }

            // Agent 1: Strategic Analyzer
            set({ strategicAnalysis: { ...createInitialAgentState(), status: 'running', startedAt: Date.now() } });
            const strategicResult = await runStrategicAnalyzer(businessDescription);

            // Merge Knowledge Graph vocabulary with AI-generated vocabulary
            if (kgVocabulary && strategicResult) {
                const existingVocab = strategicResult.vocabulaireSectoriel || { termesMetier: [], termesClients: [], entitesGoogle: [] };
                strategicResult.vocabulaireSectoriel = {
                    termesMetier: [...new Set([...kgVocabulary.termesMetier, ...existingVocab.termesMetier])],
                    termesClients: [...new Set([...kgVocabulary.termesClients, ...existingVocab.termesClients])],
                    entitesGoogle: [...new Set([...kgVocabulary.entitesGoogle, ...existingVocab.entitesGoogle])],
                };
            }

            // Enrich with questionnaire data if available
            if (questionnaireAnswers && strategicResult) {
                // Add questionnaire industry terms to vocabulary
                if (questionnaireAnswers.industryTerms?.length > 0) {
                    const vocab = strategicResult.vocabulaireSectoriel || { termesMetier: [], termesClients: [], entitesGoogle: [] };
                    vocab.termesMetier = [...new Set([...vocab.termesMetier, ...questionnaireAnswers.industryTerms])];
                    strategicResult.vocabulaireSectoriel = vocab;
                }

                // Add client terms 
                if (questionnaireAnswers.clientTerms) {
                    const vocab = strategicResult.vocabulaireSectoriel || { termesMetier: [], termesClients: [], entitesGoogle: [] };
                    const clientTerms = questionnaireAnswers.clientTerms.split(/[,\n]/).map(t => t.trim()).filter(Boolean);
                    vocab.termesClients = [...new Set([...vocab.termesClients, ...clientTerms])];
                    strategicResult.vocabulaireSectoriel = vocab;
                }

                // Add certifications as entities
                if (questionnaireAnswers.certifications?.length > 0) {
                    const vocab = strategicResult.vocabulaireSectoriel || { termesMetier: [], termesClients: [], entitesGoogle: [] };
                    vocab.entitesGoogle = [...new Set([...vocab.entitesGoogle, ...questionnaireAnswers.certifications])];
                    strategicResult.vocabulaireSectoriel = vocab;
                }

                // Enrich contexteBusiness with questionnaire data
                strategicResult.contexteBusiness = {
                    ...strategicResult.contexteBusiness,
                    sousSecteur: questionnaireAnswers.subSector || strategicResult.contexteBusiness?.sousSecteur,
                    zoneGeographique: questionnaireAnswers.targetCity || questionnaireAnswers.location || strategicResult.contexteBusiness?.zoneGeographique,
                } as typeof strategicResult.contexteBusiness;

                console.log('✅ Enriched with questionnaire data:', strategicResult.vocabulaireSectoriel);
            }

            set({
                strategicAnalysis: {
                    status: 'completed',
                    data: strategicResult,
                    error: null,
                    startedAt: get().strategicAnalysis.startedAt,
                    completedAt: Date.now()
                }
            });

            // Agent 2: Cluster Architect
            set({ clusterArchitecture: { ...createInitialAgentState(), status: 'running', startedAt: Date.now() } });
            const clusterResult = await runClusterArchitect(businessDescription, strategicResult);
            set({
                clusterArchitecture: {
                    status: 'completed',
                    data: clusterResult,
                    error: null,
                    startedAt: get().clusterArchitecture.startedAt,
                    completedAt: Date.now()
                }
            });

            // Agents 3, 4, 5, 6 run in parallel after Agent 2
            set({
                contentDesign: { ...createInitialAgentState(), status: 'running', startedAt: Date.now() },
                technicalOptimization: { ...createInitialAgentState(), status: 'running', startedAt: Date.now() },
                snippetStrategy: { ...createInitialAgentState(), status: 'running', startedAt: Date.now() },
                authorityStrategy: { ...createInitialAgentState(), status: 'running', startedAt: Date.now() },
            });

            const [contentResult, technicalResult, , authorityResult] = await Promise.all([
                runContentDesigner(businessDescription, strategicResult, clusterResult),
                runTechnicalOptimizer(businessDescription, clusterResult),
                runSnippetMaster(businessDescription, { tableauContenu: [], planningPublication: [] }).catch(() => null), // Will be called after content design
                runAuthorityBuilder(businessDescription, strategicResult),
            ]);

            set({
                contentDesign: {
                    status: 'completed',
                    data: contentResult,
                    error: null,
                    startedAt: get().contentDesign.startedAt,
                    completedAt: Date.now()
                },
                technicalOptimization: {
                    status: 'completed',
                    data: technicalResult,
                    error: null,
                    startedAt: get().technicalOptimization.startedAt,
                    completedAt: Date.now()
                },
                authorityStrategy: {
                    status: 'completed',
                    data: authorityResult,
                    error: null,
                    startedAt: get().authorityStrategy.startedAt,
                    completedAt: Date.now()
                },
            });

            // Run snippet master with actual content
            const snippetFinalResult = await runSnippetMaster(businessDescription, contentResult);
            set({
                snippetStrategy: {
                    status: 'completed',
                    data: snippetFinalResult,
                    error: null,
                    startedAt: get().snippetStrategy.startedAt,
                    completedAt: Date.now()
                }
            });

            // Agent SGE: Optimize content for AI Overviews
            try {
                const sgeOptimizations = await runSGEOptimizer(
                    businessDescription,
                    strategicResult,
                    contentResult.tableauContenu
                );

                // Enrich articles with SGE data
                const enrichedContent = enrichArticlesWithSGE(
                    contentResult.tableauContenu,
                    sgeOptimizations
                );

                // Update content design with SGE-enriched articles
                set({
                    contentDesign: {
                        status: 'completed',
                        data: {
                            ...contentResult,
                            tableauContenu: enrichedContent
                        },
                        error: null,
                        startedAt: get().contentDesign.startedAt,
                        completedAt: Date.now()
                    }
                });
            } catch (sgeError) {
                console.warn('SGE optimization failed, continuing without SGE data:', sgeError);
            }

            // Agent 7: Coordinator (Final)
            set({ coordinatorSummary: { ...createInitialAgentState(), status: 'running', startedAt: Date.now() } });
            const coordinatorResult = await runCoordinator(
                businessDescription,
                strategicResult,
                clusterResult,
                contentResult,
                technicalResult,
                snippetFinalResult,
                authorityResult
            );
            set({
                coordinatorSummary: {
                    status: 'completed',
                    data: coordinatorResult,
                    error: null,
                    startedAt: get().coordinatorSummary.startedAt,
                    completedAt: Date.now()
                }
            });

        } catch (error) {
            console.error('Error running agents:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // Update any running agent to error state
            const state = get();
            if (state.strategicAnalysis.status === 'running') {
                set({ strategicAnalysis: { ...state.strategicAnalysis, status: 'error', error: errorMessage } });
            }
            if (state.clusterArchitecture.status === 'running') {
                set({ clusterArchitecture: { ...state.clusterArchitecture, status: 'error', error: errorMessage } });
            }
            if (state.contentDesign.status === 'running') {
                set({ contentDesign: { ...state.contentDesign, status: 'error', error: errorMessage } });
            }
            if (state.technicalOptimization.status === 'running') {
                set({ technicalOptimization: { ...state.technicalOptimization, status: 'error', error: errorMessage } });
            }
            if (state.snippetStrategy.status === 'running') {
                set({ snippetStrategy: { ...state.snippetStrategy, status: 'error', error: errorMessage } });
            }
            if (state.authorityStrategy.status === 'running') {
                set({ authorityStrategy: { ...state.authorityStrategy, status: 'error', error: errorMessage } });
            }
            if (state.coordinatorSummary.status === 'running') {
                set({ coordinatorSummary: { ...state.coordinatorSummary, status: 'error', error: errorMessage } });
            }
        }
    },

    resetAll: () => set({
        businessDescription: '',
        questionnaireAnswers: null,
        strategicAnalysis: createInitialAgentState<StrategicAnalysis>(),
        clusterArchitecture: createInitialAgentState<ClusterArchitecture>(),
        contentDesign: createInitialAgentState<ContentDesign>(),
        technicalOptimization: createInitialAgentState<TechnicalOptimization>(),
        snippetStrategy: createInitialAgentState<SnippetStrategy>(),
        authorityStrategy: createInitialAgentState<AuthorityStrategy>(),
        coordinatorSummary: createInitialAgentState<CoordinatorSummary>(),
    }),

    restoreFromProject: (project) => set({
        businessDescription: project.businessDescription,
        questionnaireAnswers: project.questionnaireAnswers || null,
        strategicAnalysis: {
            status: project.strategicAnalysis ? 'completed' : 'idle',
            data: project.strategicAnalysis,
            error: null,
            startedAt: project.createdAt,
            completedAt: project.updatedAt,
        },
        clusterArchitecture: {
            status: project.clusterArchitecture ? 'completed' : 'idle',
            data: project.clusterArchitecture,
            error: null,
            startedAt: project.createdAt,
            completedAt: project.updatedAt,
        },
        contentDesign: {
            status: project.contentDesign ? 'completed' : 'idle',
            data: project.contentDesign,
            error: null,
            startedAt: project.createdAt,
            completedAt: project.updatedAt,
        },
        technicalOptimization: {
            status: project.technicalOptimization ? 'completed' : 'idle',
            data: project.technicalOptimization,
            error: null,
            startedAt: project.createdAt,
            completedAt: project.updatedAt,
        },
        snippetStrategy: {
            status: project.snippetStrategy ? 'completed' : 'idle',
            data: project.snippetStrategy,
            error: null,
            startedAt: project.createdAt,
            completedAt: project.updatedAt,
        },
        authorityStrategy: {
            status: project.authorityStrategy ? 'completed' : 'idle',
            data: project.authorityStrategy,
            error: null,
            startedAt: project.createdAt,
            completedAt: project.updatedAt,
        },
        coordinatorSummary: {
            status: project.coordinatorSummary ? 'completed' : 'idle',
            data: project.coordinatorSummary,
            error: null,
            startedAt: project.createdAt,
            completedAt: project.updatedAt,
        },
        // Restore News Transformer data with analyses array
        newsTransformer: project.newsTransformerData ? {
            status: 'idle' as const,
            formData: null,
            result: null,
            error: null,
            savedAnalyses: project.newsTransformerData.analyses || [],
            currentAnalysisId: project.newsTransformerData.currentAnalysisId || null,
        } : { status: 'idle' as const, formData: null, result: null, error: null, savedAnalyses: [], currentAnalysisId: null },
    }),

    // Content Audit Actions
    runContentAudit: async (url: string, targetKeyword?: string) => {
        const { apiKey } = get();

        if (!apiKey) {
            set({ contentAudit: { status: 'error', result: null, error: 'Clé API manquante', targetKeyword } });
            return;
        }

        try {
            // Step 1: Scraping
            set({ contentAudit: { status: 'scraping', result: null, error: null, targetKeyword } });
            const scrapedContent = await scrapeUrl(url);

            // Step 2: Analysis with Agent 9
            set({ contentAudit: { status: 'analyzing', result: null, error: null, targetKeyword } });
            const auditResult = await runContentAuditor(scrapedContent, targetKeyword);

            // Combine results
            const fullResult: ContentAuditResult = {
                url,
                scrapedContent,
                ...auditResult
            };

            set({ contentAudit: { status: 'completed', result: fullResult, error: null, targetKeyword } });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'audit';
            set({ contentAudit: { status: 'error', result: null, error: errorMessage, targetKeyword } });
        }
    },

    resetContentAudit: () => set({
        contentAudit: { status: 'idle', result: null, error: null, targetKeyword: undefined }
    }),

    addSuggestedArticle: (article: ContentTableRow) => {
        const state = get();
        const currentContent = state.contentDesign.data;

        if (currentContent) {
            // Add to existing content table
            set({
                contentDesign: {
                    ...state.contentDesign,
                    data: {
                        ...currentContent,
                        tableauContenu: [...currentContent.tableauContenu, article]
                    }
                }
            });
        } else {
            // Create new content design with this article
            set({
                contentDesign: {
                    status: 'completed',
                    data: {
                        tableauContenu: [article],
                        planningPublication: []
                    },
                    error: null,
                    startedAt: Date.now(),
                    completedAt: Date.now()
                }
            });
        }
    },

    // Toggle validation status of an article
    toggleArticleValidation: (index: number) => {
        const state = get();
        const currentContent = state.contentDesign.data;

        if (currentContent && currentContent.tableauContenu[index]) {
            const updatedTableau = [...currentContent.tableauContenu];
            updatedTableau[index] = {
                ...updatedTableau[index],
                validated: !updatedTableau[index].validated
            };

            set({
                contentDesign: {
                    ...state.contentDesign,
                    data: {
                        ...currentContent,
                        tableauContenu: updatedTableau
                    }
                }
            });
        }
    },

    // Delete an article from the content table
    deleteArticle: (index: number) => {
        const state = get();
        const currentContent = state.contentDesign.data;

        if (currentContent && currentContent.tableauContenu[index] !== undefined) {
            const updatedTableau = currentContent.tableauContenu.filter((_, i) => i !== index);

            set({
                contentDesign: {
                    ...state.contentDesign,
                    data: {
                        ...currentContent,
                        tableauContenu: updatedTableau
                    }
                }
            });
        }
    },

    // News Transformer Actions
    runNewsTransformerAgent: async (formData: NewsTransformerInput) => {
        const { apiKey, newsTransformer } = get();

        if (!apiKey) {
            set({ newsTransformer: { ...newsTransformer, status: 'error', formData, result: null, error: 'Clé API manquante' } });
            return;
        }

        try {
            set({ newsTransformer: { ...newsTransformer, status: 'running', formData, result: null, error: null } });

            const result = await runNewsTransformer(formData);

            set({ newsTransformer: { ...get().newsTransformer, status: 'completed', formData, result, error: null } });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la transformation';
            set({ newsTransformer: { ...get().newsTransformer, status: 'error', formData, result: null, error: errorMessage } });
        }
    },

    resetNewsTransformer: () => {
        const { newsTransformer } = get();
        set({
            newsTransformer: {
                ...newsTransformer,
                status: 'idle',
                formData: null,
                result: null,
                error: null,
                currentAnalysisId: null
            }
        });
    },

    saveCurrentNewsAnalysis: () => {
        const { newsTransformer } = get();
        if (!newsTransformer.formData || !newsTransformer.result) return;

        const newAnalysis: NewsAnalysis = {
            id: `news-${Date.now()}`,
            createdAt: Date.now(),
            sourceUrl: newsTransformer.formData.url,
            formData: newsTransformer.formData,
            result: newsTransformer.result,
        };

        const existingIndex = newsTransformer.savedAnalyses.findIndex(
            a => a.id === newsTransformer.currentAnalysisId
        );

        let updatedAnalyses: NewsAnalysis[];
        if (existingIndex >= 0) {
            // Update existing
            updatedAnalyses = [...newsTransformer.savedAnalyses];
            updatedAnalyses[existingIndex] = { ...newAnalysis, id: newsTransformer.currentAnalysisId! };
        } else {
            // Add new
            updatedAnalyses = [newAnalysis, ...newsTransformer.savedAnalyses];
        }

        set({
            newsTransformer: {
                ...newsTransformer,
                savedAnalyses: updatedAnalyses,
                currentAnalysisId: existingIndex >= 0 ? newsTransformer.currentAnalysisId : newAnalysis.id,
            }
        });
    },

    loadNewsAnalysis: (id: string) => {
        const { newsTransformer } = get();
        const analysis = newsTransformer.savedAnalyses.find(a => a.id === id);
        if (!analysis) return;

        set({
            newsTransformer: {
                ...newsTransformer,
                status: analysis.result ? 'completed' : 'idle',
                formData: analysis.formData,
                result: analysis.result,
                error: null,
                currentAnalysisId: id,
            }
        });
    },

    deleteNewsAnalysis: (id: string) => {
        const { newsTransformer } = get();
        const updatedAnalyses = newsTransformer.savedAnalyses.filter(a => a.id !== id);

        // If we deleted the current analysis, reset
        const shouldReset = newsTransformer.currentAnalysisId === id;

        set({
            newsTransformer: shouldReset ? {
                status: 'idle',
                formData: null,
                result: null,
                error: null,
                savedAnalyses: updatedAnalyses,
                currentAnalysisId: null,
            } : {
                ...newsTransformer,
                savedAnalyses: updatedAnalyses,
            }
        });
    },
}));

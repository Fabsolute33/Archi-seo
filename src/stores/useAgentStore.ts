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
    NewsTransformerResult
} from '../types/agents';
import type { ContentAuditResult } from '../types/auditTypes';
import { initializeGemini } from '../services/GeminiService';
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
    },

    setBusinessDescription: (desc: string) => set({ businessDescription: desc }),
    setApiKey: (key: string) => {
        set({ apiKey: key });
        if (key) {
            initializeGemini(key);
        }
    },
    setQuestionnaireAnswers: (answers) => set({ questionnaireAnswers: answers }),

    runAllAgents: async () => {
        const { businessDescription, apiKey } = get();

        if (!businessDescription || !apiKey) {
            console.error('Missing business description or API key');
            return;
        }

        try {
            // Agent 1: Strategic Analyzer
            set({ strategicAnalysis: { ...createInitialAgentState(), status: 'running', startedAt: Date.now() } });
            const strategicResult = await runStrategicAnalyzer(businessDescription);
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
        // Restore News Transformer data
        newsTransformer: project.newsTransformerData ? {
            status: project.newsTransformerData.result ? 'completed' : 'idle',
            formData: project.newsTransformerData.formData,
            result: project.newsTransformerData.result,
            error: null,
        } : { status: 'idle', formData: null, result: null, error: null },
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

    // News Transformer Actions
    runNewsTransformerAgent: async (formData: NewsTransformerInput) => {
        const { apiKey } = get();

        if (!apiKey) {
            set({ newsTransformer: { status: 'error', formData, result: null, error: 'Clé API manquante' } });
            return;
        }

        try {
            set({ newsTransformer: { status: 'running', formData, result: null, error: null } });

            const result = await runNewsTransformer(formData);

            set({ newsTransformer: { status: 'completed', formData, result, error: null } });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la transformation';
            set({ newsTransformer: { status: 'error', formData, result: null, error: errorMessage } });
        }
    },

    resetNewsTransformer: () => set({
        newsTransformer: { status: 'idle', formData: null, result: null, error: null }
    }),
}));

import { create } from 'zustand';
import type { SEOProject } from '../types/agents';
import { useAgentStore } from './useAgentStore';
import { useAuthStore } from './useAuthStore';
import { useRSSStore } from './useRSSStore';
import {
    saveProject,
    getProjects,
    getProject,
    deleteProject as deleteProjectFromDb,
    generateProjectId
} from '../services/ProjectService';

// Auto-save configuration
const AUTO_SAVE_DELAY = 30000; // 30 seconds
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

type AutoSaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

interface ProjectStore {
    currentProjectId: string | null;
    currentProjectName: string;
    projects: SEOProject[];
    isLoading: boolean;
    error: string | null;

    // Auto-save state
    autoSaveEnabled: boolean;
    autoSaveStatus: AutoSaveStatus;
    lastAutoSave: number | null;
    hasUnsavedChanges: boolean;

    setProjectName: (name: string) => void;
    saveCurrentProject: () => Promise<void>;
    loadProjects: () => Promise<void>;
    loadProject: (id: string) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    resetProject: () => void;
    createNewProject: () => void;
    prepareNewProjectContext: () => void; // Reset only project ID without clearing agent data

    // Auto-save actions
    setAutoSaveEnabled: (enabled: boolean) => void;
    triggerAutoSave: () => void;
    markAsChanged: () => void;
    cancelPendingAutoSave: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
    currentProjectId: null,
    currentProjectName: '',
    projects: [],
    isLoading: false,
    error: null,

    // Auto-save initial state
    autoSaveEnabled: true,
    autoSaveStatus: 'idle',
    lastAutoSave: null,
    hasUnsavedChanges: false,

    setProjectName: (name: string) => set({ currentProjectName: name }),

    saveCurrentProject: async () => {
        const { currentProjectName, currentProjectId } = get();
        const agentStore = useAgentStore.getState();
        const rssStore = useRSSStore.getState();
        const userId = useAuthStore.getState().user?.uid;

        if (!userId) {
            set({ error: 'Vous devez être connecté pour sauvegarder' });
            return;
        }

        if (!currentProjectName.trim()) {
            set({ error: 'Le nom du projet est requis' });
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const projectId = currentProjectId || generateProjectId();
            const now = Date.now();

            const project: SEOProject = {
                id: projectId,
                name: currentProjectName,
                createdAt: currentProjectId ? get().projects.find(p => p.id === projectId)?.createdAt || now : now,
                updatedAt: now,
                businessDescription: agentStore.businessDescription,
                questionnaireAnswers: agentStore.questionnaireAnswers || undefined,
                strategicAnalysis: agentStore.strategicAnalysis.data,
                clusterArchitecture: agentStore.clusterArchitecture.data,
                contentDesign: agentStore.contentDesign.data,
                technicalOptimization: agentStore.technicalOptimization.data,
                snippetStrategy: agentStore.snippetStrategy.data,
                authorityStrategy: agentStore.authorityStrategy.data,
                competitorAnalysis: agentStore.competitorAnalysis.data,
                coordinatorSummary: agentStore.coordinatorSummary.data,
                // News Transformer data - new format with analyses array
                newsTransformerData: agentStore.newsTransformer.savedAnalyses.length > 0 ? {
                    analyses: agentStore.newsTransformer.savedAnalyses,
                    currentAnalysisId: agentStore.newsTransformer.currentAnalysisId,
                } : undefined,
                // RSS data - sources and processed articles per project
                rssData: rssStore.getDataForSave(),
            };

            await saveProject(userId, project);

            // Update local state
            const projects = get().projects;
            const existingIndex = projects.findIndex(p => p.id === projectId);
            if (existingIndex >= 0) {
                projects[existingIndex] = project;
                set({ projects: [...projects], currentProjectId: projectId });
            } else {
                set({ projects: [project, ...projects], currentProjectId: projectId });
            }

            set({ isLoading: false });
        } catch (error) {
            console.error('Error saving project:', error);
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde'
            });
        }
    },

    loadProjects: async () => {
        const userId = useAuthStore.getState().user?.uid;

        if (!userId) {
            set({ projects: [], isLoading: false });
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const projects = await getProjects(userId);
            set({ projects, isLoading: false });
        } catch (error) {
            console.error('Error loading projects:', error);
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Erreur lors du chargement'
            });
        }
    },

    loadProject: async (id: string) => {
        const userId = useAuthStore.getState().user?.uid;

        if (!userId) {
            set({ error: 'Vous devez être connecté' });
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const project = await getProject(userId, id);

            if (project) {
                // Restore to agent store
                useAgentStore.getState().restoreFromProject(project);
                // Restore RSS data
                useRSSStore.getState().restoreFromProject(project.rssData);

                set({
                    currentProjectId: project.id,
                    currentProjectName: project.name,
                    isLoading: false
                });
            } else {
                set({
                    isLoading: false,
                    error: 'Projet non trouvé'
                });
            }
        } catch (error) {
            console.error('Error loading project:', error);
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Erreur lors du chargement'
            });
        }
    },

    deleteProject: async (id: string) => {
        const userId = useAuthStore.getState().user?.uid;

        if (!userId) {
            set({ error: 'Vous devez être connecté' });
            return;
        }

        set({ isLoading: true, error: null });

        try {
            await deleteProjectFromDb(userId, id);

            const projects = get().projects.filter(p => p.id !== id);
            const wasCurrentProject = get().currentProjectId === id;

            // Si le projet supprimé était le projet courant, réinitialiser
            if (wasCurrentProject) {
                useAgentStore.getState().resetAll();
                set({
                    projects,
                    currentProjectId: null,
                    currentProjectName: '',
                    isLoading: false
                });
            } else {
                set({ projects, isLoading: false });
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Erreur lors de la suppression'
            });
        }
    },

    resetProject: () => set({
        currentProjectId: null,
        currentProjectName: '',
        error: null
    }),

    createNewProject: () => {
        // Cancel any pending auto-save
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = null;
        }
        // Reset agent store data first
        useAgentStore.getState().resetAll();
        // Reset RSS store to ensure project data isolation
        useRSSStore.getState().resetAll();
        // Reset project identifiers to create a fresh project
        set({
            currentProjectId: null,
            currentProjectName: '',
            error: null,
            autoSaveStatus: 'idle',
            hasUnsavedChanges: false,
            lastAutoSave: null
        });
    },

    // Prepare for a new project context without clearing agent data
    // This is used when starting a new analysis to ensure we don't overwrite an existing project
    prepareNewProjectContext: () => {
        // Cancel any pending auto-save from previous project
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = null;
        }
        // Reset RSS store for new project context
        useRSSStore.getState().resetAll();
        // Only reset project identifiers - agent data will be populated by the new analysis
        set({
            currentProjectId: null,
            currentProjectName: '',
            error: null,
            autoSaveStatus: 'idle',
            hasUnsavedChanges: false,
            lastAutoSave: null
        });
    },

    // Auto-save actions
    setAutoSaveEnabled: (enabled: boolean) => {
        set({ autoSaveEnabled: enabled });
        if (!enabled && autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = null;
            set({ autoSaveStatus: 'idle' });
        }
    },

    triggerAutoSave: () => {
        const { autoSaveEnabled, currentProjectId, isLoading } = get();

        // Only auto-save if enabled, a project is loaded, and not already saving
        if (!autoSaveEnabled || !currentProjectId || isLoading) {
            return;
        }

        // Clear any existing timeout
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }

        set({ autoSaveStatus: 'pending', hasUnsavedChanges: true });

        // Set new timeout for auto-save
        autoSaveTimeout = setTimeout(async () => {
            const state = get();
            if (!state.autoSaveEnabled || !state.currentProjectId) {
                return;
            }

            try {
                set({ autoSaveStatus: 'saving' });
                await get().saveCurrentProject();
                set({
                    autoSaveStatus: 'saved',
                    lastAutoSave: Date.now(),
                    hasUnsavedChanges: false
                });

                // Reset status after 3 seconds
                setTimeout(() => {
                    if (get().autoSaveStatus === 'saved') {
                        set({ autoSaveStatus: 'idle' });
                    }
                }, 3000);
            } catch (error) {
                console.error('Auto-save failed:', error);
                set({ autoSaveStatus: 'error' });
            }
            autoSaveTimeout = null;
        }, AUTO_SAVE_DELAY);
    },

    markAsChanged: () => {
        const { currentProjectId } = get();
        if (currentProjectId) {
            set({ hasUnsavedChanges: true });
            get().triggerAutoSave();
        }
    },

    cancelPendingAutoSave: () => {
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = null;
        }
        set({ autoSaveStatus: 'idle' });
    }
}));

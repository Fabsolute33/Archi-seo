import { create } from 'zustand';
import type { SEOProject } from '../types/agents';
import { useAgentStore } from './useAgentStore';
import { useAuthStore } from './useAuthStore';
import {
    saveProject,
    getProjects,
    getProject,
    deleteProject as deleteProjectFromDb,
    generateProjectId
} from '../services/ProjectService';

interface ProjectStore {
    currentProjectId: string | null;
    currentProjectName: string;
    projects: SEOProject[];
    isLoading: boolean;
    error: string | null;

    setProjectName: (name: string) => void;
    saveCurrentProject: () => Promise<void>;
    loadProjects: () => Promise<void>;
    loadProject: (id: string) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    resetProject: () => void;
    createNewProject: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
    currentProjectId: null,
    currentProjectName: '',
    projects: [],
    isLoading: false,
    error: null,

    setProjectName: (name: string) => set({ currentProjectName: name }),

    saveCurrentProject: async () => {
        const { currentProjectName, currentProjectId } = get();
        const agentStore = useAgentStore.getState();
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
                coordinatorSummary: agentStore.coordinatorSummary.data,
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
            const currentProjectId = get().currentProjectId === id ? null : get().currentProjectId;

            set({ projects, currentProjectId, isLoading: false });
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
        // Reset agent store data first
        useAgentStore.getState().resetAll();
        // Reset project identifiers to create a fresh project
        set({ currentProjectId: null, currentProjectName: '', error: null });
    }
}));

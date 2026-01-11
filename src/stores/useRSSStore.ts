import { create } from 'zustand';
import type { RSSSource, RSSArticle } from '../types/agents';
import { fetchAllRSSSources } from '../services/NewsMonitorService';

interface RSSStore {
    // State
    sources: RSSSource[];
    articles: RSSArticle[];
    processedArticleIds: string[];
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;

    // Actions
    addSource: (source: Omit<RSSSource, 'id' | 'isActive'>) => void;
    removeSource: (id: string) => void;
    toggleSource: (id: string) => void;
    fetchArticles: () => Promise<void>;
    markArticleAsProcessed: (articleId: string) => void;
    restoreFromProject: (data: { sources: RSSSource[]; processedArticleIds: string[] } | undefined) => void;
    getDataForSave: () => { sources: RSSSource[]; processedArticleIds: string[] };
    resetAll: () => void;
}

export const useRSSStore = create<RSSStore>((set, get) => ({
    sources: [],
    articles: [],
    processedArticleIds: [],
    isLoading: false,
    error: null,
    lastFetched: null,

    addSource: (source) => {
        const newSource: RSSSource = {
            ...source,
            id: `rss-src-${Date.now()}`,
            isActive: true,
        };
        set(state => ({
            sources: [...state.sources, newSource]
        }));
    },

    removeSource: (id) => {
        set(state => ({
            sources: state.sources.filter(s => s.id !== id),
            articles: state.articles.filter(a => a.sourceId !== id)
        }));
    },

    toggleSource: (id) => {
        set(state => ({
            sources: state.sources.map(s =>
                s.id === id ? { ...s, isActive: !s.isActive } : s
            )
        }));
    },

    fetchArticles: async () => {
        const { sources } = get();

        if (sources.length === 0) {
            set({ articles: [], error: null });
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const allArticles = await fetchAllRSSSources(sources);

            // Store ALL articles - don't filter by processed IDs
            // This ensures refresh always shows current feed content
            set({
                articles: allArticles,
                isLoading: false,
                lastFetched: Date.now()
            });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Erreur lors du chargement des flux'
            });
        }
    },

    markArticleAsProcessed: (articleId) => {
        set(state => ({
            processedArticleIds: [...state.processedArticleIds, articleId],
            articles: state.articles.filter(a => a.id !== articleId)
        }));
    },

    restoreFromProject: (data) => {
        if (data) {
            set({
                sources: data.sources || [],
                processedArticleIds: data.processedArticleIds || [],
                articles: [],
                isLoading: false,
                error: null,
                lastFetched: null
            });
        } else {
            // Reset if no data
            set({
                sources: [],
                processedArticleIds: [],
                articles: [],
                isLoading: false,
                error: null,
                lastFetched: null
            });
        }
    },

    getDataForSave: () => {
        const { sources, processedArticleIds } = get();
        return { sources, processedArticleIds };
    },

    resetAll: () => {
        set({
            sources: [],
            articles: [],
            processedArticleIds: [],
            isLoading: false,
            error: null,
            lastFetched: null
        });
    }
}));

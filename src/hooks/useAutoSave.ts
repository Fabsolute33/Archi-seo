import { useEffect, useRef } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { useAgentStore } from '../stores/useAgentStore';
import { useRSSStore } from '../stores/useRSSStore';

/**
 * Custom hook that monitors store changes and triggers auto-save
 * when a project is active and changes are detected.
 */
export function useAutoSave() {
    const currentProjectId = useProjectStore((state) => state.currentProjectId);
    const markAsChanged = useProjectStore((state) => state.markAsChanged);
    const hasUnsavedChanges = useProjectStore((state) => state.hasUnsavedChanges);

    // Track previous states to detect changes
    const prevAgentState = useRef<string>('');
    const prevRSSState = useRef<string>('');
    const isFirstRender = useRef(true);

    // Subscribe to AgentStore changes
    useEffect(() => {
        if (!currentProjectId) return;

        const unsubscribe = useAgentStore.subscribe((state) => {
            // Create a simplified snapshot of relevant data for change detection
            const snapshot = JSON.stringify({
                businessDescription: state.businessDescription,
                questionnaireAnswers: state.questionnaireAnswers,
                strategicAnalysis: state.strategicAnalysis.data,
                clusterArchitecture: state.clusterArchitecture.data,
                contentDesign: state.contentDesign.data,
                technicalOptimization: state.technicalOptimization.data,
                snippetStrategy: state.snippetStrategy.data,
                authorityStrategy: state.authorityStrategy.data,
                coordinatorSummary: state.coordinatorSummary.data,
                newsTransformerSavedAnalyses: state.newsTransformer.savedAnalyses,
            });

            // Skip first render (initial load)
            if (isFirstRender.current) {
                prevAgentState.current = snapshot;
                isFirstRender.current = false;
                return;
            }

            // Check if there's an actual change
            if (snapshot !== prevAgentState.current) {
                prevAgentState.current = snapshot;
                markAsChanged();
            }
        });

        return () => unsubscribe();
    }, [currentProjectId, markAsChanged]);

    // Subscribe to RSSStore changes
    useEffect(() => {
        if (!currentProjectId) return;

        const unsubscribe = useRSSStore.subscribe((state) => {
            const snapshot = JSON.stringify({
                sources: state.sources,
                processedArticleIds: state.processedArticleIds,
            });

            // Skip initial load
            if (!prevRSSState.current) {
                prevRSSState.current = snapshot;
                return;
            }

            if (snapshot !== prevRSSState.current) {
                prevRSSState.current = snapshot;
                markAsChanged();
            }
        });

        return () => unsubscribe();
    }, [currentProjectId, markAsChanged]);

    // Reset refs when project changes
    useEffect(() => {
        isFirstRender.current = true;
        prevAgentState.current = '';
        prevRSSState.current = '';
    }, [currentProjectId]);

    return { hasUnsavedChanges };
}

export default useAutoSave;

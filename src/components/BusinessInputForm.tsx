import { useState, useEffect } from 'react';
import { Sparkles, Save } from 'lucide-react';
import { useAgentStore } from '../stores/useAgentStore';
import { useProjectStore } from '../stores/useProjectStore';
import { BusinessQuestionnaire, formatAnswersForAgent, QuestionnaireAnswers } from './BusinessQuestionnaire';
import './BusinessInputForm.css';

const STARTUP_MESSAGE = `🚀 SEO DOMINATION MULTI-AGENT SYSTEM

Répondez à quelques questions pour que nos 7 agents IA analysent votre business et génèrent une stratégie SEO complète.

💡 Plus vous êtes précis, plus l'analyse sera chirurgicale.`;

export function BusinessInputForm() {
    const { setBusinessDescription, runAllAgents, apiKey, coordinatorSummary } = useAgentStore();
    const { setProjectName, saveCurrentProject, currentProjectName, isLoading: isSaving } = useProjectStore();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleQuestionnaireComplete = async (answers: QuestionnaireAnswers) => {
        if (!apiKey) return;

        // Set project name before running analysis
        setProjectName(answers.projectName);

        const formattedDescription = formatAnswersForAgent(answers);
        setBusinessDescription(formattedDescription);

        setIsGenerating(true);
        try {
            await runAllAgents();
        } finally {
            setIsGenerating(false);
        }
    };

    const isComplete = coordinatorSummary.status === 'completed';

    // Auto-save when analysis completes
    useEffect(() => {
        if (isComplete && currentProjectName) {
            saveCurrentProject();
        }
    }, [isComplete, currentProjectName, saveCurrentProject]);

    const handleManualSave = async () => {
        await saveCurrentProject();
    };

    return (
        <section className="business-input-section">
            <div className="business-input-container">
                {!isComplete && !isGenerating && (
                    <div className="startup-message">
                        <pre>{STARTUP_MESSAGE}</pre>
                    </div>
                )}

                <div className="business-input-header">
                    <div className="business-input-icon">
                        <Sparkles className="icon" />
                    </div>
                    <h2>Décrivez votre Business</h2>
                    <p>
                        Notre système de 7 agents IA spécialisés va analyser votre business
                        et générer une stratégie SEO complète et exécutable.
                    </p>
                </div>

                {isComplete && currentProjectName && (
                    <div className="project-save-status">
                        <span className="project-name-badge">
                            📁 {currentProjectName}
                        </span>
                        <button
                            className="save-project-btn"
                            onClick={handleManualSave}
                            disabled={isSaving}
                        >
                            <Save size={16} />
                            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                    </div>
                )}

                <div className="workflow-preview">
                    <h4>🔄 WORKFLOW DE COLLABORATION</h4>
                    <div className="workflow-visual">
                        <div className="workflow-step active">
                            <span className="step-icon">🔍</span>
                            <span className="step-name">Agent 1</span>
                            <span className="step-role">Strategic Analyzer</span>
                        </div>
                        <div className="workflow-arrow">↓</div>
                        <div className="workflow-step">
                            <span className="step-icon">🏗️</span>
                            <span className="step-name">Agent 2</span>
                            <span className="step-role">Cluster Architect</span>
                        </div>
                        <div className="workflow-arrow">↓</div>
                        <div className="workflow-parallel">
                            <div className="parallel-label">En parallèle</div>
                            <div className="parallel-agents">
                                <div className="workflow-step small">
                                    <span className="step-icon">✍️</span>
                                    <span className="step-name">Agent 3</span>
                                </div>
                                <div className="workflow-step small">
                                    <span className="step-icon">⚙️</span>
                                    <span className="step-name">Agent 4</span>
                                </div>
                                <div className="workflow-step small">
                                    <span className="step-icon">🎯</span>
                                    <span className="step-name">Agent 5</span>
                                </div>
                                <div className="workflow-step small">
                                    <span className="step-icon">🏆</span>
                                    <span className="step-name">Agent 6</span>
                                </div>
                            </div>
                        </div>
                        <div className="workflow-arrow">↓</div>
                        <div className="workflow-step final">
                            <span className="step-icon">🎬</span>
                            <span className="step-name">Agent 7</span>
                            <span className="step-role">Coordinator</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

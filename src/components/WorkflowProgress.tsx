import { useAgentStore } from '../stores/useAgentStore';
import {
    Search,
    LayoutGrid,
    FileText,
    Settings,
    Target,
    Award,
    Zap,
    CheckCircle,
    AlertCircle,
    Loader
} from 'lucide-react';
import './WorkflowProgress.css';

const AGENT_CONFIG = [
    {
        key: 'strategicAnalysis',
        name: 'Strategic Analyzer',
        icon: Search,
        description: 'Analyse des 6 dimensions marché',
        color: '#8b5cf6'
    },
    {
        key: 'clusterArchitecture',
        name: 'Cluster Architect',
        icon: LayoutGrid,
        description: 'Architecture thématique',
        color: '#6366f1'
    },
    {
        key: 'contentDesign',
        name: 'Content Designer',
        icon: FileText,
        description: 'Tableau de contenu 12 colonnes',
        color: '#ec4899'
    },
    {
        key: 'technicalOptimization',
        name: 'Technical Optimizer',
        icon: Settings,
        description: 'Kit technique SEO',
        color: '#14b8a6'
    },
    {
        key: 'snippetStrategy',
        name: 'Snippet Master',
        icon: Target,
        description: 'Position 0 & Voice',
        color: '#f59e0b'
    },
    {
        key: 'authorityStrategy',
        name: 'Authority Builder',
        icon: Award,
        description: 'E-E-A-T & Backlinks',
        color: '#22c55e'
    },
    {
        key: 'coordinatorSummary',
        name: 'Coordinator',
        icon: Zap,
        description: 'Synthèse & Quick Wins',
        color: '#06b6d4'
    },
];

export function WorkflowProgress() {
    const store = useAgentStore();

    const getAgentState = (key: string) => {
        return store[key as keyof typeof store] as { status: string; error: string | null };
    };

    const completedCount = AGENT_CONFIG.filter(
        agent => getAgentState(agent.key).status === 'completed'
    ).length;

    const hasStarted = AGENT_CONFIG.some(
        agent => getAgentState(agent.key).status !== 'idle'
    );

    if (!hasStarted) return null;

    return (
        <section className="workflow-progress-section">
            <div className="workflow-progress-container">
                <div className="workflow-progress-header">
                    <h3>Progression des Agents</h3>
                    <span className="progress-count">{completedCount} / {AGENT_CONFIG.length}</span>
                </div>

                <div className="progress-bar">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${(completedCount / AGENT_CONFIG.length) * 100}%` }}
                    />
                </div>

                <div className="agents-grid">
                    {AGENT_CONFIG.map((agent, index) => {
                        const state = getAgentState(agent.key);
                        const Icon = agent.icon;

                        return (
                            <div
                                key={agent.key}
                                className={`agent-progress-card ${state.status}`}
                                style={{ '--agent-color': agent.color } as React.CSSProperties}
                            >
                                <div className="agent-progress-header">
                                    <div className="agent-icon-wrapper" style={{ background: agent.color }}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="agent-status-icon">
                                        {state.status === 'completed' && <CheckCircle className="status-completed" />}
                                        {state.status === 'running' && <Loader className="status-running" />}
                                        {state.status === 'error' && <AlertCircle className="status-error" />}
                                        {state.status === 'idle' && <span className="status-idle">{index + 1}</span>}
                                    </div>
                                </div>
                                <h4 className="agent-name">{agent.name}</h4>
                                <p className="agent-description">{agent.description}</p>
                                {state.error && (
                                    <div className="agent-error">{state.error}</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

import { useState } from 'react';
import { Compass, Search } from 'lucide-react';
import { Header } from './components/Header';
import { BusinessInputForm } from './components/BusinessInputForm';
import { WorkflowProgress } from './components/WorkflowProgress';
import { ResultDashboard } from './components/ResultDashboard';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { ContentAuditInput } from './components/ContentAuditInput';
import { ContentAuditResults } from './components/ContentAuditResults';
import { FloatingSaveButton } from './components/FloatingSaveButton';
import './App.css';

type TabType = 'strategy' | 'audit';

function App() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('strategy');

    return (
        <div className="app">
            <Header
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenProfile={() => setIsProfileOpen(true)}
            />

            {/* Tab Navigation */}
            <nav className="app-tabs">
                <button
                    className={`app-tab ${activeTab === 'strategy' ? 'active' : ''}`}
                    onClick={() => setActiveTab('strategy')}
                >
                    <Compass size={18} />
                    Nouvelle Stratégie
                </button>
                <button
                    className={`app-tab ${activeTab === 'audit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('audit')}
                >
                    <Search size={18} />
                    Audit de Contenu
                </button>
            </nav>

            <main className="main-content">
                {activeTab === 'strategy' && (
                    <>
                        <BusinessInputForm />
                        <WorkflowProgress />
                        <ResultDashboard />
                    </>
                )}

                {activeTab === 'audit' && (
                    <div className="audit-container">
                        <ContentAuditInput />
                        <ContentAuditResults />
                    </div>
                )}
            </main>

            <footer className="app-footer">
                <p>
                    SEO Domination Multi-Agent System • Propulsé par{' '}
                    <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer">
                        Google Gemini
                    </a>
                </p>
            </footer>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />

            <FloatingSaveButton />
        </div>
    );
}

export default App;

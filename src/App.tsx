import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar, ViewType } from './components/Sidebar';
import { BusinessInputForm } from './components/BusinessInputForm';
import { WorkflowProgress } from './components/WorkflowProgress';
import { ResultDashboard } from './components/ResultDashboard';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { AboutModal } from './components/AboutModal';
import { ContentAuditInput } from './components/ContentAuditInput';
import { ContentAuditResults } from './components/ContentAuditResults';
import { FloatingSaveButton } from './components/FloatingSaveButton';
import './App.css';

function App() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const [currentView, setCurrentView] = useState<ViewType>('strategy');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className={`app ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
            <Sidebar
                currentView={currentView}
                onViewChange={setCurrentView}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenProjects={() => setIsProfileOpen(true)}
                onOpenAbout={() => setIsAboutOpen(true)}
            />

            <Header />

            <main className={`main-content ${currentView === 'results' ? 'full-width-view' : ''}`}>
                {currentView === 'strategy' && (
                    <>
                        <BusinessInputForm />
                        <WorkflowProgress />
                    </>
                )}

                {currentView === 'audit' && (
                    <div className="audit-container">
                        <ContentAuditInput />
                        <ContentAuditResults />
                    </div>
                )}

                {currentView === 'results' && (
                    <div className="results-container">
                        <ResultDashboard />
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

            <AboutModal
                isOpen={isAboutOpen}
                onClose={() => setIsAboutOpen(false)}
            />

            <FloatingSaveButton />
        </div>
    );
}

export default App;

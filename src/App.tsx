import { useState } from 'react';
import { Header } from './components/Header';
import { BusinessInputForm } from './components/BusinessInputForm';
import { WorkflowProgress } from './components/WorkflowProgress';
import { ResultDashboard } from './components/ResultDashboard';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import './App.css';

function App() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <div className="app">
            <Header
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenProfile={() => setIsProfileOpen(true)}
            />

            <main className="main-content">
                <BusinessInputForm />
                <WorkflowProgress />
                <ResultDashboard />
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
        </div>
    );
}

export default App;


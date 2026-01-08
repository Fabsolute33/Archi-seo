import { useEffect } from 'react';
import { Zap, Settings, FolderOpen, LogIn, LogOut, PlusCircle } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useProjectStore } from '../stores/useProjectStore';
import './Header.css';

interface HeaderProps {
    onOpenSettings: () => void;
    onOpenProfile: () => void;
}

export function Header({ onOpenSettings, onOpenProfile }: HeaderProps) {
    const { user, isLoading, initialize, login, logout } = useAuthStore();
    const { currentProjectName, createNewProject } = useProjectStore();

    useEffect(() => {
        const unsubscribe = initialize();
        return unsubscribe;
    }, [initialize]);

    const handleNewProject = () => {
        if (currentProjectName) {
            if (window.confirm('Créer un nouveau projet ? Les modifications non sauvegardées seront perdues.')) {
                createNewProject();
            }
        } else {
            createNewProject();
        }
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="header-brand">
                    <div className="header-logo">
                        <Zap className="header-logo-icon" />
                    </div>
                    <div className="header-title-group">
                        <h1 className="header-title">SEO Domination</h1>
                        <span className="header-subtitle">Multi-Agent System</span>
                    </div>
                    {currentProjectName && (
                        <div className="header-project-indicator">
                            <span className="header-project-separator">|</span>
                            <span className="header-project-name">{currentProjectName}</span>
                        </div>
                    )}
                </div>

                <nav className="header-nav">
                    {user && (
                        <button className="header-new-btn" onClick={handleNewProject} title="Nouveau Projet">
                            <PlusCircle size={20} />
                            <span>Nouveau</span>
                        </button>
                    )}
                    {user && (
                        <button className="header-settings-btn" onClick={onOpenProfile}>
                            <FolderOpen size={20} />
                            <span>Mes Projets</span>
                        </button>
                    )}
                    <button className="header-settings-btn" onClick={onOpenSettings}>
                        <Settings size={20} />
                        <span>Configuration</span>
                    </button>

                    {user ? (
                        <div className="header-user">
                            {user.photoURL && (
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName || 'Avatar'}
                                    className="header-user-avatar"
                                />
                            )}
                            <span className="header-user-name">{user.displayName?.split(' ')[0]}</span>
                            <button
                                className="header-auth-btn logout"
                                onClick={logout}
                                disabled={isLoading}
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <button
                            className="header-auth-btn login"
                            onClick={login}
                            disabled={isLoading}
                        >
                            <LogIn size={18} />
                            <span>{isLoading ? 'Connexion...' : 'Connexion'}</span>
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
}

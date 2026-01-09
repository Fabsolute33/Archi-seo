import { useEffect } from 'react';
import { Zap, LogIn, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useProjectStore } from '../stores/useProjectStore';
import './Header.css';

interface HeaderProps {
    // No specific props needed for now if navigation is external
}

export function Header({ }: HeaderProps) {
    const { user, isLoading, initialize, login, logout } = useAuthStore();
    const { currentProjectName } = useProjectStore();

    useEffect(() => {
        const unsubscribe = initialize();
        return unsubscribe;
    }, [initialize]);

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
                    {/* Les boutons de navigation sont maintenant dans la Sidebar */}

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

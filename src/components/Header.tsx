import { Zap, Settings, FolderOpen } from 'lucide-react';
import './Header.css';

interface HeaderProps {
    onOpenSettings: () => void;
    onOpenProfile: () => void;
}

export function Header({ onOpenSettings, onOpenProfile }: HeaderProps) {
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
                </div>

                <nav className="header-nav">
                    <button className="header-settings-btn" onClick={onOpenProfile}>
                        <FolderOpen size={20} />
                        <span>Mes Projets</span>
                    </button>
                    <button className="header-settings-btn" onClick={onOpenSettings}>
                        <Settings size={20} />
                        <span>Configuration</span>
                    </button>
                </nav>
            </div>
        </header>
    );
}


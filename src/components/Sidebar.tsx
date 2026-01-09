import {
    Compass,
    Search,
    Table,
    FolderOpen,
    Settings,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Info
} from 'lucide-react';
import './Sidebar.css';

export type ViewType = 'strategy' | 'audit' | 'results' | 'projects' | 'settings';

interface SidebarProps {
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onOpenSettings: () => void;
    onOpenProjects: () => void;
    onOpenAbout: () => void;
}

export function Sidebar({
    currentView,
    onViewChange,
    isCollapsed,
    onToggleCollapse,
    onOpenSettings,
    onOpenProjects,
    onOpenAbout
}: SidebarProps) {

    const menuItems = [
        {
            id: 'strategy',
            label: 'Nouvelle Stratégie',
            icon: <Sparkles size={20} />,
            action: () => onViewChange('strategy')
        },
        {
            id: 'audit',
            label: 'Audit de Contenu',
            icon: <Search size={20} />,
            action: () => onViewChange('audit')
        },
        {
            id: 'results',
            label: 'Tableau de Résultats',
            icon: <Table size={20} />,
            action: () => onViewChange('results')
        },
        {
            id: 'projects',
            label: 'Mes Projets',
            icon: <FolderOpen size={20} />,
            action: onOpenProjects
        },
        {
            id: 'settings',
            label: 'Configuration',
            icon: <Settings size={20} />,
            action: onOpenSettings
        }
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <Compass className="logo-icon" size={24} />
                    {!isCollapsed && <span className="logo-text">SEO Architect</span>}
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                        onClick={item.action}
                        title={isCollapsed ? item.label : ''}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {!isCollapsed && <span className="nav-label">{item.label}</span>}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer-nav">
                <button
                    className="nav-item about-button"
                    onClick={onOpenAbout}
                    title={isCollapsed ? "À propos" : ''}
                >
                    <span className="nav-icon"><Info size={20} /></span>
                    {!isCollapsed && <span className="nav-label">À propos</span>}
                </button>
            </div>

            <button
                className="sidebar-toggle"
                onClick={onToggleCollapse}
                aria-label={isCollapsed ? "Agrandir le menu" : "Réduire le menu"}
            >
                {isCollapsed ? (
                    <ChevronRight size={20} />
                ) : (
                    <>
                        <ChevronLeft size={20} />
                        <span className="toggle-label">Réduire le menu</span>
                    </>
                )}
            </button>
        </aside>
    );
}

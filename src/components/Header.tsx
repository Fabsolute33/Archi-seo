import { useEffect, useState, useRef, useMemo } from 'react';
import { Zap, LogIn, LogOut, Plus, ChevronDown, FolderOpen } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useProjectStore } from '../stores/useProjectStore';
import './Header.css';

interface HeaderProps {
    // No specific props needed for now if navigation is external
}

// Responsive breakpoints for project count
const getMaxVisibleProjects = (): number => {
    if (typeof window === 'undefined') return 6;
    const width = window.innerWidth;
    if (width < 768) return 2;
    if (width < 1024) return 3;
    if (width < 1280) return 4;
    return 6;
};

export function Header({ }: HeaderProps) {
    const { user, isLoading, initialize, login, logout } = useAuthStore();
    const {
        projects,
        currentProjectId,
        loadProject,
        createNewProject,
        loadProjects
    } = useProjectStore();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [maxVisible, setMaxVisible] = useState(getMaxVisibleProjects());
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = initialize();
        return unsubscribe;
    }, [initialize]);

    // Load projects when user is authenticated
    useEffect(() => {
        if (user) {
            loadProjects();
        }
    }, [user, loadProjects]);

    // Responsive handler
    useEffect(() => {
        const handleResize = () => {
            setMaxVisible(getMaxVisibleProjects());
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculate visible and overflow projects
    const { visibleProjects, overflowProjects } = useMemo(() => {
        const visible = projects.slice(0, maxVisible);
        const overflow = projects.slice(maxVisible);
        return { visibleProjects: visible, overflowProjects: overflow };
    }, [projects, maxVisible]);

    const handleProjectClick = (projectId: string) => {
        loadProject(projectId);
        setDropdownOpen(false);
    };

    const handleCreateProject = () => {
        createNewProject();
        setDropdownOpen(false);
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
                </div>

                {/* Project Navigation */}
                {user && projects.length > 0 && (
                    <div className="header-projects">
                        <div className="header-projects-list">
                            {visibleProjects.map((project) => (
                                <button
                                    key={project.id}
                                    className={`header-project-tab ${project.id === currentProjectId ? 'active' : ''}`}
                                    onClick={() => handleProjectClick(project.id)}
                                    title={project.name || 'Projet sans nom'}
                                >
                                    <span className="header-project-tab-name">
                                        {project.name || 'Sans nom'}
                                    </span>
                                </button>
                            ))}

                            {/* Dropdown for overflow projects */}
                            {overflowProjects.length > 0 && (
                                <div className="header-projects-dropdown" ref={dropdownRef}>
                                    <button
                                        className="header-project-more"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                    >
                                        <span>+{overflowProjects.length}</span>
                                        <ChevronDown size={14} className={dropdownOpen ? 'rotated' : ''} />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="header-projects-dropdown-menu">
                                            {overflowProjects.map((project) => (
                                                <button
                                                    key={project.id}
                                                    className={`header-dropdown-item ${project.id === currentProjectId ? 'active' : ''}`}
                                                    onClick={() => handleProjectClick(project.id)}
                                                >
                                                    <FolderOpen size={14} />
                                                    <span>{project.name || 'Sans nom'}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* New project button */}
                        <button
                            className="header-project-new"
                            onClick={handleCreateProject}
                            title="Créer un nouveau projet"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                )}

                <nav className="header-nav">
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

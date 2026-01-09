import { useEffect } from 'react';
import { X, FolderOpen, Calendar, Layers, Trash2, ArrowRight } from 'lucide-react';
import { useProjectStore } from '../stores/useProjectStore';
import './ProfileModal.css';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const {
        projects,
        isLoading,
        error,
        currentProjectId,
        loadProjects,
        loadProject,
        deleteProject
    } = useProjectStore();

    useEffect(() => {
        if (isOpen) {
            loadProjects();
        }
    }, [isOpen, loadProjects]);

    if (!isOpen) return null;

    const handleLoadProject = async (id: string) => {
        await loadProject(id);
        onClose();
    };

    const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
            await deleteProject(id);
            // Recharger la liste des projets après suppression
            await loadProjects();
            // Si plus aucun projet, fermer le modal (retour à l'accueil)
            const updatedProjects = useProjectStore.getState().projects;
            if (updatedProjects.length === 0) {
                onClose();
            }
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="profile-modal-overlay" onClick={onClose}>
            <div className="profile-modal" onClick={e => e.stopPropagation()}>
                <div className="profile-modal-header">
                    <h2>
                        <FolderOpen className="icon" />
                        Mes Projets SEO
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="profile-modal-content">
                    {isLoading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Chargement des projets...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-state">
                            <p>⚠️ {error}</p>
                        </div>
                    )}

                    {!isLoading && !error && projects.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">📂</div>
                            <h3>Aucun projet sauvegardé</h3>
                            <p>Lancez une analyse SEO et sauvegardez-la pour la retrouver ici.</p>
                        </div>
                    )}

                    {!isLoading && !error && projects.length > 0 && (
                        <div className="projects-list">
                            {projects.map(project => (
                                <div
                                    key={project.id}
                                    className={`project-card ${project.id === currentProjectId ? 'current' : ''}`}
                                    onClick={() => handleLoadProject(project.id)}
                                >
                                    <div className="project-info">
                                        <div className="project-name">
                                            <FolderOpen size={18} className="folder-icon" />
                                            {project.name}
                                            {project.id === currentProjectId && (
                                                <span className="current-badge">Actuel</span>
                                            )}
                                        </div>
                                        <div className="project-meta">
                                            <span className="project-date">
                                                <Calendar size={14} />
                                                {formatDate(project.updatedAt)}
                                            </span>
                                            {project.clusterArchitecture && (
                                                <span className="project-clusters">
                                                    <Layers size={14} />
                                                    {project.clusterArchitecture.clusters.length} clusters
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="project-actions">
                                        <button
                                            className="action-btn load-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLoadProject(project.id);
                                            }}
                                        >
                                            <ArrowRight size={16} />
                                            Charger
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={(e) => handleDeleteProject(project.id, e)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { Save, Check, Loader2, AlertCircle, Clock } from 'lucide-react';
import './AutoSaveIndicator.css';

/**
 * Visual indicator component for auto-save status
 */
export const AutoSaveIndicator: React.FC = () => {
    const currentProjectId = useProjectStore((state) => state.currentProjectId);
    const autoSaveStatus = useProjectStore((state) => state.autoSaveStatus);
    const autoSaveEnabled = useProjectStore((state) => state.autoSaveEnabled);
    const lastAutoSave = useProjectStore((state) => state.lastAutoSave);
    const hasUnsavedChanges = useProjectStore((state) => state.hasUnsavedChanges);
    const setAutoSaveEnabled = useProjectStore((state) => state.setAutoSaveEnabled);

    // Only show when a project is loaded
    if (!currentProjectId) {
        return null;
    }

    const formatLastSave = (timestamp: number | null) => {
        if (!timestamp) return '';
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return 'à l\'instant';
        if (minutes === 1) return 'il y a 1 min';
        if (minutes < 60) return `il y a ${minutes} min`;

        const hours = Math.floor(minutes / 60);
        if (hours === 1) return 'il y a 1 heure';
        return `il y a ${hours} heures`;
    };

    const getStatusContent = () => {
        switch (autoSaveStatus) {
            case 'pending':
                return {
                    icon: <Clock size={14} />,
                    text: 'Modifications...',
                    className: 'pending'
                };
            case 'saving':
                return {
                    icon: <Loader2 size={14} className="animate-spin" />,
                    text: 'Sauvegarde...',
                    className: 'saving'
                };
            case 'saved':
                return {
                    icon: <Check size={14} />,
                    text: 'Sauvegardé',
                    className: 'saved'
                };
            case 'error':
                return {
                    icon: <AlertCircle size={14} />,
                    text: 'Erreur',
                    className: 'error'
                };
            default:
                if (hasUnsavedChanges) {
                    return {
                        icon: <Save size={14} />,
                        text: 'Non sauvegardé',
                        className: 'unsaved'
                    };
                }
                return {
                    icon: <Save size={14} />,
                    text: lastAutoSave ? formatLastSave(lastAutoSave) : 'Auto-save actif',
                    className: 'idle'
                };
        }
    };

    const status = getStatusContent();

    return (
        <div className={`auto-save-indicator ${status.className}`}>
            <div className="auto-save-content">
                {status.icon}
                <span className="auto-save-text">{status.text}</span>
            </div>
            <button
                className={`auto-save-toggle ${autoSaveEnabled ? 'active' : ''}`}
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                title={autoSaveEnabled ? 'Désactiver l\'auto-sauvegarde' : 'Activer l\'auto-sauvegarde'}
            >
                {autoSaveEnabled ? 'ON' : 'OFF'}
            </button>
        </div>
    );
};

export default AutoSaveIndicator;

import { X, Key, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAgentStore } from '../stores/useAgentStore';
import './SettingsModal.css';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { apiKey, setApiKey } = useAgentStore();
    const [inputKey, setInputKey] = useState(apiKey);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setInputKey(apiKey);
    }, [apiKey]);

    const handleSave = () => {
        setApiKey(inputKey);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="modal-header">
                    <div className="modal-icon">
                        <Key size={24} />
                    </div>
                    <h2>Configuration</h2>
                    <p>Configurez votre clé API Gemini pour utiliser l'application</p>
                </div>

                <div className="modal-body">
                    <div className="input-group">
                        <label className="input-label">Clé API Gemini</label>
                        <input
                            type="password"
                            value={inputKey}
                            onChange={e => setInputKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="input"
                        />
                        <p className="input-hint">
                            Obtenez votre clé sur{' '}
                            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                                Google AI Studio
                            </a>
                        </p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Annuler
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={!inputKey.trim()}
                    >
                        {saved ? (
                            <>✓ Sauvegardé</>
                        ) : (
                            <>
                                <Save size={18} />
                                Sauvegarder
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

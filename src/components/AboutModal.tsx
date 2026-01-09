// Removed unused React import
import { X } from 'lucide-react';
import './AboutModal.css';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content about-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="about-header">
                    <h2>À Propos du Système</h2>
                    <p className="subtitle">Workflow de collaboration Multi-Agents</p>
                </div>

                <div className="about-body">
                    <div className="workflow-diagram-container">
                        <img
                            src="/workflow-diagram.png"
                            alt="Workflow de collaboration"
                            className="workflow-diagram"
                        />
                    </div>

                    <div className="workflow-explanation">
                        <h3>Comment ça marche ?</h3>
                        <p>
                            Notre système utilise une architecture multi-agents sophistiquée pour automatiser et optimiser votre stratégie SEO :
                        </p>

                        <div className="steps-list">
                            <div className="step-item">
                                <span className="step-number">1</span>
                                <div className="step-content">
                                    <h4>Strategic Analyzer (Agent 1)</h4>
                                    <p>Analyse votre business et définit les axes stratégiques majeurs.</p>
                                </div>
                            </div>

                            <div className="step-item">
                                <span className="step-number">2</span>
                                <div className="step-content">
                                    <h4>Cluster Architect (Agent 2)</h4>
                                    <p>Structure vos contenus en clusters sémantiques cohérents.</p>
                                </div>
                            </div>

                            <div className="step-item">
                                <span className="step-number">3</span>
                                <div className="step-content">
                                    <h4>Exécution Parallèle (Agents 3-6)</h4>
                                    <p>Des agents spécialisés travaillent simultanément sur la recherche de mots-clés, l'architecture des silos, etc.</p>
                                </div>
                            </div>

                            <div className="step-item">
                                <span className="step-number">4</span>
                                <div className="step-content">
                                    <h4>Coordinator (Agent 7)</h4>
                                    <p>Assemble et vérifie la cohérence globale de la stratégie avant livraison.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * IDE Results Loader Component
 * 
 * Allows importing SEO analysis results from the IDE workflow outputs.
 */

import { useState } from 'react';
import { useAgentStore } from '../stores/useAgentStore';
import './IDEResultsLoader.css';

interface IDEOutput {
    strategic?: unknown;
    cluster?: unknown;
    content?: unknown;
    technical?: unknown;
    snippet?: unknown;
    authority?: unknown;
    sge?: unknown;
    competitor?: unknown;
    coordinator?: unknown;
    serp?: unknown;
    roi?: unknown;
}

export function IDEResultsLoader() {
    const [isDragging, setIsDragging] = useState(false);
    const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [importMessage, setImportMessage] = useState('');
    const { restoreFromProject } = useAgentStore();

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        await processFiles(files);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        await processFiles(files);
    };

    const processFiles = async (files: File[]) => {
        setImportStatus('loading');
        setImportMessage('Importation en cours...');

        try {
            const outputs: IDEOutput = {};

            for (const file of files) {
                const content = await file.text();
                const data = JSON.parse(content);

                // Detect file type by name
                if (file.name.includes('strategic')) {
                    outputs.strategic = data;
                } else if (file.name.includes('cluster')) {
                    outputs.cluster = data;
                } else if (file.name.includes('content')) {
                    outputs.content = data;
                } else if (file.name.includes('technical')) {
                    outputs.technical = data;
                } else if (file.name.includes('snippet')) {
                    outputs.snippet = data;
                } else if (file.name.includes('authority')) {
                    outputs.authority = data;
                } else if (file.name.includes('sge')) {
                    outputs.sge = data;
                } else if (file.name.includes('competitor')) {
                    outputs.competitor = data;
                } else if (file.name.includes('coordinator')) {
                    outputs.coordinator = data;
                } else if (file.name.includes('serp')) {
                    outputs.serp = data;
                } else if (file.name.includes('roi')) {
                    outputs.roi = data;
                }
            }

            const now = Date.now();

            // Create project data in the format expected by restoreFromProject
            const projectData = {
                id: `ide-import-${now}`,
                name: `Import IDE ${new Date().toLocaleDateString('fr-FR')}`,
                businessDescription: `Import depuis IDE le ${new Date().toLocaleDateString('fr-FR')}`,
                questionnaireAnswers: null,
                createdAt: now,
                updatedAt: now,
                strategicAnalysis: outputs.strategic,
                clusterArchitecture: outputs.cluster,
                contentDesign: outputs.content,
                technicalOptimization: outputs.technical,
                snippetStrategy: outputs.snippet,
                authorityStrategy: outputs.authority,
                competitorAnalysis: outputs.competitor,
                coordinatorSummary: outputs.coordinator,
            };

            // Import into store (cast through unknown for type compatibility)
            restoreFromProject(projectData as unknown as Parameters<typeof restoreFromProject>[0]);

            setImportStatus('success');
            setImportMessage(`${files.length} fichier(s) importé(s) avec succès! Allez dans "Tableau de Résultats" pour voir les données.`);

            // Reset after 5 seconds
            setTimeout(() => {
                setImportStatus('idle');
                setImportMessage('');
            }, 5000);

        } catch (error) {
            setImportStatus('error');
            setImportMessage(`Erreur: ${error instanceof Error ? error.message : 'Import échoué'}`);
        }
    };

    return (
        <div className="ide-results-loader">
            <div className="loader-header">
                <h2>📥 Importer depuis l'IDE</h2>
                <p>Glissez les fichiers JSON depuis <code>.agent/seo-architecte/outputs/</code></p>
            </div>

            <div
                className={`drop-zone ${isDragging ? 'dragging' : ''} ${importStatus}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {importStatus === 'idle' && (
                    <>
                        <div className="drop-icon">📁</div>
                        <p>Glissez vos fichiers ici</p>
                        <span>ou</span>
                        <label className="file-input-label">
                            Parcourir
                            <input
                                type="file"
                                multiple
                                accept=".json"
                                onChange={handleFileSelect}
                            />
                        </label>
                    </>
                )}

                {importStatus === 'loading' && (
                    <>
                        <div className="loading-spinner">⏳</div>
                        <p>{importMessage}</p>
                    </>
                )}

                {importStatus === 'success' && (
                    <>
                        <div className="success-icon">✅</div>
                        <p>{importMessage}</p>
                    </>
                )}

                {importStatus === 'error' && (
                    <>
                        <div className="error-icon">❌</div>
                        <p>{importMessage}</p>
                    </>
                )}
            </div>

            <div className="expected-files">
                <h4>Fichiers attendus:</h4>
                <ul>
                    <li>01-strategic-analysis.json</li>
                    <li>02-cluster-architecture.json</li>
                    <li>03-content-table.json</li>
                    <li>09-coordinator-summary.json</li>
                    <li>... (autres fichiers optionnels)</li>
                </ul>
            </div>
        </div>
    );
}

// ============================================
// INTÉGRATION DANS VOTRE APP D'AUDIT SEO
// Framework : React (adaptable à Vue/Angular)
// ============================================

import React, { useState } from 'react';
import { Loader2, Sparkles, TrendingUp, FileText, Download } from 'lucide-react';

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const NewsTransformer = ({ currentUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [formData, setFormData] = useState({
    url: currentUrl || '',
    secteur: '',
    expertise: '',
    motCle: '',
    typeContenu: [],
    audience: '',
    technicite: 'intermediaire',
    objectif: '',
    contraintes: '',
    articlesExistants: ''
  });

  // ============================================
  // APPEL À L'API ANTHROPIC
  // ============================================
  
  const generateAngles = async () => {
    setLoading(true);
    
    try {
      // Construire le prompt utilisateur
      const userPrompt = `
Transforme cet article en opportunités SEO :

**URL de l'article source :**
${formData.url}

**Mon secteur d'activité :**
${formData.secteur}

**Mon expertise principale :**
${formData.expertise}

**Mot-clé que je cible :**
${formData.motCle || 'Non spécifié'}

**Type de contenu souhaité :**
${formData.typeContenu.join(', ') || 'Article de blog informatif'}

**Audience cible :**
${formData.audience}

**Niveau de technicité attendu :**
${formData.technicite}

**Objectif principal :**
${formData.objectif || 'Générer du trafic organique'}

**Contraintes spécifiques :**
${formData.contraintes || 'Aucune'}

**Articles existants à lier :**
${formData.articlesExistants || 'Aucun'}
      `.trim();

      // Récupérer le contenu de l'URL via web_fetch
      const fetchResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: userPrompt
            }
          ],
          // Inclure le prompt système depuis votre artefact
          system: SYSTEM_PROMPT // Voir constante ci-dessous
        })
      });

      const data = await fetchResponse.json();
      
      // Extraire le texte de la réponse
      const responseText = data.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      setResults(responseText);
      
    } catch (error) {
      console.error('Erreur génération angles:', error);
      alert('Erreur lors de la génération. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // INTERFACE FORMULAIRE
  // ============================================

  return (
    <div className="news-transformer">
      
      {/* Bouton déclencheur */}
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-transform"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        🔥 Transformer cet article en opportunité SEO
      </button>

      {/* Modale */}
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            
            {/* Header */}
            <div className="modal-header">
              <h2>🎯 Transformation News → SEO</h2>
              <button onClick={() => setIsOpen(false)} className="btn-close">×</button>
            </div>

            {!results ? (
              // FORMULAIRE
              <div className="form-container">
                
                <div className="form-group">
                  <label>URL de l'article source *</label>
                  <input 
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://exemple.com/article"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Votre secteur d'activité *</label>
                  <input 
                    type="text"
                    value={formData.secteur}
                    onChange={(e) => setFormData({...formData, secteur: e.target.value})}
                    placeholder="ex: Plomberie d'urgence et détection de fuites"
                  />
                </div>

                <div className="form-group">
                  <label>Votre expertise principale *</label>
                  <input 
                    type="text"
                    value={formData.expertise}
                    onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                    placeholder="ex: Réparation de chaudières à condensation"
                  />
                </div>

                <div className="form-group">
                  <label>Mot-clé principal ciblé (optionnel)</label>
                  <input 
                    type="text"
                    value={formData.motCle}
                    onChange={(e) => setFormData({...formData, motCle: e.target.value})}
                    placeholder="ex: fuite eau urgence"
                  />
                </div>

                <div className="form-group">
                  <label>Type de contenu souhaité *</label>
                  <div className="checkbox-group">
                    {['Article de blog informatif', 'Page de service / conversion', 'Guide PDF téléchargeable', 'Outil interactif'].map(type => (
                      <label key={type}>
                        <input 
                          type="checkbox"
                          checked={formData.typeContenu.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({...formData, typeContenu: [...formData.typeContenu, type]});
                            } else {
                              setFormData({...formData, typeContenu: formData.typeContenu.filter(t => t !== type)});
                            }
                          }}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Audience cible *</label>
                  <input 
                    type="text"
                    value={formData.audience}
                    onChange={(e) => setFormData({...formData, audience: e.target.value})}
                    placeholder="ex: Propriétaires de maisons 35-60 ans"
                  />
                </div>

                <div className="form-group">
                  <label>Niveau de technicité</label>
                  <select 
                    value={formData.technicite}
                    onChange={(e) => setFormData({...formData, technicite: e.target.value})}
                  >
                    <option value="grand-public">Grand public</option>
                    <option value="intermediaire">Intermédiaire</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Contraintes spécifiques (optionnel)</label>
                  <textarea 
                    value={formData.contraintes}
                    onChange={(e) => setFormData({...formData, contraintes: e.target.value})}
                    placeholder="Budget, délai, ressources..."
                    rows={3}
                  />
                </div>

                <button 
                  onClick={generateAngles}
                  disabled={loading || !formData.secteur || !formData.expertise || !formData.audience}
                  className="btn-generate"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Générer les 5 angles SEO
                    </>
                  )}
                </button>

              </div>
            ) : (
              // RÉSULTATS
              <div className="results-container">
                
                <div className="results-header">
                  <h3>✨ Vos 5 angles d'exploitation</h3>
                  <div className="results-actions">
                    <button onClick={() => navigator.clipboard.writeText(results)}>
                      <FileText className="w-4 h-4" />
                      Copier
                    </button>
                    <button onClick={() => {
                      const blob = new Blob([results], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'angles-seo.md';
                      a.click();
                    }}>
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                  </div>
                </div>

                <div className="results-content">
                  <pre>{results}</pre>
                </div>

                <button 
                  onClick={() => {
                    setResults(null);
                    setFormData({
                      ...formData,
                      secteur: '',
                      expertise: '',
                      motCle: '',
                      typeContenu: [],
                      audience: '',
                      contraintes: ''
                    });
                  }}
                  className="btn-reset"
                >
                  ← Nouvelle analyse
                </button>

              </div>
            )}

          </div>
        </div>
      )}

      <style jsx>{`
        .news-transformer {
          margin-top: 20px;
        }

        .btn-transform {
          display: flex;
          align-items: center;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-transform:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 2px solid #f0f0f0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 24px;
          color: #1a202c;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 32px;
          cursor: pointer;
          color: #718096;
          line-height: 1;
        }

        .form-container {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2d3748;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          font-weight: normal;
          cursor: pointer;
        }

        .checkbox-group input[type="checkbox"] {
          width: auto;
          margin-right: 8px;
        }

        .btn-generate {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
        }

        .btn-generate:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .btn-generate:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .results-container {
          padding: 24px;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .results-actions {
          display: flex;
          gap: 10px;
        }

        .results-actions button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #f7fafc;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .results-actions button:hover {
          background: #edf2f7;
          border-color: #cbd5e0;
        }

        .results-content {
          background: #f7fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          max-height: 60vh;
          overflow-y: auto;
        }

        .results-content pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 13px;
          line-height: 1.6;
          color: #2d3748;
          margin: 0;
        }

        .btn-reset {
          margin-top: 20px;
          padding: 12px 24px;
          background: #718096;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-reset:hover {
          background: #4a5568;
        }
      `}</style>
    </div>
  );
};

// ============================================
// PROMPT SYSTÈME (à copier depuis l'artefact 1)
// ============================================

const SYSTEM_PROMPT = `
# PROMPT SYSTÈME - NEWS TO SEO TRANSFORMER

[Copier ici l'intégralité du contenu de l'artefact "Prompt Système - Transformation News SEO"]
`;

// ============================================
// EXPORT
// ============================================

export default NewsTransformer;

// ============================================
// UTILISATION DANS VOTRE APP
// ============================================

/*
import NewsTransformer from './components/NewsTransformer';

function AuditPage() {
  return (
    <div>
      <h1>Audit de Contenu SEO</h1>
      
      // ... votre audit existant ...
      
      <NewsTransformer currentUrl="https://enfuite.com/compteur-eau-tourne-sans-arret-urgence/" />
    </div>
  );
}
*/
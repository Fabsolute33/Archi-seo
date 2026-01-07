import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Building2, MapPin, TrendingUp, Target, Euro, Users, Globe, Zap, MessageSquare, FolderOpen } from 'lucide-react';
import './BusinessQuestionnaire.css';

export interface QuestionnaireAnswers {
    projectName: string;
    siteType: string;
    sector: string;
    location: string;
    domainAuthority: string;
    budget: string;
    teamSize: string;
    mainGoal: string;
    targetKeyword: string;
    constraints: string;
}

interface Question {
    id: keyof QuestionnaireAnswers;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    type: 'select' | 'text' | 'textarea';
    options?: { value: string; label: string; emoji?: string }[];
    placeholder?: string;
    required: boolean;
}

const QUESTIONS: Question[] = [
    {
        id: 'projectName',
        icon: <FolderOpen size={24} />,
        title: 'Donnez un nom à votre projet',
        subtitle: 'Ce nom vous permettra de retrouver votre analyse plus tard',
        type: 'text',
        placeholder: 'Ex: SEO E-commerce 2026, Refonte Mon Site...',
        required: true,
    },
    {
        id: 'siteType',
        icon: <Globe size={24} />,
        title: 'Quel type de site avez-vous ?',
        subtitle: 'Cela influence les possibilités techniques et la stratégie SEO',
        type: 'select',
        options: [
            { value: 'wordpress', label: 'WordPress', emoji: '📦' },
            { value: 'shopify', label: 'Shopify', emoji: '🛒' },
            { value: 'wix', label: 'Wix / Squarespace', emoji: '🎨' },
            { value: 'custom', label: 'Custom / Sur-mesure', emoji: '⚙️' },
            { value: 'new', label: 'Site à créer', emoji: '🆕' },
        ],
        required: true,
    },
    {
        id: 'sector',
        icon: <Building2 size={24} />,
        title: 'Quel est votre secteur d\'activité ?',
        subtitle: 'Soyez précis : "Plomberie urgence" plutôt que "BTP"',
        type: 'text',
        placeholder: 'Ex: E-commerce thé bio, SaaS RH, Plomberie...',
        required: true,
    },
    {
        id: 'location',
        icon: <MapPin size={24} />,
        title: 'Quelle est votre zone géographique cible ?',
        subtitle: 'Local, national ou international ?',
        type: 'text',
        placeholder: 'Ex: Lyon, France entière, Europe...',
        required: true,
    },
    {
        id: 'domainAuthority',
        icon: <TrendingUp size={24} />,
        title: 'Quelle est l\'autorité de votre domaine (DA) ?',
        subtitle: 'Vérifiable sur Moz, Ahrefs ou Semrush',
        type: 'select',
        options: [
            { value: 'under10', label: 'DA < 10 (nouveau site)', emoji: '🌱' },
            { value: '10-30', label: 'DA 10-30 (émergent)', emoji: '📈' },
            { value: '30-50', label: 'DA 30-50 (établi)', emoji: '💪' },
            { value: 'over50', label: 'DA > 50 (leader)', emoji: '🏆' },
            { value: 'unknown', label: 'Je ne sais pas', emoji: '❓' },
        ],
        required: true,
    },
    {
        id: 'budget',
        icon: <Euro size={24} />,
        title: 'Quel est votre budget SEO mensuel ?',
        subtitle: 'Cela détermine l\'ampleur des actions recommandées',
        type: 'select',
        options: [
            { value: 'under500', label: '< 500€/mois', emoji: '💰' },
            { value: '500-1500', label: '500€ - 1 500€/mois', emoji: '💰💰' },
            { value: '1500-3000', label: '1 500€ - 3 000€/mois', emoji: '💰💰💰' },
            { value: 'over3000', label: '> 3 000€/mois', emoji: '🚀' },
            { value: 'undefined', label: 'Non défini', emoji: '🤷' },
        ],
        required: true,
    },
    {
        id: 'teamSize',
        icon: <Users size={24} />,
        title: 'Quelle est la taille de votre équipe ?',
        subtitle: 'Pour adapter les ressources nécessaires',
        type: 'select',
        options: [
            { value: 'solo', label: 'Indépendant / Solo', emoji: '👤' },
            { value: '2-5', label: '2-5 personnes', emoji: '👥' },
            { value: '6-20', label: '6-20 personnes', emoji: '🏢' },
            { value: 'over20', label: '> 20 personnes', emoji: '🏛️' },
        ],
        required: true,
    },
    {
        id: 'mainGoal',
        icon: <Target size={24} />,
        title: 'Quel est votre objectif SEO principal ?',
        subtitle: 'Concentrons-nous sur ce qui compte le plus',
        type: 'select',
        options: [
            { value: 'leads', label: 'Générer plus de leads', emoji: '📞' },
            { value: 'sales', label: 'Augmenter les ventes', emoji: '💳' },
            { value: 'traffic', label: 'Trafic qualifié', emoji: '📊' },
            { value: 'visibility', label: 'Notoriété / Visibilité', emoji: '👁️' },
            { value: 'position1', label: 'Position 1 sur mot-clé', emoji: '🥇' },
        ],
        required: true,
    },
    {
        id: 'targetKeyword',
        icon: <Zap size={24} />,
        title: 'Quel mot-clé cible principal ?',
        subtitle: 'Optionnel mais très utile pour l\'analyse',
        type: 'text',
        placeholder: 'Ex: plombier urgence lyon, logiciel gestion RH...',
        required: false,
    },
    {
        id: 'constraints',
        icon: <MessageSquare size={24} />,
        title: 'Contraintes ou informations complémentaires ?',
        subtitle: 'Concurrents à battre, limites techniques, délais...',
        type: 'textarea',
        placeholder: 'Ex: Concurrent principal: exemple.com, Délai: résultats sous 3 mois, Budget limité sur le netlinking...',
        required: false,
    },
];

interface Props {
    onComplete: (answers: QuestionnaireAnswers) => void;
    disabled?: boolean;
}

export function BusinessQuestionnaire({ onComplete, disabled = false }: Props) {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<QuestionnaireAnswers>({
        projectName: '',
        siteType: '',
        sector: '',
        location: '',
        domainAuthority: '',
        budget: '',
        teamSize: '',
        mainGoal: '',
        targetKeyword: '',
        constraints: '',
    });
    const [showSummary, setShowSummary] = useState(false);

    const currentQuestion = QUESTIONS[currentStep];
    const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

    const handleAnswer = (value: string) => {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    };

    const canProceed = () => {
        if (!currentQuestion.required) return true;
        return answers[currentQuestion.id].trim() !== '';
    };

    const handleNext = () => {
        if (currentStep < QUESTIONS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setShowSummary(true);
        }
    };

    const handlePrevious = () => {
        if (showSummary) {
            setShowSummary(false);
        } else if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = () => {
        onComplete(answers);
    };

    const formatAnswerForDisplay = (questionId: keyof QuestionnaireAnswers, value: string) => {
        const question = QUESTIONS.find(q => q.id === questionId);
        if (question?.type === 'select' && question.options) {
            const option = question.options.find(o => o.value === value);
            return option ? `${option.emoji || ''} ${option.label}` : value;
        }
        return value || '—';
    };

    if (showSummary) {
        return (
            <div className="questionnaire-container">
                <div className="questionnaire-summary">
                    <div className="summary-header">
                        <Check size={32} className="summary-icon" />
                        <h3>Récapitulatif de votre projet</h3>
                        <p>Vérifiez vos informations avant de lancer l'analyse</p>
                    </div>
                    <div className="summary-grid">
                        {QUESTIONS.map(q => (
                            <div key={q.id} className="summary-item">
                                <span className="summary-label">{q.title.replace(' ?', '')}</span>
                                <span className="summary-value">
                                    {formatAnswerForDisplay(q.id, answers[q.id])}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="questionnaire-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handlePrevious}
                            disabled={disabled}
                        >
                            <ChevronLeft size={18} />
                            Modifier
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary btn-lg"
                            onClick={handleSubmit}
                            disabled={disabled}
                        >
                            {disabled ? (
                                <>
                                    <span className="spinner" />
                                    Analyse en cours...
                                </>
                            ) : (
                                <>
                                    <Zap size={20} />
                                    Lancer l'analyse SEO
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="questionnaire-container">
            {/* Progress Bar */}
            <div className="questionnaire-progress">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="progress-text">{currentStep + 1} / {QUESTIONS.length}</span>
            </div>

            {/* Question Card */}
            <div className="question-card" key={currentStep}>
                <div className="question-icon">{currentQuestion.icon}</div>
                <h3 className="question-title">{currentQuestion.title}</h3>
                <p className="question-subtitle">{currentQuestion.subtitle}</p>

                <div className="question-input">
                    {currentQuestion.type === 'select' && currentQuestion.options && (
                        <div className="options-grid">
                            {currentQuestion.options.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`option-btn ${answers[currentQuestion.id] === option.value ? 'selected' : ''}`}
                                    onClick={() => handleAnswer(option.value)}
                                    disabled={disabled}
                                >
                                    {option.emoji && <span className="option-emoji">{option.emoji}</span>}
                                    <span className="option-label">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {currentQuestion.type === 'text' && (
                        <input
                            type="text"
                            className="question-text-input"
                            value={answers[currentQuestion.id]}
                            onChange={(e) => handleAnswer(e.target.value)}
                            placeholder={currentQuestion.placeholder}
                            disabled={disabled}
                            onKeyDown={(e) => e.key === 'Enter' && canProceed() && handleNext()}
                        />
                    )}

                    {currentQuestion.type === 'textarea' && (
                        <textarea
                            className="question-textarea"
                            value={answers[currentQuestion.id]}
                            onChange={(e) => handleAnswer(e.target.value)}
                            placeholder={currentQuestion.placeholder}
                            disabled={disabled}
                            rows={3}
                        />
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="questionnaire-actions">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handlePrevious}
                    disabled={currentStep === 0 || disabled}
                >
                    <ChevronLeft size={18} />
                    Précédent
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNext}
                    disabled={!canProceed() || disabled}
                >
                    {currentStep === QUESTIONS.length - 1 ? 'Voir le récap' : 'Suivant'}
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Step Indicators */}
            <div className="step-indicators">
                {QUESTIONS.map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        className={`step-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                        onClick={() => !disabled && setCurrentStep(index)}
                        disabled={disabled}
                        aria-label={`Question ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

export function formatAnswersForAgent(answers: QuestionnaireAnswers): string {
    const siteTypeLabels: Record<string, string> = {
        wordpress: 'WordPress',
        shopify: 'Shopify',
        wix: 'Wix/Squarespace',
        custom: 'Site sur-mesure',
        new: 'Site à créer',
    };

    const daLabels: Record<string, string> = {
        under10: 'DA < 10 (nouveau)',
        '10-30': 'DA 10-30 (émergent)',
        '30-50': 'DA 30-50 (établi)',
        over50: 'DA > 50 (leader)',
        unknown: 'DA inconnu',
    };

    const budgetLabels: Record<string, string> = {
        under500: '< 500€/mois',
        '500-1500': '500-1500€/mois',
        '1500-3000': '1500-3000€/mois',
        over3000: '> 3000€/mois',
        undefined: 'Budget non défini',
    };

    const teamLabels: Record<string, string> = {
        solo: 'Indépendant',
        '2-5': '2-5 personnes',
        '6-20': '6-20 personnes',
        over20: '> 20 personnes',
    };

    const goalLabels: Record<string, string> = {
        leads: 'Générer plus de leads',
        sales: 'Augmenter les ventes',
        traffic: 'Trafic qualifié',
        visibility: 'Notoriété/Visibilité',
        position1: 'Position 1 sur mot-clé cible',
    };

    let description = `**CONTEXTE BUSINESS**
- Type de site: ${siteTypeLabels[answers.siteType] || answers.siteType}
- Secteur: ${answers.sector}
- Zone géographique: ${answers.location}
- Autorité du domaine: ${daLabels[answers.domainAuthority] || answers.domainAuthority}
- Budget SEO: ${budgetLabels[answers.budget] || answers.budget}
- Taille équipe: ${teamLabels[answers.teamSize] || answers.teamSize}
- Objectif principal: ${goalLabels[answers.mainGoal] || answers.mainGoal}`;

    if (answers.targetKeyword) {
        description += `\n- Mot-clé cible: ${answers.targetKeyword}`;
    }

    if (answers.constraints) {
        description += `\n\n**CONTRAINTES/INFORMATIONS COMPLÉMENTAIRES**\n${answers.constraints}`;
    }

    return description;
}

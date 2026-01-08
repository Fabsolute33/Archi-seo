import { useState, useEffect } from 'react';
import { Save, Check, Loader2 } from 'lucide-react';
import { useProjectStore } from '../stores/useProjectStore';
import './FloatingSaveButton.css';

export function FloatingSaveButton() {
    const { saveCurrentProject, currentProjectName, isLoading: isSaving } = useProjectStore();
    const [isVisible, setIsVisible] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Show button when scrolled down and there's a project to save
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsVisible(scrollY > 200 && !!currentProjectName);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial state

        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentProjectName]);

    const handleSave = async () => {
        await saveCurrentProject();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    if (!isVisible) return null;

    return (
        <button
            className={`floating-save-button ${showSuccess ? 'success' : ''}`}
            onClick={handleSave}
            disabled={isSaving}
            title={`Sauvegarder "${currentProjectName}"`}
        >
            {isSaving ? (
                <Loader2 className="spinning" size={24} />
            ) : showSuccess ? (
                <Check size={24} />
            ) : (
                <Save size={24} />
            )}
        </button>
    );
}

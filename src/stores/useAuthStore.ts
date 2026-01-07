import { create } from 'zustand';
import { User } from 'firebase/auth';
import { signInWithGoogle, signOut, onAuthStateChange } from '../services/AuthService';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;
    initialize: () => () => void;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,
    error: null,
    isInitialized: false,

    initialize: () => {
        set({ isLoading: true });
        const unsubscribe = onAuthStateChange((user) => {
            set({ user, isLoading: false, isInitialized: true });
        });
        return unsubscribe;
    },

    login: async () => {
        set({ isLoading: true, error: null });
        try {
            await signInWithGoogle();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
            set({ error: errorMessage, isLoading: false });
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await signOut();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur de déconnexion';
            set({ error: errorMessage, isLoading: false });
        }
    }
}));

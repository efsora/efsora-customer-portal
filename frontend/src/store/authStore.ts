import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth user data from JWT token or API response
 */
export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Auth store state and actions
 */
export interface AuthState {
    // State
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;

    // Actions
    setAuth: (user: AuthUser, token: string) => void;
    setUser: (user: AuthUser) => void;
    setToken: (token: string) => void;
    clearAuth: () => void;

    // Computed
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
}

/**
 * Zustand auth store with persistence
 * Stores user data and JWT token in localStorage
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            setAuth: (user: AuthUser, token: string) => {
                set({
                    user,
                    token,
                    isAuthenticated: true,
                });
            },

            setUser: (user: AuthUser) => {
                set({ user });
            },

            setToken: (token: string) => {
                set({ token, isAuthenticated: true });
            },

            clearAuth: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            },

            setIsLoading: (isLoading: boolean) => {
                set({ isLoading });
            },
        }),
        {
            name: 'auth-store', // Key in localStorage
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }), // Only persist these fields
        },
    ),
);

/**
 * Convenience hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated;
};

/**
 * Convenience hook to get current user
 */
export const useCurrentUser = () => {
    const { user } = useAuthStore();
    return user;
};

/**
 * Convenience hook to get auth token
 */
export const useAuthToken = () => {
    const { token } = useAuthStore();
    return token;
};

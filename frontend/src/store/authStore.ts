import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth user data from API response
 */
export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    surname: string | null;
    createdAt: string;
    updatedAt: string;
    projectId: number | null;
    companyId: number | null;
}

/**
 * Auth store state and actions
 *
 * Note: JWT token is now stored in httpOnly cookie (not accessible from JS).
 * Only user data is stored in this store.
 */
export interface AuthState {
    // State
    user: AuthUser | null;

    // Actions
    setUser: (user: AuthUser) => void;
    clearAuth: () => void;

    // Loading state
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
}

/**
 * Zustand auth store with persistence
 * Stores user data in localStorage (token is in httpOnly cookie)
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isLoading: false,

            setUser: (user: AuthUser) => {
                set({ user });
            },

            clearAuth: () => {
                set({ user: null });
            },

            setIsLoading: (isLoading: boolean) => {
                set({ isLoading });
            },
        }),
        {
            name: 'auth-store', // Key in localStorage
            partialize: (state) => ({
                user: state.user,
                // Token is in httpOnly cookie, not stored here
            }),
        },
    ),
);

/**
 * Convenience hook to check if user is authenticated
 * Returns true if user data exists in store
 *
 * Note: Token validity is now managed by httpOnly cookie expiration
 * and backend session validation
 */
export const useIsAuthenticated = () => {
    const user = useAuthStore((state) => state.user);
    return user !== null;
};

/**
 * Convenience hook to get current user
 */
export const useCurrentUser = () => {
    return useAuthStore((state) => state.user);
};

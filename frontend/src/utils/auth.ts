/**
 * Get the authentication token from localStorage
 * Reads from the Zustand auth-store persisted state
 *
 * @returns The JWT token string if available, null otherwise
 */
export const getAuthToken = (): string | null => {
    const authStore = localStorage.getItem('auth-store');
    if (!authStore) {
        return null;
    }

    try {
        const parsed = JSON.parse(authStore);
        return parsed.state?.token ?? null;
    } catch {
        return null;
    }
};

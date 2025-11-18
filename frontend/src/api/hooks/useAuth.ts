import { useMutation } from '@tanstack/react-query';

import {
    login as loginApi,
    logout as logoutApi,
    register as registerApi,
} from '#api/methods/auth.api';
import type {
    LoginRequest,
    RegisterRequest,
} from '#api/types/auth/request.types';
import { useAuthStore } from '#store/authStore';

/**
 * Hook for user registration
 * Handles register mutation and updates auth store on success
 */
export const useRegister = () => {
    const { setAuth } = useAuthStore();

    return useMutation({
        mutationFn: async (data: RegisterRequest) => {
            const response = await registerApi(data);
            if (!response.success) {
                throw new Error(response.message || 'Registration failed');
            }
            return response.data;
        },
        onSuccess: (data) => {
            if (data && data.token && data.user) {
                setAuth(
                    {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.name || null,
                        surname: data.user.surname || null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                    data.token,
                );
            }
        },
    });
};

/**
 * Hook for user login
 * Handles login mutation and updates auth store on success
 */
export const useLogin = () => {
    const { setAuth } = useAuthStore();

    return useMutation({
        mutationFn: async (data: LoginRequest) => {
            const response = await loginApi(data);
            if (!response.success) {
                throw new Error(response.message || 'Login failed');
            }
            return response.data;
        },
        onSuccess: (data) => {
            if (data && data.token && data.user) {
                setAuth(
                    {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.name || null,
                        surname: data.user.surname || null,
                        createdAt: data.user.createdAt || '',
                        updatedAt: data.user.updatedAt || '',
                    },
                    data.token,
                );
            }
        },
    });
};

/**
 * Hook for user logout
 * Calls backend logout endpoint to invalidate session, then clears auth state
 * Always clears local auth state even if backend call fails (token may be invalid)
 */
export const useLogout = () => {
    const { clearAuth } = useAuthStore();

    return useMutation({
        mutationFn: async () => {
            const response = await logoutApi();
            if (!response.success) {
                throw new Error(response.message || 'Logout failed');
            }
            return response.data;
        },
        onSuccess: () => {
            clearAuth();
        },
        onError: () => {
            // Always clear auth state even if backend logout fails
            // The token may be invalid, so we should logout on client side
            clearAuth();
        },
    });
};

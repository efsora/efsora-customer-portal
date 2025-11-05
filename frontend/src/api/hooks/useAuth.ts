import { useMutation } from '@tanstack/react-query';

import {
    register as registerApi,
    login as loginApi,
} from '#api/methods/auth.api';
import type {
    RegisterRequest,
    LoginRequest,
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
            if (data && data.token) {
                setAuth(
                    {
                        id: data.id,
                        email: data.email,
                        name: data.name || null,
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
 * Clears auth state
 */
export const useLogout = () => {
    const { clearAuth } = useAuthStore();

    return () => {
        clearAuth();
    };
};

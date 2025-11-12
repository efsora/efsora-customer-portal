import axiosPackage from 'axios';

import { API_URL } from '#config/env';
import { useAuthStore } from '#store/authStore';

export const axios = axiosPackage.create({
    withCredentials: true,
    baseURL: API_URL,
});

/**
 * Request interceptor: Attach JWT token to Authorization header
 * Called before every request
 */
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth-store')
        ? JSON.parse(localStorage.getItem('auth-store') || '{}').state?.token
        : null;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

/**
 * Response interceptor: Handle 401 errors (unauthorized)
 * Called after every response
 *
 * 401 can occur when:
 * 1. Backend session was deleted (logout called on another tab/device)
 * 2. JWT token has expired
 * 3. Token signature is invalid
 * 4. Session record not found in database
 */
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth store via Zustand (updates localStorage via persist middleware)
            useAuthStore.getState().clearAuth();
            // Redirect to login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

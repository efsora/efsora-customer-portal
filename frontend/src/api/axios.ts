import axiosPackage from 'axios';

import { API_URL } from '#config/env';
import { useAuthStore } from '#store/authStore';

export const axios = axiosPackage.create({
    withCredentials: true, // IMPORTANT: Sends httpOnly cookies automatically
    baseURL: API_URL,
});

// Note: No Authorization header interceptor needed
// JWT token is sent automatically via httpOnly cookie (withCredentials: true)

/**
 * Response interceptor: Handle 401 errors (unauthorized)
 * Called after every response
 *
 * 401 can occur when:
 * 1. Backend session was deleted (logout called on another tab/device)
 * 2. Cookie has expired
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

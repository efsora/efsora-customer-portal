import axiosPackage from 'axios';

import { API_URL } from '#config/env';

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
 */
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        // If 401 Unauthorized, clear auth and redirect to login
        if (error.response?.status === 401) {
            // Clear auth store
            localStorage.removeItem('auth-store');
            // Redirect to login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

// API v1 Endpoints
export const ENDPOINTS = {
    HELLO: {
        GET: '/api/v1/hello',
    },
    AUTH: {
        REGISTER: '/api/v1/auth/register',
        LOGIN: '/api/v1/auth/login',
    },
    USERS: {
        GET_BY_ID: (userId: string) => `/api/v1/users/${userId}`,
        GET_ALL: '/api/v1/users',
    },
};

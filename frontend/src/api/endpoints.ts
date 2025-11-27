// API v1 Endpoints
export const ENDPOINTS = {
    HELLO: {
        GET: '/api/v1/hello',
    },
    AUTH: {
        REGISTER: '/api/v1/auth/register',
        LOGIN: '/api/v1/auth/login',
        LOGOUT: '/api/v1/auth/logout',
    },
    USERS: {
        GET_BY_ID: (userId: string) => `/api/v1/users/${userId}`,
        GET_ALL: '/api/v1/users',
    },
    CHAT: {
        STREAM: '/api/v1/chat/stream',
        HISTORY: (sessionId: string) =>
            `/api/v1/chat/sessions/${sessionId}/messages`,
    },
    UPLOADS: {
        GET_UPLOAD_URL: '/api/v1/documents/get-upload-url',
    },
    DOCUMENTS: {
        LIST: '/api/v1/documents',
        EMBED: '/api/v1/documents/embed',
    },
};

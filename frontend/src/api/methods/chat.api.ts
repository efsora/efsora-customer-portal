import * as api from '#api/api';
import { ENDPOINTS } from '#api/endpoints';
import { API_URL } from '#config/env';
import { getAuthToken } from '#utils/auth';

import type {
    ChatStreamRequest,
    GetChatHistoryParams,
} from '../types/chat/request.types';
import type { ChatHistoryResponse } from '../types/chat/response.types';

/**
 * Stream chat response via SSE
 * Uses native fetch API for SSE support (axios doesn't handle streams well)
 */
export async function* streamChat(
    request: ChatStreamRequest,
): AsyncGenerator<string, void, unknown> {
    const token = getAuthToken();

    const response = await fetch(`${API_URL}${ENDPOINTS.CHAT.STREAM}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Unauthorized: Please login again');
        }
        if (response.status === 403) {
            throw new Error('Forbidden: Access denied');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
        throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
        let buffer = '';

        // Read stream chunks
        while (true) {
            const result = await reader.read();

            if (result.done) {
                break;
            }

            // Decode chunk and add to buffer
            const chunk = decoder.decode(result.value, { stream: true });
            buffer += chunk;

            // Process complete SSE messages
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6); // Remove 'data: ' prefix
                    yield data;
                }
            }
        }

        // Process any remaining data in buffer
        if (buffer.trim() && buffer.startsWith('data: ')) {
            const data = buffer.slice(6);
            yield data;
        }
    } finally {
        reader.releaseLock();
    }
}

/**
 * Get chat history for a session
 */
export const getChatHistory = async (
    params: GetChatHistoryParams,
): Promise<ChatHistoryResponse> => {
    const response = await api.get<ChatHistoryResponse>(
        ENDPOINTS.CHAT.HISTORY(params.sessionId),
    );

    if (response.status === 401) {
        throw new Error('Unauthorized: Please login again');
    }

    if (response.status === 403) {
        throw new Error('Forbidden: Access denied');
    }

    if (response.status === 404) {
        // Return empty messages for non-existent sessions
        return { messages: [] };
    }

    if (response.status !== 200) {
        throw new Error(
            `HTTP ${response.status}: Failed to fetch chat history`,
        );
    }

    return response.data;
};

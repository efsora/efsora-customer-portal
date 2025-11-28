import * as api from '#api/api';
import { ENDPOINTS } from '#api/endpoints';
import { API_URL } from '#config/env';
import { getAuthToken } from '#utils/auth';

import type {
    EmbedDocumentRequest,
    EmbedProgressEvent,
} from '../types/documents/embed.types';
import type { ListDocumentsRequest } from '../types/documents/request.types';
import type { AppResponse_AllDocumentsResponse_ } from '../types/documents/response.types';

/**
 * List documents from S3 for a given company and project
 */
export const listDocuments = async (
    request: ListDocumentsRequest,
): Promise<AppResponse_AllDocumentsResponse_> => {
    const response = await api.get<AppResponse_AllDocumentsResponse_>(
        ENDPOINTS.DOCUMENTS.LIST,
        {
            companyId: request.companyId,
            projectId: request.projectId,
        },
    );

    if (response?.status === 400) {
        throw new Error('Invalid request parameters');
    }

    if (response?.status > 300) {
        throw new Error(`HTTP ${response?.status}: Failed to list documents`);
    }

    return response?.data as AppResponse_AllDocumentsResponse_;
};

/**
 * Stream document embedding progress via SSE
 * Uses native fetch API for SSE support (axios doesn't handle streams well)
 */
export async function* streamEmbedDocument(
    request: EmbedDocumentRequest,
): AsyncGenerator<EmbedProgressEvent, void, unknown> {
    const token = getAuthToken();

    const response = await fetch(`${API_URL}${ENDPOINTS.DOCUMENTS.EMBED}`, {
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
                    try {
                        const event = JSON.parse(data) as EmbedProgressEvent;
                        yield event;
                    } catch {
                        // Skip non-JSON data lines
                        continue;
                    }
                }
            }
        }

        // Process any remaining data in buffer
        if (buffer.trim() && buffer.startsWith('data: ')) {
            const data = buffer.slice(6);
            try {
                const event = JSON.parse(data) as EmbedProgressEvent;
                yield event;
            } catch {
                // Skip non-JSON data
            }
        }
    } finally {
        reader.releaseLock();
    }
}

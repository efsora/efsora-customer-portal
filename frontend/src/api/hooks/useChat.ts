import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import {
    streamChat as streamChatApi,
    getChatHistory as getChatHistoryApi,
} from '#api/methods/chat.api';
import type { ChatMessage } from '#api/types/chat/response.types';

// Maximum retry attempts for streaming
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

interface UseChatOptions {
    sessionId?: string;
    onError?: (error: Error) => void;
}

interface UseChatReturn {
    messages: ChatMessage[];
    isStreaming: boolean;
    isLoadingHistory: boolean;
    sessionId: string;
    sendMessage: (message: string) => Promise<void>;
    clearSession: () => void;
    error: Error | null;
}

/**
 * Hook for managing chat interactions with retry logic
 * - Generates or reuses session ID
 * - Loads chat history on mount
 * - Streams messages from backend with retry
 * - Handles errors gracefully
 */
const CHAT_SESSION_KEY = 'efsora_chat_session_id';

export const useChat = (options: UseChatOptions = {}): UseChatReturn => {
    const { sessionId: providedSessionId, onError } = options;

    // Session management with localStorage persistence
    const [sessionId] = useState<string>(() => {
        // Priority: provided > localStorage > new
        if (providedSessionId) {
            localStorage.setItem(CHAT_SESSION_KEY, providedSessionId);
            return providedSessionId;
        }

        const stored = localStorage.getItem(CHAT_SESSION_KEY);
        if (stored) {
            return stored;
        }

        const newId = uuidv4();
        localStorage.setItem(CHAT_SESSION_KEY, newId);
        return newId;
    });

    // State
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Track the current streaming message being built
    const streamingMessageRef = useRef<string>('');

    // Load chat history on mount
    const { isLoading: isLoadingHistory } = useQuery({
        queryKey: ['chat-history', sessionId],
        queryFn: async () => {
            try {
                const response = await getChatHistoryApi({ sessionId });
                setMessages(response.messages || []);
                return response;
            } catch (err) {
                const error =
                    err instanceof Error
                        ? err
                        : new Error('Failed to load chat history');
                setError(error);
                onError?.(error);
                throw error;
            }
        },
        retry: 2,
        retryDelay: RETRY_DELAY_MS,
    });

    /**
     * Send a message and stream the response
     * Includes retry logic for transient failures
     */
    const sendMessage = useCallback(
        async (content: string, retryCount = 0): Promise<void> => {
            if (isStreaming) {
                return;
            }

            setIsStreaming(true);
            setError(null);
            streamingMessageRef.current = '';

            // Remove any previous error messages before sending new message
            setMessages((prev) =>
                prev.filter((msg) => !msg.content?.startsWith('Error:')),
            );

            // Add user message
            const userMessage: ChatMessage = {
                id: uuidv4(),
                role: 'user',
                content,
                createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, userMessage]);

            // Create placeholder for assistant message
            const assistantMessageId = uuidv4();
            const assistantMessage: ChatMessage = {
                id: assistantMessageId,
                role: 'assistant',
                content: '',
                createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMessage]);

            try {
                // Stream response
                const stream = streamChatApi({
                    message: content,
                    sessionId,
                });

                for await (const chunk of stream) {
                    // Check for error messages from backend
                    if (chunk.startsWith('[Error]')) {
                        throw new Error(chunk);
                    }

                    streamingMessageRef.current += chunk;

                    // Update assistant message with accumulated content
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === assistantMessageId
                                ? {
                                      ...msg,
                                      content: streamingMessageRef.current,
                                  }
                                : msg,
                        ),
                    );
                }

                setIsStreaming(false);
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'Failed to send message';
                const error = new Error(errorMessage);

                // Retry logic for network errors and 5xx errors
                const isRetryable =
                    errorMessage.includes('Failed to fetch') ||
                    errorMessage.includes('Network') ||
                    errorMessage.includes('HTTP 5');

                if (isRetryable && retryCount < MAX_RETRIES) {
                    console.warn(
                        `Chat stream failed, retrying (${retryCount + 1}/${MAX_RETRIES})...`,
                        error,
                    );

                    // Show retrying message
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === assistantMessageId
                                ? {
                                      ...msg,
                                      content: `Retrying... (${retryCount + 1}/${MAX_RETRIES})`,
                                  }
                                : msg,
                        ),
                    );

                    // Wait before retrying
                    await new Promise((resolve) =>
                        setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)),
                    );

                    // Clear retry message and reset streaming message
                    streamingMessageRef.current = '';
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === assistantMessageId
                                ? { ...msg, content: '' }
                                : msg,
                        ),
                    );

                    // Retry
                    return sendMessage(content, retryCount + 1);
                }

                // Final error - show standardized error message
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === assistantMessageId
                            ? {
                                  ...msg,
                                  content:
                                      'Error: Unable to get a response. Please try sending your message again.',
                              }
                            : msg,
                    ),
                );

                setError(error);
                onError?.(error);
                setIsStreaming(false);
            }
        },
        [isStreaming, sessionId, onError],
    );

    /**
     * Clear current session and start fresh
     * Removes session from localStorage and clears messages
     */
    const clearSession = useCallback(() => {
        localStorage.removeItem(CHAT_SESSION_KEY);
        setMessages([]);
        setError(null);
        // Force page reload to get new session ID
        window.location.reload();
    }, []);

    return {
        messages,
        isStreaming,
        isLoadingHistory,
        sessionId,
        sendMessage,
        clearSession,
        error,
    };
};

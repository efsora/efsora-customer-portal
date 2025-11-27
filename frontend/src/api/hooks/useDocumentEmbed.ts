import { useMutation } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';


import { streamEmbedDocument } from '#api/methods/documents.api';
import type {
    EmbedDocumentRequest,
    EmbedState,
    EmbedStage,
} from '#api/types/documents/embed.types';
import { QUERY_KEYS } from '#constants/queryKeys';

interface UseDocumentEmbedOptions {
    onComplete?: (s3Key: string, documentId: string | null) => void;
    onError?: (s3Key: string, error: string) => void;
}

interface UseDocumentEmbedReturn {
    /** Map of s3Key to embedding state */
    embeddingStates: Map<string, EmbedState>;
    /** Start embedding for a document */
    startEmbedding: (
        s3Key: string,
        projectId: number,
        collectionName?: string,
    ) => void;
    /** Retry embedding for a failed document */
    retryEmbedding: (
        s3Key: string,
        projectId: number,
        collectionName?: string,
    ) => void;
    /** Clear embedding state for a document */
    clearEmbeddingState: (s3Key: string) => void;
    /** Check if a document is currently embedding */
    isEmbedding: (s3Key: string) => boolean;
    /** Get embedding state for a document */
    getEmbedState: (s3Key: string) => EmbedState | undefined;
}

const createInitialState = (): EmbedState => ({
    isEmbedding: true,
    progress: 0,
    stage: null,
    message: 'Starting embedding...',
    error: null,
    errorCode: null,
    documentId: null,
});

/**
 * Process the SSE stream and update state
 */
async function processEmbedStream(
    request: EmbedDocumentRequest,
    updateState: (s3Key: string, updates: Partial<EmbedState>) => void,
    activeEmbeddings: Set<string>,
    onComplete?: (s3Key: string, documentId: string | null) => void,
    onError?: (s3Key: string, error: string) => void,
): Promise<void> {
    const { s3Key } = request;

    const stream = streamEmbedDocument(request);

    for await (const event of stream) {
        // Check if this embedding was cancelled
        if (!activeEmbeddings.has(s3Key)) {
            break;
        }

        if (event.stage === 'error') {
            updateState(s3Key, {
                isEmbedding: false,
                stage: 'error',
                progress: event.progress_percent,
                message: event.message,
                error: event.message,
                errorCode: event.error_code || null,
            });
            onError?.(s3Key, event.message);
            throw new Error(event.message);
        }

        if (event.stage === 'completed') {
            updateState(s3Key, {
                isEmbedding: false,
                stage: 'completed',
                progress: 100,
                message: event.message || 'Embedding completed',
                documentId: event.document_id || null,
            });
            onComplete?.(s3Key, event.document_id || null);
            return;
        }

        // Update progress for intermediate stages
        updateState(s3Key, {
            stage: event.stage as EmbedStage,
            progress: event.progress_percent,
            message: event.message,
        });
    }
}

/**
 * Hook to manage document embedding state and streaming using TanStack Query
 */
export function useDocumentEmbed(
    options: UseDocumentEmbedOptions = {},
): UseDocumentEmbedReturn {
    const { onComplete, onError } = options;
    const [embeddingStates, setEmbeddingStates] = useState<
        Map<string, EmbedState>
    >(new Map());

    // Use ref to track active embedding operations for cleanup
    const activeEmbeddings = useRef<Set<string>>(new Set());

    const updateState = useCallback(
        (s3Key: string, updates: Partial<EmbedState>) => {
            setEmbeddingStates((prev) => {
                const newMap = new Map(prev);
                const currentState = newMap.get(s3Key) || createInitialState();
                newMap.set(s3Key, { ...currentState, ...updates });
                return newMap;
            });
        },
        [],
    );

    const embedMutation = useMutation({
        mutationKey: [QUERY_KEYS.DOCUMENTS.EMBED],
        mutationFn: async (request: EmbedDocumentRequest) => {
            return processEmbedStream(
                request,
                updateState,
                activeEmbeddings.current,
                onComplete,
                onError,
            );
        },
    });

    const startEmbedding = useCallback(
        (s3Key: string, projectId: number, collectionName?: string): void => {
            // Prevent duplicate embedding of the same document
            if (activeEmbeddings.current.has(s3Key)) {
                return;
            }

            activeEmbeddings.current.add(s3Key);

            // Initialize state
            setEmbeddingStates((prev) => {
                const newMap = new Map(prev);
                newMap.set(s3Key, createInitialState());
                return newMap;
            });

            // Start the mutation
            embedMutation.mutate(
                { s3Key, projectId, collectionName },
                {
                    onError: (error) => {
                        const errorMessage =
                            error instanceof Error
                                ? error.message
                                : 'Failed to embed document';
                        updateState(s3Key, {
                            isEmbedding: false,
                            stage: 'error',
                            error: errorMessage,
                            message: errorMessage,
                        });
                        onError?.(s3Key, errorMessage);
                    },
                    onSettled: () => {
                        activeEmbeddings.current.delete(s3Key);
                    },
                },
            );
        },
        [embedMutation, updateState, onError],
    );

    const retryEmbedding = useCallback(
        (s3Key: string, projectId: number, collectionName?: string): void => {
            // Clear error state and restart
            updateState(s3Key, {
                isEmbedding: true,
                progress: 0,
                stage: null,
                message: 'Retrying embedding...',
                error: null,
                errorCode: null,
            });
            // Remove from active set to allow restart
            activeEmbeddings.current.delete(s3Key);
            startEmbedding(s3Key, projectId, collectionName);
        },
        [startEmbedding, updateState],
    );

    const clearEmbeddingState = useCallback((s3Key: string) => {
        // Cancel any active embedding
        activeEmbeddings.current.delete(s3Key);
        setEmbeddingStates((prev) => {
            const newMap = new Map(prev);
            newMap.delete(s3Key);
            return newMap;
        });
    }, []);

    const isEmbedding = useCallback(
        (s3Key: string): boolean => {
            const state = embeddingStates.get(s3Key);
            return state?.isEmbedding ?? false;
        },
        [embeddingStates],
    );

    const getEmbedState = useCallback(
        (s3Key: string): EmbedState | undefined => {
            return embeddingStates.get(s3Key);
        },
        [embeddingStates],
    );

    return {
        embeddingStates,
        startEmbedding,
        retryEmbedding,
        clearEmbeddingState,
        isEmbedding,
        getEmbedState,
    };
}

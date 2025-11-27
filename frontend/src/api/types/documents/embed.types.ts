/**
 * Embed Document Types
 * Types for document embedding progress streaming
 */

export type EmbedStage =
    | 'downloading'
    | 'loading'
    | 'chunking'
    | 'embedding'
    | 'storing'
    | 'completed'
    | 'error';

export interface EmbedProgressEvent {
    stage: EmbedStage;
    progress_percent: number;
    message: string;
    error_code?: string;
    document_id?: string;
}

export interface EmbedDocumentRequest {
    s3Key: string;
    projectId: number;
    collectionName?: string;
}

/**
 * State for tracking embedding progress of a single document
 */
export interface EmbedState {
    isEmbedding: boolean;
    progress: number;
    stage: EmbedStage | null;
    message: string;
    error: string | null;
    errorCode: string | null;
    documentId: string | null;
}

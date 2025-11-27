import type { EmbedState, EmbedStage } from '#api/types/documents/embed.types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

import Tag from '../Tag/Tag';


interface EmbeddingProgressProps {
    state: EmbedState;
    onRetry?: () => void;
    className?: string;
}

const STAGE_LABELS: Record<EmbedStage, string> = {
    downloading: 'Downloading...',
    loading: 'Loading document...',
    chunking: 'Chunking document...',
    embedding: 'Generating embeddings...',
    storing: 'Storing vectors...',
    completed: 'Completed',
    error: 'Error',
};

/**
 * Component to display embedding progress with real-time updates
 */
export function EmbeddingProgress({
    state,
    onRetry,
    className,
}: EmbeddingProgressProps) {
    const { isEmbedding, progress, stage, message, error } = state;

    // Show error state with retry button
    if (error) {
        return (
            <div
                className={cn(
                    'flex items-center gap-2 text-sm text-red-600',
                    className,
                )}
            >
                <svg
                    className="h-4 w-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <span className="truncate" title={error}>
                    {message || 'Embedding failed'}
                </span>
                {onRetry && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRetry}
                        className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        Retry
                    </Button>
                )}
            </div>
        );
    }

    // Show completed state - display Sent tag
    if (stage === 'completed') {
        return <Tag status="sent" />;
    }

    // Show progress bar for embedding in progress
    if (isEmbedding) {
        return (
            <div className={cn('flex flex-col gap-1', className)}>
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{stage ? STAGE_LABELS[stage] : 'Starting...'}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
            </div>
        );
    }

    // No state to show
    return null;
}

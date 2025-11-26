import { useState, useCallback } from 'react';

import { useGetUploadUrl } from '#api/hooks/useUpload';
import type { FileRow } from '#api/mockData';

type DocumentCategory = 'SoW' | 'Legal' | 'Billing' | 'Assets';

interface UseDocumentUploadOptions {
    projectId: number;
    onSuccess?: (file: FileRow) => void;
    onError?: (error: string) => void;
}

interface UseDocumentUploadReturn {
    uploadedFiles: FileRow[];
    isUploading: boolean;
    uploadError: string | null;
    isUploadModalOpen: boolean;
    setIsUploadModalOpen: (isOpen: boolean) => void;
    handleUploadDocument: (file: File, category: string) => void;
    clearUploadError: () => void;
}

/**
 * Custom hook to manage document upload state and logic
 */
export function useDocumentUpload({
    projectId,
    onSuccess,
    onError,
}: UseDocumentUploadOptions): UseDocumentUploadReturn {
    const [uploadedFiles, setUploadedFiles] = useState<FileRow[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const { mutate: getUploadUrl } = useGetUploadUrl();

    const clearUploadError = useCallback(() => {
        setUploadError(null);
    }, []);

    const handleUploadDocument = useCallback(
        (file: File, category: string) => {
            setUploadError(null);
            setIsUploading(true);

            getUploadUrl(
                {
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                    projectId,
                    category: category as DocumentCategory,
                },
                {
                    onSuccess: async (response) => {
                        try {
                            if (!response.success || !response.data?.uploadUrl) {
                                throw new Error(
                                    response.message || 'Failed to get upload URL'
                                );
                            }

                            const uploadResponse = await fetch(
                                response.data.uploadUrl,
                                {
                                    method: 'PUT',
                                    body: file,
                                    headers: {
                                        'Content-Type':
                                            file.type || 'application/octet-stream',
                                        'x-amz-meta-category': category,
                                    },
                                }
                            );

                            if (!uploadResponse.ok) {
                                throw new Error(
                                    `Upload failed: ${uploadResponse.statusText}`
                                );
                            }

                            const newFile: FileRow = {
                                id: Date.now().toString(),
                                fileName: {
                                    name: file.name,
                                    icon: '/documents/table-doc.svg',
                                },
                                version: 'v1.0.0',
                                uploader: {
                                    name: 'You',
                                    icon: '/documents/table-person.svg',
                                },
                                lastUpdated: new Date().toISOString(),
                                dateCreated: new Date().toISOString(),
                                status: 'inProgress',
                                category: category as DocumentCategory,
                            };

                            setUploadedFiles((prev) => [newFile, ...prev]);
                            setIsUploading(false);
                            setIsUploadModalOpen(false);
                            onSuccess?.(newFile);
                        } catch (error) {
                            const errorMessage =
                                error instanceof Error
                                    ? error.message
                                    : 'Failed to upload file';
                            setUploadError(errorMessage);
                            setIsUploading(false);
                            onError?.(errorMessage);
                        }
                    },
                    onError: (error) => {
                        const errorMessage =
                            error instanceof Error
                                ? error.message
                                : 'Failed to get upload URL';
                        setUploadError(errorMessage);
                        setIsUploading(false);
                        onError?.(errorMessage);
                    },
                }
            );
        },
        [getUploadUrl, projectId, onSuccess, onError]
    );

    return {
        uploadedFiles,
        isUploading,
        uploadError,
        isUploadModalOpen,
        setIsUploadModalOpen,
        handleUploadDocument,
        clearUploadError,
    };
}

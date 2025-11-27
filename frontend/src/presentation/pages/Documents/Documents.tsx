import { useCallback } from 'react';

import { useDocumentEmbed } from '#api/hooks/useDocumentEmbed';
import { useDocumentFilters } from '#api/hooks/useDocumentFilters';
import { useDocumentUpload } from '#api/hooks/useDocumentUpload';
import { FILTER_TAGS, type FileRow } from '#api/mockData';
import type { DocumentRow } from '#api/types/documents/response.types';
import { FilterTagBar } from '#components/common/FilterTagBar/FilterTagBar';
import { LoadingState } from '#components/common/LoadingState/LoadingState';
import { SearchInput } from '#components/common/SearchInput/SearchInput';
import { UploadDocumentModal } from '#components/common/UploadDocumentModal/UploadDocumentModal';
import PageTitle from '#presentation/components/common/PageTitle/PageTitle';
import { Table } from '#presentation/components/common/Table/Table';
import { useAllDocuments } from '@/api/hooks/useAllDocuments';

import styles from './Documents.module.css';

// Convert DocumentRow from API to FileRow for the Table component
const toFileRow = (doc: DocumentRow): FileRow => ({
    id: doc.id,
    fileName: doc.fileName,
    version: '',
    uploader: doc.uploader,
    lastUpdated: doc.lastUpdated,
    dateCreated: doc.dateCreated,
    status: doc.status,
    category: doc.category,
});

// TODO: Get actual companyId and projectId from context/params
const COMPANY_ID = 1;
const PROJECT_ID = 1;

export function Documents() {
    // Filter state and logic
    const {
        activeTag,
        setActiveTag,
        searchQuery,
        setSearchQuery,
        filterFiles,
    } = useDocumentFilters();

    // Embedding state and logic
    const { embeddingStates, startEmbedding, retryEmbedding } =
        useDocumentEmbed({
            onComplete: (s3Key) => {
                // Update file status to 'sent' when embedding completes
                updateFileStatus(s3Key, 'sent');
            },
            onError: (s3Key) => {
                // Update file status when embedding fails
                updateFileStatus(s3Key, 'embedError');
            },
        });

    // Handler to start embedding after upload
    const handleUploadComplete = useCallback(
        (s3Key: string) => {
            startEmbedding(s3Key, PROJECT_ID);
        },
        [startEmbedding],
    );

    // Handler to retry embedding
    const handleRetryEmbed = useCallback(
        (s3Key: string) => {
            retryEmbedding(s3Key, PROJECT_ID);
        },
        [retryEmbedding],
    );

    // Upload state and logic
    const {
        uploadedFiles,
        isUploading,
        uploadError,
        isUploadModalOpen,
        setIsUploadModalOpen,
        handleUploadDocument,
        updateFileStatus,
    } = useDocumentUpload({
        projectId: PROJECT_ID,
        onUploadComplete: handleUploadComplete,
    });

    // Fetch documents from API
    const { data: documentsResponse, isLoading: isLoadingDocuments } =
        useAllDocuments({
            companyId: COMPANY_ID,
            projectId: PROJECT_ID,
        });

    // Get documents from API response and convert to FileRow format
    const apiDocuments: FileRow[] =
        documentsResponse?.success && documentsResponse.data?.documents
            ? documentsResponse.data.documents.map(toFileRow)
            : [];

    // Combine API documents with locally uploaded files (uploaded files appear first)
    const allFiles = [...uploadedFiles, ...apiDocuments];
    const filteredFiles = filterFiles(allFiles);

    return (
        <div>
            <div className="flex justify-between">
                <PageTitle
                    title="Documents"
                    description="Access and manage project documents."
                />

                <div className={styles.uploadSection}>
                    <button
                        className={styles.uploadButton}
                        onClick={() => setIsUploadModalOpen(true)}
                        disabled={isUploading}
                    >
                        <img src="/documents/upload.svg" alt="upload" />
                    </button>
                    {uploadError && (
                        <div className={styles.uploadError}>{uploadError}</div>
                    )}
                </div>
            </div>

            <div className={styles.pageContainer}>
                <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search document name or type..."
                />

                <div className={styles.filterContainer}>
                    <FilterTagBar
                        tags={FILTER_TAGS}
                        activeTag={activeTag}
                        onTagClick={setActiveTag}
                    />
                </div>

                <div className={styles.documentTable}>
                    {isLoadingDocuments ? (
                        <LoadingState message="Loading documents..." />
                    ) : (
                        <Table
                            files={filteredFiles}
                            embeddingStates={embeddingStates}
                            onRetryEmbed={handleRetryEmbed}
                        />
                    )}
                </div>
            </div>

            <UploadDocumentModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUploadDocument}
                isLoading={isUploading}
            />
        </div>
    );
}

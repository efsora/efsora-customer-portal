import { useState } from 'react';

import { useGetUploadUrl } from '#api/hooks/useUploads';
import {
    FILTER_CATEGORIES,
    FILTER_TAGS,
    getFilterOptions,
    MOCK_FILES,
    type FileRow,
    type FilterType,
} from '#api/mockData';
import MenuDropdown from '#components/common/MenuDropdown/MenuDropdown';
import { UploadDocumentModal } from '#components/common/UploadDocumentModal/UploadDocumentModal';
import PageTitle from '#presentation/components/common/PageTitle/PageTitle';
import { Table } from '#presentation/components/common/Table/Table';

import styles from './Documents.module.css';

export function Documents() {
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [selectedFilters, setSelectedFilters] = useState<
        Map<FilterType, Set<string>>
    >(new Map());
    const [searchQuery, setSearchQuery] = useState<string>('');
    // All filter categories start collapsed by default
    const [expandedCategories, setExpandedCategories] = useState<
        Set<FilterType>
    >(new Set());
    const [uploadedFiles, setUploadedFiles] = useState<FileRow[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const { mutate: getUploadUrl } = useGetUploadUrl();

    const handleUploadDocument = (file: File, category: string) => {
        setUploadError(null);
        setIsUploading(true);

        // Get upload URL from backend
        getUploadUrl(
            {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                projectId: 1, // TODO: Get actual projectId from context/params
            },
            {
                onSuccess: async (response) => {
                    try {
                        // Check if we got a valid response with upload URL
                        if (!response.success || !response.data?.uploadUrl) {
                            throw new Error(
                                response.message || 'Failed to get upload URL',
                            );
                        }

                        // Upload file directly to S3 using the pre-signed URL
                        const uploadResponse = await fetch(
                            response.data.uploadUrl,
                            {
                                method: 'PUT',
                                body: file,
                                headers: {
                                    'Content-Type': file.type || 'application/octet-stream',
                                },
                            },
                        );

                        if (!uploadResponse.ok) {
                            throw new Error(
                                `Upload failed: ${uploadResponse.statusText}`,
                            );
                        }

                        // Add uploaded file to the list
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
                            category: category as
                                | 'SoW'
                                | 'Legal'
                                | 'Billing'
                                | 'Assets',
                        };

                        setUploadedFiles((prev) => [newFile, ...prev]);
                        setIsUploading(false);
                        setIsUploadModalOpen(false);
                    } catch (error) {
                        setUploadError(
                            error instanceof Error
                                ? error.message
                                : 'Failed to upload file',
                        );
                        setIsUploading(false);
                    }
                },
                onError: (error) => {
                    setUploadError(
                        error instanceof Error
                            ? error.message
                            : 'Failed to get upload URL',
                    );
                    setIsUploading(false);
                },
            },
        );
    };

    const toggleCategoryExpand = (filterType: FilterType) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(filterType)) {
            newExpanded.delete(filterType);
        } else {
            newExpanded.add(filterType);
        }
        setExpandedCategories(newExpanded);
    };

    const handleFilterToggle = (filterType: FilterType, option: string) => {
        const newFilters = new Map(selectedFilters);
        const filterSet = newFilters.get(filterType) || new Set();

        if (filterSet.has(option)) {
            filterSet.delete(option);
        } else {
            filterSet.add(option);
        }

        if (filterSet.size === 0) {
            newFilters.delete(filterType);
        } else {
            newFilters.set(filterType, filterSet);
        }
        setSelectedFilters(newFilters);
    };

    // Combine mock files with uploaded files
    const allFiles = [...uploadedFiles, ...MOCK_FILES];

    // Filter logic: apply all filters
    const filteredFiles = allFiles.filter((file) => {
        // Filter by category (tag)
        if (activeTag && file.category !== activeTag) {
            return false;
        }

        // Filter by selected dropdown filters
        for (const [filterType, selectedValues] of selectedFilters.entries()) {
            let matches = false;

            switch (filterType) {
                // case 'Version':
                //     matches = selectedValues.has(file.version);
                //     break;
                case 'Uploader':
                    matches = selectedValues.has(file.uploader.name);
                    break;
                case 'Status': {
                    const statusDisplay =
                        file.status === 'signed'
                            ? 'Signed'
                            : file.status === 'inProgress'
                              ? 'In Progress'
                              : file.status === 'paid'
                                ? 'Paid'
                                : file.status === 'sent'
                                  ? 'Sent'
                                  : file.status;
                    matches = selectedValues.has(statusDisplay);
                    break;
                }
                case 'Last Updated': {
                    const lastUpdatedMonth = new Date(
                        file.lastUpdated,
                    ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                    });
                    matches = selectedValues.has(lastUpdatedMonth);
                    break;
                }
                case 'Date Created': {
                    const createdMonth = new Date(
                        file.dateCreated,
                    ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                    });
                    matches = selectedValues.has(createdMonth);
                    break;
                }
            }

            if (!matches) {
                return false;
            }
        }

        // Filter by search query (search in fileName and uploader name)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesFileName = file.fileName.name
                .toLowerCase()
                .includes(query);
            const matchesUploader = file.uploader.name
                .toLowerCase()
                .includes(query);
            if (!matchesFileName && !matchesUploader) {
                return false;
            }
        }

        return true;
    });

    return (
        <div>
            <div className='flex justify-between'>
                <PageTitle
                    title="Documents"
                    description="Access and manage project documents."
                />

                {/* Upload button */}
                <div className={styles.uploadSection}>
                    <button
                        className={styles.uploadButton}
                        onClick={() => setIsUploadModalOpen(true)}
                        disabled={isUploading}
                    >
                        <img src="/documents/upload.svg" alt="upload" />
                    </button>
                    {uploadError && (
                        <div className={styles.uploadError}>
                            {uploadError}
                        </div>
                    )}
                </div>

            </div>
            

            <div className={styles.pageContainer}>
                <div className={styles.searchContainer}>
                    <img src="/documents/search.svg" alt="search" />
                    <input
                        type="text"
                        placeholder="Search document name or type..."
                        className={styles.search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className={styles.filterContainer}>
                    <div className={styles.filterTags}>
                        {FILTER_TAGS.map((tag) => (
                            <button
                                key={tag.label}
                                className={`${styles.filterButton} ${activeTag === tag.label ? styles.active : ''}`}
                                onClick={() =>
                                    setActiveTag(
                                        activeTag === tag.label
                                            ? null
                                            : tag.label,
                                    )
                                }
                            >
                                <img
                                    src={
                                        activeTag === tag.label
                                            ? tag.activeIcon
                                            : tag.icon
                                    }
                                    alt={`${tag.label} icon`}
                                    className={styles.icon}
                                />
                                <span>{tag.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className={styles.dropdownContainer}>
                        <MenuDropdown
                            trigger={(isOpen) => (
                                <button className={styles.dropdownButton}>
                                    <img src="/documents/filter.svg" alt="" />
                                    <span>Filter By</span>
                                    <img
                                        src={
                                            isOpen
                                                ? 'dropdown-up.svg'
                                                : 'dropdown.svg'
                                        }
                                    />
                                </button>
                            )}
                            items={[
                                {
                                    type: 'custom',
                                    render: (
                                        <div
                                            className={styles.dropdownMenu}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {FILTER_CATEGORIES.map((category) => {
                                                const filterOptions =
                                                    getFilterOptions(
                                                        category.type,
                                                    );
                                                const selectedOptionsForCategory =
                                                    selectedFilters.get(
                                                        category.type,
                                                    ) || new Set();
                                                const isExpanded =
                                                    expandedCategories.has(
                                                        category.type,
                                                    );

                                                return (
                                                    <div key={category.type}>
                                                        <div
                                                            className={
                                                                styles.filterCategoryTitle
                                                            }
                                                            onClick={() =>
                                                                toggleCategoryExpand(
                                                                    category.type,
                                                                )
                                                            }
                                                        >
                                                            <span>
                                                                {
                                                                    category.label
                                                                }
                                                            </span>
                                                            <img
                                                                src={
                                                                    isExpanded
                                                                        ? 'dropdown-up.svg'
                                                                        : 'dropdown.svg'
                                                                }
                                                                alt="toggle"
                                                                className={
                                                                    styles.filterCategoryIcon
                                                                }
                                                            />
                                                        </div>
                                                        {isExpanded && (
                                                            <>
                                                                {filterOptions.map(
                                                                    (option) => (
                                                                        <label
                                                                            key={`${category.type}-${option}`}
                                                                            className={
                                                                                styles.dropdownOption
                                                                            }
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={selectedOptionsForCategory.has(
                                                                                    option,
                                                                                )}
                                                                                onChange={() =>
                                                                                    handleFilterToggle(
                                                                                        category.type,
                                                                                        option,
                                                                                    )
                                                                                }
                                                                                className={
                                                                                    styles.checkbox
                                                                                }
                                                                            />
                                                                            <span
                                                                                className={
                                                                                    styles.checkmark
                                                                                }
                                                                            >
                                                                                {selectedOptionsForCategory.has(
                                                                                    option,
                                                                                )
                                                                                    ? '✓'
                                                                                    : ''}
                                                                            </span>
                                                                            <span>
                                                                                {
                                                                                    option
                                                                                }
                                                                            </span>
                                                                        </label>
                                                                    ),
                                                                )}
                                                                <div
                                                                    className={
                                                                        styles.filterSeparator
                                                                    }
                                                                />
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ),
                                },
                            ]}
                            align="right"
                            position="bottom"
                            fullWidth={true}
                        />
                    </div>
                </div>

                <div className={styles.documentTable}>
                    <Table files={filteredFiles} />
                </div>
            </div>

            {/* Upload Document Modal */}
            <UploadDocumentModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUploadDocument}
                isLoading={isUploading}
            />
        </div>
    );
}

import { useDocumentFilters } from '#api/hooks/useDocumentFilters';
import { useListDocuments } from '#api/hooks/useDocuments';
import { useDocumentUpload } from '#api/hooks/useDocumentUpload';
import {
    FILTER_CATEGORIES,
    FILTER_TAGS,
    getFilterOptions,
    type FileRow,
    type FilterType,
} from '#api/mockData';
import type { DocumentRow } from '#api/types/documents/response.types';
import { FilterTagBar } from '#components/common/FilterTagBar/FilterTagBar';
import { LoadingState } from '#components/common/LoadingState/LoadingState';
import MenuDropdown from '#components/common/MenuDropdown/MenuDropdown';
import { SearchInput } from '#components/common/SearchInput/SearchInput';
import { UploadDocumentModal } from '#components/common/UploadDocumentModal/UploadDocumentModal';
import PageTitle from '#presentation/components/common/PageTitle/PageTitle';
import { Table } from '#presentation/components/common/Table/Table';

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
        selectedFilters,
        searchQuery,
        setSearchQuery,
        expandedCategories,
        toggleCategoryExpand,
        handleFilterToggle,
        filterFiles,
    } = useDocumentFilters();

    // Upload state and logic
    const {
        uploadedFiles,
        isUploading,
        uploadError,
        isUploadModalOpen,
        setIsUploadModalOpen,
        handleUploadDocument,
    } = useDocumentUpload({ projectId: PROJECT_ID });

    // Fetch documents from API
    const { data: documentsResponse, isLoading: isLoadingDocuments } =
        useListDocuments({
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

                    <div className={styles.dropdownContainer}>
                        <FilterDropdown
                            selectedFilters={selectedFilters}
                            expandedCategories={expandedCategories}
                            onCategoryToggle={toggleCategoryExpand}
                            onFilterToggle={handleFilterToggle}
                        />
                    </div>
                </div>

                <div className={styles.documentTable}>
                    {isLoadingDocuments ? (
                        <LoadingState message="Loading documents..." />
                    ) : (
                        <Table files={filteredFiles} />
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

// Filter dropdown component extracted inline for now
interface FilterDropdownProps {
    selectedFilters: Map<string, Set<string>>;
    expandedCategories: Set<string>;
    onCategoryToggle: (category: FilterType) => void;
    onFilterToggle: (category: FilterType, option: string) => void;
}

function FilterDropdown({
    selectedFilters,
    expandedCategories,
    onCategoryToggle,
    onFilterToggle,
}: FilterDropdownProps) {
    return (
        <MenuDropdown
            trigger={(isOpen) => (
                <button className={styles.dropdownButton}>
                    <img src="/documents/filter.svg" alt="" />
                    <span>Filter By</span>
                    <img src={isOpen ? 'dropdown-up.svg' : 'dropdown.svg'} />
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
                                const filterOptions = getFilterOptions(
                                    category.type
                                );
                                const selectedOptionsForCategory =
                                    selectedFilters.get(category.type) ||
                                    new Set();
                                const isExpanded = expandedCategories.has(
                                    category.type
                                );

                                return (
                                    <div key={category.type}>
                                        <div
                                            className={
                                                styles.filterCategoryTitle
                                            }
                                            onClick={() =>
                                                onCategoryToggle(category.type)
                                            }
                                        >
                                            <span>{category.label}</span>
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
                                                {filterOptions.map((option) => (
                                                    <label
                                                        key={`${category.type}-${option}`}
                                                        className={
                                                            styles.dropdownOption
                                                        }
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedOptionsForCategory.has(
                                                                option
                                                            )}
                                                            onChange={() =>
                                                                onFilterToggle(
                                                                    category.type,
                                                                    option
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
                                                                option
                                                            )
                                                                ? '✓'
                                                                : ''}
                                                        </span>
                                                        <span>{option}</span>
                                                    </label>
                                                ))}
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
    );
}

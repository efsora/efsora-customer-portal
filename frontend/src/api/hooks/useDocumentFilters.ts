import { useState, useCallback, useMemo } from 'react';

import type { FileRow, FilterType } from '#api/mockData';

interface UseDocumentFiltersReturn {
    activeTag: string | null;
    setActiveTag: (tag: string | null) => void;
    selectedFilters: Map<FilterType, Set<string>>;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    expandedCategories: Set<FilterType>;
    toggleCategoryExpand: (filterType: FilterType) => void;
    handleFilterToggle: (filterType: FilterType, option: string) => void;
    filterFiles: (files: FileRow[]) => FileRow[];
}

/**
 * Custom hook to manage document filtering state and logic
 */
export function useDocumentFilters(): UseDocumentFiltersReturn {
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [selectedFilters, setSelectedFilters] = useState<
        Map<FilterType, Set<string>>
    >(new Map());
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [expandedCategories, setExpandedCategories] = useState<Set<FilterType>>(
        new Set()
    );

    const toggleCategoryExpand = useCallback((filterType: FilterType) => {
        setExpandedCategories((prev) => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(filterType)) {
                newExpanded.delete(filterType);
            } else {
                newExpanded.add(filterType);
            }
            return newExpanded;
        });
    }, []);

    const handleFilterToggle = useCallback(
        (filterType: FilterType, option: string) => {
            setSelectedFilters((prev) => {
                const newFilters = new Map(prev);
                const filterSet = new Set(newFilters.get(filterType) || []);

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
                return newFilters;
            });
        },
        []
    );

    const filterFiles = useCallback(
        (files: FileRow[]): FileRow[] => {
            return files.filter((file) => {
                // Filter by category (tag)
                if (activeTag && file.category !== activeTag) {
                    return false;
                }

                // Filter by selected dropdown filters
                for (const [filterType, selectedValues] of selectedFilters.entries()) {
                    let matches = false;

                    switch (filterType) {
                        case 'Uploader':
                            matches = selectedValues.has(file.uploader.name);
                            break;
                        case 'Status': {
                            const statusDisplay = getStatusDisplay(file.status);
                            matches = selectedValues.has(statusDisplay);
                            break;
                        }
                        case 'Last Updated': {
                            const lastUpdatedMonth = formatMonth(file.lastUpdated);
                            matches = selectedValues.has(lastUpdatedMonth);
                            break;
                        }
                        case 'Date Created': {
                            const createdMonth = formatMonth(file.dateCreated);
                            matches = selectedValues.has(createdMonth);
                            break;
                        }
                    }

                    if (!matches) {
                        return false;
                    }
                }

                // Filter by search query
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
        },
        [activeTag, selectedFilters, searchQuery]
    );

    return useMemo(
        () => ({
            activeTag,
            setActiveTag,
            selectedFilters,
            searchQuery,
            setSearchQuery,
            expandedCategories,
            toggleCategoryExpand,
            handleFilterToggle,
            filterFiles,
        }),
        [
            activeTag,
            selectedFilters,
            searchQuery,
            expandedCategories,
            toggleCategoryExpand,
            handleFilterToggle,
            filterFiles,
        ]
    );
}

// Helper functions
function getStatusDisplay(status: FileRow['status']): string {
    switch (status) {
        case 'signed':
            return 'Signed';
        case 'inProgress':
            return 'In Progress';
        case 'paid':
            return 'Paid';
        case 'sent':
            return 'Sent';
        default:
            return status;
    }
}

function formatMonth(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
    });
}

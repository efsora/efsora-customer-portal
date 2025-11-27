import { useState, useCallback, useMemo } from 'react';

import type { FileRow } from '#api/mockData';

interface UseDocumentFiltersReturn {
    activeTag: string | null;
    setActiveTag: (tag: string | null) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filterFiles: (files: FileRow[]) => FileRow[];
}

/**
 * Custom hook to manage document filtering state and logic
 */
export function useDocumentFilters(): UseDocumentFiltersReturn {
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filterFiles = useCallback(
        (files: FileRow[]): FileRow[] => {
            return files.filter((file) => {
                // Filter by category (tag)
                if (activeTag && file.category !== activeTag) {
                    return false;
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
        [activeTag, searchQuery],
    );

    return useMemo(
        () => ({
            activeTag,
            setActiveTag,
            searchQuery,
            setSearchQuery,
            filterFiles,
        }),
        [activeTag, searchQuery, filterFiles],
    );
}

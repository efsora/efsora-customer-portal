import { useQuery } from '@tanstack/react-query';

import { listDocuments } from '#api/methods/documents.api';
import type { ListDocumentsRequest } from '#api/types/documents/request.types';
import type { AppResponse_AllDocumentsResponse_ } from '#api/types/documents/response.types';
import { QUERY_KEYS } from '#constants/queryKeys';

/**
 * Hook for listing documents from S3
 */
export const useAllDocuments = (params: ListDocumentsRequest) => {
    return useQuery({
        queryKey: [
            QUERY_KEYS.DOCUMENTS.ALL,
            params.companyId,
            params.projectId,
        ],
        queryFn: async (): Promise<AppResponse_AllDocumentsResponse_> => {
            return listDocuments(params);
        },
        enabled: params.companyId > 0 && params.projectId > 0,
    });
};

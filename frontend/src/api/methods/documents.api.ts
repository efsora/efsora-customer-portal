import * as api from '#api/api';
import { ENDPOINTS } from '#api/endpoints';

import type { ListDocumentsRequest } from '../types/documents/request.types';
import type { AppResponse_ListDocumentsResponse_ } from '../types/documents/response.types';

/**
 * List documents from S3 for a given company and project
 */
export const listDocuments = async (
    request: ListDocumentsRequest,
): Promise<AppResponse_ListDocumentsResponse_> => {
    const response = await api.get<AppResponse_ListDocumentsResponse_>(
        ENDPOINTS.DOCUMENTS.LIST,
        {
            companyId: request.companyId,
            projectId: request.projectId,
        },
    );

    if (response?.status === 400) {
        throw new Error('Invalid request parameters');
    }

    if (response?.status > 300) {
        throw new Error(`HTTP ${response?.status}: Failed to list documents`);
    }

    return response?.data as AppResponse_ListDocumentsResponse_;
};

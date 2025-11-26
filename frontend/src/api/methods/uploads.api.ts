import * as api from '#api/api';
import { ENDPOINTS } from '#api/endpoints';

import type { GetUploadUrlRequest } from '../types/upload/request.types';
import type { AppResponse_GenerateUploadUrlResponse_ } from '../types/upload/response.types';

export const getUploadUrl = async (
    request: GetUploadUrlRequest,
): Promise<AppResponse_GenerateUploadUrlResponse_> => {
    const response = await api.post<
        AppResponse_GenerateUploadUrlResponse_,
        GetUploadUrlRequest
    >(ENDPOINTS.UPLOADS.GET_UPLOAD_URL, request);

    if (response?.status === 401) {
        throw new Error('Unauthorized: Please login again');
    }

    if (response?.status === 403) {
        throw new Error('Forbidden: You do not have access to this project');
    }

    if (response?.status === 404) {
        throw new Error('Project not found');
    }

    if (response?.status === 400) {
        throw new Error('Invalid request parameters');
    }

    if (response?.status > 300) {
        throw new Error(`HTTP ${response?.status}: Failed to get upload URL`);
    }

    return response?.data as AppResponse_GenerateUploadUrlResponse_;
};

import { useMutation } from '@tanstack/react-query';

import { getUploadUrl } from '#api/methods/uploads.api';
import type { GetUploadUrlRequest } from '#api/types/uploads/request.types';
import type { AppResponse_GetUploadUrlResponse_ } from '#api/types/uploads/response.types';
import { QUERY_KEYS } from '#constants/queryKeys';

/**
 * Hook for getting a pre-signed upload URL from the backend
 */
export const useGetUploadUrl = () => {
    return useMutation({
        mutationFn: async (data: GetUploadUrlRequest): Promise<AppResponse_GetUploadUrlResponse_> => {
            return getUploadUrl(data);
        },
        mutationKey: [QUERY_KEYS.UPLOADS.GET_UPLOAD_URL],
    });
};

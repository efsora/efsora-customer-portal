import { useMutation } from '@tanstack/react-query';

import { getUploadUrl } from '#api/methods/uploads.api';
import type { GetUploadUrlRequest } from '#api/types/upload/request.types';
import type { AppResponse_GenerateUploadUrlResponse_ } from '#api/types/upload/response.types';
import { QUERY_KEYS } from '#constants/queryKeys';

export const useGetUploadUrl = () => {
    return useMutation({
        mutationFn: async (
            data: GetUploadUrlRequest,
        ): Promise<AppResponse_GenerateUploadUrlResponse_> => {
            return getUploadUrl(data);
        },
        mutationKey: [QUERY_KEYS.UPLOADS.GET_UPLOAD_URL],
    });
};

import { useMutation } from '@tanstack/react-query';

import type { GetUploadUrlRequest } from '#api/types/uploads/request.types';
import type { GetUploadUrlResponse } from '#api/types/uploads/response.types';
import { QUERY_KEYS } from '#constants/queryKeys';

/**
 * Hook for getting a pre-signed upload URL
 * Currently returns a mock presigned S3 URL for development
 */
export const useGetUploadUrl = () => {
    return useMutation({
        mutationFn: async (data: GetUploadUrlRequest): Promise<GetUploadUrlResponse> => {
            // Mock presigned S3 URL - replace with actual backend call later
            const mockPresignedUrl = 'https://efsora-customer-portal-documents.s3.us-east-1.amazonaws.com/efsora-customer-portal/documents/1/1/test-upload?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20251124%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251124T000000Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=test-signature&x-amz-checksum-algorithm=CRC32&x-id=PutObject';

            return {
                uploadUrl: mockPresignedUrl,
                expiresIn: 3600,
            };
        },
        mutationKey: [QUERY_KEYS.UPLOADS.GET_UPLOAD_URL],
    });
};

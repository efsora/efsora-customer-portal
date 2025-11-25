import type { AppResponse } from '../base.types';

export interface GetUploadUrlResponse {
    uploadUrl: string;
    expiresIn: number;
}

export type AppResponse_GetUploadUrlResponse_ =
    AppResponse<GetUploadUrlResponse>;

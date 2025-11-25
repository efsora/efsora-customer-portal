export type DocumentCategory = 'SoW' | 'Legal' | 'Billing' | 'Assets';

export interface GetUploadUrlRequest {
    fileName: string;
    fileSize: number;
    fileType: string;
    projectId: number;
    category: DocumentCategory;
}

export type DocumentCategory = 'SoW' | 'Legal' | 'Billing' | 'Assets';

export interface GetUploadUrlRequest {
    //TODO: derive from schema.d.ts
    fileName: string;
    fileSize: number;
    fileType: string;
    projectId: number;
    category: DocumentCategory;
}

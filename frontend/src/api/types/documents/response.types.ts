import type { AppResponse } from '../base.types';

export type DocumentStatus = 'signed' | 'inProgress' | 'paid' | 'sent';
export type DocumentCategory = 'SoW' | 'Legal' | 'Billing' | 'Assets';

export interface DocumentFileName {
    name: string;
    icon: string;
}

export interface DocumentUploader {
    name: string;
    icon: string;
}

export interface Document {
    id: string;
    fileName: DocumentFileName;
    uploader: DocumentUploader;
    lastUpdated: string;
    dateCreated: string;
    status: DocumentStatus;
    category: DocumentCategory;
}

export interface AllDocumentsResponse {
    documents: Document[];
}

export type AppResponse_AllDocumentsResponse_ =
    AppResponse<AllDocumentsResponse>;

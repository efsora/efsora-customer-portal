import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import styles from './UploadDocumentModal.module.css';

export interface UploadDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File, category: string) => void;
    isLoading?: boolean;
}

type DocumentCategory = 'SoW' | 'Legal' | 'Billing' | 'Assets';

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
    'SoW',
    'Legal',
    'Billing',
    'Assets',
];

export function UploadDocumentModal({
    isOpen,
    onClose,
    onUpload,
    isLoading = false,
}: UploadDocumentModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedCategory, setSelectedCategory] =
        useState<DocumentCategory>('SoW');
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        }
    };

    const handleUploadClick = () => {
        if (selectedFile) {
            onUpload(selectedFile, selectedCategory);
            // Reset form
            setSelectedFile(null);
            setSelectedCategory('SoW');
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setSelectedCategory('SoW');
        onClose();
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) handleCancel();
            }}
        >
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload a Document</DialogTitle>
                </DialogHeader>

                {/* File Selection Section */}
                <div className={styles.section}>
                    <label className={styles.sectionTitle}>Select File *</label>
                    <div
                        ref={dropZoneRef}
                        className={`${styles.dropZone} ${dragActive ? styles.active : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            className={styles.browseButton}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                        >
                            <img
                                src="/documents/popup-upload.svg"
                                alt="Upload icon"
                            />
                            <span className={styles.dropText}>
                                Drop files here or{' '}
                                <span className={styles.clickLink}>
                                    click to browse
                                </span>
                            </span>
                            <p className={styles.dropSubtext}>
                                Supports PDF, DOC, DOCX, XLS, XLSX, ZIP (Max
                                50MB)
                            </p>
                        </button>
                        {selectedFile && (
                            <div className={styles.selectedFileName}>
                                {selectedFile.name}
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Selection Section */}
                <div className={styles.section}>
                    <label htmlFor="category" className={styles.sectionTitle}>
                        Category *
                    </label>
                    <select
                        id="category"
                        className={styles.categoryDropdown}
                        value={selectedCategory}
                        onChange={(e) =>
                            setSelectedCategory(
                                e.target.value as DocumentCategory,
                            )
                        }
                        disabled={isLoading}
                    >
                        {DOCUMENT_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Action Buttons */}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleUploadClick}
                        disabled={!selectedFile || isLoading}
                        className={styles.uploadButton}
                    >
                        {isLoading ? (
                            <span>Uploading...</span>
                        ) : (
                            <div className="flex gap-2">
                                <img src="/documents/upload.svg" alt="upload" />
                                <span>Upload Document</span>
                            </div>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

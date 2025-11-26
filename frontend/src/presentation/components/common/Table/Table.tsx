import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import Tag from '../Tag/Tag';
import styles from './Table.module.css';

interface FileRow {
    id: string;
    fileName: {
        name: string;
        icon: string;
    };
    version: string;
    uploader: {
        name: string;
        icon: string;
    };
    lastUpdated: string;
    status: 'signed' | 'inProgress' | 'paid' | 'sent';
}

interface TableProps {
    files: FileRow[];
    onDownload?: (file: FileRow) => void;
    onSign?: (file: FileRow) => void;
    onReupload?: (file: FileRow) => void;
    onDelete?: (file: FileRow) => void;
}

type SortKey = 'fileName' | 'uploader' | 'lastUpdated' | 'status';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
    key: SortKey;
    direction: SortDirection;
}

const STATUS_ORDER: Record<FileRow['status'], number> = {
    inProgress: 0,
    sent: 1,
    signed: 2,
    paid: 3,
};

export function Table({
    files,
    onDownload,
    onSign,
    onReupload,
    onDelete,
}: TableProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [fileToDelete, setFileToDelete] = useState<FileRow | null>(null);

    const handleDeleteClick = (file: FileRow) => {
        setFileToDelete(file);
    };

    const handleConfirmDelete = () => {
        if (fileToDelete) {
            onDelete?.(fileToDelete);
            setFileToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setFileToDelete(null);
    };

    const handleSort = (key: SortKey) => {
        setSortConfig((prev) => {
            if (prev?.key === key) {
                // Toggle direction or clear if already descending
                if (prev.direction === 'asc') {
                    return { key, direction: 'desc' };
                }
                return null; // Clear sort
            }
            return { key, direction: 'asc' };
        });
    };

    const sortedFiles = useMemo(() => {
        if (!sortConfig) return files;

        return [...files].sort((a, b) => {
            const { key, direction } = sortConfig;
            const multiplier = direction === 'asc' ? 1 : -1;

            switch (key) {
                case 'fileName':
                    return (
                        multiplier *
                        a.fileName.name.localeCompare(b.fileName.name)
                    );
                case 'uploader':
                    return (
                        multiplier *
                        a.uploader.name.localeCompare(b.uploader.name)
                    );
                case 'lastUpdated':
                    return (
                        multiplier *
                        (new Date(a.lastUpdated).getTime() -
                            new Date(b.lastUpdated).getTime())
                    );
                case 'status':
                    return (
                        multiplier *
                        (STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
                    );
                default:
                    return 0;
            }
        });
    }, [files, sortConfig]);

    const getSortIcon = (key: SortKey) => {
        if (sortConfig?.key !== key) {
            return '/documents/sort-default.svg';
        }
        return sortConfig.direction === 'asc'
            ? '/documents/sort-asc.svg'
            : '/documents/sort-desc.svg';
    };

    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th
                            className={styles.headerSortable}
                            onClick={() => handleSort('fileName')}
                        >
                            <div className="flex items-center gap-2">
                                <span>File Name</span>
                                <img
                                    src={getSortIcon('fileName')}
                                    alt="sort"
                                    className={styles.sortIcon}
                                />
                            </div>
                          
                        </th>
                        <th
                            className={`${styles.headerSortable} ${styles.hideOnMobile}`}
                            onClick={() => handleSort('uploader')}
                        >
                            <div className="flex items-center gap-2">
                                <span>Uploader</span>
                                <img
                                    src={getSortIcon('uploader')}
                                    alt="sort"
                                    className={styles.sortIcon}
                                />
                            </div>
                        </th>
                        <th
                            className={`${styles.headerSortable} ${styles.hideOnMobile}`}
                            onClick={() => handleSort('lastUpdated')}
                        >
                            <div className="flex items-center gap-2">
                                <span>Last Updated</span>
                                <img
                                    src={getSortIcon('lastUpdated')}
                                    alt="sort"
                                    className={styles.sortIcon}
                                />
                            </div>
                        </th>
                        <th
                            className={`${styles.headerSortable} ${styles.hideOnMobile}`}
                            onClick={() => handleSort('status')}
                        >
                            <div className="flex items-center gap-2">
                                <span>Status</span>
                                <img
                                    src={getSortIcon('status')}
                                    alt="sort"
                                    className={styles.sortIcon}
                                />
                            </div>
                        </th>
                        <th className={styles.header}>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {sortedFiles.map((file) => (
                        <tr key={file.id}>
                            <td>
                                <div className={styles.cell}>
                                    <img
                                        src={file.fileName.icon}
                                        alt="file-icon"
                                    />
                                    {file.fileName.name}
                                </div>
                            </td>
                            {/*<td>
                                <VersionDropdown
                                    options={
                                        ['v1.0.3', 'v1.0.4', 'v1.1.0'].includes(
                                            selectedVersions[file.id],
                                        )
                                            ? ['v1.0.3', 'v1.0.4', 'v1.1.0']
                                            : [
                                                  selectedVersions[file.id],
                                                  ...[
                                                      'v1.0.3',
                                                      'v1.0.4',
                                                      'v1.1.0',
                                                  ],
                                              ]
                                    }
                                    value={selectedVersions[file.id]}
                                    onChange={(val) =>
                                        handleVersionChange(file.id, val)
                                    }
                                />
                            </td>*/}
                            <td className={styles.hideOnMobile}>
                                <div className={styles.cell}>
                                    <img
                                        src={file.uploader.icon}
                                        alt="uploader-icon"
                                    />
                                    {file.uploader.name}
                                </div>
                            </td>
                            <td className={styles.hideOnMobile}>
                                <div className={styles.cell}>
                                    <img
                                        src="/documents/table-date.svg"
                                        alt="date"
                                    />
                                    {new Date(
                                        file.lastUpdated,
                                    ).toLocaleDateString()}
                                </div>
                            </td>
                            <td className={styles.hideOnMobile}>
                                <div className={styles.status}>
                                    <Tag status={file.status} />
                                </div>
                            </td>
                            <td>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={styles.actionsButton}
                                            aria-label="Open actions menu"
                                        >
                                            <img
                                                src="/documents/three-dots.svg"
                                                alt="actions"
                                            />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem
                                                onSelect={() =>
                                                    onDownload?.(file)
                                                }
                                                className={styles.action}
                                            >
                                                <img
                                                    src="/documents/action-download.svg"
                                                    alt=""
                                                />
                                                Download Document
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onSelect={() => onSign?.(file)}
                                                className={styles.action}
                                            >
                                                <img
                                                    src="/documents/action-sign.svg"
                                                    alt=""
                                                />
                                                Sign Document
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem
                                                onSelect={() =>
                                                    onReupload?.(file)
                                                }
                                                className={styles.action}
                                            >
                                                <img
                                                    src="/documents/action-reupload.svg"
                                                    alt=""
                                                />
                                                Reupload Document
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onSelect={() =>
                                                    handleDeleteClick(file)
                                                }
                                                className={styles.deleteAction}
                                            >
                                                <img
                                                    src="/documents/action-delete.svg"
                                                    alt=""
                                                />
                                                Delete Document
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Dialog
                open={fileToDelete !== null}
                onOpenChange={(open) => {
                    if (!open) handleCancelDelete();
                }}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. Clicking Delete will
                            permanently delete this document.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleConfirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

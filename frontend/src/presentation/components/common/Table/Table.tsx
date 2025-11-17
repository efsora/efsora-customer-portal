import { useState } from 'react';

import styles from './Table.module.css';
import Tag from '../Tag/Tag';
import VersionDropdown from '../VersionDropdown/VersionDropdown';

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

// eslint-disable-next-line react-refresh/only-export-components
export const mockFiles: FileRow[] = [
    {
        id: '1',
        fileName: {
            name: 'Customer_Report_Q1.pdf',
            icon: '/documents/table-doc.svg',
        },
        version: 'v1.0.3',
        uploader: { name: 'Jane Doe', icon: '/documents/table-person.svg' },
        lastUpdated: '2025-11-10T09:12:00Z',
        status: 'signed',
    },
    {
        id: '2',
        fileName: {
            name: 'Sales_Data_Export.csv',
            icon: '/documents/table-doc.svg',
        },
        version: 'v2.1.0',
        uploader: { name: 'John Smith', icon: '/documents/table-person.svg' },
        lastUpdated: '2025-11-08T15:42:00Z',
        status: 'inProgress',
    },
    {
        id: '3',
        fileName: {
            name: 'Product_Images.zip',
            icon: '/documents/table-doc.svg',
        },
        version: 'v3.4.1',
        uploader: { name: 'Emily Carter', icon: '/documents/table-person.svg' },
        lastUpdated: '2025-10-29T18:21:00Z',
        status: 'paid',
    },
    {
        id: '4',
        fileName: {
            name: 'Contract_Template.docx',
            icon: '/documents/table-doc.svg',
        },
        version: 'v1.2.0',
        uploader: { name: 'Efsora', icon: '/documents/table-people.svg' },
        lastUpdated: '2025-11-11T07:50:00Z',
        status: 'sent',
    },
    {
        id: '5',
        fileName: {
            name: 'Release_Notes.md',
            icon: '/documents/table-doc.svg',
        },
        version: 'v5.0.0',
        uploader: {
            name: 'Sarah Johnson',
            icon: '/documents/table-person.svg',
        },
        lastUpdated: '2025-11-13T12:10:00Z',
        status: 'sent',
    },
];

export function Table() {
    const [selectedVersions, setSelectedVersions] = useState<
        Record<string, string>
    >(Object.fromEntries(mockFiles.map((file) => [file.id, file.version])));

    const handleVersionChange = (fileId: string, newVersion: string) => {
        setSelectedVersions((prev) => ({
            ...prev,
            [fileId]: newVersion,
        }));
        console.log('Selected version:', newVersion);
    };

    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.header}>File Name</th>
                        <th className={styles.header}>Version</th>
                        <th className={styles.header}>Uploader</th>
                        <th className={styles.header}>Last Updated</th>
                        <th className={styles.header}>Status</th>
                        <th className={styles.header}>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {mockFiles.map((file) => (
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
                            <td>
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
                            </td>
                            <td>
                                <div className={styles.cell}>
                                    <img
                                        src={file.uploader.icon}
                                        alt="uploader-icon"
                                    />
                                    {file.uploader.name}
                                </div>
                            </td>
                            <td>
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
                            <td className={styles.status}>
                                <Tag status={file.status} />
                            </td>
                            <td>
                                <button className={styles.downloadButton}>
                                    <img
                                        src="/documents/table-download.svg"
                                        alt="download"
                                    />
                                    Download
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

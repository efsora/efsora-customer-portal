import { useState } from 'react';

import Tag from '../Tag/Tag';
import VersionDropdown from '../VersionDropdown/VersionDropdown';
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
}

export function Table({ files }: TableProps) {
  const [selectedVersions, setSelectedVersions] = useState<Record<string, string>>(
    Object.fromEntries(files.map(file => [file.id, file.version]))
  );

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
          {files.map((file) => (
            <tr key={file.id}>
              <td>
                <div className={styles.cell}>
                    <img src={file.fileName.icon} alt="file-icon" />
                    {file.fileName.name}
                </div>
           
              </td>
              <td>
                <VersionDropdown
                    options={
                      ["v1.0.3", "v1.0.4", "v1.1.0"].includes(selectedVersions[file.id])
                        ? ["v1.0.3", "v1.0.4", "v1.1.0"]
                        : [selectedVersions[file.id], ...["v1.0.3", "v1.0.4", "v1.1.0"]]
                    }
                    value={selectedVersions[file.id]}
                    onChange={(val) => handleVersionChange(file.id, val)}
                />
              </td>
              <td>
                <div className={styles.cell}>
                    <img src={file.uploader.icon} alt="uploader-icon" />
                    {file.uploader.name}
                </div>
              </td>
              <td>
                <div className={styles.cell}>
                    <img src="/documents/table-date.svg" alt="date" />
                    {new Date(file.lastUpdated).toLocaleDateString()}
                </div>
              </td>
              <td>
                <div className={styles.status}>
                  <Tag status={file.status} />
                </div>
              </td>
              <td>
                <button className={styles.downloadButton}>
                    <img src="/documents/table-download.svg" alt="download" />
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

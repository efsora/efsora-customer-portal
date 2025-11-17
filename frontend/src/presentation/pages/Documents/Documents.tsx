import { useState } from 'react';
import PageTitle from "#presentation/components/common/PageTitle/PageTitle";
import styles from './Documents.module.css'
import { Table } from '#presentation/components/common/Table/Table';

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
  dateCreated: string;
  status: "signed" | "inProgress" | "paid" | "sent";
  category: 'SoW' | 'Legal' | 'Billing' | 'Assets';
}

const MOCK_FILES: FileRow[] = [
  {
    id: "1",
    fileName: { name: "Customer_Report_Q1.pdf", icon: "/documents/table-doc.svg" },
    version: "v1.0.3",
    uploader: { name: "Jane Doe", icon: "/documents/table-person.svg" },
    lastUpdated: "2025-11-10T09:12:00Z",
    dateCreated: "2025-10-01T08:00:00Z",
    status: "signed",
    category: 'SoW',
  },
  {
    id: "2",
    fileName: { name: "Sales_Data_Export.csv", icon: "/documents/table-doc.svg" },
    version: "v2.1.0",
    uploader: { name: "John Smith", icon: "/documents/table-person.svg" },
    lastUpdated: "2025-11-08T15:42:00Z",
    dateCreated: "2025-10-15T10:30:00Z",
    status: "inProgress",
    category: 'Billing',
  },
  {
    id: "3",
    fileName: { name: "Product_Images.zip", icon: "/documents/table-doc.svg" },
    version: "v3.4.1",
    uploader: { name: "Emily Carter", icon: "/documents/table-person.svg" },
    lastUpdated: "2025-10-29T18:21:00Z",
    dateCreated: "2025-09-20T14:15:00Z",
    status: "paid",
    category: 'Assets',
  },
  {
    id: "4",
    fileName: { name: "Contract_Template.docx", icon: "/documents/table-doc.svg" },
    version: "v1.2.0",
    uploader: { name: "Efsora", icon: "/documents/table-people.svg" },
    lastUpdated: "2025-11-11T07:50:00Z",
    dateCreated: "2025-10-05T09:00:00Z",
    status: "sent",
    category: 'Legal',
  },
  {
    id: "5",
    fileName: { name: "Release_Notes.md", icon: "/documents/table-doc.svg" },
    version: "v5.0.0",
    uploader: { name: "Sarah Johnson", icon: "/documents/table-person.svg" },
    lastUpdated: "2025-11-13T12:10:00Z",
    dateCreated: "2025-11-01T11:20:00Z",
    status: "sent",
    category: 'SoW',
  },
  {
    id: "6",
    fileName: { name: "Invoice_November.xlsx", icon: "/documents/table-doc.svg" },
    version: "v1.5.0",
    uploader: { name: "Michael Lee", icon: "/documents/table-person.svg" },
    lastUpdated: "2025-11-12T11:30:00Z",
    dateCreated: "2025-10-28T13:45:00Z",
    status: "signed",
    category: 'Billing',
  },
  {
    id: "7",
    fileName: { name: "Brand_Guidelines.pdf", icon: "/documents/table-doc.svg" },
    version: "v2.0.0",
    uploader: { name: "Lisa Wong", icon: "/documents/table-person.svg" },
    lastUpdated: "2025-11-09T14:15:00Z",
    dateCreated: "2025-09-10T16:00:00Z",
    status: "inProgress",
    category: 'Assets',
  },
  {
    id: "8",
    fileName: { name: "Legal_Agreement.pdf", icon: "/documents/table-doc.svg" },
    version: "v3.0.0",
    uploader: { name: "Robert Brown", icon: "/documents/table-person.svg" },
    lastUpdated: "2025-11-14T10:00:00Z",
    dateCreated: "2025-10-12T12:30:00Z",
    status: "paid",
    category: 'Legal',
  },
];

const FILTER_TAGS = [
    { label: 'SoW', icon: '/documents/sow-g.svg', activeIcon: '/documents/sow-w.svg' },
    { label: 'Legal', icon: '/documents/shield-g.svg', activeIcon: '/documents/shield-w.svg' },
    { label: 'Billing', icon: '/documents/biling-g.svg', activeIcon: '/documents/biling-w.svg' },
    { label: 'Assets', icon: '/documents/asset-g.svg', activeIcon: '/documents/asset-w.svg' },
];

type FilterType = 'Version' | 'Uploader' | 'Status' | 'Last Updated' | 'Date Created';

const FILTER_CATEGORIES: { type: FilterType; label: string }[] = [
    { type: 'Version', label: 'Version' },
    { type: 'Uploader', label: 'Uploader' },
    { type: 'Status', label: 'Status' },
    { type: 'Last Updated', label: 'Last Updated' },
    { type: 'Date Created', label: 'Date Created' },
];

// Helper functions to extract unique values
const getUniqueVersions = () => [...new Set(MOCK_FILES.map(f => f.version))].sort();
const getUniqueUploaders = () => [...new Set(MOCK_FILES.map(f => f.uploader.name))].sort();
const getUniqueStatuses = () => [...new Set(MOCK_FILES.map(f => f.status))];
const getLastUpdatedMonths = () => {
  const months = new Set(MOCK_FILES.map(f => {
    const date = new Date(f.lastUpdated);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }));
  return Array.from(months).sort();
};
const getCreatedMonths = () => {
  const months = new Set(MOCK_FILES.map(f => {
    const date = new Date(f.dateCreated);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }));
  return Array.from(months).sort();
};

// Get filter options based on type
const getFilterOptions = (type: FilterType): string[] => {
    switch (type) {
        case 'Version':
            return getUniqueVersions();
        case 'Uploader':
            return getUniqueUploaders();
        case 'Status':
            return getUniqueStatuses().map(s =>
                s === 'signed' ? 'Signed' :
                s === 'inProgress' ? 'In Progress' :
                s === 'paid' ? 'Paid' :
                s === 'sent' ? 'Sent' : s
            );
        case 'Last Updated':
            return getLastUpdatedMonths();
        case 'Date Created':
            return getCreatedMonths();
        default:
            return [];
    }
};

export function Documents() {
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<Map<FilterType, Set<string>>>(new Map());
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [expandedCategories, setExpandedCategories] = useState<Set<FilterType>>(
        new Set(FILTER_CATEGORIES.map(cat => cat.type)) // Başlangıçta hepsi açık
    );

    const toggleCategoryExpand = (filterType: FilterType) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(filterType)) {
            newExpanded.delete(filterType);
        } else {
            newExpanded.add(filterType);
        }
        setExpandedCategories(newExpanded);
    };

    const handleFilterToggle = (filterType: FilterType, option: string) => {
        const newFilters = new Map(selectedFilters);
        const filterSet = newFilters.get(filterType) || new Set();

        if (filterSet.has(option)) {
            filterSet.delete(option);
        } else {
            filterSet.add(option);
        }

        if (filterSet.size === 0) {
            newFilters.delete(filterType);
        } else {
            newFilters.set(filterType, filterSet);
        }
        setSelectedFilters(newFilters);
    };

    // Filter logic: apply all filters
    const filteredFiles = MOCK_FILES.filter((file) => {
        // Filter by category (tag)
        if (activeTag && file.category !== activeTag) {
            return false;
        }

        // Filter by selected dropdown filters
        for (const [filterType, selectedValues] of selectedFilters.entries()) {
            let matches = false;

            switch (filterType) {
                case 'Version':
                    matches = selectedValues.has(file.version);
                    break;
                case 'Uploader':
                    matches = selectedValues.has(file.uploader.name);
                    break;
                case 'Status':
                    const statusDisplay = file.status === 'signed' ? 'Signed' :
                                        file.status === 'inProgress' ? 'In Progress' :
                                        file.status === 'paid' ? 'Paid' :
                                        file.status === 'sent' ? 'Sent' : file.status;
                    matches = selectedValues.has(statusDisplay);
                    break;
                case 'Last Updated':
                    const lastUpdatedMonth = new Date(file.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                    matches = selectedValues.has(lastUpdatedMonth);
                    break;
                case 'Date Created':
                    const createdMonth = new Date(file.dateCreated).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                    matches = selectedValues.has(createdMonth);
                    break;
            }

            if (!matches) {
                return false;
            }
        }

        // Filter by search query (search in fileName and uploader name)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesFileName = file.fileName.name.toLowerCase().includes(query);
            const matchesUploader = file.uploader.name.toLowerCase().includes(query);
            if (!matchesFileName && !matchesUploader) {
                return false;
            }
        }

        return true;
    });

    return (
        <div>
            <PageTitle title="Documents" description='Access and manage project documents.'/>
            
            <div className={styles.pageContainer}>
                <div className={styles.searchContainer}>
                    <img src="/documents/search.svg" alt="search" />
                    <input
                        type="text"
                        placeholder="Search document name or type..."
                        className={styles.search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                

                <div className={styles.filterContainer}>

                    <div className={styles.filterTags}>
                        {FILTER_TAGS.map((tag) => (
                            <button
                                key={tag.label}
                                className={`${styles.filterButton} ${activeTag === tag.label ? styles.active : ''}`}
                                onClick={() => setActiveTag(activeTag === tag.label ? null : tag.label)}
                            >
                                <img
                                    src={activeTag === tag.label ? tag.activeIcon : tag.icon}
                                    alt={`${tag.label} icon`}
                                    className={styles.icon}
                                />
                                <span>{tag.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className={styles.dropdownContainer}>
                        <button
                            className={styles.dropdownButton}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <img src="/documents/filter.svg" alt="" />
                            <span>Filter By</span>
                            <img src={isDropdownOpen ? "dropdown-up.svg" : "dropdown.svg"}/>
                        </button>
                        {isDropdownOpen && (
                            <div className={styles.dropdownMenu}>
                                {FILTER_CATEGORIES.map((category) => {
                                    const filterOptions = getFilterOptions(category.type);
                                    const selectedOptionsForCategory = selectedFilters.get(category.type) || new Set();
                                    const isExpanded = expandedCategories.has(category.type);

                                    return (
                                        <div key={category.type}>
                                            <div
                                                className={styles.filterCategoryTitle}
                                                onClick={() => toggleCategoryExpand(category.type)}
                                            >
                                                <span>{category.label}</span>
                                                <img
                                                    src={isExpanded ? "dropdown-up.svg" : "dropdown.svg"}
                                                    alt="toggle"
                                                    className={styles.filterCategoryIcon}
                                                />
                                            </div>
                                            {isExpanded && (
                                                <>
                                                    {filterOptions.map((option) => (
                                                        <label
                                                            key={`${category.type}-${option}`}
                                                            className={styles.dropdownOption}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedOptionsForCategory.has(option)}
                                                                onChange={() => handleFilterToggle(category.type, option)}
                                                                className={styles.checkbox}
                                                            />
                                                            <span className={styles.checkmark}>
                                                                {selectedOptionsForCategory.has(option) ? '✓' : ''}
                                                            </span>
                                                            <span>{option}</span>
                                                        </label>
                                                    ))}
                                                    <div className={styles.filterSeparator} />
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>

                <div className={styles.documentTable}>
                    <Table files={filteredFiles} />
                </div>
            </div>
      
        </div>
    );
}

import { useState } from 'react';
import PageTitle from "#presentation/components/common/PageTitle/PageTitle";
import styles from './Documents.module.css'

const FILTER_TAGS = [
    { label: 'SoW', icon: '/documents/sow-g.svg', activeIcon: '/documents/sow-w.svg' },
    { label: 'Legal', icon: '/documents/shield-g.svg', activeIcon: '/documents/shield-w.svg' },
    { label: 'Billing', icon: '/documents/biling-g.svg', activeIcon: '/documents/biling-w.svg' },
    { label: 'Assets', icon: '/documents/asset-g.svg', activeIcon: '/documents/asset-w.svg' },
];
const FILTER_BY_OPTIONS = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'];

export function Documents() {
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());

    const handleFilterToggle = (option: string) => {
        const newSelected = new Set(selectedFilters);
        if (newSelected.has(option)) {
            newSelected.delete(option);
        } else {
            newSelected.add(option);
        }
        setSelectedFilters(newSelected);
    };

    return (
        <div>
            <PageTitle title="Documents" description='Access and manage project documents.'/>
            
            <div className={styles.pageContainer}>
                <input
                    type="text"
                    placeholder="Search document name or type..."
                    className={styles.search}
                />

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
                                {FILTER_BY_OPTIONS.map((option) => (
                                    <label key={option} className={styles.dropdownOption}>
                                        <input
                                            type="checkbox"
                                            checked={selectedFilters.has(option)}
                                            onChange={() => handleFilterToggle(option)}
                                            className={styles.checkbox}
                                        />
                                        <span className={styles.checkmark}>
                                            {selectedFilters.has(option) ? '✓' : ''}
                                        </span>
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                <div>documents</div>
            </div>
      
        </div>
    );
}

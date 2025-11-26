import type { FilterTag } from '#api/mockData';

import styles from './FilterTagBar.module.css';

interface FilterTagBarProps {
    tags: FilterTag[];
    activeTag: string | null;
    onTagClick: (tag: string | null) => void;
}

export function FilterTagBar({ tags, activeTag, onTagClick }: FilterTagBarProps) {
    return (
        <div className={styles.container}>
            {tags.map((tag) => (
                <button
                    key={tag.label}
                    className={`${styles.button} ${activeTag === tag.label ? styles.active : ''}`}
                    onClick={() =>
                        onTagClick(activeTag === tag.label ? null : tag.label)
                    }
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
    );
}

import styles from './SearchInput.module.css';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: string;
}

export function SearchInput({
    value,
    onChange,
    placeholder = 'Search...',
    icon = '/documents/search.svg',
}: SearchInputProps) {
    return (
        <div className={styles.container}>
            <img src={icon} alt="search" className={styles.icon} />
            <input
                type="text"
                placeholder={placeholder}
                className={styles.input}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

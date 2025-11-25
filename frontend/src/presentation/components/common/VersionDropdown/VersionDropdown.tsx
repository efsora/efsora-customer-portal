import styles from './VersionDropdown.module.css';
import MenuDropdown from '../MenuDropdown/MenuDropdown';

interface VersionDropdownProps {
    options: string[];
    value: string;
    onChange: (val: string) => void;
}

/**
 * Version selector dropdown
 * Refactored to use centralized MenuDropdown component
 */
export default function VersionDropdown({
    options,
    value,
    onChange,
}: VersionDropdownProps) {
    const menuItems = options.map((option) => ({
        type: 'button' as const,
        label: option,
        onClick: () => onChange(option),
    }));

    return (
        <MenuDropdown
            trigger={
                <div className={styles.selected}>
                    {value}
                    <img
                        src="/dropdown.svg"
                        alt="dropdown arrow"
                        className={styles.arrow}
                    />
                </div>
            }
            items={menuItems}
            align="right"
            fullWidth={true}
        />
    );
}

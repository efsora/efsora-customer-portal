import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import styles from './VersionDropdown.module.css';

interface VersionDropdownProps {
    options: string[];
    value: string;
    onChange: (val: string) => void;
}

/**
 * Version selector dropdown
 * Refactored to use shadcn DropdownMenu component
 */
export default function VersionDropdown({
    options,
    value,
    onChange,
}: VersionDropdownProps) {
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <div className={styles.selected}>
                    {value}
                    <img
                        src="/dropdown.svg"
                        alt="dropdown arrow"
                        className={styles.arrow}
                    />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-full">
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option}
                        onSelect={() => onChange(option)}
                    >
                        {option}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

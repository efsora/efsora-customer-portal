import { useEffect, useRef, useState } from 'react';

import styles from './VersionDropdown.module.css';

interface VersionDropdownProps {
    options: string[];
    value: string;
    onChange: (val: string) => void;
}

export default function VersionDropdown({
    options,
    value,
    onChange,
}: VersionDropdownProps) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={styles.dropdown} ref={dropdownRef}>
            <div className={styles.selected} onClick={() => setOpen(!open)}>
                {value}
                <img
                    src={open ? '/dropdown-up.svg' : '/dropdown.svg'}
                    alt="dropdown arrow"
                    className={styles.arrow}
                />
            </div>

            {open && (
                <ul className={styles.options}>
                    {options.map((option) => (
                        <li
                            key={option}
                            className={styles.option}
                            onClick={() => {
                                onChange(option);
                                setOpen(false);
                            }}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

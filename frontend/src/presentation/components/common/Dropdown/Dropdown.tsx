import { useEffect, useRef, useState, type ReactNode } from 'react';

import styles from './Dropdown.module.css';

interface DropdownProps {
    trigger: (open: boolean) => ReactNode;
    children: ReactNode;
    align?: 'left' | 'right';
}

export default function Dropdown({
    trigger,
    children,
    align = 'right',
}: DropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={styles.container} ref={ref}>
            <div
                onClick={() => setOpen((prev) => !prev)}
                className={styles.trigger}
            >
                {trigger(open)}
            </div>

            {open && (
                <div
                    className={`${styles.dropdown} ${
                        align === 'right' ? styles.alignRight : styles.alignLeft
                    }`}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

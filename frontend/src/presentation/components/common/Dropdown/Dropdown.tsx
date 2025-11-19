/**
 * @deprecated Use MenuDropdown from './MenuDropdown' instead
 *
 * This component is deprecated and not used in the codebase.
 * Please migrate to MenuDropdown which provides better UI, accessibility,
 * and built-in support for buttons and separators.
 *
 * Migration example:
 * Old: <Dropdown trigger={open => <button>Menu</button>}><button>Item</button></Dropdown>
 * New: <MenuDropdown trigger={<button>Menu</button>} items={[{ type: 'button', label: 'Item', onClick: () => {} }]} />
 */

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

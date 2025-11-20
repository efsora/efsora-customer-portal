import { useEffect, useRef, useState, type ReactNode } from 'react';

import styles from './MenuDropdown.module.css';

// Menu item types
export interface ButtonItemProps {
    type: 'button';
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    disabled?: boolean;
    className?: string;
}

export interface SeparatorItemProps {
    type: 'separator';
}

export interface CustomItemProps {
    type: 'custom';
    render: ReactNode;
}

export type MenuItem = ButtonItemProps | SeparatorItemProps | CustomItemProps;

interface MenuDropdownProps {
    trigger: ReactNode | ((isOpen: boolean) => ReactNode);
    items: MenuItem[];
    align?: 'left' | 'right';
    position?: 'top' | 'bottom';
    className?: string;
    fullWidth?: boolean;
}

/**
 * Centralized MenuDropdown component
 * Supports button items, separators, and custom content
 *
 * @example
 * <MenuDropdown
 *   trigger={<button>Menu</button>}
 *   items={[
 *     { type: 'button', label: 'Edit', onClick: handleEdit, icon: <EditIcon /> },
 *     { type: 'separator' },
 *     { type: 'button', label: 'Delete', onClick: handleDelete, icon: <DeleteIcon /> },
 *   ]}
 *   align="right"
 * />
 */
export default function MenuDropdown({
    trigger,
    items,
    align = 'right',
    position = 'bottom',
    className,
    fullWidth = false,
}: MenuDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const renderTrigger = () => {
        if (typeof trigger === 'function') {
            return trigger(isOpen);
        }
        return trigger;
    };

    const handleItemClick = (item: MenuItem) => {
        if (item.type === 'button' && !item.disabled) {
            item.onClick();
            setIsOpen(false);
        }
    };

    const renderMenuItem = (item: MenuItem, index: number) => {
        if (item.type === 'separator') {
            return <div key={index} className={styles.separator} role="separator" />;
        }

        if (item.type === 'custom') {
            return (
                <div key={index} className={styles.customItem}>
                    {item.render}
                </div>
            );
        }

        if (item.type === 'button') {
            return (
                <button
                    key={index}
                    className={`${styles.menuButton} ${
                        item.disabled ? styles.disabled : ''
                    } ${item.className || ''}`}
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    type="button"
                >
                    {item.icon && <span className={styles.icon}>{item.icon}</span>}
                    <span className={styles.label}>{item.label}</span>
                </button>
            );
        }
    };

    return (
        <div
            className={`${styles.container} ${fullWidth ? styles.fullWidth : ''} ${className || ''}`}
            ref={containerRef}
        >
            <div
                ref={triggerRef}
                className={styles.trigger}
                onClick={() => setIsOpen((prev) => !prev)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsOpen((prev) => !prev);
                    }
                }}
                aria-haspopup="menu"
                aria-expanded={isOpen}
            >
                {renderTrigger()}
            </div>

            {isOpen && (
                <div
                    className={`${styles.menu} ${
                        align === 'left' ? styles.alignLeft : styles.alignRight
                    } ${position === 'top' ? styles.positionTop : styles.positionBottom}`}
                    role="menu"
                >
                    {items.length === 0 ? (
                        <div className={styles.empty}>No items</div>
                    ) : (
                        items.map((item, index) => renderMenuItem(item, index))
                    )}
                </div>
            )}
        </div>
    );
}

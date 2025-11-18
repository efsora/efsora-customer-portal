import { useEffect, useRef, useState } from 'react';
import NavigationMenu from '../NavigationMenu/NavigationMenu';
import styles from './LeftBar.module.css';

export default function LeftBar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <div className={styles.leftBarContainer}>
            <div className={styles.brands}>
                <div className={styles.brandContainer}>
                    <img
                        src="efsora-labs-brand.svg"
                        alt="EfsoraBrand"
                        className={styles.efsoraBrand}
                    />
                </div>
                <div className={styles.customerContainer} ref={dropdownRef}>
                    <button
                        className={styles.customerButton}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div className='flex gap-2'>
                            <img src="allsober-logo.svg" alt="allsober" />
                            <div>
                                <div className={styles.customerTitle}>AllSober</div>
                                <div className={styles.customerSubtitle}>EMR Platform</div>
                            </div>
                        </div>
                        <img
                            src={isDropdownOpen ? "dropdown-up.svg" : "dropdown.svg"}
                            alt="dropdown"
                            className={styles.dropdownIcon}
                        />
                    </button>

                    {isDropdownOpen && (
                        <div className={styles.projectDropdownMenu}>
                            <button className={styles.projectOption}>
                                AllSober
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <NavigationMenu />
        </div>
    );
}

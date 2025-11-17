import { NavLink } from 'react-router-dom';

import styles from './NavigationMenu.module.css';

interface NavItem {
    label: string;
    path: string;
    icon?: string;
    activeIcon: string;
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        path: '/',
        icon: '/home.svg',
        activeIcon: '/active-home.svg',
    },
    {
        label: 'Timeline',
        path: '/timeline',
        icon: '/timeline.svg',
        activeIcon: '/active-timeline.svg',
    },
    {
        label: 'Documents',
        path: '/documents',
        icon: '/documents.svg',
        activeIcon: '/active-documents.svg',
    },
    {
        label: 'Your Team',
        path: '/yourteam',
        icon: '/team.svg',
        activeIcon: '/active-team.svg',
    },
];

export default function NavigationMenu() {
    return (
        <nav className={styles.navContainer}>
            <ul className={styles.navList}>
                {navItems.map((item) => (
                    <li key={item.path} className={styles.navItem}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                isActive
                                    ? `${styles.navLink} ${styles.active}`
                                    : styles.navLink
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <img
                                        src={
                                            isActive
                                                ? item.activeIcon
                                                : item.icon
                                        }
                                        alt="icon"
                                    />
                                    {item.label}
                                </>
                            )}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

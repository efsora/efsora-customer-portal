import styles from "./NavigationMenu.module.css";
import { NavLink } from 'react-router-dom';

interface NavItem {
    label: string;
    path: string;
    icon?: string;
}

const navItems: NavItem[] = [
    { label: "Dashboard", path: "/" },
    { label: "Timeline", path: "/timeline" },
    { label: "Documents", path: "/documents" },
    { label: "Your Team", path: "/yourteam" },
    { label: "Users", path: "/users" },
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
                            <div className="iconPlaceholder"/>
                            {item.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
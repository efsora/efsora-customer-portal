import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

import styles from './Header.module.css';

export default function Header() {
    return (
        <header className={styles.headerContainer}>
            <div className={styles.headerLeft}>
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            <div className={styles.headerRight}>
                {/* Future header content like breadcrumbs, search, notifications, etc. */}
            </div>
        </header>
    );
}

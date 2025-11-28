import { Outlet } from 'react-router-dom';

import FloatingCircle from '#components/common/FloatingCircle/FloatingCircle';
import SlidePanel from '#components/common/SlidePanel/SlidePanel';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import styles from './Layout.module.css';
import { AppSidebar } from '../AppSidebar/AppSidebar';
import Footer from '../Footer.tsx';
import Header from '../Header/Header.tsx';

export default function Layout() {
    return (
        <>
            <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                <SidebarInset>
                    <Header />
                    <div className={styles.outlet}>
                        <Outlet />
                    </div>
                    <Footer />
                    <FloatingCircle />
                </SidebarInset>
            </SidebarProvider>
            <SlidePanel />
        </>
    );
}

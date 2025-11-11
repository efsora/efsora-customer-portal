import { Outlet } from 'react-router-dom';

import styles from './Layout.module.css';
import Footer from '../Footer.tsx';
import Header from '../Header/Header.tsx';
import LeftBar from '../LeftBar/LeftBar.tsx';
import RightBar from '../RightBar.tsx';
import FloatingCircle from '#components/common/FloatingCircle/FloatingCircle';
import SlidePanel from '#components/common/SlidePanel/SlidePanel';

export default function Layout() {
    return (
        <>
            <div className={styles.container}>
                <LeftBar />
                <div className={styles.content}>
                    <Header />
                    <div className={styles.outlet}>
                        <Outlet />
                    </div>
                    <Footer />
                </div>
                <RightBar />
                <FloatingCircle />
            </div>
            <SlidePanel />
        </>
    );
}

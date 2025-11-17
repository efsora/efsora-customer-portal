import styles from './LeftBar.module.css';
import NavigationMenu from '../NavigationMenu/NavigationMenu';

export default function LeftBar() {
    return (
        <div className={styles.leftBarContainer}>
            <div className={styles.brandContainer}>
                <img
                    src="efsora-labs-brand.svg"
                    alt="EfsoraBrand"
                    className={styles.efsoraBrand}
                />
            </div>
            <NavigationMenu />
        </div>
    );
}

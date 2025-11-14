import NavigationMenu from '../NavigationMenu/NavigationMenu';
import styles from "./LeftBar.module.css";

export default function LeftBar() {

    return (
        <div className={styles.leftBarContainer}>
            <div className={styles.brandContainer}>
                <img src="efsora-labs-brand.svg" alt="EfsoraBrand" className={styles.efsoraBrand} />
            </div>
            <NavigationMenu />
        </div>
    );
}

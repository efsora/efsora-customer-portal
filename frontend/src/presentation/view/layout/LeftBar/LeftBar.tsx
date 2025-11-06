import NavigationMenu from '../NavigationMenu/NavigationMenu';
import styles from "./LeftBar.module.css";
import Logout from '#components/common/Logout/Logout';

export default function LeftBar() {

    return (
        <div className={styles.leftBarContainer}>

            <div className={styles.brandContainer}>
                <img src="efsora-brand.svg" alt="EfsoraBrand" className={styles.efsoraBrand} />
            </div>
            <NavigationMenu />
            <Logout />  

        </div>
    );
}

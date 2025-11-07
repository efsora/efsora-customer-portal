import UserProfile from '#components/user/UserProfile';
import styles from "./Header.module.css";

export default function Header() {
    return (
        <div className={styles.headerContainer}>
            <UserProfile />
        </div>
    );
}

import UserProfile from '#presentation/components/user/UserProfile/UserProfile';
import styles from "./Header.module.css";

export default function Header() {
    return (
        <div className={styles.headerContainer}>
            <UserProfile />
        </div>
    );
}

import LanguageSelect from '#components/common/LanguageSelect';
import UserProfile from '#components/user/UserProfile';
import styles from "./Header.module.css";

export default function Header() {
    return (
        <div className={styles.headerContainer}>
            <div className="flex items-center gap-4">
                <LanguageSelect />
            </div>
            <UserProfile />
        </div>
    );
}

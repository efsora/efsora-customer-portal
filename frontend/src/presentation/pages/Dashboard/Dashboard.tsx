import PageTitle from '#presentation/components/common/PageTitle/PageTitle';
import { CurrentMilestone } from '#presentation/components/dashboard/CurrentMilestone/CurrentMilestone';
import { useCurrentUser } from '#store/authStore';
import styles from './Dashboard.module.css'

export default function Home() {
    const user = useCurrentUser();

    return (
        <>
            <PageTitle title="Dashboard" description="Welcome back! Here's an overview of your projects." />
            {user && (
                <div data-testid="welcome-message" className={styles.welcomeMessage}>
                    Welcome, {user.name || user.email}! 👋
                </div>
            )}
            <div className={styles.pageLayout}>
                <div className={styles.currentMilestone}>
                    <CurrentMilestone />
                </div>
            </div>
        </>
    );
}

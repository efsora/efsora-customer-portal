import PageTitle from '#presentation/components/common/PageTitle/PageTitle';
import { CurrentMilestone } from '#presentation/components/dashboard/CurrentMilestone/CurrentMilestone';

import styles from './Dashboard.module.css';

export default function Home() {
    return (
        <>
            <PageTitle
                title="Dashboard"
                description="Welcome back! Here's an overview of your projects."
            />
            <div className={styles.pageLayout}>
                <div className={styles.currentMilestone}>
                    <CurrentMilestone />
                </div>
            </div>
        </>
    );
}

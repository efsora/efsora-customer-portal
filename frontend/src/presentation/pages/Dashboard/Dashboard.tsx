import PageTitle from '#presentation/components/common/PageTitle/PageTitle';
import { CurrentMilestone } from '#presentation/components/dashboard/CurrentMilestone/CurrentMilestone';
import { DashboardCard } from '#presentation/components/dashboard/DashboardCard/DashboardCard';
import { QuickAccess } from '#presentation/components/dashboard/QuickAccess/QuickAccess';

import styles from './Dashboard.module.css';

export default function Home() {
    return (
        <>
            <div className={styles.pageTitle}>
                <PageTitle
                    title="Dashboard"
                    description="Welcome back! Here's an overview of your projects."
                />
                <QuickAccess />
            </div>
            

            <div className={styles.pageLayout}>
                <div className={styles.cardContainer}>
                    <div className={styles.cards}>
                        <DashboardCard
                            cardType="signature"
                            title="Pending Signature"
                            value={2}
                            subValue="7 total"
                        />
                        <DashboardCard
                            cardType="invoices"
                            title="Pending Invoices"
                            value={2}
                            subValue="7 paid"
                        />
                        <DashboardCard
                            cardType="progress"
                            title="Progress"
                            value="35%"
                            subValue="on track"
                        />
                        <DashboardCard
                            cardType="payment"
                            title="Remaining Payment"
                            value="$200k"
                            subValue="on track"
                        />
                    </div>
                </div>

                <CurrentMilestone />
            
            </div>
        </>
    );
}

import { ActiveMilestone } from './ActiveMilestone/ActiveMilestone';
import styles from './CurrentMilestone.module.css';

export function CurrentMilestone() {
    return (
        <div className={styles.container}>
            <div className={styles.currentMilestoneContainer}>
                <p className={styles.currentMilestoneText}>Current Milestone</p>
                <div className={styles.milestones}>
                    <div className={styles.milestoneItem}>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <img src="check.svg" alt="previous" />
                            <div>Previous</div>
                        </div>
                        <p className={styles.milestoneItemDescription}>
                            Kickoff Meeting Completed
                        </p>
                        <p className={styles.milestoneItemDate}>Oct 15, 2025</p>
                    </div>

                    <ActiveMilestone />

                    <div className={styles.milestoneItem}>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <img src="circle.svg" alt="next" />
                            <div>Next</div>
                        </div>
                        <p className={styles.milestoneItemDescription}>
                            Development Sprint 1
                        </p>
                        <p className={styles.milestoneItemDate}>Oct 25, 2025</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

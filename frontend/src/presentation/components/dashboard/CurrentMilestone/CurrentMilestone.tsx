import { MILESTONES } from '#api/mockData';
import { ActiveMilestone } from './ActiveMilestone/ActiveMilestone';
import styles from './CurrentMilestone.module.css';

export function CurrentMilestone() {
    // Find the active (inProgress) milestone index
    const activeIndex = MILESTONES.findIndex(m => m.status === 'inProgress');

    // Since MILESTONES are in reverse chronological order (newest first):
    // - Milestones AFTER activeIndex are older (completed)
    // - Milestones BEFORE activeIndex are newer (waiting/future)
    const previousMilestone = activeIndex < MILESTONES.length - 1 ? MILESTONES[activeIndex + 1] : null;
    const nextMilestone = activeIndex > 0 ? MILESTONES[activeIndex - 1] : null;

    return (
        <div className={styles.container}>
            <div className={styles.currentMilestoneContainer}>
                <p className={styles.currentMilestoneText}>Current Milestone</p>
                <div className={styles.milestones}>
                    {previousMilestone && (
                        <div className={styles.milestoneItem}>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <img src="check.svg" alt="previous" />
                                <div>Previous</div>
                            </div>
                            <p className={styles.milestoneItemDescription}>
                                {previousMilestone.title}
                            </p>
                            <p className={styles.milestoneItemDate}>{previousMilestone.dueDate}</p>
                        </div>
                    )}

                    <ActiveMilestone />

                    {nextMilestone && (
                        <div className={styles.milestoneItem}>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <img src="circle.svg" alt="next" />
                                <div>Next</div>
                            </div>
                            <p className={styles.milestoneItemDescription}>
                                {nextMilestone.title}
                            </p>
                            <p className={styles.milestoneItemDate}>{nextMilestone.dueDate}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

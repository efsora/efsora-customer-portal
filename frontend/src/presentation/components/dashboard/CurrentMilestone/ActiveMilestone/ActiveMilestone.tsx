import { ACTIVE_MILESTONE, RECENT_UPDATES } from '#api/mockData';
import Tag from '#presentation/components/common/Tag/Tag';

import styles from './ActiveMilestone.module.css';

function Title() {
    return (
        <div className="flex gap-4 justify-between">
            <div className="flex gap-4">
                <img src="/dashboard/milestone-icon.svg" alt="milestone-icon" />
                <div>
                    <div className={styles.activeMilestoneTitle}>
                        {ACTIVE_MILESTONE.title}
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                        <div>{ACTIVE_MILESTONE.assignedPerson}</div>
                        <div>Due: {ACTIVE_MILESTONE.dueDate}</div>
                    </div>
                </div>
            </div>

            <Tag
                status={
                    ACTIVE_MILESTONE.status as
                        | 'scheduled'
                        | 'inProgress'
                        | 'waiting'
                        | 'internalReview'
                        | 'delivered'
                        | 'completed'
                        | 'revision'
                        | 'blocked'
                }
            />
        </div>
    );
}

function ProgressBar() {
    return (
        <div className={styles.progressContainer}>
            <div className="flex justify-between mb-1 text-xs">
                <p className={styles.progressTitle}>Milestone Progress</p>
                <p className={styles.progressPercentage}>65%</p>
            </div>
            <div className={styles.progressBarContainer}>
                <div
                    className={styles.progressBarFill}
                    style={{ width: '65%' }}
                ></div>
            </div>
        </div>
    );
}

function RecentUpdates() {
    const updates = RECENT_UPDATES;

    const statusDotIcons: Record<string, string> = {
        past: '/dashboard/future-dot.svg',
        present: '/dashboard/present-dot.svg',
        future: '/dashboard/past-dot.svg',
    };

    return (
        <div className="mt-4">
            <div className={styles.recentUpdatesText}>Recent Updates</div>
            <ul className={`${styles.recentUpdatesList}`}>
                {updates.map((update, index) => (
                    <li key={index} className={styles.updateItem}>
                        <div className={styles.dateTime}>
                            <img
                                src={statusDotIcons[update.status]}
                                alt={`${update.status}-dot`}
                            />
                            <div>{update.date}</div>
                            <div>•</div>
                            <div>{update.time}</div>
                        </div>
                        <div className={styles.description}>
                            {update.description}
                        </div>
                        <div className={styles.owner}>by {update.owner}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function ActiveMilestone() {
    return (
        <div className={styles.milestoneItemActive}>
            <Title />
            <ProgressBar />
            <RecentUpdates />
        </div>
    );
}

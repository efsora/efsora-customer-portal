import Tag from '#presentation/components/common/Tag/Tag';

import styles from './ActiveMilestone.module.css';

function Title() {
    return (
        <div className="flex gap-4 justify-between">
            <div className="flex gap-4">
                <img src="milestone-icon.svg" alt="milestone-icon" />
                <div>
                    <div className={styles.activeMilestoneTitle}>
                        Design Phase Review
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                        <div>Michael Chen</div>
                        <div>Due: Oct 20, 2025</div>
                    </div>
                </div>
            </div>

            <Tag status="inProgress" />
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
    const updates = [
        {
            date: 'Oct 18, 2025',
            time: '2:30 PM',
            description: 'Wireframes approved by client.',
            owner: 'Sarah Johnson',
            status: 'past',
        },
        {
            date: 'Oct 16, 2025',
            time: '10:15 AM',
            description: 'Initial design concepts shared with the team.',
            owner: 'Michael Chen',
            status: 'present',
        },
        {
            date: 'Oct 15, 2025',
            time: '4:00 PM',
            description: 'Feedback session scheduled for Oct 15, 2025.',
            owner: 'Emily Rodriguez',
            status: 'future',
        },
    ];

    const statusDotIcons: Record<string, string> = {
        past: 'future-dot.svg',
        present: 'present-dot.svg',
        future: 'past-dot.svg',
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

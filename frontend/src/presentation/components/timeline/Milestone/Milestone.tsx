import Tag from '#presentation/components/common/Tag/Tag';

import styles from './Milestone.module.css';

type MilestoneStatus =
    | 'scheduled'
    | 'inProgress'
    | 'waiting'
    | 'internalReview'
    | 'delivered'
    | 'completed'
    | 'revision'
    | 'blocked';

export interface MilestoneProps {
    title: string;
    dueDate: string;
    assignedPerson: string;
    status: MilestoneStatus;
}

const ICON_MAP: Record<MilestoneStatus, string> = {
    scheduled: 'timeline/milestone-scheduled.svg',
    inProgress: 'timeline/milestone-wip.svg',
    waiting: 'timeline/milestone-wait.svg',
    internalReview: 'timeline/milestone-rew.svg',
    delivered: 'timeline/milestone-delivered.svg',
    completed: 'timeline/milestone-completed.svg',
    revision: 'timeline/milestone-revision.svg',
    blocked: 'timeline/milestone-blocked.svg',
};

export function Milestone({
    title,
    dueDate,
    assignedPerson,
    status,
}: MilestoneProps) {
    const iconSrc = `/${ICON_MAP[status]}`;
    const lineClassName = `${styles.line} ${styles[status]}`;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.logo}>
                    <div className={styles.icon}>
                        <img src={iconSrc} alt={status} />
                    </div>
                    <div className={lineClassName} />
                </div>
                <div className={styles.titleContainer}>
                    <div>{title}</div>
                    <div className={styles.subheader}>
                        <div className="flex items-center gap-1">
                            <img src="/timeline/milestone-due.svg" alt="due" />
                            Due: {dueDate}
                        </div>
                        <div className="flex items-center gap-1">
                            <img src="/timeline/milestone-person.svg" alt="person" />
                            {assignedPerson}
                        </div>
                    </div>
                </div>
            </div>

            <Tag status={status} />
        </div>
    );
}

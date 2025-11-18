import styles from './MilestoneList.module.css'
import { Milestone } from '../Milestone/Milestone';
import type { MilestoneProps } from '../Milestone/Milestone';
import { MILESTONES } from '#api/mockData';

export function MilestoneList() {
    return (
        <div className={styles.container}>
            {MILESTONES.map((milestone, index) => (
                <Milestone
                    key={index}
                    title={milestone.title}
                    dueDate={milestone.dueDate}
                    assignedPerson={milestone.assignedPerson}
                    status={milestone.status}
                />
            ))}
        </div>
    );
}
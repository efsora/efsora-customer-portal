import { MILESTONES } from '#api/mockData';

import { Milestone } from '../Milestone/Milestone';
import styles from './MilestoneList.module.css';

export function MilestoneList() {
    return (
        <div className={`container ${styles.container}`}>
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

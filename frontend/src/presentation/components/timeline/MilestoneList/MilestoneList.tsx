import styles from './MilestoneList.module.css'
import { Milestone } from '../Milestone/Milestone';
import type { MilestoneProps } from '../Milestone/Milestone';

const MILESTONES: MilestoneProps[] = [
    {
        title: "Initial Contact & NDA",
        dueDate: "20 Oct 2025",
        assignedPerson: "Michael Chen",
        status: "revision"
    },
    {
        title: "Initial Contact & NDA",
        dueDate: "20 Oct 2025",
        assignedPerson: "Michael Chen",
        status: "delivered"
    },
    {
        title: "Initial Contact & NDA",
        dueDate: "20 Oct 2025",
        assignedPerson: "Michael Chen",
        status: "waiting"
    },
    {
        title: "Initial Contact & NDA",
        dueDate: "20 Oct 2025",
        assignedPerson: "Michael Chen",
        status: "completed"
    }
];

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
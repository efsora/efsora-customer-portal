import styles from "./Tag.module.css";

type TagStatus =
  | "scheduled"
  | "inProgress"
  | "waiting"
  | "internalReview"
  | "delivered"
  | "completed"
  | "revision";

interface TagProps {
  status: TagStatus;
}

const LABELS: Record<TagStatus, string> = {
  scheduled: "Scheduled",
  inProgress: "In Progress",
  waiting: "Waiting",
  internalReview: "Internal Review",
  delivered: "Delivered",
  completed: "Completed",
  revision: "Revision",
};

export default function Tag({ status }: TagProps) {
  const variantClass = {
    scheduled: styles.scheduled,
    inProgress: styles.inProgress,
    waiting: styles.waiting,
    internalReview: styles.internalReview,
    delivered: styles.delivered,
    completed: styles.completed,
    revision: styles.revision,
  }[status];

  return (
    <span className={`${styles.tag} ${variantClass}`}>
      <div>{LABELS[status]}</div>
    </span>
  );
}

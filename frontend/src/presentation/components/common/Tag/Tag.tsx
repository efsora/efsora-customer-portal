import styles from "./Tag.module.css";

type TagStatus =
  | "scheduled"
  | "inProgress"
  | "waiting"
  | "internalReview"
  | "delivered"
  | "completed"
  | "revision"
  | "blocked"
  | "management"
  | "product"
  | "legal"
  | "financial"
  | "dev"
  | "testing";

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
  blocked: "Blocked",
  management: "Management",
  product: "Product",
  legal: "Legal",
  financial: "Financial",
  dev: "Dev",
  testing: "Testing"
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
    blocked: styles.blocked,
    management: styles.management,
    product: styles.product,
    legal: styles.legal,
    financial: styles.financial,
    dev: styles.dev,
    testing: styles.testing,
  }[status];

  return (
    <span className={`${styles.tag} ${variantClass}`}>
      <div>{LABELS[status]}</div>
    </span>
  );
}

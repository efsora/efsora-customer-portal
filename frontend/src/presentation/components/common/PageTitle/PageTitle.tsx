import styles from './PageTitle.module.css';

interface PageTitleProps {
    title: string;
    description?: string;
}

export default function PageTitle({ title, description }: PageTitleProps) {
    return (
        <div className={styles.pageTitleContainer}>
            <div className={styles.pageTitle}>{title}</div>
            {description && <p className="text-gray-600">{description}</p>}
        </div>
    );
}

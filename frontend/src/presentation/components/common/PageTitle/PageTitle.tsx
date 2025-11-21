import styles from './PageTitle.module.css';

interface PageTitleProps {
    title: string;
    description?: string;
}

export default function PageTitle({ title, description }: PageTitleProps) {
    return (
        <div className={styles.container}>
            <div className={styles.title}>{title}</div>
            {description && (
                <p className={styles.subtitle} data-testid="welcome-message">
                    {description}
                </p>
            )}
        </div>
    );
}

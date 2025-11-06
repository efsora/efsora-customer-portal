import styles from './PageTitle.module.css';

interface PageTitleProps {
    title: string;
    description?: string;
}

export default function PageTitle({ title, description }: PageTitleProps) {
    return (
        <div className={styles.pageTitleContainer}>
            <h2 className='text-2xl'>{title}</h2>
            {description && <p className="text-gray-600">{description}</p>}
        </div>
    );
}

import styles from './LoadingState.module.css';

interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
    return (
        <div className={styles.container}>
            <span className={styles.message}>{message}</span>
        </div>
    );
}

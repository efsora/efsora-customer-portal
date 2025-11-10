import styles from "./QuickAccess.module.css";

export function QuickAccess() {
    return (
        <div className={styles.container}>
            <div className={styles.quickAccessButtons}>
                <a 
                    href="https://www.figma.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.quickAccessButtonWrapper}
                >
                    <button className={styles.quickAccessButton}>
                        <img src="figma.svg" alt="figma" />
                    </button>
                </a>

                <a 
                    href="https://www.linear.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.quickAccessButtonWrapper}
                >
                    <button className={styles.quickAccessButton}>
                        <img src="linear.svg" alt="linear" />
                    </button>
                </a>
                <a 
                    href="https://www.slack.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.quickAccessButtonWrapper}
                >
                    <button className={styles.quickAccessButton}>
                        <img src="slack.svg" alt="slack" />
                    </button>
                </a>
                <a 
                    href="https://www.figma.com/files/recent" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.quickAccessButtonWrapper}
                >
                    <button className={styles.quickAccessButton}>
                        <img src="notion.svg" alt="notion" />
                    </button>
                </a>
                <a 
                    href="https://www.github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.quickAccessButtonWrapper}
                >
                    <button className={styles.quickAccessButton}>
                        <img src="github.svg" alt="github" />
                    </button>
                </a>
                <a 
                    href="https://drive.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.quickAccessButtonWrapper}
                >
                    <button className={styles.quickAccessButton}>
                        <img src="google-drive.svg" alt="google-drive" />
                    </button>
                </a>
            </div>
        </div>
    );
}

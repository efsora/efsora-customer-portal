import styles from "./QuickAccess.module.css";

export function QuickAccess() {
    return (
        <div>
            <div className={styles.quickAccessButtons}>
                <a 
                    href="https://www.figma.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.quickAccessButtonWrapper}
                >
                    <button className={styles.quickAccessButton}>
                        <img src="figma.svg" alt="figma" />
                        Figma
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
                        Linear
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
                        Slack
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
                        Notion
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
                        Github
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
                        Google Drive
                    </button>
                </a>
            </div>
        </div>
    );
}

import styles from "./QuickAccess.module.css";
import Tooltip from "#presentation/components/common/Tooltip/Tooltip";

export function QuickAccess() {
    return (
        <div className={styles.container}>
            <div className={styles.quickAccessButtons}>
                <div className={styles.tooltipWrapper}>
                        <a 
                            href="https://www.figma.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.quickAccessButtonWrapper}
                        >
                            <Tooltip content="Figma" position="left">
                                <button className={styles.quickAccessButton}>
                                    <img src="figma.svg" alt="figma" />
                                </button>
                            </Tooltip>
                        </a>
                </div>
         

                <a 
                    href="https://www.linear.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.quickAccessButtonWrapper}
                >
                    <Tooltip content="Linear" position="left">
                        <button className={styles.quickAccessButton}>
                            <img src="linear.svg" alt="linear" />
                        </button>
                    </Tooltip>
                </a>
                <a 
                    href="https://www.slack.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.quickAccessButtonWrapper}
                >
                    <Tooltip content="Slack" position="left">
                        <button className={styles.quickAccessButton}>
                            <img src="slack.svg" alt="slack" />
                        </button>
                    </Tooltip>
                </a>
                <a 
                    href="https://www.figma.com/files/recent" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.quickAccessButtonWrapper}
                >
                    <Tooltip content="Notion" position="left">
                        <button className={styles.quickAccessButton}>
                            <img src="notion.svg" alt="notion" />
                        </button>
                    </Tooltip>
                </a>
                <a 
                    href="https://www.github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.quickAccessButtonWrapper}
                >
                    <Tooltip content="GitHub" position="left">
                        <button className={styles.quickAccessButton}>
                            <img src="github.svg" alt="github" />
                        </button>
                    </Tooltip>
                </a>
                <a 
                    href="https://drive.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.quickAccessButtonWrapper}
                >
                    <Tooltip content="Google Drive" position="left">
                        <button className={styles.quickAccessButton}>
                            <img src="google-drive.svg" alt="google-drive" />
                        </button>
                    </Tooltip>
                </a>
            </div>
        </div>
    );
}

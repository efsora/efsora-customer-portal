import { useUIStore } from '#store/uiStore';

import styles from './FloatingCircle.module.css';

export default function FloatingCircle() {
    const { setSlidePanelOpen } = useUIStore();

    const handleClick = () => {
        setSlidePanelOpen(true);
    };

    return (
        <button
            className={styles.circle}
            onClick={handleClick}
            aria-label="Open side panel"
        >
            <img src="chat.svg" alt="chat" />
        </button>
    );
}

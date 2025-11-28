import Chat from '#presentation/view/chat/Chat';
import { useUIStore } from '#store/uiStore';

import styles from './SlidePanel.module.css';

export default function SlidePanel() {
    const { isSlidePanelOpen, setSlidePanelOpen } = useUIStore();

    const handleBackdropClick = () => {
        setSlidePanelOpen(false);
    };

    return (
        <>
            {/* Backdrop */}
            {isSlidePanelOpen && (
                <div
                    className={styles.backdrop}
                    onClick={handleBackdropClick}
                    data-testid="slide-panel-backdrop"
                />
            )}

            {/* Slide Panel */}
            <div
                className={`${styles.panel} ${
                    isSlidePanelOpen ? styles.open : styles.closed
                }`}
                data-testid="slide-panel"
                data-open={isSlidePanelOpen}
            >
                {/* Add your panel content here */}
                <div className={styles.content}>
                    <button
                        className={styles.closeButton}
                        onClick={handleBackdropClick}
                        aria-label="Close panel"
                        data-testid="slide-panel-close-button"
                    >
                        ✕
                    </button>

                    <Chat />
                </div>
            </div>
        </>
    );
}

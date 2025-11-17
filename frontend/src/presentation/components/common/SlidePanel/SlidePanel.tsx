import Chat from '#presentation/view/chat/Chat';
import { useUIStore } from '#store/uiStore';

import styles from './SlidePanel.module.css';

export default function SlidePanel() {
    const { isSlidePanelOpen, setSlidePanelOpen } = useUIStore();

    console.log('isSlidePanelOpen: ', isSlidePanelOpen);

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
                />
            )}

            {/* Slide Panel */}
            <div
                className={`${styles.panel} ${
                    isSlidePanelOpen ? styles.open : styles.closed
                }`}
            >
                {/* Add your panel content here */}
                <div className={styles.content}>
                    <button
                        className={styles.closeButton}
                        onClick={handleBackdropClick}
                        aria-label="Close panel"
                    >
                        ✕
                    </button>

                    <Chat />
                </div>
            </div>
        </>
    );
}

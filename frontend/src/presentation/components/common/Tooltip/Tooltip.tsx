import { type ReactNode, useState } from 'react';

import styles from './Tooltip.module.css';

type TooltipProps = {
    content: ReactNode;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
};

export default function Tooltip({
    content,
    children,
    position = 'top',
}: TooltipProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div
            className={styles.wrapper}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}

            {visible && (
                <div className={`${styles.tooltip} ${styles[position]}`}>
                    {content}
                </div>
            )}
        </div>
    );
}

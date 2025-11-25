import styles from './DashboardCard.module.css';

export type CardType = 'signature' | 'invoices' | 'progress' | 'payment';

interface DashboardCardProps {
    cardType: CardType;
    title: string;
    value: string | number;
    subValue: string;
}

const CARD_CONFIG: Record<CardType, { icon: string; label: string }> = {
    signature: {
        icon: '/dashboard/signature.svg',
        label: 'signature',
    },
    invoices: {
        icon: '/dashboard/invoices.svg',
        label: 'invoices',
    },
    progress: {
        icon: '/dashboard/progress.svg',
        label: 'progress',
    },
    payment: {
        icon: '/dashboard/payment.svg',
        label: 'payment',
    },
};

export function DashboardCard({
    cardType,
    title,
    value,
    subValue,
}: DashboardCardProps) {
    const config = CARD_CONFIG[cardType];

    return (
        <div className={`${styles.card} ${styles[cardType]} container`}>
            <div className="flex flex-col justify-between">
                <div className={styles.cardTitle}>{title}</div>
                <div>
                    <div className={styles.cardValue}>{value}</div>
                    <div className={styles.cardSubValue}>{subValue}</div>
                </div>
            </div>

            <div className={`${styles.cardIcon} ${styles[`icon_${cardType}`]}`}>
                <img src={config.icon} alt={config.label} />
            </div>
        </div>
    );
}

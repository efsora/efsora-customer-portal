import { Card, CardContent } from '@/components/ui/card';

export type CardType = 'signature' | 'invoices' | 'progress' | 'payment';

interface DashboardCardProps {
    cardType: CardType;
    title: string;
    value: string | number;
    subValue: string;
}

const CARD_CONFIG: Record<
    CardType,
    { icon: string; label: string; valueColor: string; iconBg: string }
> = {
    signature: {
        icon: '/dashboard/signature.svg',
        label: 'signature',
        valueColor: 'var(--color-info-800)',
        iconBg: 'var(--color-info-100)',
    },
    invoices: {
        icon: '/dashboard/invoices.svg',
        label: 'invoices',
        valueColor: 'var(--color-primary-800)',
        iconBg: 'var(--color-primary-50)',
    },
    progress: {
        icon: '/dashboard/progress.svg',
        label: 'progress',
        valueColor: 'var(--color-success-800)',
        iconBg: 'var(--color-success-100)',
    },
    payment: {
        icon: '/dashboard/payment.svg',
        label: 'payment',
        valueColor: 'var(--color-error-800)',
        iconBg: 'var(--color-error-100)',
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
        <Card className="flex-1">
            <CardContent className="flex justify-between gap-9 p-6">
                <div className="flex flex-col justify-between">
                    <div className="text-base text-[var(--color-neutral-grey-600)]">
                        {title}
                    </div>
                    <div>
                        <div
                            className="mt-2 text-[30px] font-semibold"
                            style={{ color: config.valueColor }}
                        >
                            {value}
                        </div>
                        <div
                            className="text-[13px]"
                            style={{ color: config.valueColor }}
                        >
                            {subValue}
                        </div>
                    </div>
                </div>

                <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: config.iconBg }}
                >
                    <img src={config.icon} alt={config.label} />
                </div>
            </CardContent>
        </Card>
    );
}

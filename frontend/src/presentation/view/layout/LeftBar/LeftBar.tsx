import UserProfile from '#presentation/components/user/UserProfile/UserProfile';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import styles from './LeftBar.module.css';
import NavigationMenu from '../NavigationMenu/NavigationMenu';

export default function LeftBar() {
    // Sample customer/project data - can be connected to API
    const customers = [
        { id: 'allsober', name: 'AllSober', subtitle: 'EMR Platform' },
        // Add more customers as needed
    ];

    const currentCustomer = customers[0];

    return (
        <div className={styles.leftBarContainer}>
            <div className={styles.brands}>
                <div className={styles.brandContainer}>
                    <img
                        src="efsora-labs-brand.svg"
                        alt="EfsoraBrand"
                        className={styles.efsoraBrand}
                    />
                </div>

                {/* Customer selector dropdown */}
                <div className={styles.customerContainer}>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <button className={styles.customerButton}>
                                <div className="flex gap-2">
                                    <img
                                        src="allsober.svg"
                                        alt={currentCustomer.name}
                                    />
                                    <div>
                                        <div className={styles.customerTitle}>
                                            {currentCustomer.name}
                                        </div>
                                        <div
                                            className={styles.customerSubtitle}
                                        >
                                            {currentCustomer.subtitle}
                                        </div>
                                    </div>
                                </div>
                                <img
                                    src="dropdown.svg"
                                    alt="dropdown"
                                    className={styles.dropdownIcon}
                                />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-full">
                            {customers.map((customer) => (
                                <DropdownMenuItem
                                    key={customer.id}
                                    onSelect={() => {
                                        console.log(
                                            `Switched to ${customer.name}`,
                                        );
                                    }}
                                >
                                    {customer.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <NavigationMenu />

            <div className={styles.userProfile}>
                <UserProfile />
            </div>
        </div>
    );
}

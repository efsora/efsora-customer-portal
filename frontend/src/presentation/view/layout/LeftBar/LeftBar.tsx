import MenuDropdown from '#components/common/MenuDropdown/MenuDropdown';

import styles from './LeftBar.module.css';
import NavigationMenu from '../NavigationMenu/NavigationMenu';

export default function LeftBar() {
    // Sample customer/project data - can be connected to API
    const customers = [
        { id: 'allsober', name: 'AllSober', subtitle: 'EMR Platform' },
        // Add more customers as needed
    ];

    const currentCustomer = customers[0];

    // Menu items for customer dropdown
    const customerMenuItems = customers.map((customer) => ({
        type: 'button' as const,
        label: customer.name,
        onClick: () => {
            // Handle customer change
            console.log(`Switched to ${customer.name}`);
        },
    }));

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
                    <MenuDropdown
                        trigger={(isOpen) => (
                            <button className={styles.customerButton}>
                                <div className="flex gap-2">
                                    <img
                                        src="allsober-logo.svg"
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
                                    src={
                                        isOpen
                                            ? 'dropdown-up.svg'
                                            : 'dropdown.svg'
                                    }
                                    alt="dropdown"
                                    className={styles.dropdownIcon}
                                />
                            </button>
                        )}
                        items={customerMenuItems}
                        align="right"
                        position="bottom"
                        fullWidth
                    />
                </div>
            </div>

            <NavigationMenu />
        </div>
    );
}

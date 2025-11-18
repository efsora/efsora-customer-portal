import Dropdown from '#components/common/Dropdown/Dropdown';
import { useGetUserSummaryById } from '#hooks/useUser';
import { useCurrentUser } from '#store/authStore';

import styles from './UserProfile.module.css';
import Logout from '../../common/Logout';

export default function UserProfile() {
    const currentUser = useCurrentUser();
    const userId = currentUser?.id || '';
    const { data: user, isLoading, isError } = useGetUserSummaryById(userId);

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error</p>;

    return (
        <div className={styles.container}>
            <div className={styles.userProfileContainer}>
                <div className="iconPlaceholder" />
                <div>
                    <p>{user?.data?.name || 'Unknown User'}</p>
                    <p className={styles.userRole}>Customer</p>
                </div>
            </div>
            <Dropdown
                trigger={(open) => (
                    <img
                        src={open ? '/dropdown-up.svg' : '/dropdown.svg'}
                        alt="toggle dropdown"
                    />
                )}
            >
                <div className="text-lg">Quick Actions</div>
                <div className={styles.dropdownItem}>
                    <img src="new-event.svg" alt="new-event" />
                    <button>New Event</button>
                </div>
                <div className={styles.dropdownItem}>
                    <img src="new-document.svg" alt="new-document" />
                    <button>New Document</button>
                </div>
                <div className={styles.dropdownItem}>
                    <img src="new-milestone.svg" alt="new-milestone" />
                    <button>New Milestone</button>
                </div>

                <div className="separator" />

                <div className="text-lg pt-2">Recently Viewed</div>
                <div className={styles.dropdownItem}>
                    <img src="recent.svg" alt="recent" />
                    <button>August Invoice</button>
                </div>
                <div className={styles.dropdownItem}>
                    <img src="recent.svg" alt="recent" />
                    <button>Front-end Development Phase 2</button>
                </div>
                <div className={styles.dropdownItem}>
                    <img src="recent.svg" alt="recent" />
                    <button>MVP Scope Agreement</button>
                </div>

                <div className="separator" />

                <div className={styles.dropdownItem}>
                    <img src="settings.svg" alt="settings" />
                    <button>Settings</button>
                </div>
                <div className={styles.dropdownItem}>
                    <img src="help.svg" alt="help" />
                    <button>Help & Support</button>
                </div>

                <div className="separator" />

                <div className={`${styles.dropdownItem} ${styles.logout}`}>
                    <img src="red-logout.svg" alt="red-logout" />
                    <Logout />
                </div>
            </Dropdown>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLogout } from '#api/hooks/useAuth';
import MenuDropdown from '#components/common/MenuDropdown/MenuDropdown';
import { useGetUserById } from '#hooks/useUser';
import { useCurrentUser } from '#store/authStore';

import styles from './UserProfile.module.css';

/**
 * UserProfile component with responsive user menu dropdown
 * Mobile: Avatar trigger + dropdown menu
 * Desktop (1024px+): Avatar + Name + Email inline + dropdown icon
 */
export default function UserProfile() {
    const navigate = useNavigate();
    const currentUser = useCurrentUser();
    const userId = currentUser?.id || '';
    const { data: user, isLoading, isError } = useGetUserById(userId);
    const { mutate: logout, isPending } = useLogout();
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    // Handle window resize for responsive layout
    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Generate initials from name and surname
    const getInitials = (
        name: string | null | undefined,
        surname: string | null | undefined,
    ) => {
        const fullName = [name, surname].filter(Boolean).join(' ');
        if (!fullName) return 'U';
        const words = fullName.trim().split(/\s+/);
        return words
            .map((word) => word.charAt(0).toUpperCase())
            .join('')
            .slice(0, 2);
    };

    // Menu items - different for mobile vs desktop
    const menuItems = [
        // Only show user info on mobile
        ...(isDesktop
            ? []
            : [
                  {
                      type: 'custom' as const,
                      render: (
                          <div className={styles.userInfoSection}>
                              <div className={styles.userInfoContent}>
                                  <p className={styles.userName}>
                                      {[user?.data?.name, user?.data?.surname]
                                          .filter(Boolean)
                                          .join(' ') || 'Unknown User'}
                                  </p>
                                  <p className={styles.userEmail}>
                                      {user?.data?.email}
                                  </p>
                              </div>
                          </div>
                      ),
                  },
                  { type: 'separator' as const },
              ]),
        {
            type: 'button' as const,
            label: 'Help & Support',
            onClick: () => navigate('/help'),
            icon: (
                <img
                    src="help.svg"
                    alt="help"
                    style={{ width: '16px', height: '16px' }}
                />
            ),
            testId: 'help-support-button',
        },
        { type: 'separator' as const },
        {
            type: 'button' as const,
            label: isPending ? 'Logging out...' : 'Logout',
            onClick: () => {
                logout(undefined, {
                    onSuccess: () => {
                        navigate('/login');
                    },
                    onError: () => {
                        // Hook already clears auth on error, just need to navigate
                        navigate('/login');
                    },
                });
            },
            icon: (
                <img
                    src="red-logout.svg"
                    alt="logout"
                    style={{ width: '16px', height: '16px' }}
                />
            ),
            disabled: isPending,
            className: styles.logoutItem,
            testId: 'logout-button',
        },
    ];

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error</p>;

    const userName =
        [user?.data?.name, user?.data?.surname].filter(Boolean).join(' ') ||
        'Unknown User';

    return (
        <div>
            <MenuDropdown
                trigger={(isOpen) => (
                    <div
                        className={`${styles.triggerButton} ${isDesktop ? styles.desktopTrigger : styles.mobileTrigger}`}
                        data-testid="user-dropdown-trigger"
                    >
                        <div className={styles.profilePhoto}>
                            {getInitials(user?.data?.name, user?.data?.surname)}
                        </div>
                        {isDesktop && (
                            <>
                                <div className={styles.userInfo}>
                                    <p className={styles.desktopUserName}>
                                        {userName}
                                    </p>
                                    <p className={styles.desktopUserEmail}>
                                        {user?.data?.email}
                                    </p>
                                </div>
                                <img
                                    src={
                                        isOpen
                                            ? '/dropdown-up.svg'
                                            : '/dropdown.svg'
                                    }
                                    alt="menu"
                                    data-testid="user-dropdown-icon"
                                />
                            </>
                        )}
                    </div>
                )}
                items={menuItems}
                align="right"
                position="bottom"
            />
        </div>
    );
}

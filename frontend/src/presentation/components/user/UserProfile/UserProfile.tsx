import { useNavigate } from 'react-router-dom';

import { useLogout } from '#api/hooks/useAuth';
import MenuDropdown from '#components/common/MenuDropdown/MenuDropdown';
import { useGetUserById } from '#hooks/useUser';
import { useCurrentUser } from '#store/authStore';

import styles from './UserProfile.module.css';

/**
 * UserProfile component with user menu dropdown
 * Always displays: Avatar + Name + Email inline + dropdown icon
 */
export default function UserProfile() {
    const navigate = useNavigate();
    const currentUser = useCurrentUser();
    const userId = currentUser?.id || '';
    const { data: user, isLoading, isError } = useGetUserById(userId);
    const { mutate: logout, isPending } = useLogout();

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

    // Menu items
    const menuItems = [
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
        },
    ];

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error</p>;

    const userName = [user?.data?.name, user?.data?.surname]
        .filter(Boolean)
        .join(' ') || 'Unknown User';

    return (
        <div>
            <MenuDropdown
                trigger={(isOpen) => (
                    <div className={styles.triggerButton}>
                        <div className={styles.profilePhoto}>
                            {getInitials(user?.data?.name, user?.data?.surname)}
                        </div>
                        <div className={styles.userInfo}>
                            <p className={styles.desktopUserName}>{userName}</p>
                        </div>
                        <img
                            src={isOpen ? '/dropdown.svg' : '/dropdown-up.svg'}
                            alt="menu"
                        />
                    </div>
                )}
                items={menuItems}
                align="right"
                position="top"
                fullWidth={true}
            />
        </div>
    );
}

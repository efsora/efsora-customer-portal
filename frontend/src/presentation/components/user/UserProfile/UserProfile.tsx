import { useNavigate } from 'react-router-dom';

import { useLogout } from '#api/hooks/useAuth';
import { useGetUserById } from '#hooks/useUser';
import { useCurrentUser } from '#store/authStore';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

    const handleLogout = () => {
        logout(undefined, {
            onSuccess: () => {
                navigate('/login');
            },
            onError: () => {
                // Hook already clears auth on error, just need to navigate
                navigate('/login');
            },
        });
    };

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error</p>;

    const userName =
        [user?.data?.name, user?.data?.surname].filter(Boolean).join(' ') ||
        'Unknown User';

    return (
        <div>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <div
                        className={styles.triggerButton}
                        data-testid="user-dropdown-trigger"
                    >
                        <div className={styles.profilePhoto}>
                            {getInitials(user?.data?.name, user?.data?.surname)}
                        </div>
                        <div className={styles.userInfo}>
                            <p className={styles.desktopUserName}>{userName}</p>
                        </div>
                        <img src="/dropdown.svg" alt="menu" />
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="w-full">
                    <DropdownMenuItem
                        onSelect={() => navigate('/help')}
                        data-testid="help-support-button"
                    >
                        <img
                            src="help.svg"
                            alt="help"
                            style={{ width: '16px', height: '16px' }}
                        />
                        Help & Support
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onSelect={handleLogout}
                        disabled={isPending}
                        className={styles.logoutItem}
                        data-testid="logout-button"
                    >
                        <img
                            src="red-logout.svg"
                            alt="logout"
                            style={{ width: '16px', height: '16px' }}
                        />
                        {isPending ? 'Logging out...' : 'Logout'}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

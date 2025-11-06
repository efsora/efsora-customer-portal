import { useGetUserSummaryById } from '#hooks/useUser';
import { useCurrentUser } from '#store/authStore';
import styles from './UserProfile.module.css';

export default function UserProfile() {
    const currentUser = useCurrentUser();
    const userId = currentUser?.id || '';
    const {
        data: user,
        isLoading,
        isError,
    } = useGetUserSummaryById(userId);
    
    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error</p>;

    return (
        <div className={styles.userProfileContainer}>
            <div className="iconPlaceholder" />
            <div>
                <p>{user?.data?.name || 'Unknown User'}</p>
                <p className={styles.userRole}>Customer</p> {/* TODO: dynamic role */}
            </div>
        </div>
    );
}
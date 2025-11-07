import { useGetUserSummaryById } from "#hooks/useUser";
import { useCurrentUser } from "#store/authStore";
import Dropdown from "#components/common/Dropdown/Dropdown";
import styles from "./UserProfile.module.css";
import Logout from "../common/Logout";

export default function UserProfile() {
    const currentUser = useCurrentUser();
    const userId = currentUser?.id || "";
    const {
        data: user,
        isLoading,
        isError,
    } = useGetUserSummaryById(userId);

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error</p>;

    return (
        <div className={styles.container}>
            <div className={styles.userProfileContainer}>
                <div className='iconPlaceholder' />
                <div>
                    <p>{user?.data?.name || "Unknown User"}</p>
                    <p className={styles.userRole}>Customer</p>
                </div>
            </div>
            <Dropdown
                trigger={(open) => (
                    <img
                        src={open ? "/dropdown-up.svg" : "/dropdown.svg"}
                        alt="toggle dropdown"
                    />
                )}
            >
                <div className='text-lg'>Quick Actions</div>
                <div className="flex items-center px-2">
                    <div className="iconPlaceholder" />
                    <button>New Event</button>
                </div>
                <div className="flex items-center px-2">
                    <div className="iconPlaceholder" />
                    <button>New Document</button>
                </div>
                <div className="flex items-center px-2">
                    <div className="iconPlaceholder" />
                    <button>New Milestone</button>
                </div>

                <div className="separator" />

                <div className='text-lg pt-2'>Recently Viewed</div>
                <div className="flex items-center px-2">
                    <div className="iconPlaceholder" />
                    <button>August Invoice</button>
                </div>
                <div className="flex items-center px-2">
                    <div className="iconPlaceholder" />
                    <button>Front-end Development Phase 2</button>
                </div>
                <div className="flex items-center px-2">
                    <div className="iconPlaceholder" />
                    <button>MVP Scope Agreement</button>  
                </div>

                <div className="separator" />

                <div className="flex items-center px-2">
                    <div className="iconPlaceholder" />
                    <button>Settings</button>
                </div>
                <div className="flex items-center px-2">
                    <div className="iconPlaceholder" />
                    <button>Help & Support</button>
                </div>

                <div className="separator" />

                <div className="flex items-center px-2 text-red-600">
                    <div className="iconPlaceholder" />
                    <Logout />
                </div>
            </Dropdown>
        </div>
    );
}

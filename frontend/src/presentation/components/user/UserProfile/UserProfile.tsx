import Dropdown from "#components/common/Dropdown/Dropdown";
import { useGetUserSummaryById } from "#hooks/useUser";
import { useCurrentUser } from "#store/authStore";
import { useNavigate } from "react-router-dom";
import Logout from "../../common/Logout";
import styles from "./UserProfile.module.css";

export default function UserProfile() {
    const navigate = useNavigate();
    const currentUser = useCurrentUser();
    const userId = currentUser?.id || "";
    const {
        data: user,
        isLoading,
        isError,
    } = useGetUserSummaryById(userId);

    // Generate initials from username
    const getInitials = (name: string | null | undefined) => {
        if (!name) return "U";
        const words = name.trim().split(/\s+/);
        return words.map((word) => word.charAt(0).toUpperCase()).join("").slice(0, 2);
    };

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error</p>;

    return (
        <div className={styles.container}>
            <div className={styles.userProfileContainer}>
                <div className={styles.profilePhoto}>{getInitials(user?.data?.name)}</div>
                <div>
                    <p>{user?.data?.name || "Unknown User"}</p>
                    <p className={styles.userRole}>{/*Customer*/}</p>
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
                {/* 
                <div className='text-lg'>Quick Actions</div>
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
                */}
                <div className={styles.dropdownItem}>
                    <img src="help.svg" alt="help" />
                    <button onClick={() => navigate("/help")}>Help & Support</button>
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

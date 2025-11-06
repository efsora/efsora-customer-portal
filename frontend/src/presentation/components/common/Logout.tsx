import { useIsAuthenticated } from '#store/authStore';
import { useNavigate } from 'react-router-dom';

import { useLogout } from '#api/hooks/useAuth';
import styles from './Logout.module.css';

export default function Logout() {
    const navigate = useNavigate();
    const isAuthenticated = useIsAuthenticated();
    const logout = useLogout();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };


    return (
        <>
            {isAuthenticated && (
                <button
                    onClick={handleLogout}
                    className={styles.logoutButton}
                >
                    <div className='flex items-center gap-2'>
                        <div className="iconPlaceholder"/>
                        Logout
                    </div>
                </button>
            )}
        </> 
    ); 
}

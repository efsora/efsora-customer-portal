import { useIsAuthenticated } from '#store/authStore';
import { useNavigate } from 'react-router-dom';

import { useLogout } from '#api/hooks/useAuth';

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
                >
                        Logout
                </button>
            )}
        </> 
    ); 
}

import { useNavigate } from 'react-router-dom';

import { useLogout } from '#api/hooks/useAuth';
import { useIsAuthenticated } from '#store/authStore';

export default function Logout() {
    const navigate = useNavigate();
    const isAuthenticated = useIsAuthenticated();
    const { mutate: logout, isPending } = useLogout();

    const handleLogout = () => {
        logout(undefined, {
            onSuccess: () => {
                navigate('/login');
            },
        });
    };

    return (
        <>
            {isAuthenticated && (
                <button onClick={handleLogout} disabled={isPending}>
                    {isPending ? 'Logging out...' : 'Logout'}
                </button>
            )}
        </>
    );
}

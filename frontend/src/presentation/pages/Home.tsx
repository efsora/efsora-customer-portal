import { useNavigate } from 'react-router-dom';

import { useLogout } from '#api/hooks/useAuth';
import Counter from '#components/hello/Counter';
import DisplayCount from '#components/hello/DisplayCount';
import CreateUserForm from '#components/user/CreateUserForm';
import SummaryUser from '#components/user/SummaryUser';
import { useIsAuthenticated } from '#store/authStore';

export default function Home() {
    const navigate = useNavigate();
    const isAuthenticated = useIsAuthenticated();
    const logout = useLogout();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <div className="flex justify-end p-4">
                {isAuthenticated && (
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
                    >
                        Logout
                    </button>
                )}
            </div>
            <SummaryUser />
            <CreateUserForm />
            <Counter />
            <DisplayCount />
        </>
    );
}

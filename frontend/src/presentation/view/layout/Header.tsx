import { useNavigate } from 'react-router-dom';

import { useLogout } from '#api/hooks/useAuth';
import LanguageSelect from '#components/common/LanguageSelect';
import { useIsAuthenticated } from '#store/authStore';

export default function Header() {
    const navigate = useNavigate();
    const isAuthenticated = useIsAuthenticated();
    const logout = useLogout();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="bg-gray-200 flex justify-between items-center p-4">
            <div>Header</div>
            <div className="flex items-center gap-4">
                <LanguageSelect />
                {isAuthenticated && (
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
                    >
                        Logout
                    </button>
                )}
            </div>
        </div>
    );
}

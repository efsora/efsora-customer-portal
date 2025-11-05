import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useIsAuthenticated } from '#store/authStore';

interface ProtectedRouteProps {
    children: ReactNode;
}

/**
 * Protected route component
 * Redirects to login if user is not authenticated
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const isAuthenticated = useIsAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

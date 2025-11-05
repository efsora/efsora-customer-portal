import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useIsAuthenticated } from '#store/authStore';

interface PublicRouteProps {
    children: ReactNode;
}

/**
 * Public route component
 * Redirects to home if user is already authenticated
 */
export const PublicRoute = ({ children }: PublicRouteProps) => {
    const isAuthenticated = useIsAuthenticated();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from '#layout/Layout/Layout';
import { ProtectedRoute } from '#presentation/components/auth/ProtectedRoute';
import { PublicRoute } from '#presentation/components/auth/PublicRoute';
import { LoadingState } from '#presentation/components/common/LoadingState/LoadingState';

// Lazy load page components for code splitting
const Login = lazy(() =>
    import('#presentation/pages/Auth/Login').then((m) => ({
        default: m.Login,
    })),
);
const RegisterPage = lazy(() =>
    import('#presentation/pages/Auth/Register').then((m) => ({
        default: m.RegisterPage,
    })),
);
const Dashboard = lazy(() => import('#presentation/pages/Dashboard/Dashboard'));
const Documents = lazy(() =>
    import('#presentation/pages/Documents/Documents').then((m) => ({
        default: m.Documents,
    })),
);
const Help = lazy(() =>
    import('#presentation/pages/Help/Help').then((m) => ({ default: m.Help })),
);
const NoPage = lazy(() =>
    import('#presentation/pages/NoPage').then((m) => ({ default: m.NoPage })),
);
const Timeline = lazy(() => import('#presentation/pages/Timeline'));
const YourTeam = lazy(() =>
    import('#presentation/pages/YourTeam/YourTeam').then((m) => ({
        default: m.YourTeam,
    })),
);

export default function Router() {
    return (
        <Suspense fallback={<LoadingState />}>
            <Routes>
                {/* Public routes (redirect to home if authenticated) */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <RegisterPage />
                        </PublicRoute>
                    }
                />

                {/* Protected routes wrapped with Layout */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="/timeline" element={<Timeline />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/yourteam" element={<YourTeam />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="*" element={<NoPage />} />
                </Route>
            </Routes>
        </Suspense>
    );
}

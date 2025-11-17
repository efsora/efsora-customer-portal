import { Route, Routes } from 'react-router-dom';

import Layout from '#layout/Layout/Layout';
import { Login } from '#presentation/pages/Login/Login';
import { RegisterPage } from '#pages/RegisterPage';
import { ProtectedRoute } from '#presentation/components/auth/ProtectedRoute';
import { PublicRoute } from '#presentation/components/auth/PublicRoute';
import Dashboard from '#presentation/pages/Dashboard/Dashboard';
import Timeline from '#presentation/pages/Timeline';
import { NoPage } from '#presentation/pages/NoPage';
import { Documents } from '#presentation/pages/Documents/Documents';
import { YourTeam } from '#presentation/pages/YourTeam/YourTeam';

export default function Router() {
    return (
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
                <Route path="*" element={<NoPage />} />
            </Route>
        </Routes>
    );
}

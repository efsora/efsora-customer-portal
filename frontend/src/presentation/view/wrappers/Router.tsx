import { Route, Routes } from 'react-router-dom';

import Layout from '#layout/Layout/Layout';
import Home from '#pages/Home';
import { LoginPage } from '#pages/LoginPage';
import { RegisterPage } from '#pages/RegisterPage';
import User from '#pages/User';
import { ProtectedRoute } from '#presentation/components/auth/ProtectedRoute';

export default function Router() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes wrapped with Layout */}
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route
                    path="/users/:id"
                    element={
                        <ProtectedRoute>
                            <User />
                        </ProtectedRoute>
                    }
                />
            </Route>
        </Routes>
    );
}

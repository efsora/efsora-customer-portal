# Frontend Improvement Plan

Based on the Framework Best Practices Audit (2025-11-24)

---

## Summary

| Priority | Issue | Effort | Status |
|----------|-------|--------|--------|
| P0 | Code Splitting / Lazy Loading | 30 min | [ ] |
| P2 | TanStack Query Configuration | 10 min | [ ] |
| P2 | React.StrictMode | 5 min | [ ] |
| P1 | Vite Build Optimization | 20 min | [ ] |
| P1 | JWT httpOnly Cookies | 4-6 hrs | [ ] |

**Total Quick Wins:** ~1 hour
**Full Implementation:** ~6-7 hours (including JWT migration)

---

## 1. Code Splitting / Lazy Loading (P0)

### Problem
All page components are statically imported in `Router.tsx`, resulting in:
- Large initial bundle size
- Slow Time-to-Interactive (TTI)
- Wasted bandwidth for unvisited routes

### Current Code
```tsx
// src/presentation/view/wrappers/Router.tsx
import Dashboard from '#presentation/pages/Dashboard/Dashboard';
import { Documents } from '#presentation/pages/Documents/Documents';
import Timeline from '#presentation/pages/Timeline';
// ... all pages loaded upfront
```

### Solution
```tsx
// src/presentation/view/wrappers/Router.tsx
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from '#layout/Layout/Layout';
import { ProtectedRoute } from '#presentation/components/auth/ProtectedRoute';
import { PublicRoute } from '#presentation/components/auth/PublicRoute';

// Lazy load all page components
const Login = lazy(() => import('#presentation/pages/Auth/Login').then(m => ({ default: m.Login })));
const RegisterPage = lazy(() => import('#presentation/pages/Auth/Register').then(m => ({ default: m.RegisterPage })));
const Dashboard = lazy(() => import('#presentation/pages/Dashboard/Dashboard'));
const Documents = lazy(() => import('#presentation/pages/Documents/Documents').then(m => ({ default: m.Documents })));
const Help = lazy(() => import('#presentation/pages/Help/Help').then(m => ({ default: m.Help })));
const NoPage = lazy(() => import('#presentation/pages/NoPage').then(m => ({ default: m.NoPage })));
const Timeline = lazy(() => import('#presentation/pages/Timeline'));
const YourTeam = lazy(() => import('#presentation/pages/YourTeam/YourTeam').then(m => ({ default: m.YourTeam })));

// Loading fallback component
function PageLoader() {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
}

export default function Router() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Public routes */}
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

                {/* Protected routes */}
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
```

### Notes
- Named exports require `.then(m => ({ default: m.ComponentName }))`
- Default exports work directly with `lazy(() => import(...))`
- Consider adding error boundary for chunk load failures

### Expected Impact
- 40-60% reduction in initial bundle size
- Faster First Contentful Paint (FCP)
- Better Core Web Vitals scores

---

## 2. TanStack Query Configuration (P2)

### Problem
QueryClient uses defaults with no caching strategy:
```tsx
const queryClient = new QueryClient(); // No config
```

### Solution
```tsx
// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,      // 5 minutes - data considered fresh
            gcTime: 10 * 60 * 1000,        // 10 minutes - cache retention
            retry: 2,                       // Retry failed requests twice
            refetchOnWindowFocus: false,   // Don't refetch when window regains focus
            refetchOnMount: true,          // Refetch when component mounts
        },
        mutations: {
            retry: 1,                       // Retry failed mutations once
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
                <NotificationProvider />
                <Router />
            </ErrorBoundary>
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
}
```

### Install DevTools (Optional but Recommended)
```bash
npm install @tanstack/react-query-devtools --save-dev
```

### Expected Impact
- ~30% reduction in unnecessary API calls
- Better UX with cached data
- DevTools for debugging queries in development

---

## 3. React.StrictMode (P2)

### Problem
Missing StrictMode wrapper in `main.tsx` - loses development-time checks.

### Solution
```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import '../i18n.ts';
import './index.css';
import './styles/colors.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
);
```

### Benefits
- Detects unsafe lifecycles
- Warns about legacy API usage
- Identifies side effects in render phase
- Double-invokes components in dev to find issues

---

## 4. Vite Build Optimization (P1)

### Problem
No chunk splitting configuration - all vendor code bundled together.

### Solution
```tsx
// vite.config.ts
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // ... existing aliases
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Core React ecosystem
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    // Data fetching & state
                    'vendor-state': ['@tanstack/react-query', 'zustand', 'axios'],
                    // Forms & validation
                    'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
                    // UI components
                    'vendor-ui': [
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-dropdown-menu',
                        '@radix-ui/react-progress',
                        '@radix-ui/react-slot',
                        'lucide-react',
                    ],
                    // Markdown rendering
                    'vendor-markdown': ['react-markdown', 'rehype-raw', 'remark-gfm'],
                },
            },
        },
        // Increase warning limit (default is 500kb)
        chunkSizeWarningLimit: 1000,
        // Disable sourcemaps in production for smaller builds
        sourcemap: false,
    },
});
```

### Expected Impact
- Better browser caching (vendor chunks change less often)
- Parallel chunk loading
- Smaller individual chunks

---

## 5. JWT to httpOnly Cookies (P1 - Security)

### Problem
JWT tokens stored in localStorage are vulnerable to XSS attacks:
```tsx
// src/store/authStore.ts
persist(
    (set, get) => ({ ... }),
    {
        name: 'auth-store', // Stored in localStorage
        partialize: (state) => ({
            user: state.user,
            token: state.token,  // Token accessible via JS
        }),
    },
)
```

### Solution Overview

This requires **coordinated frontend + backend changes**:

#### Backend Changes Required
1. Set JWT in httpOnly cookie on login response
2. Add CSRF protection (double-submit cookie pattern)
3. Configure cookie settings (Secure, SameSite, Path)

```typescript
// Backend: Set cookie on login
res.cookie('access_token', jwt, {
    httpOnly: true,      // Not accessible via JS
    secure: true,        // HTTPS only
    sameSite: 'strict',  // CSRF protection
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
});
```

#### Frontend Changes

**1. Update authStore.ts**
```tsx
// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthState {
    user: AuthUser | null;
    // Remove token from state - it's in httpOnly cookie now

    setUser: (user: AuthUser) => void;
    clearAuth: () => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isLoading: false,

            setUser: (user: AuthUser) => {
                set({ user });
            },

            clearAuth: () => {
                set({ user: null });
            },

            setIsLoading: (isLoading: boolean) => {
                set({ isLoading });
            },
        }),
        {
            name: 'auth-store',
            partialize: (state) => ({
                user: state.user,
                // Don't persist token - it's in cookie
            }),
        },
    ),
);
```

**2. Update Axios configuration**
```tsx
// src/api/axios.ts (or wherever axios is configured)
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // Send cookies with requests
});

// Remove Authorization header interceptor
// Cookie is sent automatically with withCredentials: true
```

**3. Update login/logout flows**
```tsx
// Login - backend sets cookie, frontend only stores user info
const login = async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    useAuthStore.getState().setUser(response.data.user);
};

// Logout - call backend to clear cookie
const logout = async () => {
    await api.post('/auth/logout');
    useAuthStore.getState().clearAuth();
};
```

**4. Update auth check**
```tsx
// Check auth status via API call (cookie sent automatically)
const checkAuth = async () => {
    try {
        const response = await api.get('/auth/me');
        useAuthStore.getState().setUser(response.data.user);
        return true;
    } catch {
        useAuthStore.getState().clearAuth();
        return false;
    }
};
```

### Migration Steps
1. [ ] Backend: Add cookie-based auth endpoints
2. [ ] Backend: Add CSRF protection
3. [ ] Frontend: Update axios config with `withCredentials: true`
4. [ ] Frontend: Remove token from authStore
5. [ ] Frontend: Update login/logout/auth-check flows
6. [ ] Test: Verify cookies work cross-origin (if applicable)
7. [ ] Deploy: Backend first, then frontend

---

## Implementation Checklist

### Quick Wins (Do First - ~45 min)
- [ ] Add React.StrictMode to main.tsx
- [ ] Configure QueryClient with caching defaults
- [ ] Install React Query DevTools (optional)
- [ ] Implement lazy loading in Router.tsx

### Build Optimization (~20 min)
- [ ] Add manualChunks config to vite.config.ts
- [ ] Run `npm run build` and verify chunk sizes
- [ ] Test production build locally with `npm run preview`

### Security (Requires Backend - 4-6 hrs)
- [ ] Coordinate with backend team on cookie implementation
- [ ] Update frontend auth flow
- [ ] Test thoroughly in all environments

---

## Verification Commands

```bash
# Build and check bundle sizes
npm run build

# Analyze bundle (optional - install vite-bundle-analyzer)
npx vite-bundle-analyzer dist

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint
```

---

## Notes

- Code splitting works best with route-based splitting (implemented above)
- Consider component-level splitting for heavy components (e.g., markdown editors, charts)
- The JWT migration is a breaking change - coordinate deployment carefully
- Test lazy loading with slow 3G in Chrome DevTools to verify loading states

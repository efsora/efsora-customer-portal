# JWT to httpOnly Cookie Migration Plan

## Overview

Migrate from localStorage JWT storage to httpOnly cookies for improved security against XSS attacks.

| Current | Target |
|---------|--------|
| Token in localStorage | Token in httpOnly cookie |
| Frontend sends `Authorization: Bearer` | Browser sends cookie automatically |
| JS can read token (XSS vulnerable) | JS cannot access token |

---

## Files to Modify

### Backend (4 files)
1. `backend/src/routes/auth/handlers.ts` - Set/clear cookies
2. `backend/src/middlewares/auth.ts` - Read token from cookie
3. `backend/src/index.ts` - Add cookie-parser middleware
4. `backend/package.json` - Add cookie-parser dependency

### Frontend (3 files)
1. `frontend/src/store/authStore.ts` - Remove token storage
2. `frontend/src/api/axios.ts` - Remove Authorization header
3. `frontend/src/utils/auth.ts` - Update auth check logic

---

## Implementation Steps

### Step 1: Backend - Add cookie-parser dependency

```bash
cd backend
npm install cookie-parser
npm install -D @types/cookie-parser
```

### Step 2: Backend - Configure cookie-parser middleware

**File:** `backend/src/index.ts`

```typescript
// Add import
import cookieParser from "cookie-parser";

// Add after express.json() middleware
app.use(cookieParser());
```

### Step 3: Backend - Create cookie utilities

**File:** `backend/src/infrastructure/auth/cookie.ts` (NEW)

```typescript
import { Response } from "express";
import { env } from "#infrastructure/config/env";

// Cookie configuration
const COOKIE_NAME = "access_token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days (match JWT expiry)

/**
 * Set JWT token in httpOnly cookie
 */
export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,                              // JS cannot access
    secure: env.NODE_ENV === "production",       // HTTPS only in prod
    sameSite: "strict",                          // CSRF protection
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

/**
 * Clear auth cookie on logout
 */
export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
}

export { COOKIE_NAME };
```

### Step 4: Backend - Update auth handlers to set cookies

**File:** `backend/src/routes/auth/handlers.ts`

```typescript
// Add import
import { setAuthCookie, clearAuthCookie } from "#infrastructure/auth/cookie";

// Update handleLogin - set cookie and DON'T return token in body
export async function handleLogin(
  req: ValidatedRequest<{ body: LoginBody }>,
  res: Response,  // Add res parameter
): Promise<AppResponse<LoginResult>> {
  const body = req.validated.body;
  const result = await run(login(body));

  return matchResponse(result, {
    onSuccess: (data) => {
      // Set token in httpOnly cookie
      setAuthCookie(res, data.token);

      // Return user data only (no token in response body)
      return createSuccessResponse({
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          surname: data.user.surname,
          createdAt: data.user.createdAt,
          updatedAt: data.user.updatedAt,
          projectId: data.user.projectId,
          companyId: data.user.companyId,
        },
        // Remove: token: data.token
      });
    },
    onFailure: (error) => createFailureResponse(error),
  });
}

// Update handleRegister similarly
export async function handleRegister(
  req: ValidatedRequest<{ body: RegisterBody }>,
  res: Response,  // Add res parameter
): Promise<AppResponse<CreateUserResult>> {
  const body = req.validated.body;
  const result = await run(createUser(body));

  return matchResponse(result, {
    onSuccess: (data) => {
      // Set token in httpOnly cookie
      setAuthCookie(res, data.token);

      return createSuccessResponse({
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          surname: data.user.surname,
        },
        // Remove: token: data.token
      });
    },
    onFailure: (error) => createFailureResponse(error),
  });
}

// Update handleLogout to clear cookie
export async function handleLogout(
  req: AuthenticatedRequest,
  res: Response,  // Add res parameter
): Promise<AppResponse<LogoutResponse>> {
  try {
    // Get token from cookie instead of header
    const token = req.cookies?.access_token;

    if (!token) {
      // ... existing logic
    }

    // Delete session from database
    const deletedSessions = await sessionRepository.deleteByToken(token);

    // Clear the auth cookie
    clearAuthCookie(res);

    // ... rest of existing logic
    return createSuccessResponse({
      message: "Logged out successfully",
    });
  } catch (error) {
    // ... existing error handling
  }
}
```

### Step 5: Backend - Update auth middleware to read from cookie

**File:** `backend/src/middlewares/auth.ts`

```typescript
// Add cookie types
declare module "express" {
  interface Request {
    cookies: { [key: string]: string };
  }
}

export async function auth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Try cookie first, fall back to Authorization header for backwards compatibility
    const token = req.cookies?.access_token || extractBearerToken(req);

    if (!token) {
      logger.warn(
        {
          path: req.path,
          method: req.method,
          requestId: getRequestId(),
        },
        "No authentication token found",
      );

      res
        .status(401)
        .json(
          errorResponse(
            "Authentication required. Please login.",
            "MISSING_TOKEN",
          ),
        );
      return;
    }

    // ... rest of existing verification logic (JWT verify, session check)
  } catch (error) {
    // ... existing error handling
  }
}

/**
 * Extract Bearer token from Authorization header
 * Used for backwards compatibility during migration
 */
function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const tokenParts = authHeader.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") return null;

  return tokenParts[1];
}
```

### Step 6: Backend - Update resultHandler to pass res to handlers

**File:** `backend/src/middlewares/resultHandler.ts`

The handlers now need access to `res` to set cookies. Update the handler type:

```typescript
export type ResultHandler<R extends Request = Request> = (
  req: R,
  res: Response,  // handlers now receive res
  next: NextFunction,
) => Promise<AppResponse<unknown>>;
```

---

### Step 7: Frontend - Update authStore (remove token)

**File:** `frontend/src/store/authStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthState {
    // State - no more token
    user: AuthUser | null;

    // Actions
    setUser: (user: AuthUser) => void;
    clearAuth: () => void;

    // Loading state
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
                // No more token - it's in httpOnly cookie
            }),
        },
    ),
);

// Update convenience hooks
export const useIsAuthenticated = () => {
    const user = useAuthStore((state) => state.user);
    return user !== null;
};
```

### Step 8: Frontend - Update axios (remove Authorization header)

**File:** `frontend/src/api/axios.ts`

```typescript
import axiosPackage from 'axios';
import { API_URL } from '#config/env';
import { useAuthStore } from '#store/authStore';

export const axios = axiosPackage.create({
    withCredentials: true,  // IMPORTANT: This sends cookies automatically
    baseURL: API_URL,
});

// REMOVE the request interceptor that adds Authorization header
// Cookie is sent automatically with withCredentials: true

/**
 * Response interceptor: Handle 401 errors (unauthorized)
 */
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().clearAuth();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);
```

### Step 9: Frontend - Update login flow

**File:** `frontend/src/api/methods/auth.api.ts` (or wherever login is called)

```typescript
// Login response no longer includes token
interface LoginResponse {
    user: AuthUser;
    // No more token field
}

export const login = async (credentials: LoginCredentials) => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);

    if (response.data.success) {
        // Only store user info - token is in cookie
        useAuthStore.getState().setUser(response.data.data.user);
    }

    return response;
};
```

### Step 10: Frontend - Update/remove auth utilities

**File:** `frontend/src/utils/auth.ts`

```typescript
// Remove getAuthToken - no longer needed
// Remove isTokenValid - token is managed by backend cookie expiry

// If you need to check auth status, call an API endpoint
export const checkAuthStatus = async (): Promise<boolean> => {
    try {
        // Call a protected endpoint - cookie sent automatically
        await axios.get('/auth/me');  // Add this endpoint in backend
        return true;
    } catch {
        return false;
    }
};
```

### Step 11: Backend - Add /auth/me endpoint (optional but recommended)

**File:** `backend/src/routes/auth/routes.ts`

```typescript
/**
 * GET /auth/me
 * Get current authenticated user (protected endpoint)
 * Used by frontend to verify auth status on app load
 */
router.get("/me", auth, handleResult(handleGetMe));
```

**File:** `backend/src/routes/auth/handlers.ts`

```typescript
export async function handleGetMe(
  req: AuthenticatedRequest,
): Promise<AppResponse<{ user: UserInfo }>> {
  // User info is already attached by auth middleware
  return createSuccessResponse({
    user: {
      id: req.userId!,
      email: req.user!.email,
      // Add other user fields as needed
    },
  });
}
```

---

## Migration Strategy

### Option A: Big Bang (Simple, short downtime)
1. Deploy backend changes
2. Deploy frontend changes
3. Users need to re-login (old tokens in localStorage won't work)

### Option B: Gradual (Zero downtime)
1. Backend: Accept both cookie AND header (Step 5 already does this)
2. Deploy backend
3. Deploy frontend
4. After migration period, remove header support from backend

**Recommended: Option B** - The backend changes support both methods.

---

## Testing Checklist

### Backend Tests
- [ ] Login sets httpOnly cookie
- [ ] Register sets httpOnly cookie
- [ ] Logout clears cookie
- [ ] Auth middleware reads from cookie
- [ ] Auth middleware falls back to header (backwards compat)
- [ ] Cookie has correct flags (httpOnly, secure, sameSite)

### Frontend Tests
- [ ] Login stores user but not token
- [ ] Axios sends cookies automatically
- [ ] 401 response clears auth and redirects
- [ ] Auth check works without token in localStorage

### E2E Tests
- [ ] Full login flow works
- [ ] Protected routes accessible after login
- [ ] Logout invalidates session
- [ ] New tab/window maintains session (cookie shared)

---

## Security Considerations

1. **CSRF Protection**: `sameSite: 'strict'` prevents CSRF in modern browsers
2. **HTTPS Required**: `secure: true` in production ensures cookie only sent over HTTPS
3. **XSS Protection**: `httpOnly: true` prevents JavaScript access to token
4. **Session Invalidation**: Existing session-based invalidation still works

---

## Rollback Plan

If issues occur:
1. Backend: Remove cookie-parser, revert auth middleware to header-only
2. Frontend: Restore token storage in authStore, restore Authorization header

The backwards-compatible backend (Option B) allows quick rollback by just reverting frontend.

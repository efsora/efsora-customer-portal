import { jwtDecode } from 'jwt-decode';

/**
 * JWT token payload structure
 */
interface JWTPayload {
    exp?: number;
    [key: string]: unknown;
}

/**
 * Check if a JWT token is valid (not expired)
 * @param token - JWT token string
 * @returns true if token is valid, false otherwise
 */
export const isTokenValid = (token: string | null): boolean => {
    if (!token) {
        return false;
    }

    try {
        const decoded = jwtDecode<JWTPayload>(token);

        if (!decoded.exp) {
            // If no expiration is set, consider it as valid
            return true;
        }

        // exp is in seconds, convert to milliseconds and compare with current time
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();

        return currentTime < expirationTime;
    } catch {
        // If decoding fails, consider token as invalid
        return false;
    }
};

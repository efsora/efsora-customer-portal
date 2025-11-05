import * as api from '#api/api';
import { ENDPOINTS } from '#api/endpoints';

import type {
    RegisterRequest,
    LoginRequest,
} from '../types/auth/request.types';
import type {
    AppResponse_RegisterResponse_,
    AppResponse_LoginResponse_,
} from '../types/auth/response.types';

/**
 * Register a new user
 */
export const register = async (
    registerRequest: RegisterRequest,
): Promise<AppResponse_RegisterResponse_> => {
    const response = await api.post<
        AppResponse_RegisterResponse_,
        RegisterRequest
    >(ENDPOINTS.AUTH.REGISTER, registerRequest);

    return response?.data;
};

/**
 * Login a user with email and password
 */
export const login = async (
    loginRequest: LoginRequest,
): Promise<AppResponse_LoginResponse_> => {
    const response = await api.post<AppResponse_LoginResponse_, LoginRequest>(
        ENDPOINTS.AUTH.LOGIN,
        loginRequest,
    );

    return response?.data;
};

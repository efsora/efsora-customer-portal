import * as api from '#api/api';

import type { CreateUserRequest } from '../types/user/request.types';
import type { AppResponse_CreateUserResponse_ } from '../types/user/response.types';

export const createUser = async (
    createUserRequest: CreateUserRequest,
): Promise<AppResponse_CreateUserResponse_> => {
    const response = await api.post<
        AppResponse_CreateUserResponse_,
        CreateUserRequest
    >('/api/v1/users', createUserRequest);

    return response?.data;
};

export const getUserById = async (
    userId: number,
): Promise<AppResponse_CreateUserResponse_> => {
    const response = await api.get<AppResponse_CreateUserResponse_>(
        `/api/v1/users/${userId}`,
    );

    return response?.data;
};

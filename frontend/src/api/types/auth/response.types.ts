import type { components } from '../../../../schema';
import type { AppResponse } from '../base.types';

// RegisterResponse from OpenAPI - contains user data with token
export type RegisterResponse = {
    id: string;
    email: string;
    name: string | null;
    token: string;
};

// LoginResponse from OpenAPI - contains user object and token
export type LoginResponse = {
    user: {
        id: string;
        email: string;
        name: string | null;
        createdAt: string;
        updatedAt: string;
    };
    token: string;
};

export type UserData = components['schemas']['UserData'];

export type AppResponse_RegisterResponse_ = AppResponse<RegisterResponse>;
export type AppResponse_LoginResponse_ = AppResponse<LoginResponse>;

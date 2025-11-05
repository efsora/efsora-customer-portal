import type { components } from '../../../../schema';
import type { AppResponse } from '../base.types';

export type RegisterResponse = components['schemas']['RegisterResponse'];
export type UserData = components['schemas']['UserData'];

export type AppResponse_RegisterResponse_ = AppResponse<RegisterResponse>;
export type AppResponse_UserData_ = AppResponse<UserData>;

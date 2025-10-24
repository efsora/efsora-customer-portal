import type { AxiosResponse } from 'axios';

import * as api from './api';
import type { AppResponse_HelloResponse_ } from './models.ts';

export const getHello = async (): Promise<AppResponse_HelloResponse_> => {
    const response = await api.get('/api/v1/hello');
    return (response as AxiosResponse<AppResponse_HelloResponse_>).data;
};

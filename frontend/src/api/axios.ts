import axiosPackage from 'axios';

import { API_URL } from 'src/constants/env';

export const axios = axiosPackage.create({
    withCredentials: true,
    baseURL: API_URL,
});

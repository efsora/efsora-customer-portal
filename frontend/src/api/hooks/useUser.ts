import { useQuery } from '@tanstack/react-query';

import { getAllUsers, getUserById } from '#api/methods/user.api';
import { MINUTES_IN_MS } from '#config/time';
import { QUERY_KEYS } from '#constants/queryKeys';

export function useGetUserById(userId: string) {
    return useQuery({
        queryKey: [QUERY_KEYS.USER.BY_ID, userId],
        queryFn: async () => getUserById(userId),
        staleTime: MINUTES_IN_MS * 5,
        retry: 2,
        enabled: !!userId,
    });
}

export function useGetAllUsers() {
    return useQuery({
        queryKey: [QUERY_KEYS.USER.ALL],
        queryFn: async () => getAllUsers(),
        staleTime: MINUTES_IN_MS * 5,
        retry: 2,
    });
}

import { useQuery } from '@tanstack/react-query';

import { getHello } from '#api/helloApi/getHello.api.ts';
import { MINUTES_IN_MS } from '#config/time';
import QUERY_KEYS from 'src/constants/queryKeys';

export function useGetHello() {
    return useQuery({
        queryKey: [QUERY_KEYS.HELLO],
        queryFn: getHello,
        staleTime: MINUTES_IN_MS * 5,
        retry: 2,
    });
}

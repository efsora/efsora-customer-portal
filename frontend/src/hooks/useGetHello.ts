import { useQuery } from '@tanstack/react-query';

import { getHello } from '../api/helloApi.ts';
import { FIVE_MINUTES_IN_MS } from '../config/constants.ts';
import QUERY_KEYS from '../config/queryKeys.ts';

export function useGetHello() {
    return useQuery({
        queryKey: [QUERY_KEYS.HELLO],
        queryFn: getHello,
        staleTime: FIVE_MINUTES_IN_MS,
        retry: 2,
    });
}

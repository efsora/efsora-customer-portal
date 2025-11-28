import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';

import { NotificationProvider } from './presentation/components/common/NotificationProvider.tsx';
import ErrorBoundary from './presentation/view/wrappers/ErrorBoundary.tsx';
import Router from './presentation/view/wrappers/Router.tsx';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
            gcTime: 10 * 60 * 1000, // 10 minutes - cache retention
            retry: 2, // Retry failed requests twice
            refetchOnWindowFocus: false, // Don't refetch on window focus
            refetchOnMount: true, // Refetch when component mounts
        },
        mutations: {
            retry: 1, // Retry failed mutations once
        },
    },
});

function App() {
    return (
        <>
            <QueryClientProvider client={queryClient}>
                <ErrorBoundary>
                    <NotificationProvider />
                    <Router />
                </ErrorBoundary>
            </QueryClientProvider>
        </>
    );
}

export default App;

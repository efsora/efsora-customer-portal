import { ChevronsUpDown, HelpCircle, Home, LogOut, FileText, Clock, Users } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

import { useLogout } from '#api/hooks/useAuth';
import { useGetUserById } from '#hooks/useUser';
import { useCurrentUser } from '#store/authStore';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';

interface NavItem {
    label: string;
    path: string;
    icon: React.ElementType;
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        path: '/',
        icon: Home,
    },
    {
        label: 'Timeline',
        path: '/timeline',
        icon: Clock,
    },
    {
        label: 'Documents',
        path: '/documents',
        icon: FileText,
    },
    {
        label: 'Your Team',
        path: '/yourteam',
        icon: Users,
    },
];

// Customer data - can be connected to API later
const customers = [
    { id: 'allsober', name: 'AllSober', subtitle: 'EMR Platform' },
];

function SidebarUserProfile() {
    const navigate = useNavigate();
    const { state } = useSidebar();
    const currentUser = useCurrentUser();
    const userId = currentUser?.id || '';
    const { data: user, isLoading, isError } = useGetUserById(userId);
    const { mutate: logout, isPending } = useLogout();

    const getInitials = (
        name: string | null | undefined,
        surname: string | null | undefined,
    ) => {
        const fullName = [name, surname].filter(Boolean).join(' ');
        if (!fullName) return 'U';
        const words = fullName.trim().split(/\s+/);
        return words
            .map((word) => word.charAt(0).toUpperCase())
            .join('')
            .slice(0, 2);
    };

    const handleLogout = () => {
        logout(undefined, {
            onSuccess: () => {
                navigate('/login');
            },
            onError: () => {
                navigate('/login');
            },
        });
    };

    if (isLoading) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg">
                        <div className="h-8 w-8 animate-pulse rounded-lg bg-sidebar-accent" />
                        <span className="truncate">Loading...</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    if (isError) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
                            !
                        </div>
                        <span className="truncate">Error</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    const userName =
        [user?.data?.name, user?.data?.surname].filter(Boolean).join(' ') ||
        'Unknown User';

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            data-testid="user-dropdown-trigger"
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                                {getInitials(user?.data?.name, user?.data?.surname)}
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{userName}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={state === 'collapsed' ? 'right' : 'top'}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuItem
                            onSelect={() => navigate('/help')}
                            data-testid="help-support-button"
                        >
                            <HelpCircle className="mr-2 h-4 w-4" />
                            Help & Support
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={handleLogout}
                            disabled={isPending}
                            className="text-destructive focus:text-destructive"
                            data-testid="logout-button"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            {isPending ? 'Logging out...' : 'Logout'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

function CustomerSelector() {
    const currentCustomer = customers[0];
    const { state } = useSidebar();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                                <img
                                    src="/allsober.svg"
                                    alt={currentCustomer.name}
                                    className="h-8 w-8"
                                />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{currentCustomer.name}</span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {currentCustomer.subtitle}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={state === 'collapsed' ? 'right' : 'bottom'}
                        align="start"
                        sideOffset={4}
                    >
                        {customers.map((customer) => (
                            <DropdownMenuItem
                                key={customer.id}
                                onSelect={() => {
                                    console.log(`Switched to ${customer.name}`);
                                }}
                            >
                                {customer.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                {/* Logo */}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="/">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                                    <img
                                        src="/efsora-logo.svg"
                                        alt="Efsora"
                                        className="h-8 w-8"
                                    />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Efsora Labs</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {/* Customer Selector */}
                <CustomerSelector />
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {navItems.map((item) => (
                            <SidebarMenuItem key={item.path}>
                                <NavLink to={item.path}>
                                    {({ isActive }) => (
                                        <SidebarMenuButton
                                            isActive={isActive}
                                            tooltip={item.label}
                                        >
                                            <item.icon />
                                            <span>{item.label}</span>
                                        </SidebarMenuButton>
                                    )}
                                </NavLink>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarUserProfile />
            </SidebarFooter>
        </Sidebar>
    );
}

'use client';

import { Banknote, BookOpen, LayoutDashboard, Settings2, TicketCheck, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LogoutButton } from '@/components/logout-button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    testId: 'dashboard_nav',
  },
  {
    title: 'Banks',
    url: '/dashboard/banks',
    icon: Banknote,
    testId: 'banks_nav',
  },
  {
    title: 'Tickets',
    url: '/dashboard/bets/new',
    icon: TicketCheck,
    testId: 'bets_nav',
  },
  {
    title: 'Catálogo',
    url: '/dashboard/catalog',
    icon: BookOpen,
    testId: 'catalog_nav',
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { user, profile } = useAuth();
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'SL';

  return (
    <Sidebar collapsible="icon" data-testid="appSidebar" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-1">
          <div className="relative h-20 w-20">
            <Image
              src="/imageSL.png"
              alt="StakeLedger logo"
              fill
              sizes="80px"
              className="rounded-[28px] object-cover"
              priority
            />
          </div>
          <div className={cn('grid', state === 'collapsed' ? 'sr-only' : '')}>
            <span className="text-sm font-semibold">StakeLedger</span>
            <span className="text-xs text-sidebar-foreground/60">
              Control de bank
            </span>
          </div>
          <Badge
            variant="outline"
            className={cn('ml-auto', state === 'collapsed' ? 'sr-only' : '')}
          >
            MVP
          </Badge>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={state === 'collapsed' ? 'sr-only' : ''}>
            Operacion
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu data-testid="primary_nav">
              {navItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      data-testid={item.testId}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span className={state === 'collapsed' ? 'sr-only' : ''}>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {(profile?.role === 'admin' || profile?.role === 'editor') && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/dashboard/admin/catalog'}
                    tooltip="Gestionar catálogo"
                    data-testid="admin_catalog_nav"
                  >
                    <Link href="/dashboard/admin/catalog">
                      <Settings2 className="h-4 w-4" />
                      <span className={state === 'collapsed' ? 'sr-only' : ''}>Gestionar catálogo</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {profile?.role === 'admin' && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/dashboard/admin/users'} tooltip="Gestionar usuarios" data-testid="admin_users_nav">
                    <Link href="/dashboard/admin/users">
                      <Users className="h-4 w-4" />
                      <span className={state === 'collapsed' ? 'sr-only' : ''}>Gestionar usuarios</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className={cn('flex-1', state === 'collapsed' ? 'sr-only' : '')}>
            <p className="text-sm font-semibold">Sesion activa</p>
            <p className="text-xs text-sidebar-foreground/60">
              <span aria-hidden className="min-w-24"></span>
              <span className="sr-only">Usuario</span>
            </p>
          </div>
          <div className={state === 'collapsed' ? 'sr-only' : ''}>
            <LogoutButton />
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

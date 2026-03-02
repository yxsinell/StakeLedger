'use client';

import { Info, Zap } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/auth-context';

export function AppHeader() {
  const { user } = useAuth();
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'SL';

  return (
    <header
      className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-background/80 px-6 py-4 backdrop-blur"
      data-testid="appHeader"
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger data-testid="sidebar_toggle" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Panel operativo</h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="panel_info">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Datos en tiempo real con foco en riesgo y trazabilidad.
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground">
            Seguimiento de banks, tickets y metas activas.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="secondary" data-testid="fast_action_button">
          <Zap className="h-4 w-4" />
          Accion rapida
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2" data-testid="user_menu_trigger">
              <Avatar className="h-7 w-7">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span aria-hidden className="min-w-16"></span>
              <span className="sr-only">Usuario</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem data-testid="profile_menu_item">
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="settings_menu_item">
              Configuracion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

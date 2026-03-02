'use client';

import { Slot } from '@radix-ui/react-slot';
import { ChevronLeft, Menu } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SidebarContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  state: 'expanded' | 'collapsed'
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    listener();
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [open, setOpen] = React.useState(defaultOpen);

  React.useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile]);

  const value = React.useMemo<SidebarContextValue>(() => {
    const state = open ? 'expanded' : 'collapsed';
    return {
      open,
      setOpen,
      toggle: () => setOpen(prev => !prev),
      state,
      isMobile,
    };
  }, [open, isMobile]);

  return (
    <SidebarContext.Provider value={value}>
      <div className="flex min-h-svh w-full">{children}</div>
    </SidebarContext.Provider>
  );
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: 'icon' | 'offcanvas'
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, collapsible = 'icon', ...props }, ref) => {
    const { state, isMobile, open } = useSidebar();
    const isCollapsed = state === 'collapsed' && collapsible === 'icon';

    return (
      <aside
        ref={ref}
        data-state={state}
        data-collapsible={collapsible}
        className={cn(
          'relative flex h-svh flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200',
          isMobile
            ? 'fixed inset-y-0 left-0 z-50 w-72'
            : isCollapsed
              ? 'w-20'
              : 'w-72',
          isMobile && !open ? '-translate-x-full' : 'translate-x-0',
          className,
        )}
        {...props}
      />
    );
  },
);
Sidebar.displayName = 'Sidebar';

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex min-h-svh flex-1 flex-col', className)}
    {...props}
  />
));
SidebarInset.displayName = 'SidebarInset';

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('px-4 pb-2 pt-4', className)} {...props} />
));
SidebarHeader.displayName = 'SidebarHeader';

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 overflow-y-auto px-3 pb-4', className)}
    {...props}
  />
));
SidebarContent.displayName = 'SidebarContent';

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('px-3 pb-4', className)} {...props} />
));
SidebarFooter.displayName = 'SidebarFooter';

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-2', className)} {...props} />
));
SidebarGroup.displayName = 'SidebarGroup';

const SidebarGroupLabel = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('px-3 text-xs font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/60', className)}
    {...props}
  />
));
SidebarGroupLabel.displayName = 'SidebarGroupLabel';

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-1', className)} {...props} />
));
SidebarGroupContent.displayName = 'SidebarGroupContent';

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn('grid gap-1', className)} {...props} />
));
SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('list-none', className)} {...props} />
));
SidebarMenuItem.displayName = 'SidebarMenuItem';

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, asChild = false, isActive, tooltip, ...props }, ref) => {
  const { state } = useSidebar();
  const Comp = asChild ? Slot : 'button';
  const button = (
    <Comp
      ref={ref}
      data-active={isActive}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
        state === 'collapsed' ? 'justify-center' : '',
        className,
      )}
      {...props}
    />
  );

  if (!tooltip || state !== 'collapsed') {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
});
SidebarMenuButton.displayName = 'SidebarMenuButton';

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { toggle } = useSidebar();

  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      size="icon"
      className={cn('h-9 w-9', className)}
      onClick={(event) => {
        onClick?.(event);
        toggle();
      }}
      {...props}
    >
      <Menu className="h-4 w-4" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = 'SidebarTrigger';

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { toggle } = useSidebar();

  return (
    <button
      ref={ref}
      type="button"
      onClick={toggle}
      className={cn(
        'absolute -right-3 top-20 hidden h-9 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition hover:text-foreground md:flex',
        className,
      )}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Toggle sidebar</span>
    </button>
  );
});
SidebarRail.displayName = 'SidebarRail';

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
};



'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Settings,
  MessageSquare,
  Heart,
  LoaderCircle,
  Package,
  Home,
  Leaf,
  PenSquare,
} from 'lucide-react';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useEffect } from 'react';
import { HeaderActions } from '@/components/header-actions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Loading from './loading';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, unreadMessagesCount } = useAuth();

  useEffect(() => {
    // This effect handles redirection ONLY if the auth state is fully resolved and there's no user.
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    // This effect handles the initial redirection for sellers from /dashboard to /dashboard/orders.
    if (!isLoading && user?.type === 'seller' && pathname === '/dashboard') {
      router.replace('/dashboard/orders');
    }
  }, [isLoading, user, pathname, router]);


  // If the auth state is still loading, show a full-page loader.
  // This prevents any child components from rendering prematurely.
  if (isLoading) {
    return <Loading />;
  }

  // If loading is finished and there is still no user, the useEffect above will handle redirection.
  // In the meantime, we can render a loader to avoid a flash of content or an error.
  if (!user) {
    return <Loading />;
  }

  const isActive = (path: string) => pathname === path || (path === '/dashboard/messages' && pathname.startsWith('/dashboard/messages'));

  const sellerNav = [
    { href: '/dashboard/orders', label: 'Commandes', icon: ShoppingCart },
    { href: '/dashboard/products', label: 'Produits', icon: Package },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare, notificationCount: unreadMessagesCount },
  ];

  const buyerNav = [
    { href: '/dashboard/orders', label: 'Mes Commandes', icon: ShoppingCart },
    { href: '/dashboard/favorites', label: 'Favoris', icon: Heart },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare, notificationCount: unreadMessagesCount },
  ];

  const commonNav = [
    { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
  ];

  const sellerSiteManagementNav = [
  ]

  const siteNav = [
    { href: '/', label: 'Accueil' },
    { href: '/products', label: 'Produits' },
    { href: '/ingredients.html', label: 'Nos Ingrédients' },
  ];

  const navItems = user.type === 'seller' ? sellerNav : buyerNav;

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2">
            <Icons.logo className="size-7 text-primary" />
            <span className="text-lg font-semibold font-headline">Ùnica Cosmétiques</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          {user.type === 'buyer' && (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard')}
                  tooltip={{ children: 'Dashboard' }}
                >
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href} className="relative">
                    <item.icon />
                    <span>{item.label}</span>
                     {item.notificationCount && item.notificationCount > 0 && (
                      <Badge className="absolute right-2 top-1/2 -translate-y-1/2 h-5 min-w-[1.25rem] justify-center p-1 text-xs">
                        {item.notificationCount}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          
          {user.type === 'seller' && sellerSiteManagementNav.length > 0 && (
            <>
              <SidebarSeparator />
              <SidebarMenu>
                 <span className="px-4 text-xs font-semibold uppercase text-muted-foreground/80">Gestion du site</span>
                 {sellerSiteManagementNav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={{ children: item.label }}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                 ))}
              </SidebarMenu>
            </>
          )}

          <SidebarSeparator />
          <SidebarMenu>
            {commonNav.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1">
            {user.type === 'buyer' && (
                <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
                {siteNav.map((item) => (
                    <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'transition-colors hover:text-foreground/80',
                        pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                    )}
                    >
                    {item.label}
                    </Link>
                ))}
                </nav>
            )}
          </div>
          <HeaderActions />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-secondary/40">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

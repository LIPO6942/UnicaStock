

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
  useSidebar,
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

// We create a sub-component to be able to use the useSidebar hook
function DashboardNav() {
  const pathname = usePathname();
  const { user, unreadMessagesCount } = useAuth();
  const { open } = useSidebar();

  const isActive = (path: string) => pathname === path || (path === '/dashboard/messages' && pathname.startsWith('/dashboard/messages'));

  const sellerNav = [
    { href: '/dashboard/orders', label: 'Commandes', icon: ShoppingCart },
    { href: '/dashboard/products', label: 'Produits', icon: Package },
    { href: '/dashboard/ingredients', label: 'Ingrédients', icon: Leaf },
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

  const navItems = user?.type === 'seller' ? sellerNav : buyerNav;

  return (
    <>
      {user?.type === 'buyer' && (
          <SidebarMenu>
          <SidebarMenuItem>
              <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard')}
              tooltip={{ children: 'Dashboard' }}
              >
              <Link href="/dashboard">
                  <LayoutDashboard />
                  {open && <span>Dashboard</span>}
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
                  {open && (
                    <>
                      <span>{item.label}</span>
                      {item.notificationCount && item.notificationCount > 0 && (
                        <Badge className="absolute right-2 top-1/2 -translate-y-1/2 h-5 min-w-[1.25rem] justify-center p-1 text-xs">
                            {item.notificationCount}
                        </Badge>
                      )}
                    </>
                  )}
              </Link>
              </SidebarMenuButton>
          </SidebarMenuItem>
          ))}
      </SidebarMenu>
      
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
                  {open && <span>{item.label}</span>}
              </Link>
              </SidebarMenuButton>
          </SidebarMenuItem>
          ))}
      </SidebarMenu>
    </>
  );
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!isLoading && user?.type === 'buyer' && pathname === '/dashboard') {
      router.replace('/dashboard/orders');
    }
    if (!isLoading && user?.type === 'seller' && pathname === '/dashboard') {
      router.replace('/dashboard/orders');
    }
  }, [isLoading, user, pathname, router]);


  if (isLoading) {
    return <Loading />;
  }
  
  if (!user) {
    return null;
  }

  const siteNav = [
    { href: '/', label: 'Accueil' },
    { href: '/products', label: 'Produits' },
    { href: '/ingredients', label: 'Nos Ingrédients' },
  ];


  return (
    <SidebarProvider defaultOpen>
        <Sidebar>
            <SidebarHeader>
            <Link href="/" className="flex items-center gap-2">
                <Icons.logo className="size-7 text-primary" />
                <span className="text-lg font-semibold font-headline">Única Stock</span>
            </Link>
            </SidebarHeader>
            <SidebarContent>
              <DashboardNav />
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

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
} from 'lucide-react';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useEffect } from 'react';
import { HeaderActions } from '@/components/header-actions';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // Redirect seller from dashboard root to orders page
  useEffect(() => {
    if (!isLoading && user?.type === 'seller' && pathname === '/dashboard') {
      router.replace('/dashboard/orders');
    }
  }, [isLoading, user, pathname, router]);


  if (isLoading || !user) {
    return (
        <div className="flex h-screen items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  const isActive = (path: string) => pathname === path;

  const sellerNav = [
    { href: '/dashboard/orders', label: 'Commandes', icon: ShoppingCart },
    { href: '/dashboard/products', label: 'Produits', icon: Package },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  ];

  const buyerNav = [
    { href: '/dashboard/orders', label: 'Mes Commandes', icon: ShoppingCart },
    { href: '/dashboard/favorites', label: 'Favoris', icon: Heart },
  ];

  const commonNav = [
    { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
  ];

  const navItems = user.type === 'seller' ? sellerNav : buyerNav;

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Icons.logo className="size-7 text-primary" />
            <span className="text-lg font-semibold font-headline">Unica Link</span>
          </div>
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
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
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
            {/* Can add search bar here if needed */}
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

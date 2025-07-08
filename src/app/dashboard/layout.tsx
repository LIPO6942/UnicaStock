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
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FlaskConical,
  Settings,
  Users,
  BarChart3,
  MessageSquare,
} from 'lucide-react';
import { Icons } from '@/components/icons';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  // Mock user type, in a real app this would come from session/auth context
  const userType = 'seller'; 

  const sellerNav = [
    { href: '/dashboard/products', label: 'Produits', icon: Package },
    { href: '/dashboard/orders', label: 'Commandes', icon: ShoppingCart },
    { href: '/dashboard/analytics', label: 'Analyses', icon: BarChart3 },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  ];

  const buyerNav = [
    { href: '/dashboard/orders', label: 'Mes Commandes', icon: ShoppingCart },
    { href: '/dashboard/favorites', label: 'Favoris', icon: Package },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  ];

  const adminNav = [
    { href: '/dashboard/users', label: 'Utilisateurs', icon: Users },
    { href: '/dashboard/categories', label: 'Catégories', icon: LayoutDashboard },
  ];

  const commonNav = [
    { href: '/dashboard/ai-generator', label: 'AI Generator', icon: FlaskConical },
    { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
  ];

  // Determine nav items based on user type
  const navItems = userType === 'seller' ? sellerNav : buyerNav;

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Icons.logo className="size-6 text-primary" />
            <span className="text-lg font-semibold font-headline">Unica Link</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
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
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1">
            {/* Can add search bar here if needed */}
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

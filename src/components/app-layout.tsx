
'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { MainNav } from '@/components/main-nav';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { HeaderActions } from '@/components/header-actions';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <>
      <div className="relative flex min-h-screen flex-col">
        {!isDashboard ? (
          <>
            <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
                <MainNav />
                <div className="flex flex-1 items-center justify-end space-x-4">
                  <HeaderActions />
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="py-6 md:px-8 md:py-0 bg-secondary/50">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                <div className="flex items-center gap-2">
                  <Icons.logo className="h-6 w-6 text-primary" />
                  <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    Construit avec passion
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Conditions d'utilisation
                  </Link>
                  <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Politique de confidentialité
                  </Link>
                </div>
              </div>
            </footer>
          </>
        ) : (
          <>{children}</>
        )}
      </div>
      <Toaster />
    </>
  );
}

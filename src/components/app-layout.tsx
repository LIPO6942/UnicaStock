
'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { MainNav } from '@/components/main-nav';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { HeaderActions } from '@/components/header-actions';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Menu, Package2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/products', label: 'Produits' },
    { href: '/ingredients', label: 'Nos Ingrédients' },
  ];
  
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  }

  return (
    <>
      <div className="relative flex min-h-screen flex-col">
        {!isDashboard ? (
          <>
            <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
                <MainNav />
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                        >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <nav className="grid gap-6 text-lg font-medium">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-lg font-semibold"
                            onClick={handleLinkClick}
                        >
                            <Icons.logo className="h-6 w-6 text-primary" />
                            <span className="font-bold text-lg font-headline tracking-tight">Ùnica Cosmétiques</span>
                        </Link>
                         {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={handleLinkClick}
                                className={cn(
                                'transition-colors hover:text-foreground',
                                pathname === link.href ? 'text-foreground' : 'text-muted-foreground'
                                )}
                            >
                                {link.label}
                            </Link>
                         ))}
                          {user && (
                            <Link
                                href="/dashboard"
                                onClick={handleLinkClick}
                                className={cn(
                                'transition-colors hover:text-foreground',
                                pathname.startsWith('/dashboard') ? 'text-foreground' : 'text-muted-foreground'
                                )}
                            >
                                Dashboard
                            </Link>
                         )}
                        </nav>
                    </SheetContent>
                </Sheet>
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

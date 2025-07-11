
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { useAuth } from '@/context/auth-context';

export function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Icons.logo className="h-6 w-6 text-primary" />
        <span className="hidden sm:inline-block font-bold text-lg font-headline tracking-tight">Ùnica Link</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/products"
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === '/products' ? 'text-foreground' : 'text-foreground/60'
          )}
        >
          Produits
        </Link>
        {user && (
           <Link
              href="/dashboard"
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname.startsWith('/dashboard') ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              Dashboard
            </Link>
        )}
      </nav>
    </div>
  );
}

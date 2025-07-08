'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Icons.logo className="h-6 w-6 text-primary" />
        <span className="hidden font-bold sm:inline-block font-headline">Unica Link</span>
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
        <Link
          href="#"
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === '/sellers' ? 'text-foreground' : 'text-foreground/60'
          )}
        >
          Pour les Vendeurs
        </Link>
        <Link
          href="/dashboard/ai-generator"
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === '/dashboard/ai-generator' ? 'text-foreground' : 'text-foreground/60'
          )}
        >
          AI Generator
        </Link>
      </nav>
    </div>
  );
}

'use client';
import { useAuth } from '@/context/auth-context';
import { UserNav } from './user-nav';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Badge } from './ui/badge';

export function HeaderActions() {
    const { user, cartCount, isLoading } = useAuth();
    const isBuyer = user?.type === 'buyer';
    
    if (isLoading) {
        return <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />;
    }

    return (
        <div className="flex items-center space-x-2">
            {isBuyer && (
                <Button asChild variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Link href="/cart">
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && (
                            <Badge variant="destructive" className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full p-1 text-xs">
                                {cartCount}
                            </Badge>
                        )}
                        <span className="sr-only">Panier</span>
                    </Link>
                </Button>
            )}
            <UserNav />
        </div>
    );
}

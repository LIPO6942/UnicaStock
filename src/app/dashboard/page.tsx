
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, DollarSign, ShoppingCart, Heart, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order, OrderStatus } from '@/lib/types';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  
  useEffect(() => {
    if (!user || user.type !== 'buyer') return;
    
    setIsLoadingOrders(true);
    const ordersCollectionRef = collection(db, 'orders');
    // The composite query with `where` and `orderBy` requires a manual index in Firestore.
    // To avoid this manual step for the user, we remove server-side sorting
    // and apply it on the client instead.
    const q = query(
      ordersCollectionRef, 
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        orderNumber: doc.data().orderNumber || `#${doc.id.substring(0,4)}`,
        ...doc.data()
      } as Order));

      // Sort orders on the client
      fetchedOrders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

      setOrders(fetchedOrders);
      setIsLoadingOrders(false);
    });

    return () => unsubscribe();
  }, [user]);
  
  const getStatusBadgeProps = (status: OrderStatus): { variant: 'outline' | 'default' | 'destructive' | 'secondary', className?: string } => {
    switch (status) {
      case 'Livrée':
        return { variant: 'outline', className: 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400 font-medium' };
      case 'Expédiée':
        return { variant: 'outline', className: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-400 font-medium' };
      case 'Préparation en cours':
        return { variant: 'outline', className: 'border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-400 font-medium' };
      case 'Confirmée':
        return { variant: 'default', className: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-medium' };
      case 'Annulée':
        return { variant: 'destructive' };
      case 'En attente':
      default:
        return { variant: 'secondary' };
    }
  }

  if (isLoading || !user || user.type === 'seller') {
    return null; 
  }
  
  const recentOrders = orders.slice(0, 3);
  const totalSpent = orders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = orders.length;
  const favoriteCount = 0; // Favorites are not implemented yet

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dépensé</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSpent.toFixed(2)} TND</div>
            <p className="text-xs text-muted-foreground">Merci pour votre confiance !</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes Passées</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Depuis votre inscription.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits Favoris</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoriteCount}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/dashboard/favorites" className="hover:underline">
                Voir vos favoris
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Mes Commandes Récentes</CardTitle>
            <CardDescription>
              Voici un aperçu de vos dernières commandes.
            </CardDescription>
          </div>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/dashboard/orders">
              Voir tout
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingOrders ? (
             <div className="flex justify-center py-12">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : recentOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Vous n'avez pas encore passé de commande.</p>
                <Button asChild className="mt-4">
                  <Link href="/products">Commencer mes achats</Link>
                </Button>
              </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commande</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.orderNumber}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{new Date(order.date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="text-right">{order.total.toFixed(2)} TND</TableCell>
                    <TableCell className="text-center">
                       <Badge {...getStatusBadgeProps(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

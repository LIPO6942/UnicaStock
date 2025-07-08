'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, DollarSign, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BannerCarousel } from '@/components/banner-carousel';

export default function DashboardPage() {
  const { user, getOrdersForUser, isLoading } = useAuth();
  
  if (isLoading || !user || user.type === 'seller') {
    // Sellers are redirected by the layout, this is a fallback.
    return null; 
  }
  
  const userOrders = getOrdersForUser(user);
  const recentOrders = userOrders.slice(0, 3);
  const totalSpent = userOrders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = userOrders.length;
  // Favorites are mocked for now
  const favoriteCount = 3; 

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

      <BannerCarousel />

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
          {recentOrders.length === 0 ? (
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
                      <div className="font-medium">{order.id}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{new Date(order.date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="text-right">{order.total.toFixed(2)} TND</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={order.status === 'Livrée' ? 'default' : 'secondary'}>
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

'use client';

import { File } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/auth-context";

export default function DashboardOrdersPage() {
  const { user, getOrdersForUser, isLoading } = useAuth();
  
  if (isLoading || !user) {
    return null; // or a loading skeleton
  }
  
  const isSeller = user.type === 'seller';
  const orders = getOrdersForUser(user).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


  const cardTitle = isSeller ? "Toutes les Commandes" : "Mes Commandes";
  const cardDescription = isSeller 
    ? "Consultez l'historique de toutes les commandes clients."
    : "Consultez l'historique de vos commandes.";


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>{cardTitle}</CardTitle>
            <CardDescription>{cardDescription}</CardDescription>
        </div>
        {isSeller && (
            <Button size="sm" variant="outline" className="h-8 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Exporter
                </span>
            </Button>
        )}
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Vous n'avez aucune commande pour le moment.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                {isSeller && <TableHead>Client</TableHead>}
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Statut</TableHead>
                <TableHead className="text-center">Paiement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                  <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      {isSeller && <TableCell>{order.user}</TableCell>}
                      <TableCell className="hidden md:table-cell">{new Date(order.date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell className="text-right">{`${order.total.toFixed(2).replace('.', ',')} TND`}</TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                          <Badge variant={order.status === 'Livrée' ? 'default' : (order.status === 'Annulée' ? 'destructive' : 'secondary')}>
                              {order.status}
                          </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                          <Badge variant={order.payment === 'Réglé' ? 'default' : 'secondary'} className="capitalize">
                              {order.payment}
                          </Badge>
                      </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

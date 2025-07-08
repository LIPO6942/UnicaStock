'use client';

import React, { useState, useEffect } from "react";
import { File, ChevronRight, LoaderCircle, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from "firebase/firestore";
import type { Order, OrderStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const orderStatuses: OrderStatus[] = ['En attente', 'Confirmée', 'Préparation en cours', 'Expédiée', 'Livrée', 'Annulée'];

export default function DashboardOrdersPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    setIsLoadingOrders(true);
    const ordersCollectionRef = collection(db, 'orders');
    let q;
    
    if (user.type === 'seller') {
      q = query(ordersCollectionRef, orderBy('createdAt', 'desc'));
    } else {
      q = query(ordersCollectionRef, where('userId', '==', user.uid));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        orderNumber: doc.data().orderNumber || `#${doc.id.substring(0,4)}`,
        ...doc.data()
      } as Order));

      if (user.type === 'buyer') {
        fetchedOrders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      }

      setOrders(fetchedOrders);
      setIsLoadingOrders(false);
    }, (error) => {
        console.error("Error fetching orders:", error);
        setIsLoadingOrders(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const orderRef = doc(db, 'orders', orderId);
    try {
      await updateDoc(orderRef, { status: newStatus });
      toast({ title: "Statut mis à jour", description: `La commande a été marquée comme "${newStatus}".` });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut.", variant: "destructive" });
    }
  };

  if (isAuthLoading || isLoadingOrders) {
    return (
       <div className="flex flex-1 items-center justify-center">
         <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
       </div>
    )
  }
  
  const isSeller = user?.type === 'seller';

  const cardTitle = isSeller ? "Toutes les Commandes" : "Mes Commandes";
  const cardDescription = isSeller
    ? "Consultez l'historique de toutes les commandes clients."
    : "Consultez l'historique de vos commandes.";

  const toggleOrderDetails = (orderId: string) => {
    setOpenOrderId(openOrderId === orderId ? null : orderId);
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'Livrée': return 'default';
      case 'Annulée': return 'destructive';
      case 'Expédiée': return 'outline';
      default: return 'secondary';
    }
  }

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
                <React.Fragment key={order.id}>
                  <TableRow onClick={() => toggleOrderDetails(order.id)} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <ChevronRight className={`h-4 w-4 shrink-0 transition-transform duration-200 ${openOrderId === order.id ? 'rotate-90' : ''}`} />
                        {order.orderNumber}
                      </div>
                    </TableCell>
                    {isSeller && <TableCell>{order.userName}</TableCell>}
                    <TableCell className="hidden md:table-cell">{new Date(order.date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="text-right">{`${order.total.toFixed(2).replace('.', ',')} TND`}</TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={order.payment === 'Réglé' ? 'default' : 'secondary'} className="capitalize">
                        {order.payment}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  {openOrderId === order.id && (
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableCell colSpan={isSeller ? 6 : 5} className="p-0">
                        <div className="p-4 md:pl-14">
                          <div className="flex flex-col md:flex-row justify-between md:items-start mb-4 gap-4">
                              <div>
                                  <h4 className="font-semibold mb-2 text-sm">Détails de la commande</h4>
                                  {isSeller && order.buyerInfo && (
                                      <div className="text-sm text-muted-foreground space-y-1">
                                          <p><strong>Client :</strong> {order.userName}</p>
                                          <p><strong>Email :</strong> <a href={`mailto:${order.buyerInfo.email}`} className="text-primary hover:underline">{order.buyerInfo.email}</a></p>
                                          <p><strong>Adresse de livraison :</strong> (Non spécifiée)</p> 
                                      </div>
                                  )}
                                  {!isSeller && (
                                      <div className="text-sm text-muted-foreground">
                                          <p>Commande passée le {new Date(order.date).toLocaleDateString('fr-FR')}</p>
                                      </div>
                                  )}
                              </div>
                              {isSeller && (
                                  <div className="flex items-center gap-2">
                                      <div className="w-[200px]">
                                          <Select
                                              defaultValue={order.status}
                                              onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                                          >
                                              <SelectTrigger id={`status-${order.id}`}>
                                                  <SelectValue placeholder="Changer le statut" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                  {orderStatuses.map(status => (
                                                      <SelectItem key={status} value={status}>{status}</SelectItem>
                                                  ))}
                                              </SelectContent>
                                          </Select>
                                      </div>
                                      <Button variant="outline" size="sm">
                                          <MessageSquare className="mr-2 h-4 w-4" />
                                          Contacter
                                      </Button>
                                  </div>
                              )}
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Produit</TableHead>
                                <TableHead>Quantité</TableHead>
                                <TableHead className="text-right">Prix Unitaire</TableHead>
                                <TableHead className="text-right">Sous-total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {order.items.map((item, index) => (
                                <TableRow key={`${item.product.id}-${index}`} className="border-b-0">
                                  <TableCell className="font-medium">{item.product.name}</TableCell>
                                  <TableCell>{item.quantity} kg</TableCell>
                                  <TableCell className="text-right">{item.product.price.toFixed(2)} TND</TableCell>
                                  <TableCell className="text-right">
                                    {(item.product.price * item.quantity).toFixed(2)} TND
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

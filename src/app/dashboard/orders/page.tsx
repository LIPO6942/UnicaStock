

'use client';

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import { File, ChevronRight, LoaderCircle, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, runTransaction } from "firebase/firestore";
import type { Order, OrderStatus, Product } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


const orderStatuses: OrderStatus[] = ['En attente', 'Confirmée', 'Préparation en cours', 'Expédiée', 'Livrée', 'Annulée'];

export default function DashboardOrdersPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
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
      q = query(ordersCollectionRef);
    } else {
      q = query(ordersCollectionRef, where('userId', '==', user.uid));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        orderNumber: doc.data().orderNumber || `#${doc.id.substring(0,4)}`,
        ...doc.data()
      } as Order));

      fetchedOrders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

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
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;
  
    try {
      await runTransaction(db, async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) {
          throw "La commande n'existe pas.";
        }
        const currentOrderData = orderDoc.data() as Order;
  
        // Deduct stock when confirming order
        if (newStatus === 'Confirmée' && !currentOrderData.stockDeducted) {
          for (const item of currentOrderData.items) {
            if (!item.productId) {
                console.warn(`Article ignoré car productId est manquant: ${item.productName}`);
                continue;
            }
            const productRef = doc(db, 'products', item.productId);
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) throw `Produit ${item.productName} non trouvé.`;
  
            const productData = productDoc.data() as Product;
            const variantToUpdate = productData.variants.find(v => v.id === item.variant?.id);
  
            if (!variantToUpdate) throw `Variante ${item.variant?.contenance} non trouvée pour ${item.productName}`;
            if (variantToUpdate.stock < item.quantity) throw `Stock insuffisant pour ${item.productName}`;
  
            const newVariants = productData.variants.map(v =>
              v.id === item.variant.id ? { ...v, stock: v.stock - item.quantity } : v
            );
            transaction.update(productRef, { variants: newVariants });
          }
          transaction.update(orderRef, { status: newStatus, stockDeducted: true });
          toast({ title: "Commande confirmée", description: "Le stock a été mis à jour." });
        } 
        // Restore stock when a confirmed order is cancelled
        else if (newStatus === 'Annulée' && currentOrderData.stockDeducted) {
            for (const item of currentOrderData.items) {
                if (!item.productId) {
                    console.warn(`Article ignoré car productId est manquant: ${item.productName}`);
                    continue;
                }
                const productRef = doc(db, 'products', item.productId);
                const productDoc = await transaction.get(productRef);
                if (!productDoc.exists()) {
                    console.warn(`Produit ${item.productName} non trouvé lors de l'annulation, impossible de restituer le stock.`);
                    continue; 
                }
    
                const productData = productDoc.data() as Product;
                const newVariants = productData.variants.map(v =>
                    v.id === item.variant?.id ? { ...v, stock: v.stock + item.quantity } : v
                );
                transaction.update(productRef, { variants: newVariants });
            }
            transaction.update(orderRef, { status: newStatus, stockDeducted: false });
            toast({ title: "Commande annulée", description: "Le stock a été restitué." });
        }
        else {
          // For other status changes, just update the status
          transaction.update(orderRef, { status: newStatus });
          toast({ title: "Statut mis à jour", description: `La commande a été marquée comme "${newStatus}".` });
        }
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast({ title: "Erreur", description: String(error), variant: "destructive" });
    }
  };

  const handleExport = () => {
    if (orders.length === 0) {
      toast({ title: "Aucune commande à exporter", variant: "destructive" });
      return;
    }

    const formatCsvCell = (value: any): string => {
      const stringValue = String(value ?? '').replace(/"/g, '""');
      return `"${stringValue}"`;
    };

    const csvHeader = [
      "Numéro Commande", "Date", "Client", "Email", "Produits", "Total (TND)", "Statut", "Paiement"
    ].map(formatCsvCell).join(';');

    const csvRows = orders.map(order => {
      const productsString = order.items
        .map(item => `${item.quantity} x ${item.productName} ${item.variant ? `(${item.variant.contenance})` : ''}`)
        .join(" | ");

      const row = [
        order.orderNumber,
        new Date(order.date).toLocaleDateString('fr-FR'),
        order.userName,
        order.buyerInfo?.email || '',
        productsString,
        order.total.toFixed(2),
        order.status,
        order.payment,
      ].map(formatCsvCell);
      return row.join(';');
    });

    const csvContent = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `export_commandes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Exportation réussie", description: "Le fichier CSV a été téléchargé." });
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
  
  const handleContactSeller = (order: Order) => {
    const productPreview = order.items && order.items.length > 0
      ? order.items.slice(0, 2).map(item => item.productName).join(', ') + (order.items.length > 2 ? ', etc.' : '')
      : 'Commande sans produits spécifiés';
    
    router.push(`/dashboard/messages?orderId=${order.id}&orderNumber=${order.orderNumber}&productPreview=${encodeURIComponent(productPreview)}`);
  };

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

  const getPaymentStatusBadgeProps = (status: Order['payment']): { variant: 'default' | 'destructive' | 'secondary' | 'outline', className?: string } => {
    switch (status) {
      case 'Réglé':
        return { variant: 'outline', className: 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400 font-medium' };
      case 'Remboursé':
        return { variant: 'outline', className: 'border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-400 font-medium' };
      case 'En attente':
      default:
        return { variant: 'secondary' };
    }
  }

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{cardTitle}</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </div>
        {isSeller && (
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
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
                {isSeller ? <TableHead>Produits</TableHead> : <TableHead>Client</TableHead>}
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
                    {isSeller ? (
                       <TableCell>
                        <div className="font-medium truncate max-w-xs">
                          {Array.isArray(order.items) ? order.items.map(item => `${item.quantity} x ${item.productName}`).join(', ') : ''}
                        </div>
                        <div className="text-sm text-muted-foreground hidden md:inline">
                          par {order.userName}
                        </div>
                      </TableCell>
                    ) : (
                      <TableCell>{order.userName}</TableCell>
                    )}
                    <TableCell className="hidden md:table-cell">{new Date(order.date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="text-right">{`${order.total.toFixed(2).replace('.', ',')} TND`}</TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      <Badge {...getStatusBadgeProps(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge {...getPaymentStatusBadgeProps(order.payment)} className="capitalize">
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
                               <div className="flex items-center gap-2">
                                  {isSeller ? (
                                    <>
                                        <div className="w-[200px]">
                                            <Select
                                                defaultValue={order.status}
                                                onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                                            >
                                                <SelectTrigger id={`status-${order.id}`} onClick={(e) => e.stopPropagation()}>
                                                    <SelectValue placeholder="Changer le statut" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {orderStatuses.map(status => (
                                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => handleContactSeller(order)}>
                                          <MessageSquare className="mr-2 h-4 w-4" />
                                          Voir Messages
                                        </Button>
                                      </>
                                  ) : (
                                    <Button variant="outline" size="sm" onClick={() => handleContactSeller(order)}>
                                       <MessageSquare className="mr-2 h-4 w-4" />
                                       Contacter le vendeur
                                    </Button>
                                  )}
                                  </div>
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
                              {Array.isArray(order.items) && order.items.map((item, index) => (
                                <TableRow key={`${item.productId}-${index}`} className="border-b-0">
                                  <TableCell className="font-medium">
                                      <div className="flex items-center gap-3">
                                        <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                                            <Image 
                                                src={item.productImage || 'https://placehold.co/64x64.png'} 
                                                alt={item.productName || 'Image du produit'}
                                                fill
                                                className="object-cover"
                                                data-ai-hint="cosmetic ingredient"
                                                sizes="48px"
                                            />
                                        </div>
                                        <div>
                                            {item.productName}
                                            {item.variant ? <p className="text-xs text-muted-foreground">{item.variant.contenance}</p> : ''}
                                        </div>
                                      </div>
                                  </TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell className="text-right">{item.variant ? `${item.variant.price.toFixed(2)} TND` : 'N/A'}</TableCell>
                                  <TableCell className="text-right">
                                    {item.variant ? `${(item.variant.price * item.quantity).toFixed(2)} TND` : 'N/A'}
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
    </>
  )
}

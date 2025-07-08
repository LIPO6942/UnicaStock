'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function CartPage() {
  const { cart, removeFromCart, updateCartItemQuantity, placeOrder, cartCount } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const newOrder = await placeOrder();
      if (newOrder) {
        toast({
          title: 'Commande passée avec succès !',
          description: `Votre commande ${newOrder.orderNumber} a été envoyée.`,
        });
        router.push('/dashboard/orders');
      } else {
        toast({
          title: 'Erreur',
          description: 'Votre panier est vide ou une erreur est survenue.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error("Failed to place order:", error);
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue lors de la validation de la commande.",
        variant: 'destructive',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartCount === 0) {
    return (
      <div className="container py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-20rem)]">
        <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-bold font-headline">Votre panier est vide</h1>
        <p className="mt-2 text-muted-foreground">Parcourez nos produits pour commencer vos achats.</p>
        <Button asChild className="mt-6">
          <Link href="/products">Voir les produits</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8 font-headline">Votre Panier</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] pl-4">Produit</TableHead>
                    <TableHead></TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[50px] pr-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-4">
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="rounded-md object-cover"
                          data-ai-hint="cosmetic ingredient"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/products/${item.product.id}`} className="hover:text-primary">
                          {item.product.name}
                        </Link>
                      </TableCell>
                      <TableCell>{item.product.price.toFixed(2)} TND</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateCartItemQuantity(item.id, parseInt(e.target.value, 10))}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {(item.product.price * item.quantity).toFixed(2)} TND
                      </TableCell>
                      <TableCell className="pr-4">
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-4 w-4" />
                           <span className="sr-only">Supprimer</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Résumé de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{cartTotal.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span className="text-muted-foreground">Calculée à la prochaine étape</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{cartTotal.toFixed(2)} TND</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                {isPlacingOrder ? 'Traitement...' : 'Passer la commande'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, PlusCircle, PackagePlus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

import type { Product } from '@/lib/types';
import * as ProductService from '@/lib/product-service';
import * as ProductServiceClient from '@/lib/product-service-client';
import { useToast } from '@/hooks/use-toast';
import { EditProductDialog } from '@/components/edit-product-dialog';
import { RestockDialog } from '@/components/restock-dialog';
import Loading from '../loading';
import { useAuth } from '@/context/auth-context';

export default function SellerProductsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const fetchedProducts = await ProductService.getProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return; // Wait until authentication status is resolved

    if (!user || user.type !== 'seller') {
      toast({
        title: "Accès non autorisé",
        description: "Cette page est réservée aux vendeurs.",
        variant: "destructive",
      });
      router.replace('/dashboard');
    } else {
      // User is a seller, go ahead and fetch products
      fetchProducts();
    }
  }, [user, isAuthLoading, router, toast]);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsEditDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };
  
  const handleOpenRestockDialog = () => {
    setIsRestockDialogOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await ProductServiceClient.deleteProduct(productId);
      toast({
        title: 'Produit supprimé',
        description: 'Le produit a été supprimé avec succès.',
      });
      fetchProducts(); // Refresh list
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le produit.',
        variant: 'destructive',
      });
    }
  };

  const handleDialogSave = () => {
    setIsEditDialogOpen(false);
    setIsRestockDialogOpen(false);
    fetchProducts();
  };

  if (isAuthLoading || isLoading || !user || user.type !== 'seller') {
    return <Loading />;
  }

  const getProductStockStatus = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return false;
    const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
    return totalStock > 0;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-2">
        <div>
            <h1 className="text-3xl font-bold font-headline">Gestion des Produits</h1>
            <p className="text-muted-foreground">Ajoutez, modifiez et gérez votre inventaire.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleOpenRestockDialog} variant="outline">
            <PackagePlus className="h-4 w-4 mr-2" />
            Réapprovisionner
          </Button>
          <Button onClick={handleAddProduct}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Inventaire des Produits</CardTitle>
          <CardDescription>
            Gérez vos matières premières et consultez leur statut de vente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Variantes (Contenance / Prix / Stock)</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={product.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={product.imageUrl || 'https://placehold.co/64x64.png'}
                        width="64"
                        data-ai-hint="cosmetic ingredient"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        {product.variants && product.variants.length > 0 ? (
                           product.variants.map(v => (
                            <div key={v.id} className="grid grid-cols-3 gap-2">
                                <span className="font-medium">{v.contenance}</span>
                                <span className="text-muted-foreground">{v.price.toFixed(2)} TND</span>
                                <span className="text-muted-foreground">{v.stock} unités</span>
                            </div>
                           ))
                        ) : (
                            <span className="text-muted-foreground">Aucune variante</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getProductStockStatus(product) ? 'outline' : 'destructive'}>
                        {getProductStockStatus(product) ? 'En stock' : 'Épuisé'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditProduct(product)}>Modifier</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                Supprimer
                               </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    Cette action est irréversible. Le produit sera définitivement supprimé.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>Supprimer</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                           </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Aucun produit trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Affichage de <strong>{products.length}</strong> produits
          </div>
        </CardFooter>
      </Card>
      
      {isEditDialogOpen && (
         <EditProductDialog
            isOpen={isEditDialogOpen}
            setIsOpen={setIsEditDialogOpen}
            product={selectedProduct}
            onSave={handleDialogSave}
        />
      )}

      {isRestockDialogOpen && (
        <RestockDialog
          isOpen={isRestockDialogOpen}
          setIsOpen={setIsRestockDialogOpen}
          products={products}
          onSave={handleDialogSave}
        />
      )}
    </>
  );
}

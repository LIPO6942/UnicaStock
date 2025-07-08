'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FirebaseError } from 'firebase/app';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import type { Product } from '@/lib/types';
import * as ProductService from '@/lib/product-service';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface EditProductDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  product: Product | null;
  onSave: () => void;
}

const productSchema = z.object({
  name: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères.' }),
  inci: z.string().min(3, { message: "L'INCI doit contenir au moins 3 caractères." }),
  category: z.string().min(2, { message: 'La catégorie est requise.' }),
  price: z.coerce.number().positive({ message: 'Le prix doit être un nombre positif.' }),
  stock: z.coerce.number().int().min(0, { message: 'Le stock doit être un nombre positif.' }),
  moq: z.coerce.number().int().min(1, { message: 'Le MOQ doit être au moins 1.' }),
  description: z.string().min(10, { message: 'La description courte est requise (min 10 caractères).' }),
  longDescription: z.string().min(20, { message: 'La description longue est requise (min 20 caractères).' }),
  imageUrl: z.string().url({ message: "Veuillez entrer une URL valide." }).or(z.literal('')),
});

export function EditProductDialog({ isOpen, setIsOpen, product, onSave }: EditProductDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      inci: '',
      category: '',
      price: 0,
      stock: 0,
      moq: 1,
      description: '',
      longDescription: '',
      imageUrl: '',
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  useEffect(() => {
    if (product) {
      reset(product);
    } else {
      reset({
        name: '',
        inci: '',
        category: '',
        price: 0,
        stock: 0,
        moq: 1,
        description: '',
        longDescription: '',
        imageUrl: 'https://placehold.co/600x600.png',
      });
    }
  }, [product, reset, isOpen]);

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    try {
      const productData = {
        ...values,
        imageUrl: values.imageUrl || 'https://placehold.co/600x600.png',
      };
      
      if (product) {
        // Update existing product
        await ProductService.updateProduct(product.id, productData);
        toast({
          title: 'Produit mis à jour',
          description: 'Les informations du produit ont été enregistrées.',
        });
      } else {
        // Add new product
        await ProductService.addProduct(productData);
        toast({
          title: 'Produit ajouté',
          description: 'Le nouveau produit a été créé avec succès.',
        });
      }
      onSave();
    } catch (error) {
      console.error("Détail de l'erreur d'enregistrement:", error);
      let description = "Une erreur est survenue lors de l'enregistrement du produit.";
      
      if (error instanceof FirebaseError) {
        if (error.code === 'permission-denied') {
          description = "Permission refusée. Assurez-vous que votre compte est bien un 'vendeur' dans la base de données (collection 'users') et que les règles de sécurité sont bien publiées.";
        } else {
          description = `Erreur Firebase : ${error.message} (code: ${error.code})`;
        }
      } else if (error instanceof Error) {
        description = error.message;
      }
      
      toast({
        title: 'Erreur de Permission',
        description: description,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Modifier le produit' : 'Ajouter un nouveau produit'}</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous. Cliquez sur enregistrer pour sauvegarder.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du produit</FormLabel>
                    <FormControl><Input placeholder="Huile d'Argan Pure BIO" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inci"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>INCI</FormLabel>
                    <FormControl><Input placeholder="Argania Spinosa Kernel Oil" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <FormControl><Input placeholder="Huiles Végétales" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix (TND/kg)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock (kg)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="moq"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MOQ (kg)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description courte</FormLabel>
                    <FormControl><Textarea placeholder="Description affichée sur la carte produit" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
             <FormField
                control={form.control}
                name="longDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description longue</FormLabel>
                    <FormControl><Textarea rows={5} placeholder="Description complète affichée sur la page du produit" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de l'image</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormDescription>
                      Hébergez votre image sur un service comme <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="underline">postimages.org</a> et collez le lien direct ici.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
             <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

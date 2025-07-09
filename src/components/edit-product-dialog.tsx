'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FirebaseError } from 'firebase/app';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Product, ProductVariant } from '@/lib/types';
import * as ProductServiceClient from '@/lib/product-service-client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { getProducts } from '@/lib/product-service';

interface EditProductDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  product: Product | null;
  onSave: () => void;
}

const variantSchema = z.object({
  id: z.string().min(1, { message: 'ID de variante requis.'}),
  contenance: z.string().min(1, { message: 'La contenance est requise.' }),
  price: z.coerce.number().positive({ message: 'Le prix doit être un nombre positif.' }),
  stock: z.coerce.number().int().min(0, { message: 'Le stock doit être un nombre positif.' }),
});

const productSchema = z.object({
  name: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères.' }),
  inci: z.string().min(3, { message: "L'INCI doit contenir au moins 3 caractères." }),
  category: z.string().min(2, { message: 'La catégorie est requise.' }),
  newCategory: z.string().optional(),
  moq: z.coerce.number().int().min(1, { message: 'Le MOQ doit être au moins 1.' }),
  description: z.string().min(10, { message: 'La description courte est requise (min 10 caractères).' }),
  longDescription: z.string().min(20, { message: 'La description longue est requise (min 20 caractères).' }),
  imageUrl: z.string().url({ message: "Veuillez entrer une URL valide." }).or(z.literal('')),
  variants: z.array(variantSchema).min(1, { message: 'Au moins une variante de produit est requise.' }),
  dataSheetUrl: z.string().url({ message: "Veuillez entrer une URL valide pour la fiche technique." }).or(z.literal('')).optional(),
  coaUrl: z.string().url({ message: "Veuillez entrer une URL valide pour le certificat d'analyse." }).or(z.literal('')).optional(),
});

const NEW_CATEGORY_VALUE = '__new__';

export function EditProductDialog({ isOpen, setIsOpen, product, onSave }: EditProductDialogProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      const products = await getProducts();
      const uniqueCategories = Array.from(new Set(products.map(p => p.category))).sort();
      setCategories(uniqueCategories);
    }
    fetchCategories();
  }, [isOpen]);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      inci: '',
      category: '',
      newCategory: '',
      moq: 1,
      description: '',
      longDescription: '',
      imageUrl: '',
      variants: [],
      dataSheetUrl: '',
      coaUrl: '',
    },
  });

  const {
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  const selectedCategory = watch('category');

  useEffect(() => {
    if (selectedCategory === NEW_CATEGORY_VALUE) {
      setShowNewCategory(true);
    } else {
      setShowNewCategory(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (product) {
      reset({
        ...product,
        newCategory: '',
      });
    } else {
      reset({
        name: '',
        inci: '',
        category: '',
        newCategory: '',
        moq: 1,
        description: '',
        longDescription: '',
        imageUrl: 'https://placehold.co/600x600.png',
        variants: [{ id: 'variante-1', contenance: '', price: 0, stock: 0 }],
        dataSheetUrl: '',
        coaUrl: '',
      });
    }
  }, [product, reset, isOpen]);

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    const finalCategory = values.category === NEW_CATEGORY_VALUE ? values.newCategory : values.category;
    if (!finalCategory) {
      form.setError('category', { type: 'manual', message: 'La catégorie est requise.' });
      return;
    }

    try {
      const productData: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'seller'> = {
        ...values,
        category: finalCategory,
        imageUrl: values.imageUrl || 'https://placehold.co/600x600.png',
      };
      
      if (product) {
        await ProductServiceClient.updateProduct(product.id, productData);
        toast({
          title: 'Produit mis à jour',
          description: 'Les informations du produit ont été enregistrées.',
        });
      } else {
        await ProductServiceClient.addProduct(productData);
        toast({
          title: 'Produit ajouté',
          description: 'Le nouveau produit a été créé avec succès.',
        });
      }
      onSave();
    } catch (error) {
      console.error("Détail de l'erreur Firebase:", error);
      let description = "L'action a échoué. Veuillez réessayer.";
      if (error instanceof FirebaseError && error.code === 'permission-denied') {
        description = "Permission Refusée par Firestore. Assurez-vous que les règles de sécurité sont à jour et que votre compte est bien de type 'seller' dans la base de données.";
      }
      toast({
          title: "Erreur d'enregistrement",
          description: description,
          variant: 'destructive',
          duration: 10000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Modifier le produit' : 'Ajouter un nouveau produit'}</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous. Cliquez sur enregistrer pour sauvegarder.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        <SelectItem value={NEW_CATEGORY_VALUE}>Ajouter une nouvelle catégorie</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {showNewCategory && (
                <FormField
                  control={form.control}
                  name="newCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la nouvelle catégorie</FormLabel>
                      <FormControl><Input placeholder="Ex: Argiles" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="space-y-4 rounded-md border p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Variantes du produit (Contenance, Prix, Stock)</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => append({ id: `variante-${fields.length + 1}`, contenance: '', price: 0, stock: 0 })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter une variante
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end border-t pt-4">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.contenance`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenance</FormLabel>
                        <FormControl><Input placeholder="Ex: 100ml, 1kg" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`variants.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix (TND)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`variants.${index}.stock`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock (unités)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <FormMessage>{form.formState.errors.variants?.message}</FormMessage>
            </div>
             
            <FormField
              control={form.control}
              name="moq"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MOQ (unités)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormDescription>Quantité minimale de commande, toutes variantes confondues.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                    <FormLabel>URL de l'image principale</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormDescription>
                      Hébergez votre image sur un service comme <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="underline">postimages.org</a> et collez le lien direct ici.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dataSheetUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de la Fiche Technique (PDF)</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                     <FormDescription>Hébergez votre PDF et collez le lien direct ici.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coaUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL du Certificat d'Analyse (PDF)</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormDescription>Hébergez votre PDF et collez le lien direct ici.</FormDescription>
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

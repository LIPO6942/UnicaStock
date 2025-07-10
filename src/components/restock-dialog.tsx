
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import * as ProductServiceClient from '@/lib/product-service-client';

interface RestockDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  products: Product[];
  onSave: () => void;
}

const formSchema = z.object({
  productId: z.string().min(1, 'Veuillez sélectionner un produit.'),
  variants: z.array(z.object({
    variantId: z.string(),
    contenance: z.string(),
    stockToAdd: z.coerce.number().int().min(0, 'La quantité doit être positive.'),
  })),
});

export function RestockDialog({ isOpen, setIsOpen, products, onSave }: RestockDialogProps) {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: '',
      variants: [],
    },
  });

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = form;

  const productId = watch('productId');

  useState(() => {
    if (productId) {
      const product = products.find(p => p.id === productId);
      setSelectedProduct(product || null);
      setValue('variants', product?.variants.map(v => ({
        variantId: v.id,
        contenance: v.contenance,
        stockToAdd: 0,
      })) || []);
    } else {
      setSelectedProduct(null);
      setValue('variants', []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, products]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const stockUpdates = values.variants.reduce((acc, variant) => {
        if(variant.stockToAdd > 0) {
            acc[variant.variantId] = variant.stockToAdd;
        }
        return acc;
    }, {} as { [variantId: string]: number });
    
    if (Object.keys(stockUpdates).length === 0) {
        toast({ title: 'Aucune quantité à ajouter.', description: 'Veuillez entrer une quantité pour au moins une variante.'});
        return;
    }

    try {
        await ProductServiceClient.restockProduct(values.productId, stockUpdates);
        toast({ title: 'Stock mis à jour', description: `Le stock pour ${selectedProduct?.name} a été mis à jour.`});
        reset({ productId: '', variants: []});
        onSave();
    } catch(error: any) {
        toast({ title: 'Erreur', description: error.message, variant: 'destructive'});
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
            reset();
            setSelectedProduct(null);
        }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Réapprovisionner un Produit</DialogTitle>
          <DialogDescription>
            Sélectionnez un produit et entrez les quantités à ajouter au stock existant.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produit</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un produit à réapprovisionner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedProduct && (
              <div className="space-y-4 rounded-md border p-4">
                <h4 className="font-medium">Variantes de "{selectedProduct.name}"</h4>
                 {form.getValues('variants').map((variant, index) => (
                    <FormField
                        key={variant.variantId}
                        control={control}
                        name={`variants.${index}.stockToAdd`}
                        render={({field}) => (
                             <FormItem className="grid grid-cols-3 items-center gap-4">
                                <FormLabel className="text-right">
                                    {variant.contenance}
                                </FormLabel>
                                <FormControl className="col-span-2">
                                     <Input type="number" placeholder="Quantité à ajouter" {...field} />
                                </FormControl>
                                <FormMessage className="col-span-3" />
                            </FormItem>
                        )}
                    />
                 ))}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting || !selectedProduct}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter au Stock
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

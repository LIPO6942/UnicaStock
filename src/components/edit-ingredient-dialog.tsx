
'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import type { Ingredient } from '@/lib/types';
import * as IngredientsService from '@/lib/ingredients-service';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';

interface EditIngredientDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  ingredient: Ingredient | null;
  onSave: () => void;
}

const benefitSchema = z.object({
  name: z.string().min(1, { message: 'Le bienfait ne peut pas être vide.' }),
});

const ingredientSchema = z.object({
  name: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères.' }),
  location: z.string().min(3, { message: 'La localisation est requise.' }),
  description: z.string().min(10, { message: 'La description est requise (min 10 caractères).' }),
  imageUrl: z.string().url({ message: "Veuillez entrer une URL valide." }).or(z.literal('')),
  benefits: z.array(benefitSchema).min(1, { message: 'Au moins un bienfait est requis.' }),
  certifications: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
});

export function EditIngredientDialog({ isOpen, setIsOpen, ingredient, onSave }: EditIngredientDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ingredientSchema>>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: '',
      location: '',
      description: '',
      imageUrl: '',
      benefits: [{ name: '' }],
      certifications: [],
    },
  });

  const {
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'benefits',
  });

  useEffect(() => {
    if (ingredient) {
      reset({
        ...ingredient,
        certifications: ingredient.certifications.join(', '),
      });
    } else {
      reset({
        name: '',
        location: '',
        description: '',
        imageUrl: 'https://placehold.co/600x400.png',
        benefits: [{ name: '' }],
        certifications: '',
      });
    }
  }, [ingredient, reset]);

  const onSubmit = async (values: z.infer<typeof ingredientSchema>) => {
    try {
      const ingredientData: Omit<Ingredient, 'id'> = {
        ...values,
        imageUrl: values.imageUrl || 'https://placehold.co/600x400.png',
      };
      
      if (ingredient) {
        await IngredientsService.updateIngredient(ingredient.id, ingredientData);
        toast({
          title: 'Ingrédient mis à jour',
          description: 'Les informations ont été enregistrées.',
        });
      } else {
        await IngredientsService.addIngredient(ingredientData);
        toast({
          title: 'Ingrédient ajouté',
          description: 'Le nouvel ingrédient a été créé avec succès.',
        });
      }
      onSave();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'ingrédient:", error);
      toast({
          title: "Erreur d'enregistrement",
          description: "L'action a échoué. Vérifiez vos permissions Firestore.",
          variant: 'destructive',
          duration: 10000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ingredient ? "Modifier l'ingrédient" : 'Ajouter un nouvel ingrédient'}</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'ingrédient</FormLabel>
                  <FormControl><Input placeholder="Figue de Barbarie" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localisation</FormLabel>
                  <FormControl><Input placeholder="Kasserine, Tunisie" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea rows={4} placeholder="Description de l'ingrédient..." {...field} /></FormControl>
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
                    Utilisez un service comme <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="underline">postimages.org</a> pour héberger votre image.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 rounded-md border p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium">Bienfaits</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => append({ name: '' })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter un bienfait
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`benefits.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl><Input placeholder="Anti-âge puissant..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <FormMessage>{form.formState.errors.benefits?.message}</FormMessage>
            </div>

             <FormField
                control={form.control}
                name="certifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certifications</FormLabel>
                    <FormControl><Input placeholder="ECOCERT, BIO" {...field} /></FormControl>
                    <FormDescription>Séparez les certifications par une virgule.</FormDescription>
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

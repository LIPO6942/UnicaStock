
'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FirebaseError } from 'firebase/app';

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

const benefitSchema = z.object({ name: z.string().min(1, 'Le nom du bienfait ne peut pas être vide.') });

const ingredientSchema = z.object({
  name: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères.' }),
  location: z.string().min(3, { message: "La localisation est requise." }),
  description: z.string().min(10, { message: 'La description est requise (min 10 caractères).' }),
  imageUrl: z.string().url({ message: "Veuillez entrer une URL d'image valide." }),
  imageHint: z.string().min(2, 'Veuillez donner un indice pour l\'image.'),
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
      imageHint: '',
      benefits: [{ name: '' }],
      certifications: [],
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  const { fields: benefitFields, append: appendBenefit, remove: removeBenefit } = useFieldArray({
    control,
    name: "benefits",
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
        imageUrl: 'https://placehold.co/600x800.png',
        imageHint: 'nature',
        benefits: [{ name: '' }],
        certifications: [],
      });
    }
  }, [ingredient, reset, isOpen]);

  const onSubmit = async (values: z.infer<typeof ingredientSchema>) => {
    try {
      const dataToSave = { ...values };

      if (ingredient) {
        await IngredientsService.updateIngredient(ingredient.id, dataToSave);
        toast({
          title: 'Ingrédient mis à jour',
          description: 'Les informations ont été enregistrées.',
        });
      } else {
        await IngredientsService.addIngredient(dataToSave);
        toast({
          title: 'Ingrédient ajouté',
          description: 'Le nouvel ingrédient a été créé avec succès.',
        });
      }
      onSave();
    } catch (error) {
      console.error("Détail de l'erreur Firebase:", error);
      let description = "L'action a échoué. Veuillez réessayer.";
      if (error instanceof FirebaseError && error.code === 'permission-denied') {
        description = "Permission Refusée. Vérifiez vos règles de sécurité Firestore.";
      }
      toast({
          title: "Erreur d'enregistrement",
          description: description,
          variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ingredient ? "Modifier l'ingrédient" : 'Ajouter un ingrédient'}</DialogTitle>
          <DialogDescription>
            Gérez les informations affichées sur la page "Nos Ingrédients".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <FormField
              control={control}
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
              control={control}
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
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea rows={4} placeholder="Description affichée sur la page..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de l'image</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormDescription>
                      Utilisez un service comme <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="underline">postimages.org</a> pour héberger vos images.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="imageHint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indice pour l'image</FormLabel>
                    <FormControl><Input placeholder="prickly pear" {...field} /></FormControl>
                    <FormDescription>Un ou deux mots-clés en anglais pour l'IA.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="certifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certifications</FormLabel>
                    <FormControl><Input placeholder="Bio, Commerce Équitable" {...field} /></FormControl>
                    <FormDescription>Séparez les certifications par une virgule.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
            <div className="space-y-4 rounded-md border p-4">
              <div className="flex justify-between items-center">
                  <h3 className="text-md font-medium">Bienfaits</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendBenefit({ name: '' })}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
                  </Button>
              </div>
              {benefitFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                       <FormField
                          control={control}
                          name={`benefits.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="flex-grow">
                                <FormControl><Input placeholder="Anti-âge puissant" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                          )}
                        />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeBenefit(index)} disabled={benefitFields.length <= 1}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                  </div>
              ))}
            </div>

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

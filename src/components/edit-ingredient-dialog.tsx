
'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import type { Ingredient } from '@/lib/types';
import * as IngredientsService from '@/lib/ingredients-service';

interface EditIngredientDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  ingredient: Ingredient | null;
  onSave: () => void;
}

const benefitSchema = z.object({ name: z.string().min(1, 'Le nom du bienfait est requis.') });
const certificationSchema = z.object({ name: z.string().min(1, 'Le nom de la certification est requis.') });

const ingredientSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères.'),
  location: z.string().min(3, 'La localisation est requise.'),
  description: z.string().min(10, 'La description est requise (min 10 caractères).'),
  imageUrl: z.string().url({ message: 'Veuillez entrer une URL d\'image valide.' }),
  imageHint: z.string().min(2, 'Veuillez entrer au moins un mot-clé pour l\'image.'),
  benefits: z.array(benefitSchema).min(1, 'Au moins un bienfait est requis.'),
  certifications: z.array(certificationSchema),
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
  
  const { fields: benefitFields, append: appendBenefit, remove: removeBenefit } = useFieldArray({
    control: form.control,
    name: 'benefits',
  });
  
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({
    control: form.control,
    name: 'certifications',
  });

  useEffect(() => {
    if (ingredient) {
      form.reset(ingredient);
    } else {
      form.reset({
        name: '',
        location: '',
        description: '',
        imageUrl: 'https://placehold.co/800x800.png',
        imageHint: 'nature cosmetic',
        benefits: [{ name: '' }],
        certifications: [],
      });
    }
  }, [ingredient, form.reset]);

  const onSubmit = async (values: z.infer<typeof ingredientSchema>) => {
    try {
      if (ingredient) {
        await IngredientsService.updateIngredient(ingredient.id, values);
        toast({ title: 'Succès', description: 'Ingrédient mis à jour.' });
      } else {
        await IngredientsService.addIngredient(values);
        toast({ title: 'Succès', description: 'Ingrédient ajouté.' });
      }
      onSave();
    } catch (error) {
      console.error('Failed to save ingredient:', error);
      toast({ title: 'Erreur', description: 'Impossible d\'enregistrer l\'ingrédient.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ingredient ? 'Modifier l\'ingrédient' : 'Ajouter un ingrédient'}</DialogTitle>
          <DialogDescription>
            Remplissez les champs ci-dessous pour mettre à jour les informations de la page "Nos Ingrédients".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
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
                  <FormControl><Textarea rows={4} {...field} /></FormControl>
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
                   <FormDescription>Utilisez un service comme <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="underline">postimages.org</a> pour héberger vos images.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="imageHint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indice pour l'image (IA)</FormLabel>
                  <FormControl><Input placeholder="cactus fruit" {...field} /></FormControl>
                   <FormDescription>Un ou deux mots-clés en anglais pour décrire l'image.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Benefits */}
            <div className="space-y-2">
                <FormLabel>Bienfaits</FormLabel>
                {benefitFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <FormField
                            control={form.control}
                            name={`benefits.${index}.name`}
                            render={({ field }) => (
                                <FormItem className="flex-grow">
                                    <FormControl><Input {...field} placeholder={`Bienfait #${index + 1}`} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeBenefit(index)} disabled={benefitFields.length <= 1}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                 <Button type="button" size="sm" variant="outline" onClick={() => appendBenefit({ name: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un bienfait
                </Button>
            </div>
            
            {/* Certifications */}
            <div className="space-y-2">
                <FormLabel>Certifications</FormLabel>
                {certFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <FormField
                            control={form.control}
                            name={`certifications.${index}.name`}
                            render={({ field }) => (
                                <FormItem className="flex-grow">
                                    <FormControl><Input {...field} placeholder={`Certification #${index + 1}`} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeCert(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                 <Button type="button" size="sm" variant="outline" onClick={() => appendCert({ name: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une certification
                </Button>
            </div>


            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import * as IngredientsService from '@/lib/ingredients-service';
import type { Ingredient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';

interface EditIngredientDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  ingredient: Ingredient | null;
  onSave: () => void;
}

const benefitSchema = z.object({ name: z.string().min(3, 'Le bénéfice doit contenir au moins 3 caractères.') });

const ingredientSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères.'),
  location: z.string().min(3, 'La localisation est requise.'),
  description: z.string().min(10, 'La description est requise (min 10 caractères).'),
  imageUrl: z.string().url('Veuillez entrer une URL valide.').or(z.literal('')),
  benefits: z.array(benefitSchema).min(1, 'Au moins un bénéfice est requis.'),
  certifications: z.array(z.string()).optional(),
});

type IngredientFormData = z.infer<typeof ingredientSchema>;

export function EditIngredientDialog({ isOpen, setIsOpen, ingredient, onSave }: EditIngredientDialogProps) {
  const { toast } = useToast();
  const form = useForm<IngredientFormData>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: '',
      location: '',
      description: '',
      imageUrl: '',
      benefits: [],
      certifications: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'benefits',
  });

  useEffect(() => {
    if (ingredient) {
      form.reset({
        ...ingredient,
        certifications: ingredient.certifications || [],
      });
    } else {
      form.reset({
        name: '',
        location: '',
        description: '',
        imageUrl: 'https://placehold.co/600x400.png',
        benefits: [{ name: '' }],
        certifications: [],
      });
    }
  }, [ingredient, form, isOpen]);

  const onSubmit = async (values: IngredientFormData) => {
    try {
      if (ingredient) {
        await IngredientsService.updateIngredient(ingredient.id, values);
        toast({ title: 'Ingrédient mis à jour', description: 'Les informations ont été enregistrées.' });
      } else {
        await IngredientsService.addIngredient(values);
        toast({ title: 'Ingrédient ajouté', description: 'Le nouvel ingrédient a été créé.' });
      }
      onSave();
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur d'enregistrement", description: "L'action a échoué. Vérifiez les règles de sécurité.", variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{ingredient ? 'Modifier l\'ingrédient' : 'Ajouter un ingrédient'}</DialogTitle>
          <DialogDescription>Remplissez les informations ci-dessous.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6 pl-2">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nom</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem><FormLabel>Localisation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="imageUrl" render={({ field }) => (
              <FormItem><FormLabel>URL de l'image</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <div className="space-y-2">
              <FormLabel>Bénéfices</FormLabel>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField control={form.control} name={`benefits.${index}.name`} render={({ field }) => (
                    <FormItem className="flex-grow"><FormControl><Input {...field} placeholder={`Bénéfice ${index + 1}`} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un bénéfice
              </Button>
            </div>
            
            <FormField control={form.control} name="certifications" render={({ field }) => (
                <FormItem>
                    <FormLabel>Certifications (optionnel, séparées par des virgules)</FormLabel>
                    <FormControl>
                        <Input 
                            {...field} 
                            value={Array.isArray(field.value) ? field.value.join(', ') : ''} 
                            onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                            placeholder="BIO, Ecocert..."
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <DialogFooter className="sticky bottom-0 bg-background pt-4">
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

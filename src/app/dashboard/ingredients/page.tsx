
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { EditIngredientDialog } from '@/components/edit-ingredient-dialog';
import * as IngredientsService from '@/lib/ingredients-service';
import type { Ingredient } from '@/lib/types';
import Loading from '../loading';

export default function SellerIngredientsPage() {
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const fetchIngredients = async () => {
    setIsLoading(true);
    try {
      const fetchedIngredients = await IngredientsService.getIngredients();
      setIngredients(fetchedIngredients);
    } catch (err) {
      console.error(err);
      toast({ title: 'Erreur', description: 'Impossible de charger les ingrédients.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleAddIngredient = () => {
    setSelectedIngredient(null);
    setIsEditDialogOpen(true);
  };

  const handleEditIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsEditDialogOpen(true);
  };

  const handleDeleteIngredient = async (ingredientId: string) => {
    try {
      await IngredientsService.deleteIngredient(ingredientId);
      toast({ title: 'Ingrédient supprimé', description: "L'ingrédient a été supprimé avec succès." });
      fetchIngredients(); // Refresh list
    } catch (err) {
      console.error(err);
      toast({ title: 'Erreur', description: "Impossible de supprimer l'ingrédient.", variant: 'destructive' });
    }
  };

  const handleDialogSave = () => {
    setIsEditDialogOpen(false);
    fetchIngredients();
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Gestion de la Page "Nos Ingrédients"</h1>
          <p className="text-muted-foreground">Modifiez le contenu qui apparaît sur la page publique.</p>
        </div>
        <Button onClick={handleAddIngredient}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Ajouter un ingrédient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contenu Actuel</CardTitle>
          <CardDescription>Liste des ingrédients affichés sur la page "Nos Ingrédients".</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.length > 0 ? (
                ingredients.map((ingredient) => (
                  <TableRow key={ingredient.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={ingredient.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={ingredient.imageUrl || 'https://placehold.co/64x64.png'}
                        width="64"
                        data-ai-hint="ingredient natural"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{ingredient.name}</TableCell>
                    <TableCell>{ingredient.location}</TableCell>
                    <TableCell className="max-w-xs truncate">{ingredient.description}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditIngredient(ingredient)}>Modifier</DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                Supprimer
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteIngredient(ingredient.id)}>Supprimer</AlertDialogAction>
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
                  <TableCell colSpan={5} className="h-24 text-center">
                    Aucun ingrédient trouvé. Commencez par en ajouter un.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {isEditDialogOpen && (
        <EditIngredientDialog
          isOpen={isEditDialogOpen}
          setIsOpen={setIsEditDialogOpen}
          ingredient={selectedIngredient}
          onSave={handleDialogSave}
        />
      )}
    </>
  );
}

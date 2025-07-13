
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

import type { Ingredient } from '@/lib/types';
import * as IngredientsServiceClient from '@/lib/ingredients-service-client';
import { useToast } from '@/hooks/use-toast';
import { EditIngredientDialog } from '@/components/edit-ingredient-dialog';
import Loading from '@/app/dashboard/loading';
import { useAuth } from '@/context/auth-context';

interface IngredientsClientPageProps {
  initialIngredients: Ingredient[];
}

export function IngredientsClientPage({ initialIngredients }: IngredientsClientPageProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const fetchIngredientsClientSide = async () => {
    // This function can be used to refresh the list after a mutation.
    const fetchedIngredients = await IngredientsServiceClient.getIngredientsClient();
    setIngredients(fetchedIngredients);
  };
  
  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.replace('/login');
      } else if (user.type !== 'seller') {
        toast({ title: 'Accès non autorisé', description: 'Cette page est réservée aux vendeurs.', variant: 'destructive'});
        router.replace('/dashboard');
      }
    }
  }, [user, isAuthLoading, router, toast]);

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
      await IngredientsServiceClient.deleteIngredient(ingredientId);
      toast({
        title: 'Ingrédient supprimé',
        description: "L'ingrédient a été supprimé avec succès.",
      });
      fetchIngredientsClientSide(); // Refresh list
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer l'ingrédient.",
        variant: 'destructive',
      });
    }
  };

  const handleDialogSave = () => {
    setIsEditDialogOpen(false);
    fetchIngredientsClientSide();
  };

  if (isAuthLoading || !user || user.type !== 'seller') {
    return <Loading />;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-2">
        <div>
            <h1 className="text-3xl font-bold font-headline">Gestion des Ingrédients</h1>
            <p className="text-muted-foreground">Gérez le contenu de la page "Nos Ingrédients".</p>
        </div>
        <Button onClick={handleAddIngredient}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Ajouter un ingrédient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Ingrédients</CardTitle>
          <CardDescription>
            Ces éléments apparaissent sur la page publique "Nos Ingrédients".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Localisation</TableHead>
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
                        data-ai-hint="natural ingredient"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{ingredient.name}</TableCell>
                    <TableCell>{ingredient.location}</TableCell>
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
                                    Cette action est irréversible. L'ingrédient sera définitivement supprimé.
                                    </AlertDialogDescription>
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
                  <TableCell colSpan={4} className="h-24 text-center">
                    Aucun ingrédient trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Affichage de <strong>{ingredients.length}</strong> ingrédients
          </div>
        </CardFooter>
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

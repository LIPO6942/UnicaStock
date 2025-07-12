
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Ingredient } from '@/lib/types';
import * as IngredientsService from '@/lib/ingredients-service';
import { EditIngredientDialog } from '@/components/edit-ingredient-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function ManageIngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const { toast } = useToast();

  const fetchIngredients = async () => {
    setIsLoading(true);
    try {
      const data = await IngredientsService.getIngredients();
      setIngredients(data);
    } catch (error) {
      console.error("Failed to fetch ingredients:", error);
      toast({ title: 'Erreur', description: 'Impossible de charger les ingrédients.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleAdd = () => {
    setSelectedIngredient(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsDialogOpen(true);
  };

  const handleDelete = async (ingredientId: string) => {
    try {
      await IngredientsService.deleteIngredient(ingredientId);
      toast({ title: 'Succès', description: 'Ingrédient supprimé.' });
      fetchIngredients();
    } catch (error) {
      console.error("Failed to delete ingredient:", error);
      toast({ title: 'Erreur', description: 'Impossible de supprimer l\'ingrédient.', variant: 'destructive' });
    }
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    fetchIngredients();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Gérer la Page "Nos Ingrédients"</h1>
          <p className="text-muted-foreground">Modifiez le contenu qui apparaît sur la page publique.</p>
        </div>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un ingrédient
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des Ingrédients</CardTitle>
          <CardDescription>Voici les ingrédients actuellement affichés sur votre site.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : ingredients.length === 0 ? (
            <p className="text-muted-foreground text-center">Aucun ingrédient trouvé. Commencez par en ajouter un.</p>
          ) : (
            <div className="space-y-4">
              {ingredients.map((ingredient) => (
                <div key={ingredient.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                  <div className="font-medium">{ingredient.name}</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(ingredient)}>
                      <Edit className="mr-2 h-4 w-4" /> Modifier
                    </Button>
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="destructive" size="sm">
                           <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                         </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                              Cette action est irréversible et supprimera l'ingrédient de la page.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(ingredient.id)}>Confirmer</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                     </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {isDialogOpen && (
        <EditIngredientDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          ingredient={selectedIngredient}
          onSave={handleSave}
        />
      )}
    </>
  );
}

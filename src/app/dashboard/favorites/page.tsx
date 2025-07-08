import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function FavoritesPage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold tracking-tight font-headline">Vos Favoris</h1>
            <p className="text-muted-foreground">Retrouvez ici les produits que vous avez sauvegardés.</p>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <p className="text-lg text-muted-foreground">Vous n'avez pas encore de produits favoris.</p>
              <p className="text-sm text-muted-foreground">La fonctionnalité de favoris sera bientôt améliorée.</p>
          </CardContent>
        </Card>
    </div>
  );
}

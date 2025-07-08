import { ProductCard } from '@/components/product-card';
import { mockProducts } from '@/lib/mock-data';

export default function FavoritesPage() {
  const favoriteProducts = mockProducts.slice(0, 3);

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold tracking-tight font-headline">Vos Favoris</h1>
            <p className="text-muted-foreground">Retrouvez ici les produits que vous avez sauvegardés.</p>
        </div>
        
        {favoriteProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favoriteProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                <p className="text-lg text-muted-foreground">Vous n'avez pas encore de produits favoris.</p>
            </div>
        )}
    </div>
  );
}

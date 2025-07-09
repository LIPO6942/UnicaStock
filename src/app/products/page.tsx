import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getProducts } from '@/lib/product-service';
import { Filter } from 'lucide-react';
import type { Product } from '@/lib/types';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

async function getCategories(products: Product[]): Promise<string[]> {
    const categories = new Set(products.map(p => p.category));
    return Array.from(categories).sort();
}

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = await getCategories(products);

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 font-headline">
              <Filter className="h-5 w-5" />
              Filtres
            </h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="search" className="text-base font-semibold">Recherche</Label>
                <Input id="search" placeholder="Nom du produit, INCI..." className="mt-2" />
              </div>

              <div>
                <Label className="text-base font-semibold">Catégorie</Label>
                <div className="mt-2 space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center">
                       <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{category}</Link>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full">Appliquer les filtres</Button>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold font-headline">Toutes les Matières Premières</h1>
            <Select>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Popularité</SelectItem>
                <SelectItem value="price-asc">Prix: Croissant</SelectItem>
                <SelectItem value="price-desc">Prix: Décroissant</SelectItem>
                <SelectItem value="rating">Évaluation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

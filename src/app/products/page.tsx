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
    <div className="container py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 font-headline">
              <Filter className="h-6 w-6" />
              Filtres
            </h2>
            <div className="space-y-8">
              <div>
                <Label htmlFor="search" className="text-lg font-semibold">Recherche</Label>
                <Input id="search" placeholder="Nom du produit, INCI..." className="mt-2" />
              </div>

              <div>
                <Label className="text-lg font-semibold">Catégorie</Label>
                <div className="mt-2 space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                       <Link href="#" className="text-sm hover:text-primary">{category}</Link>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full" size="lg">Appliquer les filtres</Button>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold font-headline">Toutes les Matières Premières</h1>
            <Select>
              <SelectTrigger className="w-[180px]">
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

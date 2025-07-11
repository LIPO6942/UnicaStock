
'use client';

import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, Search } from 'lucide-react';
import type { Product, UserProfile } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface ProductsClientPageProps {
    products: Product[];
    categories: string[];
    seller: UserProfile | null;
}

export function ProductsClientPage({ products, categories, seller }: ProductsClientPageProps) {
  const searchParams = useSearchParams();
  const initialSearchTerm = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('popular');

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  const filteredAndSortedProducts = useMemo(() => {
    let filteredProducts = products;

    // 1. Filter by category
    if (selectedCategory !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
    }

    // 2. Filter by search term
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(lowercasedTerm) ||
        p.inci.toLowerCase().includes(lowercasedTerm)
      );
    }

    // 3. Sort the filtered products
    const sortedProducts = [...filteredProducts];
    switch (sortOrder) {
      case 'price-asc':
        sortedProducts.sort((a, b) => {
            const priceA = a.variants?.[0]?.price ?? Infinity;
            const priceB = b.variants?.[0]?.price ?? Infinity;
            return priceA - priceB;
        });
        break;
      case 'price-desc':
        sortedProducts.sort((a, b) => {
            const priceA = a.variants?.[0]?.price ?? 0;
            const priceB = b.variants?.[0]?.price ?? 0;
            return priceB - priceA;
        });
        break;
      case 'rating':
        sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
      default:
        sortedProducts.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
    }
    
    return sortedProducts;
  }, [products, searchTerm, selectedCategory, sortOrder]);


  return (
    <div className="container py-12">
      {seller?.companyBackgroundUrl && (
         <section className="relative mb-12 h-64 w-full overflow-hidden rounded-xl flex items-center justify-center p-8 text-center">
            <Image
                src={seller.companyBackgroundUrl}
                alt={seller.companyName || 'Bannière de la boutique'}
                fill
                className="object-cover"
                data-ai-hint="store banner"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 text-white">
                <h1 className="text-4xl font-bold font-headline">{seller.companyName || 'Notre Boutique'}</h1>
                <p className="mt-2 max-w-2xl text-lg text-white/90">{seller.companyDescription}</p>
            </div>
         </section>
      )}

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
                <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="search" 
                        placeholder="Nom du produit, INCI..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
              </div>

              <div>
                <Label htmlFor="category-select" className="text-base font-semibold">Catégorie</Label>
                 <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category-select" className="mt-2">
                        <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold font-headline">Toutes les Matières Premières</h1>
            <Select value={sortOrder} onValueChange={setSortOrder}>
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
          {filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredAndSortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
          ) : (
             <div className="text-center py-20 col-span-full">
                <p className="text-lg text-muted-foreground">Aucun produit ne correspond à votre recherche.</p>
                <p className="text-sm text-muted-foreground">Essayez de modifier vos filtres ou votre recherche.</p>
                <Button variant="outline" className="mt-6" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>Réinitialiser les filtres</Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

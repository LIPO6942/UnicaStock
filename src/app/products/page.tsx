import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { mockProducts } from '@/lib/mock-data';
import { Filter } from 'lucide-react';

const categories = [
  'Huiles Végétales',
  'Beurres Végétaux',
  'Hydrolats',
  'Actifs Cosmétiques',
  'Huiles Essentielles',
  'Cires & Épaississants',
  'Extraits Végétaux',
];

const certifications = ['BIO', 'ECOCERT', 'AOP'];

export default function ProductsPage() {
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
                      <Checkbox id={`cat-${category}`} />
                      <Label htmlFor={`cat-${category}`} className="font-normal">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold">Prix (TND)</Label>
                <div className="mt-4">
                  <Slider defaultValue={[50, 500]} max={2000} step={10} />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>50 TND</span>
                    <span>2000 TND</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold">Certifications</Label>
                <div className="mt-2 space-y-2">
                  {certifications.map((cert) => (
                    <div key={cert} className="flex items-center space-x-2">
                      <Checkbox id={`cert-${cert}`} />
                      <Label htmlFor={`cert-${cert}`} className="font-normal">
                        {cert}
                      </Label>
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
            {mockProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
             {[...mockProducts].reverse().map((product) => (
              <ProductCard key={`${product.id}-rev`} product={{...product, id: `${product.id}-rev`}} />
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Button variant="outline">Charger plus</Button>
          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

import { mockProducts } from '@/lib/mock-data';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, Heart, ShoppingCart, Download } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { useAuth } from '@/context/auth-context';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { user } = useAuth();
  const product = mockProducts.find((p) => p.id === id?.replace('-rev',''));
  const relatedProducts = mockProducts.filter((p) => p.category === product?.category && p.id !== product?.id).slice(0, 3);

  if (!product) {
    notFound();
  }

  const isBuyer = user?.type === 'buyer';

  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div className="aspect-square relative w-full overflow-hidden rounded-lg shadow-lg">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              data-ai-hint="cosmetic ingredient"
            />
          </div>
          {/* Add thumbnail gallery here if needed */}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="w-fit">{product.category}</Badge>
            <h1 className="text-3xl lg:text-4xl font-bold font-headline">{product.name}</h1>
            <p className="text-muted-foreground text-lg">Vendu par <span className="text-primary font-semibold">Unica Cosmétiques</span></p>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < product.rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground text-sm">({product.reviewCount} avis)</span>
            </div>
          </div>
          
          <p className="text-base leading-relaxed">{product.description}</p>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <p className="text-3xl font-bold font-headline">{product.price} <span className="text-lg font-normal text-muted-foreground">TND / kg</span></p>
                <p className="text-sm text-muted-foreground">Stock: {product.stock} kg</p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Quantité minimale (MOQ): {product.moq} kg</p>
            </CardContent>
          </Card>
          
          {isBuyer && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button size="lg" className="flex-1"><ShoppingCart className="mr-2 h-5 w-5" /> Ajouter au panier</Button>
              <Button size="lg" variant="outline"><Heart className="mr-2 h-5 w-5" /> Ajouter aux favoris</Button>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="font-semibold text-lg mb-2">Spécifications</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><strong>INCI:</strong> {product.inci}</li>
              {product.certifications && (
                <li className="flex items-center gap-2">
                  <strong>Certifications:</strong> 
                  {product.certifications.map(cert => <Badge key={cert} variant="outline">{cert}</Badge>)}
                </li>
              )}
            </ul>
             <div className="flex gap-2 mt-4">
              <Button variant="secondary" size="sm"><Download className="mr-2 h-4 w-4" /> Fiche Technique</Button>
              <Button variant="secondary" size="sm"><Download className="mr-2 h-4 w-4" /> Certificat d'Analyse</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-4 font-headline">Description Détaillée</h2>
        <p className="text-muted-foreground leading-loose">{product.longDescription}</p>
      </div>
      
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-center font-headline">Produits Similaires</h2>
         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
      </div>
    </div>
  );
}

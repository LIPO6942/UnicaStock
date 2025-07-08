'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface ProductCardProps {
  product: Product;
}

function ProductCardComponent({ product }: ProductCardProps) {
  const { user } = useAuth();
  const isBuyer = user?.type === 'buyer';

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className="block">
          <div className="aspect-square relative w-full overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="cosmetic ingredient"
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Badge variant="secondary" className="mb-2">
          {product.category}
        </Badge>
        <CardTitle className="text-lg leading-snug">
          <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Par Unica Link</p>
        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < product.rating ? 'text-primary fill-primary' : 'text-muted-foreground/50'}`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({product.reviewCount})</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="text-xl font-bold font-headline">
          {product.price} <span className="text-sm font-normal text-muted-foreground">TND/kg</span>
        </div>
        {isBuyer && (
          <Button asChild>
            <Link href={`/products/${product.id}`}>Voir</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export const ProductCard = React.memo(ProductCardComponent);
ProductCard.displayName = 'ProductCard';

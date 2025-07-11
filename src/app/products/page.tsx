import { getProducts, getSellerProfile } from '@/lib/product-service';
import type { Product } from '@/lib/types';
import { Suspense } from 'react';
import { ProductsClientPage } from '@/components/products-client-page';
import Loading from './loading';

async function getCategories(products: Product[]): Promise<string[]> {
    const categories = new Set(products.map(p => p.category));
    return Array.from(categories).sort();
}

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = await getCategories(products);
  const seller = await getSellerProfile();

  return (
    <Suspense fallback={<Loading />}>
        <ProductsClientPage products={products} categories={categories} seller={seller} />
    </Suspense>
  );
}

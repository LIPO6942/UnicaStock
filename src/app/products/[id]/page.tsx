import { notFound } from 'next/navigation';
import { getProduct, getProducts } from '@/lib/product-service';
import { ProductDetailClient } from '@/components/product-detail-client';

// This is the Server Component page that fetches data
export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    const product = await getProduct(params.id);
    
    if (!product) {
        notFound();
    }

    // Fetch related products on the server as well
    const allProducts = await getProducts();
    const relatedProducts = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 3);
    
    return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}

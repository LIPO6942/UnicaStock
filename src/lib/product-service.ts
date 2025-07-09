'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import type { Product, Review } from '@/lib/types';

// This service reads products from Firestore for Server Components.

const productsCollectionRef = collection(db, 'products');

/**
 * Fetches all products from Firestore, ordered by name.
 * @returns A promise that resolves to an array of products.
 */
export async function getProducts(): Promise<Product[]> {
    const q = query(productsCollectionRef, orderBy("name"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

/**
 * Fetches a single product by its ID from Firestore.
 * @param id The ID of the product to fetch.
 * @returns A promise that resolves to the product object or null if not found.
 */
export async function getProduct(id: string): Promise<Product | null> {
    if (!id) return null;
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
}


/**
 * Fetches all reviews for a specific product.
 * @param productId The ID of the product.
 * @returns A promise that resolves to an array of reviews.
 */
export async function getReviewsForProduct(productId: string): Promise<Review[]> {
    if (!productId) return [];
    const reviewsCollectionRef = collection(db, 'products', productId, 'reviews');
    const q = query(reviewsCollectionRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
}

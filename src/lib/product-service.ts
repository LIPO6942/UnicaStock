'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, orderBy, Timestamp, where, limit } from 'firebase/firestore';
import type { Product, Review, UserProfile } from '@/lib/types';

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
    return snapshot.docs.map(doc => {
        const data = doc.data();
        // The `createdAt` field is a Firebase Timestamp.
        // We need to convert it to a serializable format before passing it to the client component.
        const createdAtTimestamp = data.createdAt as Timestamp | null;
        return {
            id: doc.id,
            ...data,
            createdAt: createdAtTimestamp ? {
                seconds: createdAtTimestamp.seconds,
                nanoseconds: createdAtTimestamp.nanoseconds,
            } : null,
        } as Review;
    });
}

/**
 * Fetches the seller's profile.
 * As there's only one seller in this architecture, it fetches the first user with type 'seller'.
 * @returns A promise that resolves to the seller's profile or null if not found.
 */
export async function getSellerProfile(): Promise<UserProfile | null> {
    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, where('type', '==', 'seller'), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const sellerDoc = snapshot.docs[0];
    return { uid: sellerDoc.id, ...sellerDoc.data() } as UserProfile;
}

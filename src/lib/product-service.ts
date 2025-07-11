
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, orderBy, Timestamp, where, limit } from 'firebase/firestore';
import type { Product, Review, UserProfile } from '@/lib/types';

// This service reads products from Firestore for Server Components.

const productsCollectionRef = collection(db, 'products');

/**
 * Fetches all products from Firestore. Sorting is done manually to avoid complex query issues.
 * @returns A promise that resolves to an array of products.
 */
export async function getProducts(): Promise<Product[]> {
    try {
        // Query without ordering to prevent permission issues with indexes.
        const q = query(productsCollectionRef);
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return [];
        }
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        // Sort manually after fetching
        products.sort((a, b) => a.name.localeCompare(b.name));
        return products;
    } catch (error) {
        console.error("Firebase Error: Could not fetch products.", error);
        return [];
    }
}

/**
 * Fetches a single product by its ID from Firestore.
 * @param id The ID of the product to fetch.
 * @returns A promise that resolves to the product object or null if not found.
 */
export async function getProduct(id: string): Promise<Product | null> {
    if (!id) return null;
    try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Product;
        }
        return null;
    } catch (error) {
        console.error(`Firebase Error: Could not fetch product ${id}.`, error);
        return null;
    }
}


/**
 * Fetches all reviews for a specific product.
 * @param productId The ID of the product.
 * @returns A promise that resolves to an array of reviews.
 */
export async function getReviewsForProduct(productId: string): Promise<Review[]> {
    if (!productId) return [];
    try {
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
    } catch(error) {
        console.error(`Firebase Error: Could not fetch reviews for product ${productId}.`, error);
        return [];
    }
}

/**
 * Fetches the seller's profile.
 * As there's only one seller in this architecture, it fetches the first user with type 'seller'.
 * @returns A promise that resolves to the seller's profile or null if not found.
 */
export async function getSellerProfile(): Promise<UserProfile | null> {
    try {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where('type', '==', 'seller'), limit(1));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return null;
        }
        const sellerDoc = snapshot.docs[0];
        return { uid: sellerDoc.id, ...sellerDoc.data() } as UserProfile;
    } catch(error) {
         console.error(`Firebase Error: Could not fetch seller profile.`, error);
         return null;
    }
}

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import type { Product, Review } from '@/lib/types';

// This service manages product mutations from the client-side.

const productsCollectionRef = collection(db, 'products');

/**
 * Adds a new product to Firestore.
 * @param productData The product data to add, without id, seller, rating, and reviewCount.
 * @returns A promise that resolves to the new product's ID.
 */
export async function addProduct(productData: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'seller'>): Promise<string> {
    const newProduct: Omit<Product, 'id'> = {
        ...productData,
        seller: 'Unica Link', // Centralized seller
        rating: 0,
        reviewCount: 0,
    };
    const docRef = await addDoc(productsCollectionRef, newProduct);
    return docRef.id;
}

/**
 * Updates an existing product in Firestore.
 * @param id The ID of the product to update.
 * @param productData An object containing the fields to update.
 */
export async function updateProduct(id: string, productData: Partial<Omit<Product, 'id'>>) {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, productData);
}

/**
 * Deletes a product from Firestore.
 * @param id The ID of the product to delete.
 */
export async function deleteProduct(id: string) {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
}

/**
 * Adds a new review for a product and updates the product's average rating.
 * @param productId The ID of the product being reviewed.
 * @param reviewData The review data.
 */
export async function addReview(productId: string, reviewData: Omit<Review, 'id' | 'createdAt'>) {
    const productRef = doc(db, 'products', productId);
    
    await runTransaction(db, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) {
            throw new Error("Produit non trouvé !");
        }

        // Calculation of new average rating
        const currentData = productDoc.data();
        const currentRating = currentData.rating || 0;
        const currentReviewCount = currentData.reviewCount || 0;
        
        const newReviewCount = currentReviewCount + 1;
        const newTotalRating = (currentRating * currentReviewCount) + reviewData.rating;
        const newAverageRating = newTotalRating / newReviewCount;

        // Update product document
        transaction.update(productRef, {
            rating: newAverageRating,
            reviewCount: newReviewCount,
        });

        // Add the new review document
        const newReviewRef = doc(collection(db, 'products', productId, 'reviews'));
        transaction.set(newReviewRef, {
            ...reviewData,
            createdAt: serverTimestamp(),
        });
    });
}

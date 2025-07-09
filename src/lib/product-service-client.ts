import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, runTransaction, serverTimestamp, getDocs } from 'firebase/firestore';
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
 * Adds a new review for a product and updates the product's average rating and review count
 * by recounting existing reviews to ensure data integrity.
 * @param productId The ID of the product being reviewed.
 * @param reviewData The review data.
 */
export async function addReview(productId: string, reviewData: Omit<Review, 'id' | 'createdAt'>) {
    const productRef = doc(db, 'products', productId);
    const reviewsCollectionRef = collection(db, 'products', productId, 'reviews');

    // First, get all existing reviews to ensure the new count and rating are accurate.
    // This makes the system self-healing if the counter is ever out of sync.
    const reviewsSnapshot = await getDocs(reviewsCollectionRef);
    const existingReviews = reviewsSnapshot.docs.map(doc => doc.data() as Review);

    await runTransaction(db, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) {
            throw new Error("Produit non trouvé !");
        }

        // Recalculate rating and count based on the ground truth (actual reviews)
        const totalRatingOfExisting = existingReviews.reduce((sum, review) => sum + review.rating, 0);
        
        const newReviewCount = existingReviews.length + 1;
        const newTotalRating = totalRatingOfExisting + reviewData.rating;
        const newAverageRating = newTotalRating / newReviewCount;

        // Update product document with the corrected data
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

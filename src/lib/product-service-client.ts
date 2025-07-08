import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Product } from '@/lib/types';

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
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
        reviewCount: Math.floor(Math.random() * 50) + 10,
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

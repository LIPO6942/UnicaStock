'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, query, orderBy } from 'firebase/firestore';
import type { Product } from '@/lib/types';

// This service manages the 'products' collection in Firestore.

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

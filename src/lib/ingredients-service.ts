
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import type { Ingredient } from '@/lib/types';

const ingredientsCollectionRef = collection(db, 'ingredients');

/**
 * Fetches all ingredients from Firestore for the public page.
 * @returns A promise that resolves to an array of ingredients.
 */
export async function getIngredients(): Promise<Ingredient[]> {
    try {
        const q = query(ingredientsCollectionRef, orderBy('name'));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient));
    } catch (error) {
        console.error("Firebase Error: Could not fetch ingredients.", error);
        // In case of error (e.g., permissions), return an empty array to avoid crashing the page.
        return [];
    }
}

/**
 * Adds a new ingredient to Firestore.
 * This function should only be callable by an authenticated seller.
 * @param ingredientData The ingredient data to add.
 */
export async function addIngredient(ingredientData: Omit<Ingredient, 'id'>) {
    await addDoc(ingredientsCollectionRef, ingredientData);
}

/**
 * Updates an existing ingredient in Firestore.
 * This function should only be callable by an authenticated seller.
 * @param id The ID of the ingredient to update.
 * @param ingredientData An object containing the fields to update.
 */
export async function updateIngredient(id: string, ingredientData: Partial<Omit<Ingredient, 'id'>>) {
    const docRef = doc(db, 'ingredients', id);
    await updateDoc(docRef, ingredientData);
}

/**
 * Deletes an ingredient from Firestore.
 * This function should only be callable by an authenticated seller.
 * @param id The ID of the ingredient to delete.
 */
export async function deleteIngredient(id: string) {
    const docRef = doc(db, 'ingredients', id);
    await deleteDoc(docRef);
}

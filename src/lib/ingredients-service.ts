
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { Ingredient } from '@/lib/types';

const ingredientsCollectionRef = collection(db, 'ingredients');

/**
 * Fetches all ingredients from Firestore.
 * Includes error handling to prevent crashes from permission issues.
 * @returns A promise that resolves to an array of ingredients.
 */
export async function getIngredients(): Promise<Ingredient[]> {
    try {
        const q = query(ingredientsCollectionRef);
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return [];
        }
        const ingredients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient));
        // Sort manually to avoid complex query indexes
        ingredients.sort((a, b) => a.name.localeCompare(b.name));
        return ingredients;
    } catch (error) {
        console.error("Firebase Error: Could not fetch ingredients.", error);
        // Return an empty array to prevent the page from crashing.
        // This is a graceful fallback.
        return [];
    }
}

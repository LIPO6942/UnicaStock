
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { Ingredient } from '@/lib/types';

const ingredientsCollectionRef = collection(db, 'ingredients');

/**
 * Fetches all ingredients from Firestore, ordered by name.
 * @returns A promise that resolves to an array of ingredients.
 */
export async function getIngredients(): Promise<Ingredient[]> {
    const q = query(ingredientsCollectionRef, orderBy("name"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        // Fallback to returning an empty array if the collection doesn't exist
        // or has no documents, preventing errors on the page.
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient));
}

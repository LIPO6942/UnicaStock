
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import type { Ingredient } from '@/lib/types';

const ingredientsCollectionRef = collection(db, 'ingredients');

/**
 * Fetches all ingredients from Firestore, ordered by name. This is a public read operation.
 * @returns A promise that resolves to an array of ingredients.
 */
export async function getIngredients(): Promise<Ingredient[]> {
  try {
    const q = query(ingredientsCollectionRef, orderBy('name'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient));
  } catch (error) {
    console.error("Firebase Error: Could not fetch ingredients.", error);
    // Return an empty array or re-throw, depending on how you want to handle errors.
    // Returning empty array is safer for rendering.
    return [];
  }
}


import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, orderBy } from 'firebase/firestore';
import type { Ingredient } from '@/lib/types';

// This service manages ingredient mutations from the CLIENT-SIDE.
// It relies on the user being authenticated and Firestore security rules
// to authorize the write operations.

const ingredientsCollectionRef = collection(db, 'ingredients');


/**
 * Fetches all ingredients from Firestore. This function is intended to be called
 * from the client-side after an operation (like add/delete) to refresh the data.
 * @returns A promise that resolves to an array of ingredients.
 */
export async function getIngredientsClient(): Promise<Ingredient[]> {
  try {
    const q = query(ingredientsCollectionRef, orderBy('name'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient));
  } catch (error) {
    console.error("Firebase Client Error: Could not fetch ingredients.", error);
    // Propagate the error so it can be caught by the caller and displayed in a toast.
    throw error;
  }
}

/**
 * Adds a new ingredient to Firestore. This must be called from the client.
 * @param ingredientData The ingredient data to add.
 * @returns A promise that resolves to the new ingredient's ID.
 */
export async function addIngredient(ingredientData: Omit<Ingredient, 'id'>): Promise<string> {
  // The firestore.rules will enforce that only sellers can call this.
  const docRef = await addDoc(ingredientsCollectionRef, ingredientData);
  return docRef.id;
}

/**
 * Updates an existing ingredient in Firestore. This must be called from the client.
 * @param id The ID of the ingredient to update.
 * @param ingredientData An object containing the fields to update.
 */
export async function updateIngredient(id: string, ingredientData: Partial<Omit<Ingredient, 'id'>>) {
  // The firestore.rules will enforce that only sellers can call this.
  const docRef = doc(db, 'ingredients', id);
  await updateDoc(docRef, ingredientData);
}

/**
 * Deletes an ingredient from Firestore. This must be called from the client.
 * @param id The ID of the ingredient to delete.
 */
export async function deleteIngredient(id: string) {
  // The firestore.rules will enforce that only sellers can call this.
  const docRef = doc(db, 'ingredients', id);
  await deleteDoc(docRef);
}

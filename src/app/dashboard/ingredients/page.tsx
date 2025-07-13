
import { getIngredients } from '@/lib/ingredients-service';
import { IngredientsClientPage } from '@/components/ingredients-client-page';

// This is now a React Server Component (RSC)
export default async function SellerIngredientsPage() {
  // Fetch data on the server, before the page is rendered.
  // This operation uses the public read access defined in Firestore rules
  // and is more secure and efficient.
  const initialIngredients = await getIngredients();

  // Pass the server-fetched data to the client component as a prop.
  // The client component will handle all user interactions (add, edit, delete).
  return <IngredientsClientPage initialIngredients={initialIngredients} />;
}

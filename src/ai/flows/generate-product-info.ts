'use server';

/**
 * @fileOverview A flow to generate product information including descriptions and ingredient lists using AI.
 *
 * - generateProductInfo - A function that generates product information.
 * - GenerateProductInfoInput - The input type for the generateProductInfo function.
 * - GenerateProductInfoOutput - The return type for the generateProductInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductInfoInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productType: z.string().describe('The type of product (e.g., cream, lotion, serum).'),
  keyIngredients: z.string().describe('A comma-separated list of key ingredients.'),
  targetAudience: z.string().describe('The target audience for the product.'),
  regulatoryStandards: z.string().describe('The relevant local regulatory standards.'),
});
export type GenerateProductInfoInput = z.infer<typeof GenerateProductInfoInputSchema>;

const GenerateProductInfoOutputSchema = z.object({
  productDescription: z.string().describe('A detailed description of the product.'),
  ingredientList: z.string().describe('A compliant ingredient list.'),
  marketingCopy: z.string().describe('Marketing copy for the product.'),
});
export type GenerateProductInfoOutput = z.infer<typeof GenerateProductInfoOutputSchema>;

export async function generateProductInfo(input: GenerateProductInfoInput): Promise<GenerateProductInfoOutput> {
  return generateProductInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductInfoPrompt',
  input: {schema: GenerateProductInfoInputSchema},
  output: {schema: GenerateProductInfoOutputSchema},
  prompt: `You are an AI assistant specialized in generating product information for cosmetic products in Tunisia, ensuring compliance with local regulatory standards.

  Based on the following information, generate a detailed product description, a compliant ingredient list (INCI format), and compelling marketing copy.

  Product Name: {{{productName}}}
  Product Type: {{{productType}}}
  Key Ingredients: {{{keyIngredients}}}
  Target Audience: {{{targetAudience}}}
  Regulatory Standards: {{{regulatoryStandards}}}

  Product Description:

  Ingredient List:

  Marketing Copy:`,
});

const generateProductInfoFlow = ai.defineFlow(
  {
    name: 'generateProductInfoFlow',
    inputSchema: GenerateProductInfoInputSchema,
    outputSchema: GenerateProductInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

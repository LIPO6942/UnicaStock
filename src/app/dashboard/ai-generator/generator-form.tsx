'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateProductInfo } from '@/ai/flows/generate-product-info';
import type { GenerateProductInfoInput, GenerateProductInfoOutput } from '@/ai/flows/generate-product-info';
import { Loader2, Clipboard } from 'lucide-react';

const formSchema = z.object({
  productName: z.string().min(3, 'Le nom du produit est requis.'),
  productType: z.string().min(3, 'Le type de produit est requis.'),
  keyIngredients: z.string().min(3, 'Les ingrédients clés sont requis.'),
  targetAudience: z.string().min(3, 'Le public cible est requis.'),
  regulatoryStandards: z.string().default('Normes cosmétiques tunisiennes en vigueur'),
});

export function GeneratorForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GenerateProductInfoOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<GenerateProductInfoInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: '',
      productType: '',
      keyIngredients: '',
      targetAudience: '',
      regulatoryStandards: 'Normes cosmétiques tunisiennes en vigueur',
    },
  });

  const onSubmit: SubmitHandler<GenerateProductInfoInput> = async (data) => {
    setIsLoading(true);
    setGeneratedContent(null);
    try {
      const result = await generateProductInfo(data);
      setGeneratedContent(result);
      toast({
        title: 'Contenu généré avec succès!',
        description: 'Vos informations produit sont prêtes.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erreur de génération',
        description: 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copié!',
      description: `${fieldName} a été copié dans le presse-papiers.`,
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="productName">Nom du Produit</Label>
          <Input id="productName" {...form.register('productName')} placeholder="Ex: Crème de jour hydratante" />
          {form.formState.errors.productName && <p className="text-sm text-destructive">{form.formState.errors.productName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="productType">Type de Produit</Label>
          <Input id="productType" {...form.register('productType')} placeholder="Ex: Crème, lotion, sérum" />
           {form.formState.errors.productType && <p className="text-sm text-destructive">{form.formState.errors.productType.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="keyIngredients">Ingrédients Clés (séparés par une virgule)</Label>
          <Input id="keyIngredients" {...form.register('keyIngredients')} placeholder="Ex: Huile d'argan, acide hyaluronique, vitamine C" />
           {form.formState.errors.keyIngredients && <p className="text-sm text-destructive">{form.formState.errors.keyIngredients.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetAudience">Public Cible</Label>
          <Input id="targetAudience" {...form.register('targetAudience')} placeholder="Ex: Femmes 25-40 ans, peaux sèches" />
           {form.formState.errors.targetAudience && <p className="text-sm text-destructive">{form.formState.errors.targetAudience.message}</p>}
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Génération en cours...' : 'Générer les informations'}
        </Button>
      </form>
      <div className="space-y-6">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
             <Loader2 className="h-12 w-12 animate-spin text-primary" />
             <p className="text-lg">L'IA prépare vos textes...</p>
             <p className="text-sm text-center">Cela peut prendre quelques instants.</p>
          </div>
        )}
        {generatedContent && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Description du Produit</CardTitle>
                    <CardDescription>Pour votre fiche produit.</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedContent.productDescription, 'La description du produit')}>
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <Textarea readOnly value={generatedContent.productDescription} rows={6} className="bg-muted"/>
                </CardContent>
              </Card>
              <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Liste d'ingrédients (INCI)</CardTitle>
                    <CardDescription>Format conforme.</CardDescription>
                  </div>
                   <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedContent.ingredientList, 'La liste d\'ingrédients')}>
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <Textarea readOnly value={generatedContent.ingredientList} rows={6} className="bg-muted"/>
                </CardContent>
              </Card>
              <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Texte Marketing</CardTitle>
                    <CardDescription>Accroches pour réseaux sociaux, etc.</CardDescription>
                  </div>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedContent.marketingCopy, 'Le texte marketing')}>
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <Textarea readOnly value={generatedContent.marketingCopy} rows={6} className="bg-muted"/>
                </CardContent>
              </Card>
            </div>
        )}
        {!isLoading && !generatedContent && (
            <div className="flex flex-col items-center justify-center h-full rounded-lg border-2 border-dashed bg-card/50 p-8 text-center text-muted-foreground">
                <FlaskConical className="h-12 w-12 mb-4"/>
                <h3 className="text-lg font-semibold">Vos résultats apparaîtront ici.</h3>
                <p>Remplissez le formulaire et lancez la génération pour commencer.</p>
            </div>
        )}
      </div>
    </div>
  );
}

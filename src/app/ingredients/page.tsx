
import { getIngredients } from '@/lib/ingredients-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Check } from 'lucide-react';

export const revalidate = 60; // Revalidate data every 60 seconds

export default async function IngredientsPage() {
  const ingredients = await getIngredients();

  return (
    <>
      <section className="w-full py-12 md:py-20 lg:py-24 bg-secondary/40">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">Nos Ingrédients d'Exception</h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Découvrez la richesse de la nature tunisienne à travers notre sélection d'ingrédients naturels et authentiques,
              choisis pour leurs vertus et leur qualité.
            </p>
          </div>
        </div>
      </section>

      <main className="w-full py-12 md:py-16">
        <div className="container grid gap-12 px-4 md:px-6">
          {ingredients.map((ingredient, index) => (
            <div key={ingredient.id} className={`grid gap-8 md:grid-cols-2 ${index % 2 !== 0 ? 'md:grid-flow-col-dense' : ''}`}>
              <div className={`flex items-center justify-center ${index % 2 !== 0 ? 'md:col-start-2' : ''}`}>
                 <Image
                    src={ingredient.imageUrl || 'https://placehold.co/600x400.png'}
                    alt={ingredient.name}
                    width={600}
                    height={400}
                    className="rounded-xl object-cover shadow-lg"
                    data-ai-hint="natural ingredient"
                />
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <Card>
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2">{ingredient.location}</Badge>
                    <CardTitle className="text-3xl font-bold font-headline">{ingredient.name}</CardTitle>
                    <CardDescription className="text-muted-foreground text-base">
                      {ingredient.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Bienfaits principaux :</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        {ingredient.benefits.map((benefit) => (
                          <li key={benefit.name} className="flex items-start">
                            <Check className="h-5 w-5 mr-2 mt-0.5 text-primary shrink-0" />
                            <span>{benefit.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                     {ingredient.certifications && ingredient.certifications.length > 0 && (
                        <div>
                        <h3 className="font-semibold text-lg mb-2">Certifications :</h3>
                        <div className="flex flex-wrap gap-2">
                            {ingredient.certifications.map(cert => (
                                <Badge key={cert} variant="secondary">{cert}</Badge>
                            ))}
                        </div>
                        </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

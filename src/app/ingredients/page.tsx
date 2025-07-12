
import Image from 'next/image';
import { getIngredients } from '@/lib/ingredients-service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

export const revalidate = 60; // Re-fetch data at most once every 60 seconds

export default async function IngredientsPage() {
    const ingredients = await getIngredients();

    const heroIngredient = ingredients[0];
    const otherIngredients = ingredients.slice(1);

    return (
    <div className="bg-background text-foreground">
      <header className="text-center py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <h1 className="text-4xl md:text-6xl font-bold font-headline">Nos Ingrédients d'Exception</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Au cœur de nos formules, des trésors de la nature tunisienne, sélectionnés pour leur pureté et leur efficacité.
          </p>
        </div>
      </header>

      <main className="container py-16 md:py-24 space-y-24">
        {heroIngredient && (
            <section id="hero-ingredient">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                        <Image
                            src={heroIngredient.imageUrl}
                            alt={heroIngredient.name}
                            fill
                            className="object-cover"
                            data-ai-hint="cosmetic ingredient"
                        />
                    </div>
                    <div>
                        <Badge variant="outline" className="mb-4 text-primary border-primary">Ingrédient Phare</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold font-headline">{heroIngredient.name}</h2>
                        <p className="mt-2 text-lg font-semibold text-muted-foreground">{heroIngredient.location}</p>
                        <p className="mt-6 text-base leading-relaxed">{heroIngredient.description}</p>
                        <div className="mt-8">
                            <h3 className="font-semibold text-lg mb-4">Bienfaits & Certifications</h3>
                            <div className="flex flex-wrap gap-4">
                                {heroIngredient.benefits.map(benefit => (
                                    <div key={benefit.name} className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                        <span>{benefit.name}</span>
                                    </div>
                                ))}
                                {heroIngredient.certifications.map(cert => (
                                    <Badge key={cert} variant="secondary">{cert}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )}

        {otherIngredients.length > 0 && (
            <section id="other-ingredients">
                <div className="text-center mb-12">
                     <h2 className="text-3xl md:text-4xl font-bold font-headline">Découvrez nos autres trésors</h2>
                     <p className="mt-3 text-lg text-muted-foreground">Chaque ingrédient est une promesse de qualité et d'authenticité.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {otherIngredients.map(ingredient => (
                       <Card key={ingredient.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                           <div className="relative aspect-[4/3]">
                               <Image
                                   src={ingredient.imageUrl}
                                   alt={ingredient.name}
                                   fill
                                   className="object-cover"
                                   data-ai-hint="cosmetic ingredient"
                               />
                           </div>
                           <CardContent className="p-6">
                               <h3 className="text-xl font-bold font-headline">{ingredient.name}</h3>
                               <p className="text-sm font-semibold text-muted-foreground mb-4">{ingredient.location}</p>
                               <p className="text-sm text-muted-foreground mb-4">{ingredient.description.substring(0, 100)}...</p>
                               <div className="flex flex-wrap gap-2">
                                    {ingredient.benefits.map(benefit => (
                                        <Badge key={benefit.name} variant="outline">{benefit.name}</Badge>
                                    ))}
                               </div>
                           </CardContent>
                       </Card>
                    ))}
                </div>
            </section>
        )}
      </main>
    </div>
    );
}


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Check } from 'lucide-react';

const ingredients = [
    {
      id: '1',
      name: 'Figue de Barbarie',
      location: 'Kasserine, Tunisie',
      description: "L'huile de pépins de figue de Barbarie est un élixir précieux, réputé pour ses propriétés anti-âge exceptionnelles. Riche en vitamine E et en stérols, elle lutte contre les radicaux libres et stimule le renouvellement cellulaire.",
      imageUrl: 'https://i.postimg.cc/4y78TT9Y/AISelect-20250711-185144-Chrome.jpg',
      benefits: [
        { name: 'Anti-âge puissant et régénérant' },
        { name: 'Redonne fermeté et tonicité à la peau' },
        { name: 'Action cicatrisante et réparatrice' },
      ],
      certifications: ['ECOCERT', 'BIO'],
    },
    {
      id: '2',
      name: "Huile d'Olive Extra Vierge",
      location: 'Sfax, Tunisie',
      description: "Trésor de la Méditerranée, notre huile d'olive est pressée à froid pour conserver toutes ses vertus. Naturellement riche en antioxydants, elle nourrit, protège et adoucit la peau et les cheveux.",
      imageUrl: 'https://placehold.co/600x400.png',
      benefits: [
        { name: 'Hydratation intense pour peaux sèches' },
        { name: 'Protège contre les agressions extérieures' },
        { name: 'Apporte brillance et force aux cheveux' },
      ],
      certifications: ['AOP', 'BIO'],
    },
    {
      id: '3',
      name: 'Ghassoul (Argile Volcanique)',
      location: 'Montagnes de l\'Atlas, Tunisie',
      description: 'Utilisé depuis des siècles dans les rituels du hammam, le Ghassoul est une argile naturelle qui nettoie en douceur sans agresser le film hydrolipidique. Elle est idéale pour les masques visage et cheveux.',
      imageUrl: 'https://placehold.co/600x400.png',
      benefits: [
        { name: 'Nettoyant et purifiant doux' },
        { name: 'Régule l\'excès de sébum' },
        { name: 'Gaine et fortifie la fibre capillaire' },
      ],
      certifications: [],
    },
];


export default function IngredientsPage() {
  return (
    <>
      <section className="w-full py-12 md:py-20 lg:py-24 bg-secondary text-secondary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">Nos Ingrédients d'Exception</h1>
            <p className="max-w-[700px] text-secondary-foreground/80 md:text-xl">
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
                    <CardTitle className="text-3xl font-bold font-headline text-primary">{ingredient.name}</CardTitle>
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

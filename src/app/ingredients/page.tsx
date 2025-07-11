
import Image from 'next/image';
import { CheckCircle2, Leaf, MapPin, Award, Orbit, Recycle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Benefit = {
  name: string;
};

type Ingredient = {
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  benefits: Benefit[];
  certifications: string[];
};

const ingredients: Ingredient[] = [
  {
    name: 'Huile d\'Argan',
    location: 'Sud de la Tunisie',
    description: 'Riche en vitamine E et acides gras essentiels, notre huile d\'argan tunisienne est reconnue pour ses propriétés régénérantes et anti-âge exceptionnelles.',
    imageUrl: 'https://images.unsplash.com/photo-1708146646005-30597857a7c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxodWlsZSUyMGRlJTIwZmlndWV8ZW58MHx8fHwxNzUyMjMyNzE2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'argan oil',
    benefits: [{ name: 'Anti-âge' }, { name: 'Hydratation intense' }, { name: 'Régénération cellulaire' }, { name: 'Protection antioxydante' }],
    certifications: ['Bio', 'Commerce équitable'],
  },
  {
    name: 'Eau de Fleur d\'Oranger',
    location: 'Nabeul, Cap Bon',
    description: 'Distillée selon des méthodes traditionnelles, notre eau de fleur d\'oranger apaise et parfume délicatement la peau, tout en respectant son équilibre naturel.',
    imageUrl: 'https://images.unsplash.com/photo-1647249239918-058feb10d233?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxGbGV1ciUyMGQlMjdPcmFuZ2VyfGVufDB8fHx8MTc1MjIzMjgyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'cosmetic bottles',
    benefits: [{ name: 'Apaisante' }, { name: 'Rafraîchissante' }, { name: 'Anti-inflammatoire' }, { name: 'Parfum naturel' }],
    certifications: ['Naturel', 'Artisanal'],
  },
  {
    name: 'Argile Verte',
    location: 'Montagnes du Nord-Ouest',
    description: 'Extraite des gisements naturels tunisiens, notre argile verte purifie en profondeur et régule l’excès de sébum pour une peau nette et matifiée.',
    imageUrl: 'https://images.unsplash.com/photo-1626783416763-67a92e5e7266?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGNsYXklMjBjb3NtZXRpY3xlbnwwfHx8fDE3NTIyMzM3MDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'green clay',
    benefits: [{ name: 'Purifiante' }, { name: 'Détoxifiante' }, { name: 'Matifiante' }, { name: 'Resserrement des pores' }],
    certifications: ['Naturel', 'Non traité'],
  },
    {
    name: 'Huile de Figue de Barbarie',
    location: 'Régions arides tunisiennes',
    description: 'L\'or vert du désert tunisien, cette huile précieuse est l\'un des anti-âge naturels les plus puissants, riche en vitamine E et stérols.',
    imageUrl: 'https://placehold.co/500x600.png',
    imageHint: 'prickly pear',
    benefits: [{ name: 'Anti-âge puissant' }, { name: 'Élasticité' }, { name: 'Éclat' }, { name: 'Réparation' }],
    certifications: ['Bio', 'Pressage à froid'],
  },
  {
    name: 'Miel de Thym',
    location: 'Montagnes de Zaghouan',
    description: 'Récolté dans les montagnes tunisiennes, ce miel sauvage aux propriétés antibactériennes nourrit et régénère les peaux les plus exigeantes.',
    imageUrl: 'https://placehold.co/500x600.png',
    imageHint: 'honey thyme',
    benefits: [{ name: 'Nourrissant' }, { name: 'Antibactérien' }, { name: 'Cicatrisant' }, { name: 'Antioxydant' }],
    certifications: ['Sauvage', 'Non pasteurisé'],
  },
  {
    name: 'Sable du Sahara',
    location: 'Désert du Sahara Tunisien',
    description: 'Finement tamisé et purifié, le sable ocre du Sahara offre une exfoliation douce et naturelle, révélant la douceur de votre peau.',
    imageUrl: 'https://placehold.co/500x600.png',
    imageHint: 'sahara sand',
    benefits: [{ name: 'Exfoliation douce' }, { name: 'Circulation' }, { name: 'Douceur' }, { name: 'Renouvellement cellulaire' }],
    certifications: ['Naturel', 'Purifié'],
  },
];

const IngredientCard = ({ ingredient, reverse = false }: { ingredient: Ingredient; reverse?: boolean }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
    <div className={`relative aspect-[5/6] w-full rounded-xl overflow-hidden shadow-lg ${reverse ? 'md:order-last' : ''}`}>
      <Image
        src={ingredient.imageUrl}
        alt={`Image de ${ingredient.name}`}
        fill
        className="object-cover"
        data-ai-hint={ingredient.imageHint}
      />
    </div>
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-primary">
        <MapPin className="h-5 w-5" />
        <span className="font-semibold text-sm">{ingredient.location}</span>
      </div>
      <h3 className="text-3xl font-bold font-headline">{ingredient.name}</h3>
      <p className="text-muted-foreground">{ingredient.description}</p>
      
      <div>
        <h4 className="font-semibold mb-3">Bienfaits :</h4>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-muted-foreground">
          {ingredient.benefits.map((benefit) => (
            <li key={benefit.name} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>{benefit.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Certifications :</h4>
        <div className="flex flex-wrap gap-2">
          {ingredient.certifications.map((cert) => (
            <Badge key={cert} variant="outline" className="bg-accent text-accent-foreground border-primary/20">{cert}</Badge>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const EngagementCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border">
        <div className="mb-4 rounded-full bg-accent p-4 text-primary">
            {icon}
        </div>
        <h3 className="text-xl font-semibold font-headline">{title}</h3>
        <p className="mt-2 text-muted-foreground text-sm">{description}</p>
    </div>
)


export default function IngredientsPage() {
  return (
    <div className="bg-background">
      <header className="bg-primary text-primary-foreground py-20">
        <div className="container text-center">
          <h1 className="text-5xl font-bold font-headline">Nos Ingrédients</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg opacity-90">
            Découvrez la richesse naturelle de la Tunisie qui compose nos formulations d'exception.
          </p>
        </div>
      </header>

      <main className="container py-16 md:py-24">
        <section className="text-center max-w-4xl mx-auto mb-16 md:mb-24">
          <h2 className="text-4xl font-bold font-headline">L'Authenticité Tunisienne dans Chaque Formule</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Chez Ùnica Cosmétiques, nous puisons dans la richesse de notre terroir tunisien pour créer des cosmétiques d'exception. Chaque ingrédient est soigneusement sélectionné auprès de producteurs locaux qui perpétuent des savoir-faire ancestraux, garantissant ainsi authenticité et la qualité de nos produits.
          </p>
        </section>

        <section className="space-y-16 md:space-y-24">
          {ingredients.map((ingredient, index) => (
            <IngredientCard key={ingredient.name} ingredient={ingredient} reverse={index % 2 !== 0} />
          ))}
        </section>
        
        <section className="mt-16 md:mt-24 py-16 md:py-24 bg-accent/50 rounded-xl">
             <div className="container">
                <div className="text-center max-w-3xl mx-auto mb-12">
                     <h2 className="text-4xl font-bold font-headline">Notre Engagement Qualité</h2>
                     <p className="mt-4 text-muted-foreground text-lg">Nous nous engageons à respecter les plus hauts standards de qualité et de durabilité.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <EngagementCard 
                        icon={<Leaf className="h-8 w-8" />}
                        title="100% Naturel"
                        description="Aucun ingrédient synthétique, uniquement des actifs naturels soigneusement sélectionnés."
                   />
                   <EngagementCard 
                        icon={<Orbit className="h-8 w-8" />}
                        title="Origine Contrôlée"
                        description="Traçabilité complète de nos ingrédients depuis leur lieu de récolte jusqu'au produit fini."
                   />
                   <EngagementCard 
                        icon={<Award className="h-8 w-8" />}
                        title="Certifications"
                        description="Produits certifiés bio, vegan et cruelty-free par des organismes reconnus."
                   />
                </div>
            </div>
        </section>

      </main>
    </div>
  );
}

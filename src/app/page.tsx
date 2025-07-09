import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getProducts } from '@/lib/product-service';
import { ArrowRight, Leaf, Search, ShieldCheck, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function Home() {
  const allProducts = await getProducts();
  const featuredProducts = allProducts.slice(0, 4);
  const recommendedProducts = [...allProducts].reverse().slice(0, 4);

  return (
    <div className="flex flex-col">
      <section className="relative w-full">
        <div className="container relative z-10 flex min-h-[70vh] flex-col items-center justify-center gap-6 py-20 text-center">
          <div className="absolute inset-0 -z-10">
             <Image
              src="https://i.postimg.cc/jSkJ3DGv/T001-UNICA-20-LUX-20-CREAM-20-NEW-02.webp"
              alt="Hero background"
              fill
              className="object-cover opacity-10"
              data-ai-hint="cosmetics cream"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter md:text-5xl lg:text-7xl font-headline">
            Matières Premières d'Exception
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            Votre source fiable pour les ingrédients cosmétiques de qualité en Tunisie.
          </p>
          <div className="w-full max-w-2xl">
            <form className="group relative">
               <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                type="search"
                placeholder="Rechercher par nom de produit, INCI..."
                className="w-full rounded-full py-7 pl-12 pr-32 text-base shadow-lg"
              />
              <Button type="submit" size="lg" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full py-6">
                Rechercher
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section id="featured-products" className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="flex flex-col items-center text-center gap-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Nos Produits Phares</h2>
            <p className="max-w-2xl text-muted-foreground">
              Découvrez les matières premières les plus populaires auprès de nos fabricants.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/products">
                Voir tous les produits <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="why-us" className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="flex flex-col items-center text-center gap-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Pourquoi Choisir Unica Link?</h2>
            <p className="max-w-3xl text-muted-foreground">
              Nous connectons les meilleurs fournisseurs tunisiens avec les créateurs de cosmétiques pour un
              approvisionnement simple, rapide et sécurisé.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="flex flex-col items-center text-center p-8 border-none bg-secondary/30">
              <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                <Leaf className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold font-headline">Qualité & Traçabilité</h3>
              <p className="mt-2 text-muted-foreground">
                Accédez à des matières premières de haute qualité avec une transparence totale sur l'origine et
                les spécifications.
              </p>
            </Card>
            <Card className="flex flex-col items-center text-center p-8 border-none bg-secondary/30">
              <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                <Truck className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold font-headline">Approvisionnement Local</h3>
              <p className="mt-2 text-muted-foreground">
                Soutenez l'économie locale et réduisez vos délais de livraison en vous approvisionnant
                directement en Tunisie.
              </p>
            </Card>
             <Card className="flex flex-col items-center text-center p-8 border-none bg-secondary/30">
              <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold font-headline">Transactions Sécurisées</h3>
              <p className="mt-2 text-muted-foreground">
                Achetez en toute confiance grâce à notre plateforme sécurisée et notre système d'évaluation
                fiable.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section id="recommended-products" className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="flex flex-col items-center text-center gap-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Recommandé Pour Vous</h2>
            <p className="max-w-2xl text-muted-foreground">
              Des suggestions personnalisées en fonction de vos besoins et de vos précédents achats.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

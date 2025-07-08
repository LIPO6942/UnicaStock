import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockProducts } from '@/lib/mock-data';
import { ArrowRight, Leaf, Search, ShieldCheck, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { BannerCarousel } from '@/components/banner-carousel';

export default function Home() {
  const featuredProducts = mockProducts.slice(0, 4);
  const recommendedProducts = [...mockProducts].reverse().slice(0, 4);

  return (
    <div className="flex flex-col">
      <section className="relative h-[60vh] min-h-[400px] w-full flex items-center justify-center text-center bg-card">
        <Image
          src="https://i.postimg.cc/jSkJ3DGv/T001-UNICA-20-LUX-20-CREAM-20-NEW-02.webp"
          alt="Hero background"
          fill
          className="object-cover opacity-20"
          data-ai-hint="cosmetics cream"
          priority
        />
        <div className="relative container z-10 flex flex-col items-center gap-6">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl font-headline">
            Unica Matières Premières
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Votre source fiable pour les ingrédients cosmétiques de qualité en Tunisie.
          </p>
          <div className="w-full max-w-lg">
            <form className="flex w-full items-center space-x-2">
              <Input
                type="search"
                placeholder="Rechercher par nom de produit, INCI..."
                className="flex-1 !bg-background/80 text-lg py-6"
              />
              <Button type="submit" size="lg" className="py-6">
                <Search className="h-5 w-5 mr-2" />
                Rechercher
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background">
        <div className="container">
          <BannerCarousel />
        </div>
      </section>

      <section id="featured-products" className="py-16 md:py-24">
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

      <section id="why-us" className="py-16 md:py-24 bg-card">
        <div className="container">
          <div className="flex flex-col items-center text-center gap-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Pourquoi Choisir Unica Link?</h2>
            <p className="max-w-3xl text-muted-foreground">
              Nous connectons les meilleurs fournisseurs tunisiens avec les créateurs de cosmétiques pour un
              approvisionnement simple, rapide et sécurisé.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center gap-4 p-6 rounded-lg">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <Leaf className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold font-headline">Qualité & Traçabilité</h3>
              <p className="text-center text-muted-foreground">
                Accédez à des matières premières de haute qualité avec une transparence totale sur l'origine et
                les spécifications.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 rounded-lg">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <Truck className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold font-headline">Approvisionnement Local</h3>
              <p className="text-center text-muted-foreground">
                Soutenez l'économie locale et réduisez vos délais de livraison en vous approvisionnant
                directement en Tunisie.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 rounded-lg">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold font-headline">Transactions Sécurisées</h3>
              <p className="text-center text-muted-foreground">
                Achetez en toute confiance grâce à notre plateforme sécurisée et notre système d'évaluation
                fiable.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="recommended-products" className="py-16 md:py-24">
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

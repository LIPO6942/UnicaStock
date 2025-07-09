'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, Heart, ShoppingCart, Download, LoaderCircle } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { useAuth } from '@/context/auth-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Product, Review, ProductVariant } from '@/lib/types';
import * as ProductServiceClient from '@/lib/product-service-client';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { FirebaseError } from 'firebase/app';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

// Helper component for the review form
function AddReviewForm({ productId, onReviewAdded }: { productId: string, onReviewAdded: () => void }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast({ title: 'Veuillez sélectionner une note en étoiles.', variant: 'destructive' });
            return;
        }
        if (!user) {
            toast({ title: 'Vous devez être connecté pour laisser un avis.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            await ProductServiceClient.addReview(productId, {
                userId: user.uid,
                userName: user.name,
                rating,
                comment,
            });
            toast({ title: 'Avis ajouté avec succès !', description: "Merci pour votre contribution." });
            setRating(0);
            setComment("");
            onReviewAdded(); // This will trigger a data refresh
        } catch (error) {
            console.error("Failed to add review:", error);
            let description = "Impossible d'ajouter l'avis. Veuillez réessayer.";
            if (error instanceof FirebaseError && error.code === 'permission-denied') {
                description = "Permission refusée. Assurez-vous d'être connecté en tant qu'acheteur et que les règles de sécurité sont correctes.";
            }
            toast({ 
                title: "Erreur lors de l'ajout de l'avis", 
                description: description, 
                variant: "destructive",
                duration: 9000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Laissez votre avis</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Votre note</Label>
                        <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    className="text-muted-foreground/30 transition-colors"
                                >
                                    <Star className={cn("h-7 w-7", (hoverRating || rating) >= star ? 'text-amber-400 fill-amber-400' : '')} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="comment">Votre commentaire</Label>
                        <Textarea 
                            id="comment" 
                            placeholder="Partagez votre expérience avec ce produit..." 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Envoi en cours...' : 'Envoyer mon avis'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export function ProductDetailClient({ product, relatedProducts, reviews }: { product: Product, relatedProducts: Product[], reviews: Review[] }) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { user, addToCart } = useAuth();
  
  const productVariants = product.variants || [];
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(productVariants?.[0]?.id || null);
  const [isAdding, setIsAdding] = useState(false);
  
  const selectedVariant = productVariants.find(v => v.id === selectedVariantId);

  const handleAddToCart = async () => {
    if (!user) {
        router.push('/login?redirect=/products/' + product.id);
        return;
    }
    if (!selectedVariant) {
        toast({ title: 'Veuillez sélectionner une contenance', variant: 'destructive'});
        return;
    }
    if (quantity > 0) {
      setIsAdding(true);
      try {
        await addToCart(product.id, product.name, product.imageUrl, selectedVariant, quantity);
        toast({
          title: "Ajouté au panier",
          description: `${quantity} x ${product.name} (${selectedVariant.contenance}) a été ajouté à votre panier.`,
        });
      } catch (error: any) {
        console.error(error);
        toast({
            title: "Erreur",
            description: error.message || "Impossible d'ajouter le produit au panier.",
            variant: "destructive"
        })
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleReviewAdded = () => {
    router.refresh();
  };

  const isBuyer = user?.type === 'buyer';
  const reviewCount = reviews.length;
  const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : product.rating;
  const currentStock = selectedVariant?.stock ?? 0;
  const isOutOfStock = currentStock === 0;

  return (
    <div className="container py-12 md:py-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div>
          <div className="aspect-square relative w-full overflow-hidden rounded-lg shadow-lg">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              data-ai-hint="cosmetic ingredient"
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="w-fit">{product.category}</Badge>
            <h1 className="text-3xl lg:text-4xl font-bold font-headline">{product.name}</h1>
            <p className="text-muted-foreground text-lg">Vendu par <span className="text-foreground font-semibold">{product.seller}</span></p>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.round(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground text-sm">({reviewCount} avis)</span>
            </div>
          </div>
          
          <p className="text-base leading-relaxed text-muted-foreground">{product.description}</p>
          
          <Card className="bg-secondary/40 border-border/60">
            <CardContent className="p-4 space-y-4">
              {productVariants.length > 1 && (
                <div>
                  <Label className="font-semibold">Contenance :</Label>
                  <RadioGroup 
                    value={selectedVariantId || ''} 
                    onValueChange={setSelectedVariantId} 
                    className="flex flex-wrap gap-2 mt-2"
                  >
                    {productVariants.map(variant => (
                       <Label key={variant.id} htmlFor={variant.id} className={cn(
                           "flex items-center justify-center rounded-md border-2 px-4 py-2 text-sm font-medium hover:bg-accent cursor-pointer",
                           selectedVariantId === variant.id ? "border-primary bg-primary/10" : "border-border",
                           variant.stock === 0 && "opacity-50 cursor-not-allowed"
                       )}>
                          <RadioGroupItem value={variant.id} id={variant.id} className="sr-only" disabled={variant.stock === 0} />
                          {variant.contenance}
                       </Label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <div className="flex justify-between items-center">
                <p className="text-3xl font-bold font-headline">{selectedVariant?.price.toFixed(2) || '...'} <span className="text-lg font-normal text-muted-foreground">TND</span></p>
                <Badge variant={isOutOfStock ? 'destructive' : 'outline'} className={cn(!isOutOfStock && "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400 font-medium")}>
                    {isOutOfStock ? 'Hors stock' : 'En stock'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Quantité minimale (MOQ): {product.moq} unités</p>
            </CardContent>
          </Card>
          
          {isBuyer && (
             <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2">
                    <Label htmlFor="quantity" className="sr-only">Quantité</Label>
                    <Input 
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-24 h-12 text-center text-lg"
                        min="1"
                        max={currentStock}
                        disabled={isOutOfStock || !selectedVariant}
                    />
                </div>
                <Button size="lg" className="flex-1 h-12" onClick={handleAddToCart} disabled={isAdding || isOutOfStock || !selectedVariant || quantity > currentStock}>
                    {isAdding ? <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> : isOutOfStock ? 'Épuisé' : <><ShoppingCart className="mr-2 h-5 w-5" /> Ajouter au panier</>}
                </Button>
                <Button size="lg" variant="outline" className="h-12"><Heart className="h-5 w-5" /></Button>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="font-semibold text-lg mb-2">Spécifications</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><strong>INCI:</strong> {product.inci}</li>
              {product.certifications && product.certifications.length > 0 && (
                <li className="flex items-center gap-2">
                  <strong>Certifications:</strong> 
                  {product.certifications.map(cert => <Badge key={cert} variant="outline">{cert}</Badge>)}
                </li>
              )}
            </ul>
             <div className="flex gap-2 mt-4">
              <Button variant="secondary" size="sm"><Download className="mr-2 h-4 w-4" /> Fiche Technique</Button>
              <Button variant="secondary" size="sm"><Download className="mr-2 h-4 w-4" /> Certificat d'Analyse</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 md:mt-24">
         <Separator className="my-12" />
        <h2 className="text-2xl font-bold mb-4 font-headline">Description Détaillée</h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-loose">{product.longDescription}</div>
      </div>

      <Separator className="my-12 md:my-16" />
      
      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6 font-headline">Avis des clients ({reviewCount})</h2>
            <div className="space-y-8">
                {reviews.length > 0 ? reviews.map(review => (
                    <div key={review.id} className="flex gap-4">
                        <Avatar>
                            <AvatarImage src={`https://placehold.co/40x40.png?text=${review.userName.charAt(0)}`} data-ai-hint="person" />
                            <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">{review.userName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {review.createdAt ? format(new Date(review.createdAt.seconds * 1000), 'd MMMM yyyy', { locale: fr }) : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 my-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                                ))}
                            </div>
                            <p className="text-muted-foreground text-sm">{review.comment}</p>
                        </div>
                    </div>
                )) : (
                    <p className="text-muted-foreground">Ce produit n'a pas encore d'avis. Soyez le premier à en laisser un !</p>
                )}
            </div>
        </div>
        <div className="md:col-span-1">
            {isBuyer && <AddReviewForm productId={product.id} onReviewAdded={handleReviewAdded} />}
        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="mt-16 md:mt-24">
           <Separator className="my-12" />
          <h2 className="text-2xl font-bold mb-6 text-center font-headline">Produits Similaires</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
        </div>
      )}
    </div>
  );
}

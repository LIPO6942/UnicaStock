'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useAuth, UserType } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const auth = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<UserType>('buyer');

  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');

  const [sellerCompany, setSellerCompany] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');

  const handleRegister = () => {
    if (activeTab === 'buyer') {
      auth.login({ name: buyerName, email: buyerEmail, type: 'buyer' });
    } else {
      auth.login({ name: sellerCompany, email: sellerEmail, type: 'seller' });
    }
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <Tabs defaultValue="buyer" className="w-full max-w-md" onValueChange={(v) => setActiveTab(v as UserType)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buyer">Acheteur</TabsTrigger>
          <TabsTrigger value="seller">Vendeur</TabsTrigger>
        </TabsList>
        <TabsContent value="buyer">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Créer un compte Acheteur</CardTitle>
              <CardDescription>Rejoignez la communauté des créateurs et artisans cosmétiques en Tunisie.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="buyer-name">Nom complet ou Nom de l'entreprise</Label>
                <Input id="buyer-name" placeholder="Artisan Pro" required value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyer-email">Email</Label>
                <Input id="buyer-email" type="email" placeholder="nom@exemple.com" required value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyer-password">Mot de passe</Label>
                <Input id="buyer-password" type="password" required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" onClick={handleRegister}>Créer mon compte Acheteur</Button>
              <div className="text-center text-sm text-muted-foreground">
                Vous avez déjà un compte?{' '}
                <Link href="/login" className="underline hover:text-primary">
                  Se connecter
                </Link>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="seller">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Devenir Vendeur</CardTitle>
              <CardDescription>Proposez vos matières premières aux fabricants sur notre plateforme.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seller-company">Nom de l'entreprise</Label>
                <Input id="seller-company" placeholder="Atlas Essentials" required value={sellerCompany} onChange={(e) => setSellerCompany(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seller-email">Email professionnel</Label>
                <Input id="seller-email" type="email" placeholder="contact@atlas-essentials.tn" required value={sellerEmail} onChange={(e) => setSellerEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seller-password">Mot de passe</Label>
                <Input id="seller-password" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seller-license">Numéro d'enregistrement d'entreprise (ou équivalent)</Label>
                <Input id="seller-license" placeholder="Ex: B01234567" required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" onClick={handleRegister}>Créer mon compte Vendeur</Button>
               <div className="text-center text-sm text-muted-foreground">
                Vous avez déjà un compte?{' '}
                <Link href="/login" className="underline hover:text-primary">
                  Se connecter
                </Link>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

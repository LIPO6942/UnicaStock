'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const auth = useAuth();
  const router = useRouter();

  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');

  const handleRegister = () => {
    // Register as a buyer
    auth.login({ name: buyerName, email: buyerEmail, type: 'buyer' });
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
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
          <Button className="w-full" onClick={handleRegister}>Créer mon compte</Button>
          <div className="text-center text-sm text-muted-foreground">
            Vous avez déjà un compte?{' '}
            <Link href="/login" className="underline hover:text-primary">
              Se connecter
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

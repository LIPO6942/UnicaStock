'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useAuth, UserType } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('buyer');
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userType === 'seller') {
      setEmail('contact@unicacosmetiques.tn');
      setPassword('admin123');
    } else {
      setEmail('acheteur.test@email.com');
      setPassword('password123');
    }
  }, [userType]);

  const handleLogin = () => {
    // In a real app, you'd validate credentials against a backend.
    // Here, we'll just simulate a login.
    let userName = 'Acheteur Test';
    if (userType === 'seller') {
      userName = 'Unica Cosmétiques';
    }
    
    auth.login({ name: userName, email, type: userType });
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Connexion</CardTitle>
          <CardDescription>Entrez vos email ci-dessous pour vous connecter à votre compte.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Type de compte</Label>
            <RadioGroup defaultValue={userType} onValueChange={(value) => setUserType(value as UserType)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="buyer" id="r-buyer" />
                <Label htmlFor="r-buyer">Acheteur</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="seller" id="r-seller" />
                <Label htmlFor="r-seller">Vendeur (Unica)</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="nom@exemple.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={userType === 'seller'} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={userType === 'seller'} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleLogin}>Se connecter</Button>
          <div className="text-center text-sm text-muted-foreground">
            Vous n'avez pas de compte?{' '}
            <Link href="/register" className="underline hover:text-primary">
              S'inscrire
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

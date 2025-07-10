'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue sur votre tableau de bord.',
      });
      router.push('/dashboard');
    } catch (err: any) {
      const errorCode = err.code;
      let errorMessage = "Une erreur inattendue est survenue. Veuillez réessayer.";
      if (errorCode === 'auth/invalid-credential') {
        errorMessage = "Les identifiants fournis sont incorrects. Veuillez vérifier l'email et le mot de passe.";
      }
      setError(errorMessage);
      console.error("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1556228720-19b0672b2a04?q=80&w=2832"
          alt="Cosmetic products background"
          fill
          className="object-cover opacity-20"
          data-ai-hint="cosmetics background"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Connexion</CardTitle>
          <CardDescription>Entrez vos email ci-dessous pour vous connecter à votre compte.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            {error && (
               <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur de connexion</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nom@exemple.com" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Vous n'avez pas de compte?{' '}
              <Link href="/register" className="underline hover:text-primary">
                S'inscrire
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

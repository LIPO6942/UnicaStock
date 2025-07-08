'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';

export default function RegisterSellerPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: 'Information',
      description: "Il n'y a qu'un seul compte vendeur sur cette plateforme. Veuillez vous connecter.",
      variant: 'default'
    });
    router.replace('/login');
  }, [router, toast]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 mt-4 text-muted-foreground">Redirection en cours...</p>
    </div>
  );
}

'use client';

import { useAuth } from "@/context/auth-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user, deleteAccount } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast({
          title: "Compte supprimé",
          description: "Votre compte et vos données ont été supprimés. Vous allez être redirigé.",
      });
      router.push('/');
    } catch (error) {
      // L'erreur est déjà gérée par le toast dans le contexte d'authentification.
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Gérez les informations de votre profil public.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" defaultValue={user?.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email} disabled />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" type="tel" placeholder="+216 12 345 678" />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mot de passe</CardTitle>
          <CardDescription>Changez votre mot de passe ici.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </form>
        </CardContent>
      </Card>
      
      {user?.type === 'seller' && (
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'entreprise (Vendeur)</CardTitle>
            <CardDescription>Mettez à jour les informations de votre entreprise.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="company-name">Nom de l'entreprise</Label>
                <Input id="company-name" defaultValue="Unica Link" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-description">Description</Label>
                <Textarea id="company-description" defaultValue="Fournisseur d'huiles et extraits botaniques de première qualité, basés au coeur de la Tunisie." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-address">Adresse</Label>
                <Input id="company-address" defaultValue="123 Rue des Jasmins, 2092 El Manar, Tunis" />
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button>Enregistrer les modifications</Button>
      </div>
      
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zone de Danger</CardTitle>
          <CardDescription>Cette action est définitive et ne peut pas être annulée.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            La suppression de votre compte entraînera la perte de toutes vos données, y compris votre profil, votre panier et l'accès à votre historique de commandes.
          </p>
        </CardContent>
        <CardFooter className="flex justify-start border-t border-destructive/20 pt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Supprimer mon compte
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Toutes vos données personnelles (profil, panier) seront effacées. Voulez-vous vraiment continuer ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className={buttonVariants({ variant: "destructive" })}
                  disabled={isDeleting}
                >
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Oui, supprimer mon compte
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  )
}

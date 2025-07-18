
'use client';

import { useAuth } from "@/context/auth-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Slider } from "@/components/ui/slider";

export default function SettingsPage() {
  const { user, deleteAccount, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State for user profile fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // State for seller-specific fields
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [companyDescription, setCompanyDescription] = useState(user?.companyDescription || '');
  const [companyAddress, setCompanyAddress] = useState(user?.companyAddress || '');
  const [companyBackgroundUrl, setCompanyBackgroundUrl] = useState(user?.companyBackgroundUrl || '');
  const [homepageImageUrl, setHomepageImageUrl] = useState(user?.homepageImageUrl || '');
  const [homepageImageOpacity, setHomepageImageOpacity] = useState(user?.homepageImageOpacity !== undefined ? [user.homepageImageOpacity * 100] : [10]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      if (user.type === 'seller') {
        setCompanyName(user.companyName || '');
        setCompanyDescription(user.companyDescription || '');
        setCompanyAddress(user.companyAddress || '');
        setCompanyBackgroundUrl(user.companyBackgroundUrl || '');
        setHomepageImageUrl(user.homepageImageUrl || '');
        setHomepageImageOpacity(user.homepageImageOpacity !== undefined ? [user.homepageImageOpacity * 100] : [10]);
      }
    }
  }, [user]);

  const handleSaveChanges = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const dataToUpdate: any = {
        name,
        phone,
      };

      if (user.type === 'seller') {
        dataToUpdate.companyName = companyName;
        dataToUpdate.companyDescription = companyDescription;
        dataToUpdate.companyAddress = companyAddress;
        dataToUpdate.companyBackgroundUrl = companyBackgroundUrl;
        dataToUpdate.homepageImageUrl = homepageImageUrl;
        dataToUpdate.homepageImageOpacity = homepageImageOpacity[0] / 100;
      }
      
      await updateDoc(userDocRef, dataToUpdate);

      toast({
        title: "Modifications enregistrées",
        description: "Vos informations ont été mises à jour avec succès.",
      });
    } catch (error) {
       console.error("Error saving settings:", error);
       toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les modifications. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };


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

  if (isAuthLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
    )
  }

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
              <Input id="name" value={name} onChange={e => setName(e.target.value)} disabled={isSaving} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" type="tel" placeholder="+216 12 345 678" value={phone} onChange={e => setPhone(e.target.value)} disabled={isSaving} />
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
            <CardDescription>Mettez à jour les informations qui apparaissent sur vos pages boutique.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="company-name">Nom de l'entreprise</Label>
                <Input id="company-name" value={companyName} onChange={e => setCompanyName(e.target.value)} disabled={isSaving} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-description">Description</Label>
                <Textarea id="company-description" value={companyDescription} onChange={e => setCompanyDescription(e.target.value)} disabled={isSaving} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-address">Adresse</Label>
                <Input id="company-address" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} disabled={isSaving} />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="homepage-image-url">URL de l'image de la page d'accueil</Label>
                <Input id="homepage-image-url" placeholder="https://images.unsplash.com/..." value={homepageImageUrl} onChange={e => setHomepageImageUrl(e.target.value)} disabled={isSaving} />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="homepage-image-opacity">Opacité de l'image de la page d'accueil ({homepageImageOpacity[0]}%)</Label>
                <Slider id="homepage-image-opacity" min={0} max={100} step={5} value={homepageImageOpacity} onValueChange={setHomepageImageOpacity} disabled={isSaving} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-bg-url">URL de l'image de fond (Page Produits)</Label>
                <Input id="company-bg-url" placeholder="https://images.unsplash.com/..." value={companyBackgroundUrl} onChange={e => setCompanyBackgroundUrl(e.target.value)} disabled={isSaving} />
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
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

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
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
              <Input id="name" defaultValue="Artisan Pro" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="contact@artisanpro.tn" />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" type="tel" defaultValue="+216 12 345 678" />
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
      
      <Card>
        <CardHeader>
          <CardTitle>Informations de l'entreprise (Vendeur)</CardTitle>
          <CardDescription>Mettez à jour les informations de votre entreprise.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
             <div className="grid gap-2">
              <Label htmlFor="company-name">Nom de l'entreprise</Label>
              <Input id="company-name" defaultValue="Atlas Essentials" />
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

       <div className="flex justify-end">
        <Button>Enregistrer les modifications</Button>
      </div>
    </div>
  )
}

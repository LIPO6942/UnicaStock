import { GeneratorForm } from "./generator-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical, Sparkles } from "lucide-react";

export default function AiGeneratorPage() {
  return (
    <div className="grid flex-1 items-start gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
             <Sparkles className="h-6 w-6 text-primary" />
             <CardTitle className="text-2xl font-headline">Générateur d'Informations Produit</CardTitle>
          </div>
          <CardDescription>
            Utilisez l'IA pour générer une description de produit, une liste d'ingrédients conforme et un texte marketing percutant, adaptés aux normes réglementaires tunisiennes.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <GeneratorForm />
        </CardContent>
      </Card>
    </div>
  )
}

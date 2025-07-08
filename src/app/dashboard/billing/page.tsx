import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { File } from "lucide-react";

// This is a placeholder page.
export default function BillingPage() {
  const invoices = [
    { id: 'INV-2023-010', date: '2023-11-15', amount: '1,250 TND', status: 'Payée' },
    { id: 'INV-2023-009', date: '2023-10-20', amount: '850 TND', status: 'Payée' },
    { id: 'INV-2023-008', date: '2023-09-18', amount: '2,100 TND', status: 'Payée' },
  ]
  return (
    <div className="grid gap-6">
       <Card>
        <CardHeader>
          <CardTitle>Facturation</CardTitle>
          <CardDescription>Consultez votre historique de facturation et vos informations de paiement.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facture</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.amount}</TableCell>
                    <TableCell>{invoice.status}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        <File className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}

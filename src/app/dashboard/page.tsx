import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, DollarSign, CreditCard, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { mockProducts } from "@/lib/mock-data";

export default function DashboardPage() {
  const recentOrders = [
    { id: '#3210', user: 'Laboratoire Senteurs', date: '2023-11-23', total: '1,250 TND', status: 'Expédiée' },
    { id: '#3209', user: 'Créations BellePeau', date: '2023-11-22', total: '850 TND', status: 'Livrée' },
    { id: '#3208', user: 'Artisan Savonnier', date: '2023-11-21', total: '450 TND', status: 'Livrée' },
  ];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,231.89 TND</div>
            <p className="text-xs text-muted-foreground">+20.1% depuis le mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">+19% depuis le mois dernier</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+23</div>
            <p className="text-xs text-muted-foreground">+5 depuis la semaine dernière</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits Actifs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProducts.length}</div>
            <p className="text-xs text-muted-foreground">+2 depuis hier</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Commandes Récentes</CardTitle>
            <CardDescription>
              Les dernières commandes reçues sur votre boutique.
            </CardDescription>
          </div>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/dashboard/orders">
              Voir tout
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="text-center">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium">{order.user}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {order.id}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{order.date}</TableCell>
                  <TableCell className="text-right">{order.total}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={order.status === 'Livrée' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

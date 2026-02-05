import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Acá vas a ver widgets según el rol."
        right={<Button variant="secondary">+ Crear</Button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:bg-zinc-900/40 transition">
          <CardHeader>
            <CardTitle>Rol</CardTitle>
            <CardDescription>Vista dinámica</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Badge>admin</Badge>
            <Button size="sm" variant="ghost">Ver</Button>
          </CardContent>
        </Card>

        <Card className="hover:bg-zinc-900/40 transition">
          <CardHeader>
            <CardTitle>Monedas</CardTitle>
            <CardDescription>Saldo actual</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Badge tone="success">🪙 120</Badge>
            <Button size="sm">Comprar</Button>
          </CardContent>
        </Card>

        <Card className="hover:bg-zinc-900/40 transition">
          <CardHeader>
            <CardTitle>Turnos</CardTitle>
            <CardDescription>Próximos</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Badge tone="warning">3 pendientes</Badge>
            <Button size="sm" variant="secondary">Gestionar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

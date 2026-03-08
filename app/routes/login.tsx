import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../lib/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function LoginPage() {
  const { loginWithApi } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      await loginWithApi({ email, password });
      navigate("/app", { replace: true });
    } catch (err: any) {
      const msg =
        err?.status === 500
          ? "El servidor está con errores en este momento. Probá más tarde."
          : err?.message === "Failed to fetch"
            ? "No se pudo conectar con el servidor."
            : (err?.message ?? "No se pudo iniciar sesión");

      setError(msg);
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>Accedé con tu usuario y contraseña</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Usuario / Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                placeholder="devs@example.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Contraseña</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && <div className="text-sm text-red-300">{error}</div>}

            {/* CTA principal */}
            <Button className="w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>

            {/* Acciones secundarias */}
            <div className="grid gap-2">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                disabled={loading}
                onClick={() => navigate("/register")}
              >
                Crear cuenta
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={loading}
                onClick={() => navigate("/forgot-password")}
              >
                Olvidé mi contraseña
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={loading}
                onClick={() => navigate("/")}
              >
                Volver al sitio
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
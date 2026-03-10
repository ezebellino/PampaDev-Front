import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { useAuth } from "../lib/auth/AuthContext";

const LOGIN_POINTS = [
  "Ingresá a tu panel según tu rol",
  "Continuá con la sucursal y contexto activo",
  "Gestioná operación, reservas y configuración",
];

export default function LoginPage() {
  const { loginWithApi } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      await loginWithApi({ email, password });
      navigate("/app", { replace: true });
    } catch (err: any) {
      const message =
        err?.status === 500
          ? "El servidor no está respondiendo correctamente en este momento. Probá de nuevo más tarde."
          : err?.message === "Failed to fetch"
          ? "No pudimos conectarnos con el servidor."
          : err?.message ?? "No se pudo iniciar sesión.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_25%),radial-gradient(circle_at_80%_15%,rgba(245,158,11,0.1),transparent_20%),linear-gradient(180deg,rgba(24,24,27,0.2),rgba(9,9,11,0.95))]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 px-4 py-8 md:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
          <div className="inline-flex rounded-full border border-zinc-700/80 bg-zinc-900/80 px-3 py-1 text-xs font-medium text-zinc-200">
            Acceso a MultiRubro
          </div>

          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-5xl md:leading-tight">
              Ingresá para continuar con tu operación desde un solo lugar.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-zinc-300 md:text-lg md:leading-8">
              Accedé a tus herramientas, recuperá tu contexto de trabajo y seguí gestionando
              sucursales, rubros, horarios y reservas con una experiencia clara.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {LOGIN_POINTS.map((point) => (
              <div
                key={point}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-900/55 px-4 py-3 text-sm text-zinc-300"
              >
                {point}
              </div>
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950/70 px-5 py-4 text-sm text-zinc-400">
            Si todavía no tenés acceso o necesitás ayuda con tu cuenta, podés volver al sitio o
            iniciar el flujo de recuperación.
          </div>
        </section>

        <Card className="overflow-hidden border-zinc-800 bg-zinc-950/80 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="h-24 bg-[linear-gradient(135deg,rgba(56,189,248,0.14),transparent_55%)]" />
          <CardHeader className="relative -mt-6">
            <CardTitle className="text-xl text-zinc-100">Iniciar sesión</CardTitle>
            <CardDescription>
              Accedé con tu email y contraseña para entrar al panel correspondiente.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Email</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                  placeholder="devs@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Contraseña</label>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <Button className="w-full" disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>

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

                <Link
                  to="/"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-900"
                >
                  Volver al sitio
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

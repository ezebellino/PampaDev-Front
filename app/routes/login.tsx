import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { useAuth } from "../lib/auth/AuthContext";

const LOGIN_POINTS = [
  "Ingres? a tu panel",
  "Retom? tu sucursal activa",
  "Segu? con tus turnos y gesti?n",
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
          ? "El servidor no respondi? bien. Prob? de nuevo m?s tarde."
          : err?.message === "Failed to fetch"
            ? "No pudimos conectarnos con el servidor."
            : err?.message ?? "No se pudo iniciar sesi?n.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_26%),linear-gradient(180deg,rgba(24,24,27,0.2),rgba(9,9,11,0.96))]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-10 px-4 py-10 md:px-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-6">
          <div className="inline-flex rounded-full border border-zinc-800 bg-zinc-900/75 px-3 py-1 text-xs font-medium text-zinc-300">
            Acceso
          </div>

          <div className="space-y-3">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white md:text-5xl md:leading-tight">
              Ingres? y segu? donde quedaste.
            </h1>
            <p className="max-w-md text-base leading-7 text-zinc-400">
              Entr? a tu panel y continu? con tu trabajo.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {LOGIN_POINTS.map((point) => (
              <div
                key={point}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-300"
              >
                {point}
              </div>
            ))}
          </div>
        </section>

        <Card className="border-zinc-800 bg-zinc-950/88 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
          <CardHeader className="space-y-2 pb-2">
            <CardTitle className="text-2xl text-zinc-100">Iniciar sesi?n</CardTitle>
            <CardDescription>Us? tu email y contrase?a.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Email</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm outline-none transition focus:border-cyan-500/50"
                  placeholder="devs@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Contrase?a</label>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm outline-none transition focus:border-cyan-500/50"
                  placeholder="????????"
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

              <div className="grid gap-2 pt-2">
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
                  Olvid? mi contrase?a
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

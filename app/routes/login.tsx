import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { useAuth } from "../lib/auth/AuthContext";

const LOGIN_POINTS = [
  "Ingresá a tu panel",
  "Retomá tu sucursal activa",
  "Seguí con tus turnos y gestión",
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
          ? "El servidor no respondió bien. Probá de nuevo más tarde."
          : err?.message === "Failed to fetch"
            ? "No pudimos conectarnos con el servidor."
            : err?.message ?? "No se pudo iniciar sesión.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#f8f9ff] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(163,230,53,0.10),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,244,236,0.96),rgba(239,246,245,0.98))]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-10 px-4 py-10 md:px-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-6">
          <div className="inline-flex rounded-full border border-sky-200 bg-[#eff4ff] px-3 py-1 text-xs font-medium text-sky-700">
            Acceso
          </div>

          <div className="space-y-3">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl md:leading-tight">
              Ingresá y seguí donde quedaste.
            </h1>
            <p className="max-w-md text-base leading-7 text-slate-600">
              Entrá a tu panel y continuá con tu trabajo.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {LOGIN_POINTS.map((point) => (
              <div
                key={point}
                className="rounded-2xl border border-slate-200 bg-white/88 px-4 py-3 text-sm text-slate-700 shadow-sm"
              >
                {point}
              </div>
            ))}
          </div>
        </section>

        <Card className="border-slate-200 bg-white/96 shadow-[0_24px_60px_-42px_rgba(69,70,77,0.2)]">
          <CardHeader className="space-y-2 pb-2">
            <CardTitle className="text-2xl text-slate-900">Iniciar sesión</CardTitle>
            <CardDescription>Usá tu email y contraseña.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-700">Email</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
                  placeholder="devs@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-700">Contraseña</label>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
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
                  Olvidé mi contraseña
                </Button>

                <Link
                  to="/"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:bg-[#eff4ff] hover:text-slate-900"
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

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();
    setError(null);

    if (!normalizedEmail) {
      setError("Ingres? un email para continuar.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError("Ingres? un email v?lido.");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setSent(true);
      setEmail(normalizedEmail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.10),transparent_24%),linear-gradient(180deg,rgba(24,24,27,0.2),rgba(9,9,11,0.96))]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-10 px-4 py-10 md:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-6">
          <div className="inline-flex rounded-full border border-zinc-800 bg-zinc-900/75 px-3 py-1 text-xs font-medium text-zinc-300">
            Recuperaci?n
          </div>

          <div className="space-y-3">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white md:text-5xl md:leading-tight">
              Recuper? tu acceso.
            </h1>
            <p className="max-w-md text-base leading-7 text-zinc-400">
              Ingres? tu email para continuar.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-4 text-sm text-zinc-300">
            Ingres? tu email y te guiamos en el siguiente paso.
          </div>
        </section>

        <Card className="border-zinc-800 bg-zinc-950/88 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
          <CardHeader className="space-y-2 pb-2">
            <CardTitle className="text-2xl text-zinc-100">Olvid? mi contrase?a</CardTitle>
            <CardDescription>Confirm? tu email.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {sent ? (
              <div className="space-y-4">
                <div className="rounded-[1.25rem] border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm leading-6 text-emerald-100">
                  Si existe una cuenta asociada a <span className="font-medium">{email}</span>, ya dejamos preparado el siguiente paso.
                </div>

                <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-900/45 px-4 py-4 text-sm leading-6 text-zinc-400">
                  Queda conectar el env?o real de instrucciones por email.
                </div>

                <div className="grid gap-2">
                  <Button className="w-full" onClick={() => navigate("/login")}>
                    Volver a login
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setSent(false);
                      setError(null);
                    }}
                  >
                    Probar con otro email
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Email</label>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm outline-none transition focus:border-amber-500/50"
                    placeholder="tuemail@ejemplo.com"
                    autoComplete="email"
                  />
                </div>

                {error ? (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}

                <Button className="w-full" disabled={loading}>
                  {loading ? "Preparando recuperaci?n..." : "Continuar"}
                </Button>

                <div className="grid gap-2 pt-2">
                  <Button type="button" variant="secondary" className="w-full" onClick={() => navigate("/login")}>
                    Volver a login
                  </Button>

                  <Link
                    to="/"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-900"
                  >
                    Volver al sitio
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

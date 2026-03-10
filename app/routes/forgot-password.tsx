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
      setError("Ingresá un email para continuar.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError("Ingresá un email válido.");
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_24%),radial-gradient(circle_at_80%_15%,rgba(56,189,248,0.1),transparent_20%),linear-gradient(180deg,rgba(24,24,27,0.2),rgba(9,9,11,0.95))]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 px-4 py-8 md:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
          <div className="inline-flex rounded-full border border-zinc-700/80 bg-zinc-900/80 px-3 py-1 text-xs font-medium text-zinc-200">
            Recuperación de acceso
          </div>

          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-5xl md:leading-tight">
              Recuperá tu acceso y volvé a entrar con claridad.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-zinc-300 md:text-lg md:leading-8">
              Ingresá tu email y prepará el siguiente paso para restablecer la contraseña sin perder el hilo de trabajo.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950/70 px-5 py-4 text-sm text-zinc-400">
            El flujo ya está listo para recibir la integración real de recuperación. Mientras tanto, podés validar el recorrido, el mensaje y el estado de confirmación desde esta pantalla.
          </div>
        </section>

        <Card className="overflow-hidden border-zinc-800 bg-zinc-950/80 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="h-24 bg-[linear-gradient(135deg,rgba(245,158,11,0.14),transparent_55%)]" />
          <CardHeader className="relative -mt-6">
            <CardTitle className="text-xl text-zinc-100">Olvidé mi contraseña</CardTitle>
            <CardDescription>
              Confirmá tu email y seguí el flujo de recuperación.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {sent ? (
              <div className="space-y-4">
                <div className="rounded-[1.25rem] border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm leading-6 text-emerald-100">
                  Si existe una cuenta asociada a <span className="font-medium">{email}</span>, ya dejamos preparado el siguiente paso de recuperación.
                </div>

                <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-900/45 px-4 py-4 text-sm leading-6 text-zinc-400">
                  Próximo paso técnico pendiente: conectar esta confirmación con el endpoint real de recuperación o envío de instrucciones por correo.
                </div>

                <div className="grid gap-2">
                  <Button className="w-full" onClick={() => navigate("/login") }>
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
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
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
                  {loading ? "Preparando recuperación..." : "Continuar"}
                </Button>

                <div className="grid gap-2">
                  <Button type="button" variant="secondary" className="w-full" onClick={() => navigate("/login") }>
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

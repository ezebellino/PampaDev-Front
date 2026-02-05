import { Link } from "react-router";

export default function Login() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h1 className="text-xl font-semibold">Login (mock)</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Luego conectamos con el backend en C#. Por ahora es UI.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            to="/app"
            className="flex-1 rounded-2xl bg-zinc-100 px-4 py-3 text-center text-sm font-medium text-zinc-950 hover:bg-white"
          >
            Entrar
          </Link>
          <Link
            to="/"
            className="flex-1 rounded-2xl border border-zinc-800 px-4 py-3 text-center text-sm hover:bg-zinc-900"
          >
            Volver
          </Link>
        </div>
      </div>
    </div>
  );
}

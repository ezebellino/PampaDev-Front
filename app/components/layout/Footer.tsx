export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800/70 bg-zinc-950/60 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

          {/* Branding */}
          <div className="flex items-center gap-3">
            <img
              src="/branding/pampadev-icondark.png"
              alt="PampaDev"
              className="h-7 w-7"
            />
            <div className="text-sm">
              <div className="font-medium tracking-tight">PampaDev</div>
              <div className="text-zinc-500 text-xs">
                Soluciones digitales a medida
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2 text-sm md:flex-row md:gap-6">
            <a
              href="https://pampadev.ar/"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-zinc-200 transition"
            >
              🌐 pampadev.ar
            </a>

            <a
              href="mailto:contacto@pampadev.ar"
              className="text-zinc-400 hover:text-zinc-200 transition"
            >
              ✉️ contacto@pampadev.ar
            </a>
          </div>
        </div>

        {/* Línea inferior */}
        <div className="mt-6 flex flex-col gap-2 border-t border-zinc-800/70 pt-4 text-xs text-zinc-500 md:flex-row md:items-center md:justify-between">
          <span>
            © {new Date().getFullYear()} PampaDev. Todos los derechos reservados.
          </span>
          <span>
            Proyecto MultiRubro · Frontend
          </span>
        </div>
      </div>
    </footer>
  );
}

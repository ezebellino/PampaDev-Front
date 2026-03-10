export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800/70 bg-zinc-950/75 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/15 bg-zinc-900/80 shadow-[0_0_0_1px_rgba(6,182,212,0.04)]">
                <img
                  src="/branding/pampadev-icondark.png"
                  alt="PampaDev"
                  className="h-7 w-7 object-contain"
                />
              </div>
              <div>
                <div className="text-sm font-medium tracking-tight text-zinc-100">PampaDev</div>
                <div className="text-xs text-cyan-200/65">Producto y operación digital a medida</div>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-6 text-zinc-400">
              MultiRubro centraliza sucursales, catálogo, gestión operativa y flujos por rol en una
              experiencia clara, sobria y preparada para seguir creciendo.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="https://pampadev.ar/"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3 text-sm text-zinc-300 transition hover:border-cyan-500/30 hover:bg-zinc-900 hover:text-zinc-100"
            >
              <div className="text-xs uppercase tracking-wider text-zinc-500">Web</div>
              <div className="mt-2 font-medium">pampadev.ar</div>
            </a>

            <a
              href="mailto:contacto@pampadev.ar"
              className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3 text-sm text-zinc-300 transition hover:border-cyan-500/30 hover:bg-zinc-900 hover:text-zinc-100"
            >
              <div className="text-xs uppercase tracking-wider text-zinc-500">Contacto</div>
              <div className="mt-2 font-medium">contacto@pampadev.ar</div>
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-zinc-800/70 pt-4 text-xs text-zinc-500 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} PampaDev. Todos los derechos reservados.</span>
          <span>MultiRubro Frontend · Diseño y operación en evolución</span>
        </div>
      </div>
    </footer>
  );
}

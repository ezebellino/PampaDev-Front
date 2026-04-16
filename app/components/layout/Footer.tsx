export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200/35 bg-white/76 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] border border-slate-200/35 bg-white shadow-[0_18px_35px_-28px_rgba(69,70,77,0.12)]">
                <img src="/branding/pampadev-icondark.png" alt="PampaDev" className="h-7 w-7 object-contain" />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight text-slate-900">PampaDev</div>
                <div className="text-xs font-medium text-sky-700/80">Producto y gestión digital clara para cada rubro</div>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              MultiRubro centraliza sucursales, catálogo, gestión y flujos por rol en una experiencia amable, sobria y preparada para crecer sin volverse confusa.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="https://pampadev.ar/"
              target="_blank"
              rel="noreferrer"
              className="rounded-[1.4rem] border border-slate-200/45 bg-white px-4 py-3 text-sm text-slate-700 transition hover:border-sky-200 hover:bg-[#eff4ff] hover:text-slate-900"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">Web</div>
              <div className="mt-2 font-semibold">pampadev.ar</div>
            </a>

            <a
              href="mailto:contacto@pampadev.ar"
              className="rounded-[1.4rem] border border-slate-200/45 bg-white px-4 py-3 text-sm text-slate-700 transition hover:border-sky-200 hover:bg-[#eff4ff] hover:text-slate-900"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">Contacto</div>
              <div className="mt-2 font-semibold">contacto@pampadev.ar</div>
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-stone-200 pt-4 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} PampaDev. Todos los derechos reservados.</span>
          <span>MultiRubro · Plataforma clara para gestionar y reservar</span>
        </div>
      </div>
    </footer>
  );
}

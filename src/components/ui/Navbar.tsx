export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f6f1e8]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-700">
            Strate Homes
          </p>
          <p className="text-xs text-zinc-500">Real estate SaaS for modern teams</p>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-zinc-600 md:flex">
          <a href="#features" className="transition hover:text-zinc-950">
            Plataforma
          </a>
          <a href="#properties" className="transition hover:text-zinc-950">
            Propiedades
          </a>
          <a href="#contact" className="transition hover:text-zinc-950">
            Contacto
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="/admin"
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-black/5"
          >
            Admin
          </a>
          <a
            href="#contact"
            className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Solicitar demo
          </a>
        </div>
      </div>
    </header>
  );
}

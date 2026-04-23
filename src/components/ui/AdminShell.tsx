import { AuthStatusBadge } from "@/components/ui/AuthStatusBadge";
import { WorkspaceStatusBadge } from "@/components/ui/WorkspaceStatusBadge";

const navItems = ["Overview", "Properties", "Leads", "Agents", "Branding", "Settings"];

export function AdminShell() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">Strate Homes</p>
            <h1 className="mt-3 text-2xl font-semibold">Admin</h1>
          </div>
          <nav className="mt-8 space-y-2 text-sm text-white/70">
            {navItems.map((item) => (
              <a key={item} href="#" className="flex rounded-2xl px-4 py-3 transition hover:bg-white/5 hover:text-white">
                {item}
              </a>
            ))}
          </nav>
        </aside>
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/40">Workspace</p>
              <h2 className="mt-3 text-3xl font-semibold">Operations overview</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <AuthStatusBadge />
              <WorkspaceStatusBadge />
              <a href="/" className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5">
                Public site
              </a>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Active properties", "128"],
              ["Open leads", "42"],
              ["Assigned agents", "8"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-white/45">{label}</p>
                <p className="mt-3 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicBrandHeader } from "@/components/ui/PublicBrandHeader";
import { PublicLegalDisclaimer } from "@/components/ui/PublicLegalDisclaimer";
import { getPublicAgentBySlug } from "@/lib/public-agents";

export default async function WorkspaceAgentPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; agentSlug: string }>;
}) {
  const { workspaceSlug, agentSlug } = await params;
  const agent = await getPublicAgentBySlug(workspaceSlug, agentSlug);

  if (!agent) notFound();

  return (
    <main className="min-h-screen bg-[#f7fbff] px-6 py-10 text-slate-950 lg:px-8">
      <PublicBrandHeader brandName={agent.workspace.brandName ?? agent.workspace.name} logoUrl={agent.workspace.publicLogoUrl} homeHref={`/w/${workspaceSlug}`} propertiesHref={`/w/${workspaceSlug}/properties`} />
      <div className="mx-auto max-w-7xl space-y-16">
        <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <Link href={`/w/${workspaceSlug}`} className="transition hover:text-slate-900">Inicio</Link>
          <span>•</span>
          <Link href={`/w/${workspaceSlug}/properties`} className="transition hover:text-slate-900">Propiedades</Link>
          <span>•</span>
          <span className="text-slate-900">{agent.displayName}</span>
        </nav>

        <section className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div className="relative min-h-[32rem] overflow-hidden rounded-[2.6rem] bg-gradient-to-br from-sky-100 via-white to-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            {agent.avatarUrl ? <Image src={agent.avatarUrl} alt={agent.displayName} fill className="object-cover" unoptimized /> : <div className="flex h-full items-center justify-center text-7xl font-semibold text-slate-300">{agent.displayName.slice(0,1).toUpperCase()}</div>}
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Asesor inmobiliario</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight sm:text-6xl">{agent.displayName}</h1>
            {agent.title ? <p className="mt-4 text-sm uppercase tracking-[0.25em] text-slate-500">{agent.title}</p> : null}
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
              {agent.bio ?? `Un asesor de ${agent.workspace.brandName ?? agent.workspace.name} puede ayudarte con esta búsqueda y acompañarte durante todo el proceso.`}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {agent.whatsappUrl ? (
                <a href={agent.whatsappUrl} target="_blank" rel="noreferrer" className="rounded-full bg-[#d7ab5b] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#c99a46]">
                  Hablar por WhatsApp
                </a>
              ) : (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-medium text-slate-600">
                  Contacto disponible próximamente
                </span>
              )}
              <Link href={`/w/${workspaceSlug}/properties`} className="rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
                Ver propiedades disponibles
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-500">
              {agent.whatsapp ?? agent.phone ? <span>{agent.whatsapp ?? agent.phone}</span> : null}
              {agent.email ? <span>{agent.email}</span> : null}
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Propiedades asignadas</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950">Propiedades que atiende este asesor</h2>
            </div>
            <Link href={`/w/${workspaceSlug}/properties`} className="text-sm text-slate-600 transition hover:text-slate-950">Ver más propiedades</Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {agent.properties.length ? agent.properties.map((property) => (
              <article key={property.id} className="overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <div className="relative h-56 bg-gradient-to-br from-zinc-200 to-zinc-100">
                  {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill className="object-cover" unoptimized /> : null}
                </div>
                <div className="p-5">
                  <h3 className="text-2xl font-semibold text-slate-950">{property.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{property.locationLabel}</p>
                  <p className="mt-4 text-lg font-medium text-slate-950">{property.currencyCode} {property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}</p>
                  <Link href={`/w/${workspaceSlug}/properties/${property.slug}`} className="mt-5 inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
                    Ver propiedad
                  </Link>
                </div>
              </article>
            )) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-6 text-sm text-slate-600 md:col-span-3">
                Este asesor todavía no tiene propiedades públicas asignadas.
              </div>
            )}
          </div>
        </section>

        <PublicLegalDisclaimer />
      </div>
    </main>
  );
}

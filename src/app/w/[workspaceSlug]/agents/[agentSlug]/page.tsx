import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicBrandHeader } from "@/components/ui/PublicBrandHeader";
import { PublicLegalDisclaimer } from "@/components/ui/PublicLegalDisclaimer";
import { getPublicAgentBySlug } from "@/lib/public-agents";
import { buildSeoMetadata, compactDescription } from "@/lib/seo";

function formatPriceLabel(currencyCode: string, priceAmount: number | null) {
  return priceAmount ? `${currencyCode} ${priceAmount.toLocaleString("es-MX")}` : "Consultar";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ workspaceSlug: string; agentSlug: string }>;
}): Promise<Metadata> {
  const { workspaceSlug, agentSlug } = await params;
  const agent = await getPublicAgentBySlug(workspaceSlug, agentSlug);

  if (!agent) return {};

  const brandName = agent.workspace.brandName ?? agent.workspace.name;

  return buildSeoMetadata({
    title: `${agent.displayName} | Asesor inmobiliario en ${brandName}`,
    description: compactDescription(agent.bio, `${agent.displayName} te acompaña a encontrar propiedades publicadas por ${brandName}.`),
    path: `/w/${workspaceSlug}/agents/${agentSlug}`,
    image: agent.avatarUrl ?? agent.workspace.publicLogoUrl ?? agent.workspace.publicHeroUrl,
  });
}

export default async function WorkspaceAgentPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; agentSlug: string }>;
}) {
  const { workspaceSlug, agentSlug } = await params;
  const agent = await getPublicAgentBySlug(workspaceSlug, agentSlug);

  if (!agent) notFound();

  const primaryProperties = agent.properties.filter((property) => property.agent?.id === agent.id);
  const collaboratorProperties = agent.properties.filter((property) => property.agent?.id !== agent.id);
  const featuredProperty = primaryProperties[0] ?? agent.properties[0] ?? null;

  return (
    <main className="min-h-screen bg-[#f4efe8] px-6 py-10 text-slate-950 lg:px-8">
      <PublicBrandHeader brandName={agent.workspace.brandName ?? agent.workspace.name} logoUrl={agent.workspace.publicLogoUrl} homeHref={`/w/${workspaceSlug}`} propertiesHref={`/w/${workspaceSlug}/properties`} />
      <div className="public-noise mx-auto max-w-7xl space-y-20">
        <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <Link href={`/w/${workspaceSlug}`} className="transition hover:text-slate-900">Inicio</Link>
          <span>•</span>
          <Link href={`/w/${workspaceSlug}/properties`} className="transition hover:text-slate-900">Propiedades</Link>
          <span>•</span>
          <span className="text-slate-900">{agent.displayName}</span>
        </nav>

        <section className="relative overflow-hidden rounded-[3rem] bg-[#120f0c] px-6 py-8 text-[#f5e8d6] shadow-[0_34px_100px_rgba(0,0,0,0.18)] lg:px-8 lg:py-10">
          <div className="absolute inset-0">
            {agent.avatarUrl ? <Image src={agent.avatarUrl} alt={agent.displayName} fill className="public-cinematic-image object-cover opacity-58" unoptimized /> : null}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(208,163,91,0.20),transparent_28%),linear-gradient(90deg,rgba(18,15,12,0.88)_0%,rgba(18,15,12,0.46)_44%,rgba(18,15,12,0.84)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,15,12,0.18)_0%,rgba(18,15,12,0.30)_48%,rgba(18,15,12,0.82)_100%)]" />
          </div>
          <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div className="pt-8 lg:pt-12">
              <p className="text-xs uppercase tracking-[0.42em] text-[#d9c2a2]">Private advisor</p>
              <h1 className="mt-6 max-w-4xl font-serif text-5xl font-semibold leading-[0.9] tracking-[-0.055em] text-white sm:text-7xl">{agent.displayName}</h1>
              {agent.title ? <p className="mt-5 text-sm uppercase tracking-[0.28em] text-[#d8c2a2]">{agent.title}</p> : null}
              <p className="mt-7 max-w-2xl text-base leading-8 text-[#e7d8c5]">
                {agent.bio ?? `Te acompaño a descubrir propiedades extraordinarias con contexto, criterio y una conversación clara desde el primer contacto.`}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                {agent.whatsappUrl ? (
                  <a href={agent.whatsappUrl} target="_blank" rel="noreferrer" className="rounded-full bg-[#d0a35b] px-7 py-4 text-sm font-medium text-[#1b1713] shadow-[0_18px_45px_rgba(208,163,91,0.32)] transition hover:bg-[#dfb066]">
                    Agenda una visita privada
                  </a>
                ) : null}
                <Link href={`/w/${workspaceSlug}/properties`} className="rounded-full border border-white/18 bg-white/8 px-7 py-4 text-sm font-medium text-[#fff7ef] backdrop-blur transition hover:bg-white/14">
                  Ver propiedades atendidas
                </Link>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.8rem] border border-white/12 bg-white/8 px-5 py-5 backdrop-blur-xl">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8c2a2]">Activas</p>
                  <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{agent.properties.length}</p>
                </div>
                <div className="rounded-[1.8rem] border border-white/12 bg-white/8 px-5 py-5 backdrop-blur-xl">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8c2a2]">Principal</p>
                  <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{primaryProperties.length}</p>
                </div>
                <div className="rounded-[1.8rem] border border-white/12 bg-white/8 px-5 py-5 backdrop-blur-xl">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8c2a2]">Colaboración</p>
                  <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{collaboratorProperties.length}</p>
                </div>
              </div>
            </div>
            <div className="lg:pb-6">
              <div className="ml-auto max-w-[28rem] rounded-[2.2rem] border border-white/12 bg-white/8 p-5 backdrop-blur-xl shadow-[0_28px_80px_rgba(0,0,0,0.18)]">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8c2a2]">Approach</p>
                <p className="mt-4 text-sm leading-8 text-[#e7d8c5]">
                  Algunas propiedades las lidero como responsable principal y en otras colaboro con el equipo comercial de la inmobiliaria. Aquí solo aparecen oportunidades donde mi participación es directa.
                </p>
                <div className="mt-5 flex flex-wrap gap-4 text-sm text-[#e7d8c5]">
                  {agent.whatsapp ?? agent.phone ? <span>{agent.whatsapp ?? agent.phone}</span> : null}
                  {agent.email ? <span>{agent.email}</span> : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        {featuredProperty ? (
          <section className="grid gap-8 rounded-[2.6rem] border border-[#eadfce] bg-[#fbf7f1] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] lg:grid-cols-[0.92fr_1.08fr] lg:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#8a6a43]">Signature property</p>
              <h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.05em] text-[#17120e] sm:text-5xl">{featuredProperty.title}</h2>
              <p className="mt-4 text-sm leading-7 text-[#605448]">{featuredProperty.locationLabel}</p>
              <p className="mt-5 text-3xl font-semibold tracking-tight text-[#17120e]">{formatPriceLabel(featuredProperty.currencyCode, featuredProperty.priceAmount)}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-[#6d5b49]">
                <span className="rounded-full border border-[#d9c7af] bg-white px-3 py-1">
                  {featuredProperty.agent?.id === agent.id ? "Responsable principal" : "Asesor colaborador"}
                </span>
                {featuredProperty.publicCode ? <span className="rounded-full border border-[#d9c7af] bg-white px-3 py-1">{featuredProperty.publicCode}</span> : null}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/w/${workspaceSlug}/properties/${featuredProperty.slug}?advisor=${agent.slug}`} className="rounded-full bg-[#17120e] px-6 py-3.5 text-sm font-medium text-[#f8efe3] transition hover:bg-[#2b211b]">
                  Ver residencia
                </Link>
                <Link href={`/w/${workspaceSlug}/properties`} className="rounded-full border border-[#d9c7af] bg-white px-6 py-3.5 text-sm font-medium text-[#17120e] transition hover:bg-[#f7efe3]">
                  Explorar más
                </Link>
              </div>
            </div>
            <div className="public-cinematic-frame relative min-h-[20rem] overflow-hidden rounded-[2.2rem] bg-slate-100">
              {featuredProperty.coverImageUrl ? <Image src={featuredProperty.coverImageUrl} alt={featuredProperty.title} fill className="public-cinematic-image object-cover" unoptimized /> : null}
            </div>
          </section>
        ) : null}

        <section className="space-y-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#8a6a43]">Private collection</p>
              <h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.05em] text-[#17120e] sm:text-5xl">Propiedades donde su participación es directa</h2>
            </div>
            <Link href={`/w/${workspaceSlug}/properties`} className="text-sm text-slate-600 transition hover:text-slate-950">Ver más propiedades</Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {agent.properties.length ? agent.properties.map((property) => (
              <article key={property.id} className="overflow-hidden rounded-[2.2rem] bg-[#fbf7f1] shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(15,23,42,0.14)]">
                <div className="public-cinematic-frame relative h-56 bg-gradient-to-br from-zinc-200 to-zinc-100">
                  {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill className="public-cinematic-image object-cover" unoptimized /> : null}
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-[#6d5b49]">
                    <span className="rounded-full border border-[#d9c7af] bg-white px-3 py-1">
                      {property.agent?.id === agent.id ? "Responsable principal" : "Colaborador"}
                    </span>
                  </div>
                  <h3 className="mt-4 font-serif text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-[#17120e]">{property.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#605448]">{property.locationLabel}</p>
                  <p className="mt-4 text-2xl font-semibold tracking-tight text-[#17120e]">{formatPriceLabel(property.currencyCode, property.priceAmount)}</p>
                  <Link href={`/w/${workspaceSlug}/properties/${property.slug}?advisor=${agent.slug}`} className="mt-5 inline-flex rounded-full border border-[#d9c7af] bg-white px-5 py-3 text-sm font-medium text-[#17120e] transition hover:bg-[#f7efe3]">
                    Ver residencia
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

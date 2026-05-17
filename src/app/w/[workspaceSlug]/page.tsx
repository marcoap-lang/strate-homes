import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicBrandHeader } from "@/components/ui/PublicBrandHeader";
import { PublicLuxuryFilters } from "@/components/ui/PublicLuxuryFilters";
import { PublicLegalDisclaimer } from "@/components/ui/PublicLegalDisclaimer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicProperties } from "@/lib/public-properties";
import { buildSeoMetadata, compactDescription } from "@/lib/seo";

function formatOperationLabel(operationType: string) {
  if (operationType === "sale") return "Venta";
  if (operationType === "rent") return "Renta";
  return "Disponible";
}

function formatPriceLabel(currencyCode: string, priceAmount: number | null) {
  return priceAmount ? `${currencyCode} ${priceAmount.toLocaleString("es-MX")}` : "Consultar";
}

function formatPropertyTypeLabel(propertyType: string | null | undefined) {
  if (propertyType === "house") return "Casa";
  if (propertyType === "apartment") return "Departamento";
  if (propertyType === "land") return "Terreno";
  if (propertyType === "office") return "Oficina";
  if (propertyType === "commercial") return "Local comercial";
  return "Propiedad";
}

function splitPublicLines(value: string | null | undefined, fallback: string[]) {
  const lines = (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.length ? lines : fallback;
}

export async function generateMetadata({ params }: { params: Promise<{ workspaceSlug: string }> }): Promise<Metadata> {
  const { workspaceSlug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name, brand_name, public_claim, public_bio, public_logo_url, public_hero_url")
    .eq("slug", workspaceSlug)
    .maybeSingle();

  if (!workspace) return {};

  const brandName = workspace.brand_name ?? workspace.name;

  return buildSeoMetadata({
    title: `${brandName} | Propiedades inmobiliarias`,
    description: compactDescription(workspace.public_bio, workspace.public_claim ?? `Propiedades publicadas por ${brandName}.`),
    path: `/w/${workspaceSlug}`,
    image: workspace.public_hero_url ?? workspace.public_logo_url,
  });
}

export default async function WorkspacePublicHome({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, slug, brand_name, public_phone, public_whatsapp, public_email, public_claim, public_bio, public_logo_url, public_hero_url, public_services, public_trust_points, public_address, public_maps_url, public_facebook_url, public_instagram_url, public_google_business_url, public_privacy_url")
    .eq("slug", workspaceSlug)
    .maybeSingle();

  if (!workspace) notFound();

  const properties = await getPublicProperties({ workspaceSlug });
  const heroProperty = properties[0] ?? null;
  const activeProperties = properties.filter((property) => property.status === "active");
  const saleProperties = properties.filter((property) => property.operationType === "sale").length;
  const rentProperties = properties.filter((property) => property.operationType === "rent").length;
  const highlightedProperties = properties.slice(0, 6);
  const latestProperties = properties.slice(0, 3);
  const heroImage = workspace.public_hero_url ?? heroProperty?.coverImageUrl ?? null;
  const serviceItems = splitPublicLines(workspace.public_services, ["Venta y renta residencial", "Asesoría para inversión", "Acompañamiento comercial de principio a cierre"]);
  const trustItems = splitPublicLines(workspace.public_trust_points, ["Atención directa con asesores comerciales", "Inventario revisado antes de publicarse", "Seguimiento claro para cada interesado"]);

  return (
    <main className="min-h-screen bg-[#f4efe8] text-slate-950">
      <PublicBrandHeader brandName={workspace.brand_name ?? workspace.name} logoUrl={workspace.public_logo_url} homeHref={`/w/${workspaceSlug}`} propertiesHref={`/w/${workspaceSlug}/properties`} />

      <section className="relative overflow-hidden bg-[#120f0c] px-6 pb-24 pt-8 text-[#f6f0e7] lg:px-8 lg:pb-32 lg:pt-10">
        {heroImage ? (
          <div className="absolute inset-0">
            <Image src={heroImage} alt={heroProperty?.title ?? (workspace.brand_name ?? workspace.name)} fill className="public-cinematic-image object-cover opacity-70" unoptimized priority />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(196,144,68,0.22),transparent_28%),linear-gradient(90deg,rgba(18,15,12,0.92)_0%,rgba(18,15,12,0.66)_34%,rgba(18,15,12,0.48)_58%,rgba(18,15,12,0.82)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,15,12,0.20)_0%,rgba(18,15,12,0.38)_46%,rgba(18,15,12,0.88)_100%)]" />
          </div>
        ) : null}
        <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-[#d0a35b]/18 blur-3xl" />
        <div className="absolute right-0 top-12 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div className="pt-8">
              <p className="text-xs uppercase tracking-[0.42em] text-[#d8c2a2]">Inmobiliaria de alta gama</p>
              <h1 className="mt-7 max-w-5xl font-serif text-5xl font-semibold leading-[0.88] tracking-[-0.055em] text-[#fff7ef] sm:text-7xl lg:text-[7.1rem]">
                {workspace.public_claim ?? "Residencias extraordinarias, presencia impecable y una forma más refinada de comprar."}
              </h1>
              <p className="mt-8 max-w-xl text-base leading-8 text-[#efe2d1]/84 sm:text-lg">
                {workspace.public_bio ?? "Seleccionamos propiedades con arquitectura, luz, ubicación y narrativa comercial a la altura de clientes que esperan algo excepcional."}
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link href={`/w/${workspaceSlug}/properties`} className="rounded-full bg-[#d0a35b] px-7 py-4 text-sm font-medium text-[#1b1713] shadow-[0_18px_45px_rgba(208,163,91,0.32)] transition hover:bg-[#dfb066]">
                  Explorar propiedades
                </Link>
                {workspace.public_whatsapp || workspace.public_phone ? <a href={`https://wa.me/${(workspace.public_whatsapp ?? workspace.public_phone ?? "").replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="rounded-full border border-white/32 bg-white/14 px-7 py-4 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20">Hablar con la inmobiliaria</a> : null}
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.8rem] border border-white/12 bg-white/8 px-5 py-5 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8c2a2]">Inventario activo</p>
                  <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{activeProperties.length}</p>
                </div>
                <div className="rounded-[1.8rem] border border-white/12 bg-white/8 px-5 py-5 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8c2a2]">En venta</p>
                  <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{saleProperties}</p>
                </div>
                <div className="rounded-[1.8rem] border border-white/12 bg-white/8 px-5 py-5 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8c2a2]">En renta</p>
                  <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{rentProperties}</p>
                </div>
              </div>
            </div>

            <div className="relative pb-8 lg:pb-0">
              <div className="ml-auto max-w-[44rem]">
                <div className="rounded-[2.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-3 shadow-[0_34px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                  <div className="public-cinematic-frame relative min-h-[30rem] overflow-hidden rounded-[2rem] bg-black sm:min-h-[40rem] lg:min-h-[47rem]">
                    {heroImage ? <Image src={heroImage} alt={heroProperty?.title ?? (workspace.brand_name ?? workspace.name)} fill className="public-cinematic-image object-cover" unoptimized /> : null}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,6,0.06)_0%,rgba(10,8,6,0.20)_48%,rgba(10,8,6,0.64)_100%)]" />
                    <div className="absolute left-6 top-6 z-[3] rounded-full border border-white/14 bg-white/8 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-[#f8e9d5] backdrop-blur">
                      Vista de la zona
                    </div>
                  </div>
                </div>
              </div>

              {heroProperty ? (
                <div className="relative z-10 mt-5 lg:-mt-28 lg:ml-0">
                  <div className="grid gap-4 lg:grid-cols-[1.18fr_0.82fr]">
                    <div className="rounded-[2rem] border border-[#e9dcc9] bg-[#f6efe5] px-6 py-6 shadow-[0_28px_80px_rgba(0,0,0,0.14)]">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-[#8a6a43]">Residencia destacada</p>
                      <h2 className="mt-3 font-serif text-3xl font-semibold leading-[0.95] tracking-[-0.04em] text-[#18130f] sm:text-4xl">{heroProperty.title}</h2>
                      <p className="mt-3 text-sm leading-7 text-[#5f5347]">{heroProperty.locationLabel}</p>
                      <div className="mt-5 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-[#6d5b49]">
                        <span className="rounded-full border border-[#d9c7af] bg-white px-3 py-1">{formatOperationLabel(heroProperty.operationType)}</span>
                        <span className="rounded-full border border-[#d9c7af] bg-white px-3 py-1">{formatPropertyTypeLabel(heroProperty.propertyType)}</span>
                        {heroProperty.agent?.displayName ? <span className="rounded-full border border-[#d9c7af] bg-white px-3 py-1">Representada por {heroProperty.agent.displayName}</span> : null}
                      </div>
                    </div>
                    <div className="rounded-[2rem] border border-white/12 bg-[#18120d] px-6 py-6 text-[#f4e8d8] shadow-[0_28px_80px_rgba(0,0,0,0.22)]">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8c2a2]">Vista privada</p>
                      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{formatPriceLabel(heroProperty.currencyCode, heroProperty.priceAmount)}</p>
                      <p className="mt-3 text-sm leading-7 text-[#dbcab5]">Una propiedad pensada para compradores que valoran presencia, ubicación y una experiencia impecable desde el primer contacto.</p>
                      <div className="mt-5 flex flex-col gap-3">
                        <Link href={`/w/${workspaceSlug}/properties/${heroProperty.slug}`} className="rounded-full bg-[#d0a35b] px-5 py-3 text-center text-sm font-medium text-[#1b1713] transition hover:bg-[#dfb066]">
                          Ver residencia
                        </Link>
                        {heroProperty.agent?.slug ? (
                          <Link href={`/w/${workspaceSlug}/agents/${heroProperty.agent.slug}`} className="rounded-full border border-white/16 bg-white/6 px-5 py-3 text-center text-sm font-medium text-[#fff7ef] transition hover:bg-white/12">
                            Conocer al asesor
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-12 rounded-[2.2rem] border border-white/10 bg-white/8 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.16)] backdrop-blur-xl">
            <PublicLuxuryFilters basePath={`/w/${workspaceSlug}/properties`} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-18 lg:px-8 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2.4rem] bg-[#16110d] px-7 py-8 text-[#f5e7d5] shadow-[0_24px_70px_rgba(0,0,0,0.14)]">
            <p className="text-xs uppercase tracking-[0.32em] text-[#c7aa84]">Asesoría inmobiliaria</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-[0.95] tracking-[-0.045em] text-white">No vendemos volumen. Curamos decisiones.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-[#dbcab5]">
              Cada ficha pública debe sentirse como una invitación bien dirigida: contexto, representación clara y una experiencia de contacto que refleje lujo, criterio y confianza.
            </p>
          </article>
          <div className="grid gap-4 sm:grid-cols-3">
            {latestProperties.map((property, index) => (
              <article key={property.id} className="rounded-[2rem] border border-[#e8dccb] bg-[#fbf7f1] px-5 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#8a6a43]">{index === 0 ? "Nueva oportunidad" : index === 1 ? "Selección destacada" : "Vale la pena verla"}</p>
                <p className="mt-3 font-serif text-xl font-semibold leading-tight tracking-[-0.03em] text-[#17120e]">{property.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#605448]">{property.locationLabel}</p>
                <p className="mt-4 text-sm font-medium text-[#17120e]">{formatPriceLabel(property.currencyCode, property.priceAmount)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[2.6rem] border border-[#eadfce] bg-[#fbf7f1] p-7 shadow-[0_22px_70px_rgba(15,23,42,0.07)] lg:p-9">
            <p className="text-sm uppercase tracking-[0.3em] text-[#8a6a43]">Cómo trabajamos</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-[0.96] tracking-[-0.05em] text-[#17120e] sm:text-5xl">
              Servicio inmobiliario con criterio, presencia y seguimiento.
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {serviceItems.slice(0, 6).map((item) => (
                <div key={item} className="rounded-[1.6rem] border border-[#e4d6c2] bg-white px-4 py-5">
                  <p className="text-sm font-semibold leading-6 text-[#17120e]">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2.6rem] bg-[#17120e] p-7 text-[#f5e7d5] shadow-[0_24px_80px_rgba(0,0,0,0.16)] lg:p-9">
            <p className="text-sm uppercase tracking-[0.3em] text-[#c7aa84]">Confianza</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-[0.98] tracking-[-0.05em] text-white">Antes de visitar, debe sentirse claro.</h2>
            <div className="mt-8 space-y-3">
              {trustItems.slice(0, 5).map((item) => (
                <div key={item} className="rounded-[1.4rem] border border-white/10 bg-white/8 px-4 py-4">
                  <p className="text-sm leading-7 text-[#ead9c2]">{item}</p>
                </div>
              ))}
            </div>
            {workspace.public_address || workspace.public_maps_url ? (
              <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/8 px-5 py-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[#c7aa84]">Zona de atención</p>
                {workspace.public_address ? <p className="mt-3 text-sm leading-7 text-[#ead9c2]">{workspace.public_address}</p> : null}
                {workspace.public_maps_url ? (
                  <a href={workspace.public_maps_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full bg-[#d0a35b] px-5 py-3 text-sm font-medium text-[#1b1713] transition hover:bg-[#dfb066]">
                    Abrir mapa
                  </a>
                ) : null}
              </div>
            ) : null}
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-24">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#8a6a43]">Selección principal</p>
            <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.05em] text-[#17120e] sm:text-6xl">Residencias y oportunidades con presencia excepcional</h2>
          </div>
          <Link href={`/w/${workspaceSlug}/properties`} className="hidden rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-900 transition hover:bg-slate-50 md:inline-flex">
            Ver más propiedades
          </Link>
        </div>

        <div className="mt-14 grid gap-8">
          {highlightedProperties.map((property, index) => {
            const specsInline = [
              property.bedrooms ? `${property.bedrooms} recámaras` : null,
              property.bathrooms ? `${property.bathrooms} baños` : null,
              property.constructionAreaM2 ? `${property.constructionAreaM2} m²` : null,
            ].filter(Boolean).join(" · ");
            const isReverse = index % 2 === 1;

            return (
              <article key={property.id} className={`grid gap-6 rounded-[2.6rem] border border-[#eadfce] bg-[#fbf7f1] p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[1.1fr_0.9fr] lg:p-5 ${isReverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div className="public-cinematic-frame relative min-h-[20rem] overflow-hidden rounded-[2.1rem] bg-[#d9d9d9] sm:min-h-[28rem] lg:min-h-[34rem]">
                  {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill className="public-cinematic-image object-cover" unoptimized /> : null}
                  <div className="absolute left-5 top-5 z-[3] rounded-full border border-white/18 bg-black/25 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white backdrop-blur">
                    {formatOperationLabel(property.operationType)}
                  </div>
                </div>
                <div className="flex flex-col justify-between px-2 py-2 sm:px-4 sm:py-4">
                  <div>
                    <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.26em] text-[#8a6a43]">
                      <span>{property.publicCode ?? "Disponible"}</span>
                      <span>{formatPropertyTypeLabel(property.propertyType)}</span>
                    </div>
                    <h3 className="mt-5 font-serif text-4xl font-semibold leading-[0.96] tracking-[-0.05em] text-[#17120e] sm:text-5xl">{property.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-[#605448]">{property.locationLabel}</p>
                    <p className="mt-6 text-3xl font-semibold tracking-tight text-[#17120e]">{formatPriceLabel(property.currencyCode, property.priceAmount)}</p>
                    {specsInline ? <p className="mt-4 text-sm text-[#605448]">{specsInline}</p> : null}
                    {property.agent?.displayName ? (
                      <p className="mt-4 text-sm text-[#605448]">
                        Representada por <span className="font-medium text-[#17120e]">{property.agent.displayName}</span>
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link href={`/w/${workspaceSlug}/properties/${property.slug}`} className="rounded-full bg-[#17120e] px-6 py-3.5 text-sm font-medium text-[#f8efe3] transition hover:bg-[#2b211b]">
                      Ver residencia
                    </Link>
                    {property.agent?.slug ? (
                      <Link href={`/w/${workspaceSlug}/agents/${property.agent.slug}`} className="rounded-full border border-[#d9c7af] bg-white px-6 py-3.5 text-sm font-medium text-[#17120e] transition hover:bg-[#f7efe3]">
                        Ver asesor
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-8">
        <div className="space-y-3 pb-8 text-sm text-slate-500">
          <p className="font-medium text-slate-900">{workspace.brand_name ?? workspace.name}</p>
          {workspace.public_phone ? <p>Teléfono: {workspace.public_phone}</p> : null}
          {workspace.public_whatsapp ? <p>WhatsApp: {workspace.public_whatsapp}</p> : null}
          {workspace.public_email ? <p>Email: {workspace.public_email}</p> : null}
          <div className="flex flex-wrap gap-3 pt-2">
            {workspace.public_facebook_url ? <a href={workspace.public_facebook_url} target="_blank" rel="noreferrer" className="font-medium text-slate-800 underline-offset-4 hover:underline">Facebook</a> : null}
            {workspace.public_instagram_url ? <a href={workspace.public_instagram_url} target="_blank" rel="noreferrer" className="font-medium text-slate-800 underline-offset-4 hover:underline">Instagram</a> : null}
            {workspace.public_google_business_url ? <a href={workspace.public_google_business_url} target="_blank" rel="noreferrer" className="font-medium text-slate-800 underline-offset-4 hover:underline">Google Business</a> : null}
            {workspace.public_privacy_url ? <a href={workspace.public_privacy_url} target="_blank" rel="noreferrer" className="font-medium text-slate-800 underline-offset-4 hover:underline">Aviso de privacidad</a> : null}
          </div>
        </div>
        <PublicLegalDisclaimer />
      </footer>
    </main>
  );
}

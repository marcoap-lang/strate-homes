import Image from "next/image";
import Link from "next/link";
import { PublicBrandHeader } from "@/components/ui/PublicBrandHeader";
import { PublicLeadCaptureForm } from "@/components/ui/PublicLeadCaptureForm";
import { PublicLegalDisclaimer } from "@/components/ui/PublicLegalDisclaimer";
import { PublicShareActions } from "@/components/ui/PublicShareActions";
import { buildPublicPropertyUrl, buildWhatsAppPropertyMessage, buildWorkspaceAgentPath } from "@/lib/public-links";
import type { PublicProperty } from "@/lib/public-properties";

function formatOperation(operationType: string) {
  if (operationType === "sale") return "En venta";
  if (operationType === "rent") return "En renta";
  return "Disponible";
}

export function PublicPropertyDetailPage({
  property,
  similarProperties,
  workspaceSlug,
  preferredAdvisorSlug,
}: {
  property: PublicProperty;
  similarProperties: PublicProperty[];
  workspaceSlug?: string | null;
  preferredAdvisorSlug?: string | null;
}) {
  const gallery = property.images;
  const cover = gallery[0] ?? null;
  const storyImages = gallery.slice(1, 5);
  const remainingImages = gallery.slice(5);
  const effectiveWorkspaceSlug = workspaceSlug ?? property.workspaceSlug ?? null;
  const propertyBasePath = effectiveWorkspaceSlug ? `/w/${effectiveWorkspaceSlug}/properties` : "/properties";
  const homePath = effectiveWorkspaceSlug ? `/w/${effectiveWorkspaceSlug}` : "/";
  const propertyUrl = buildPublicPropertyUrl(property.slug, effectiveWorkspaceSlug);
  const locationText = [property.locationLabel, property.city, property.state].filter(Boolean).join(" · ") || property.locationLabel;
  const priceLabel = `${property.currencyCode} ${property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}`;
  const assignedAgent = property.agent;
  const preferredAdvisor = preferredAdvisorSlug
    ? [assignedAgent, ...property.collaborators].find((advisor) => advisor?.slug === preferredAdvisorSlug) ?? null
    : null;
  const fallbackContact = property.workspaceContactAgent;
  const contactEntity = preferredAdvisor?.whatsapp || preferredAdvisor?.phone
    ? preferredAdvisor
    : assignedAgent?.whatsapp || assignedAgent?.phone
      ? assignedAgent
      : fallbackContact;
  const specsInline = [
    property.bedrooms ? `${property.bedrooms} recámaras` : null,
    property.bathrooms ? `${property.bathrooms} baños` : null,
    property.constructionAreaM2 ? `${property.constructionAreaM2} m²` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const whatsappMessage = buildWhatsAppPropertyMessage({
    title: property.title,
    locationLabel: locationText,
    priceLabel,
    propertyUrl,
  });
  const whatsappNumber = (contactEntity?.whatsapp ?? contactEntity?.phone ?? "").replace(/\D/g, "");
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}` : null;
  const highlights = [
    {
      label: "Ubicación",
      value: property.neighborhood ?? property.locationLabel,
      description: property.city || property.state ? [property.city, property.state].filter(Boolean).join(" · ") : "Zona seleccionada para vivir o invertir con mejor contexto.",
    },
    {
      label: "Distribución",
      value: specsInline || "Espacios por confirmar",
      description: property.constructionAreaM2 ? `${property.constructionAreaM2} m² para evaluar amplitud, uso y potencial.` : "Ficha preparada para completar medidas y características clave.",
    },
    {
      label: "Oportunidad",
      value: formatOperation(property.operationType),
      description: `${priceLabel} · información presentada para una primera revisión comercial clara.`,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7fbff] px-6 pb-28 pt-10 text-slate-950 md:pb-10 lg:px-8">
      <PublicBrandHeader
        brandName={property.workspaceBrandName ?? property.workspaceName ?? "Strate Homes"}
        logoUrl={property.workspaceLogoUrl}
        homeHref={homePath}
        propertiesHref={propertyBasePath}
      />
      <div className="mx-auto max-w-7xl space-y-16 pt-10">
        <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <Link href={homePath} className="transition hover:text-slate-900">Inicio</Link>
          <span>•</span>
          <Link href={propertyBasePath} className="transition hover:text-slate-900">Propiedades</Link>
          <span>•</span>
          <span className="text-slate-900">{property.title}</span>
        </nav>

        <section className="overflow-hidden rounded-[2.6rem] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
          <div className="relative min-h-[32rem] lg:min-h-[48rem]">
            {cover?.url ? <Image src={cover.url} alt={cover.altText ?? property.title} fill className="object-cover object-center" unoptimized /> : null}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/78 via-slate-950/38 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 px-5 pb-8 pt-24 text-white sm:px-10 sm:pb-10 lg:max-w-[52rem]">
              <span className="inline-flex rounded-full bg-[#d7ab5b] px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-white shadow-sm">
                {formatOperation(property.operationType)}
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-[5.2rem]">{property.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">{locationText}</p>
              <p className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">{priceLabel}</p>
              {specsInline ? <p className="mt-5 text-base text-white/85">{specsInline}</p> : null}
              <div className="mt-8 flex flex-wrap gap-4">
                {whatsappUrl ? (
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-[#d7ab5b] px-6 py-4 text-sm font-medium text-white shadow-[0_10px_30px_rgba(215,171,91,0.3)] transition hover:bg-[#c99a46]">
                    Contactar por WhatsApp
                  </a>
                ) : (
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-6 py-4 text-sm font-medium text-white/90">
                    Contacto disponible próximamente
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2.2rem] border border-slate-200/80 bg-white/82 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.06)] backdrop-blur sm:p-7">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Por qué destaca</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Lectura rápida para decidir mejor</h2>
            </div>
            <span className="w-fit rounded-full border border-[#d7ab5b]/30 bg-[#fff8ec] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#9b6f21]">
              Ficha inteligente
            </span>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {highlights.map((highlight) => (
              <article key={highlight.label} className="rounded-[1.6rem] border border-slate-100 bg-slate-50/70 p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">{highlight.label}</p>
                <h3 className="mt-3 text-xl font-semibold leading-snug text-slate-950">{highlight.value}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{highlight.description}</p>
              </article>
            ))}
          </div>
        </section>

        {storyImages.length ? (
          <section className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Galería</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Espacios que cuentan la historia de la propiedad</h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden text-sm text-slate-500 md:inline-flex">{gallery.length} fotos disponibles</span>
                <Link href={propertyBasePath} className="hidden text-sm text-slate-600 transition hover:text-slate-950 md:inline-flex">Ver más propiedades</Link>
              </div>
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-max gap-5 pr-4">
                {storyImages.map((image, index) => (
                  <div key={image.id} className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-100 to-slate-50 ${index === 0 ? "h-[22rem] w-[34rem]" : "h-[22rem] w-[20rem]"}`}>
                    {image.url ? <Image src={image.url} alt={image.altText ?? property.title} fill className="object-cover object-center" unoptimized /> : null}
                  </div>
                ))}
              </div>
            </div>
            {remainingImages.length ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-slate-900">Ver todas las fotos</p>
                  <span className="text-sm text-slate-500">{remainingImages.length} fotos adicionales</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {remainingImages.map((image) => (
                    <div key={image.id} className="relative h-64 overflow-hidden rounded-[1.8rem] bg-gradient-to-br from-slate-100 to-slate-50 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                      {image.url ? <Image src={image.url} alt={image.altText ?? property.title} fill className="object-cover object-center" unoptimized /> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Sobre la propiedad</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Vive una propiedad con mejor ubicación, amplitud y proyección</h2>
            <p className="mt-6 text-base leading-9 text-slate-700">
              {property.description ?? "Una propiedad pensada para quien busca ubicación, amplitud y una vida más cómoda en una zona con buen valor residencial."}
            </p>
            {specsInline ? <p className="mt-8 text-lg text-slate-600">{specsInline}</p> : null}
          </div>

          <aside className="rounded-[2.2rem] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Asesor principal</p>
            {assignedAgent ? (
              <div className="mt-6 text-center">
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-sky-50 text-3xl font-semibold text-slate-700 sm:h-28 sm:w-28">
                  {assignedAgent.avatarUrl ? <Image src={assignedAgent.avatarUrl} alt={assignedAgent.displayName} fill className="object-cover" unoptimized sizes="112px" /> : assignedAgent.displayName.slice(0, 1).toUpperCase()}
                </div>
                <p className="mt-6 text-3xl font-semibold text-slate-950">{assignedAgent.displayName}</p>
                {effectiveWorkspaceSlug && assignedAgent.slug ? (
                  <Link href={buildWorkspaceAgentPath(effectiveWorkspaceSlug, assignedAgent.slug)} className="mt-3 inline-flex text-sm text-slate-600 transition hover:text-slate-950">
                    Ver perfil del asesor
                  </Link>
                ) : null}
                {assignedAgent.title ? <p className="mt-3 text-sm uppercase tracking-[0.25em] text-slate-500">{assignedAgent.title}</p> : null}
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {assignedAgent.bio ?? "Te acompaña para resolver dudas, revisar disponibilidad y ayudarte a encontrar la mejor opción de acuerdo con tu búsqueda."}
                </p>
                {assignedAgent.whatsapp || assignedAgent.phone ? (
                  <p className="mt-4 text-sm text-slate-500">WhatsApp principal: {assignedAgent.whatsapp ?? assignedAgent.phone}</p>
                ) : null}
                <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                  Es el responsable comercial de esta propiedad. {preferredAdvisor && preferredAdvisor.id !== assignedAgent.id ? `Como llegaste desde ${preferredAdvisor.displayName}, el botón de WhatsApp contacta a ese asesor.` : "El WhatsApp principal de la ficha llega con este asesor."}
                </p>
                {property.collaborators.length ? (
                  <div className="mt-5 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Colaboradores</p>
                    <div className="mt-3 space-y-2">
                      {property.collaborators.map((collaborator) => (
                        <p key={collaborator.id} className="text-sm text-slate-600">{collaborator.displayName}{collaborator.title ? ` · ${collaborator.title}` : ""}{preferredAdvisor?.id === collaborator.id ? " · contacto seleccionado" : ""}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="mt-8 flex justify-center">
                  {whatsappUrl ? (
                    <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-full border border-[#d7ab5b]/40 bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-[#fff8ec]">
                      Contactar por WhatsApp
                    </a>
                  ) : (
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-medium text-slate-600">
                      Sin WhatsApp disponible por ahora
                    </span>
                  )}
                </div>
              </div>
            ) : fallbackContact ? (
              <div className="mt-6 text-center">
                <p className="text-2xl font-semibold text-slate-950">{property.workspaceBrandName ?? property.workspaceName ?? "Inmobiliaria"}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Un asesor de {property.workspaceBrandName ?? property.workspaceName ?? "la inmobiliaria"} puede ayudarte con esta propiedad.
                </p>
                <p className="mt-4 text-sm text-slate-500">{fallbackContact.whatsapp ?? fallbackContact.phone}</p>
                <div className="mt-8 flex justify-center">
                  {whatsappUrl ? (
                    <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-full border border-[#d7ab5b]/40 bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-[#fff8ec]">
                      Contactar por WhatsApp
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center">
                <p className="text-sm leading-7 text-slate-600">
                  Esta propiedad no tiene un contacto público disponible en este momento.
                </p>
              </div>
            )}
          </aside>
        </section>

        {similarProperties.length ? (
          <section className="space-y-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Propiedades similares</p>
                <h2 className="mt-4 text-3xl font-semibold text-slate-950">Más opciones que podrían interesarte</h2>
              </div>
              <Link href={propertyBasePath} className="text-sm text-slate-600 transition hover:text-slate-950">Ver más propiedades</Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {similarProperties.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
                  <div className="relative h-56 bg-gradient-to-br from-zinc-200 to-zinc-100">
                    {item.coverImageUrl ? <Image src={item.coverImageUrl} alt={item.title} fill className="object-cover" unoptimized /> : null}
                  </div>
                  <div className="p-5">
                    <span className="inline-flex rounded-full bg-[#d7ab5b] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white">{formatOperation(item.operationType)}</span>
                    <h3 className="mt-4 text-2xl font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.locationLabel}</p>
                    <p className="mt-4 text-lg font-medium text-slate-950">{item.currencyCode} {item.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}</p>
                    <Link href={`${propertyBasePath}/${item.slug}`} className="mt-5 inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">Ver propiedad</Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-white px-8 py-8 shadow-sm">
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Contacto directo</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">¿Prefieres una respuesta inmediata?</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">Contáctanos por WhatsApp o, si prefieres, deja tus datos en el bloque de solicitar información.</p>
              </div>
              {whatsappUrl ? (
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex w-fit rounded-full bg-[#d7ab5b] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#c99a46]">Contactar por WhatsApp</a>
              ) : (
                <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-medium text-slate-600">Sin contacto disponible por ahora</span>
              )}
            </div>
          </div>
          <PublicLeadCaptureForm propertyId={property.id} workspaceId={property.workspaceId ?? ""} />
        </section>

        <PublicShareActions propertyUrl={propertyUrl} whatsappUrl={whatsappUrl ?? undefined} />
        <PublicLegalDisclaimer />
      </div>
      <PublicShareActions propertyUrl={propertyUrl} whatsappUrl={whatsappUrl ?? undefined} sticky />
    </main>
  );
}

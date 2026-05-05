import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPropertyDetailPage } from "@/components/ui/PublicPropertyDetailPage";
import { buildPublicPropertyUrl } from "@/lib/public-links";
import { getPublicProperties, getPublicPropertyBySlug } from "@/lib/public-properties";
import { absoluteUrl, buildSeoMetadata, compactDescription } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ workspaceSlug: string; slug: string }>;
}): Promise<Metadata> {
  const { workspaceSlug, slug } = await params;
  const property = await getPublicPropertyBySlug(slug, workspaceSlug);

  if (!property) return {};

  const brandName = property.workspaceBrandName ?? property.workspaceName ?? "Strate Homes";
  const location = [property.locationLabel, property.city, property.state].filter(Boolean).join(" · ");

  return buildSeoMetadata({
    title: `${property.title} | ${brandName}`,
    description: compactDescription(property.description, `${property.title} en ${location}. Consulta precio, características, fotos y asesoría inmobiliaria.`),
    path: `/w/${workspaceSlug}/properties/${slug}`,
    image: property.coverImageUrl,
  });
}

function buildPropertyJsonLd(property: Awaited<ReturnType<typeof getPublicPropertyBySlug>>, workspaceSlug: string) {
  if (!property) return null;

  const propertyUrl = buildPublicPropertyUrl(property.slug, workspaceSlug);
  const brandName = property.workspaceBrandName ?? property.workspaceName ?? "Strate Homes";
  const images = property.images.map((image) => image.url).filter((url): url is string => Boolean(url));
  const address = [property.locationLabel, property.city, property.state].filter(Boolean).join(", ");
  const listing: Record<string, unknown> = {
    "@type": "RealEstateListing",
    "@id": `${propertyUrl}#listing`,
    name: property.title,
    description: property.description ?? `${property.title} en ${address}.`,
    url: propertyUrl,
    image: images.length ? images : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.city ?? property.locationLabel,
      addressRegion: property.state ?? undefined,
      streetAddress: property.locationLabel,
    },
    seller: property.agent
      ? {
          "@type": "RealEstateAgent",
          name: property.agent.displayName,
          image: absoluteUrl(property.agent.avatarUrl),
          telephone: property.agent.phone ?? property.agent.whatsapp ?? undefined,
        }
      : {
          "@type": "RealEstateAgent",
          name: brandName,
        },
    broker: {
      "@type": "RealEstateAgent",
      name: brandName,
      logo: absoluteUrl(property.workspaceLogoUrl),
    },
  };

  if (property.priceAmount) {
    listing.offers = {
      "@type": "Offer",
      price: property.priceAmount,
      priceCurrency: property.currencyCode,
      availability: "https://schema.org/InStock",
      url: propertyUrl,
    };
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      listing,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: absoluteUrl(`/w/${workspaceSlug}`) },
          { "@type": "ListItem", position: 2, name: "Propiedades", item: absoluteUrl(`/w/${workspaceSlug}/properties`) },
          { "@type": "ListItem", position: 3, name: property.title, item: propertyUrl },
        ],
      },
    ],
  };
}

export default async function WorkspacePropertyDetailPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; slug: string }>;
}) {
  const { workspaceSlug, slug } = await params;
  const property = await getPublicPropertyBySlug(slug, workspaceSlug);

  if (!property) notFound();

  const allProperties = await getPublicProperties({ workspaceSlug });
  const similarProperties = allProperties.filter((item) => item.slug !== property.slug).slice(0, 3);
  const jsonLd = buildPropertyJsonLd(property, workspaceSlug);

  return (
    <>
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /> : null}
      <PublicPropertyDetailPage property={property} similarProperties={similarProperties} workspaceSlug={workspaceSlug} />
    </>
  );
}

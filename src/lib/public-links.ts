export function getPublicBaseUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, "");
  }

  return "https://strate-homes.vercel.app";
}

export function buildWorkspacePropertyPath(workspaceSlug: string | null | undefined, propertySlug: string) {
  if (workspaceSlug) {
    return `/w/${workspaceSlug}/properties/${propertySlug}`;
  }

  return `/properties/${propertySlug}`;
}

export function buildPublicPropertyUrl(slug: string, workspaceSlug?: string | null) {
  return `${getPublicBaseUrl()}${buildWorkspacePropertyPath(workspaceSlug, slug)}`;
}

export function buildPublicAgentUrl(slug: string) {
  return `${getPublicBaseUrl()}/agents/${slug}`;
}

export function buildWhatsAppPropertyMessage({
  title,
  locationLabel,
  priceLabel,
  propertyUrl,
}: {
  title: string;
  locationLabel: string;
  priceLabel: string;
  propertyUrl: string;
}) {
  return [
    `Hola, te comparto esta propiedad: ${title}.`,
    `Ubicación: ${locationLabel}`,
    `Precio: ${priceLabel}`,
    `Más información aquí: ${propertyUrl}`,
  ].join("\n");
}

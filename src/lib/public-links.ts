export function getPublicBaseUrl() {
  const explicitSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (explicitSiteUrl) {
    return explicitSiteUrl.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  const fallbackAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (fallbackAppUrl) {
    return fallbackAppUrl.replace(/\/$/, "");
  }

  return "http://localhost:3000";
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

export function buildWorkspaceAgentPath(workspaceSlug: string | null | undefined, agentSlug: string) {
  if (workspaceSlug) {
    return `/w/${workspaceSlug}/agents/${agentSlug}`;
  }

  return `/agents/${agentSlug}`;
}

export function buildPublicAgentUrl(agentSlug: string, workspaceSlug?: string | null) {
  return `${getPublicBaseUrl()}${buildWorkspaceAgentPath(workspaceSlug, agentSlug)}`;
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

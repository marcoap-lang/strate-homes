export function getPublicBaseUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export function buildPublicPropertyUrl(slug: string) {
  return `${getPublicBaseUrl()}/properties/${slug}`;
}

export function buildPublicAgentUrl(slug: string) {
  return `${getPublicBaseUrl()}/agents/${slug}`;
}

export function buildWhatsAppPropertyMessage({
  title,
  operationLabel,
  locationLabel,
  priceLabel,
  propertyUrl,
}: {
  title: string;
  operationLabel: string;
  locationLabel: string;
  priceLabel: string;
  propertyUrl: string;
}) {
  return [
    `Hola, te comparto esta propiedad: ${title}.`,
    `${operationLabel} · ${locationLabel}`,
    `Precio: ${priceLabel}`,
    `Más información aquí: ${propertyUrl}`,
  ].join("\n");
}

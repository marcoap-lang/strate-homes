import { notFound, redirect } from "next/navigation";
import { PublicPropertyDetailPage } from "@/components/ui/PublicPropertyDetailPage";
import { getPublicProperties, getPublicPropertyBySlug } from "@/lib/public-properties";
import { buildWorkspacePropertyPath } from "@/lib/public-links";

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug);

  if (!property) notFound();

  if (property.workspaceSlug) {
    redirect(buildWorkspacePropertyPath(property.workspaceSlug, property.slug));
  }

  const allProperties = await getPublicProperties();
  const similarProperties = allProperties.filter((item) => item.slug !== property.slug).slice(0, 3);

  return <PublicPropertyDetailPage property={property} similarProperties={similarProperties} />;
}

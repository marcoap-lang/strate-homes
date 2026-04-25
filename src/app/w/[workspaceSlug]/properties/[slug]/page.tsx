import { notFound } from "next/navigation";
import { PublicPropertyDetailPage } from "@/components/ui/PublicPropertyDetailPage";
import { getPublicProperties, getPublicPropertyBySlug } from "@/lib/public-properties";

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

  return <PublicPropertyDetailPage property={property} similarProperties={similarProperties} workspaceSlug={workspaceSlug} />;
}

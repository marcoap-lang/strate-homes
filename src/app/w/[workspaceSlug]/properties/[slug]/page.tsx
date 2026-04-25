import { notFound } from "next/navigation";
import { getPublicPropertyBySlug } from "@/lib/public-properties";
import PropertyDetailPage from "@/app/properties/[slug]/page";

export default async function WorkspacePropertyDetailPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; slug: string }>;
}) {
  const { workspaceSlug, slug } = await params;
  const property = await getPublicPropertyBySlug(slug, workspaceSlug);

  if (!property) notFound();

  return <PropertyDetailPage params={Promise.resolve({ slug })} />;
}

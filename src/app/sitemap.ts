import type { MetadataRoute } from "next";
import { getPublicBaseUrl } from "@/lib/public-links";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type JoinedWorkspace = { slug?: string | null } | Array<{ slug?: string | null }> | null;

function firstJoined<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getPublicBaseUrl();
  const supabase = await createSupabaseServerClient();

  const [{ data: properties }, { data: agents }] = await Promise.all([
    supabase
      .from("properties")
      .select("slug, updated_at, published_at, workspaces:workspace_id!inner (slug)")
      .eq("status", "active")
      .not("published_at", "is", null)
      .limit(1000),
    supabase
      .from("agents")
      .select("slug, updated_at, workspaces:workspace_id!inner (slug)")
      .eq("is_active", true)
      .eq("is_public", true)
      .limit(1000),
  ]);

  const workspaceSlugs = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];

  for (const property of properties ?? []) {
    const workspace = firstJoined((property as { workspaces?: JoinedWorkspace }).workspaces);
    if (!property.slug || !workspace?.slug) continue;
    workspaceSlugs.add(workspace.slug);
    entries.push({
      url: `${baseUrl}/w/${workspace.slug}/properties/${property.slug}`,
      lastModified: property.updated_at ?? property.published_at ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const agent of agents ?? []) {
    const workspace = firstJoined((agent as { workspaces?: JoinedWorkspace }).workspaces);
    if (!agent.slug || !workspace?.slug) continue;
    workspaceSlugs.add(workspace.slug);
    entries.push({
      url: `${baseUrl}/w/${workspace.slug}/agents/${agent.slug}`,
      lastModified: agent.updated_at ?? new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  const workspaceEntries: MetadataRoute.Sitemap = Array.from(workspaceSlugs).map((slug) => ({
    url: `${baseUrl}/w/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...workspaceEntries, ...entries];
}

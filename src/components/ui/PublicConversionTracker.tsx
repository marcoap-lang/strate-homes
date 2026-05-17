"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PublicConversionTracker({
  workspaceId,
  propertyId,
  agentId,
  eventType = "property_view",
  source = "public_property",
}: {
  workspaceId?: string | null;
  propertyId?: string | null;
  agentId?: string | null;
  eventType?: "property_view" | "advisor_click" | "demo_request";
  source?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!workspaceId) return;
    const params = new URLSearchParams({
      workspaceId,
      eventType,
      source,
      path: `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
    });
    if (propertyId) params.set("propertyId", propertyId);
    if (agentId) params.set("agentId", agentId);
    const adCampaignRequestId = searchParams.get("ad_campaign") ?? searchParams.get("adCampaignRequestId");
    const utmSource = searchParams.get("utm_source");
    const utmCampaign = searchParams.get("utm_campaign");
    if (adCampaignRequestId) params.set("adCampaignRequestId", adCampaignRequestId);
    if (utmSource) params.set("utm_source", utmSource);
    if (utmCampaign) params.set("utm_campaign", utmCampaign);

    void fetch(`/api/public-conversions?${params.toString()}`, { method: "GET", keepalive: true });
  }, [agentId, eventType, pathname, propertyId, searchParams, source, workspaceId]);

  return null;
}

import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedEvents = new Set(["property_view", "whatsapp_click", "advisor_click", "demo_request"]);

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const workspaceId = url.searchParams.get("workspaceId");
  const propertyId = url.searchParams.get("propertyId");
  const agentId = url.searchParams.get("agentId");
  const eventType = url.searchParams.get("eventType");
  const source = url.searchParams.get("source");
  const path = url.searchParams.get("path");
  const target = url.searchParams.get("target");

  if (workspaceId && eventType && allowedEvents.has(eventType)) {
    const supabase = await createSupabaseServerClient();
    await supabase.from("public_conversion_events").insert({
      workspace_id: workspaceId,
      property_id: propertyId || null,
      agent_id: agentId || null,
      event_type: eventType,
      path,
      source,
      metadata: { target: target ? "external" : "internal" },
    });
  }

  if (target) {
    return NextResponse.redirect(target);
  }

  return NextResponse.json({ ok: true });
}

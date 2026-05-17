"use client";

import Image from "next/image";
import { useActionState, useRef, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { createAdCampaignRequestAction, updateWorkspaceBrandingAction, type AdCampaignRequestState, type WorkspaceBrandingState } from "@/app/admin/actions";
import type { AdCampaignRequestRecord } from "@/lib/admin-access";

const initialState: WorkspaceBrandingState = { success: false, message: "" };
const initialAdState: AdCampaignRequestState = { success: false, message: "" };
const MAX_IMAGE_FILE_SIZE_MB = 8;

type WorkspaceBrandingRecord = {
  workspaceId: string;
  workspaceName?: string | null;
  workspaceSlug?: string | null;
  brandName?: string | null;
  publicPhone?: string | null;
  publicWhatsapp?: string | null;
  publicEmail?: string | null;
  publicClaim?: string | null;
  publicBio?: string | null;
  publicLogoUrl?: string | null;
  publicHeroUrl?: string | null;
  publicServices?: string | null;
  publicTrustPoints?: string | null;
  publicAddress?: string | null;
  publicMapsUrl?: string | null;
  publicFacebookUrl?: string | null;
  publicInstagramUrl?: string | null;
  publicGoogleBusinessUrl?: string | null;
  publicPrivacyUrl?: string | null;
};

function AdvertisingRequestManager({ properties, requests }: {
  properties: Array<{ id: string; title: string; status: string }>;
  requests: AdCampaignRequestRecord[];
}) {
  const [state, action, pending] = useActionState(createAdCampaignRequestAction, initialAdState);
  const activeProperties = properties.filter((property) => property.status === "active");

  return (
    <section id="publicidad" className="rounded-[2rem] border border-[#eadfce] bg-[linear-gradient(135deg,#17120e_0%,#2c2117_100%)] p-5 text-white shadow-[0_24px_70px_rgba(15,23,42,0.20)] sm:p-6">
      <p className="text-xs uppercase tracking-[0.26em] text-[#d7ab5b]">Publicidad</p>
      <h3 className="mt-3 text-3xl font-semibold tracking-tight">Comprar campañas para Facebook, Instagram y Google</h3>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">
        Solicita una campaña y Strate la arma contigo: objetivo, zona, propiedad a empujar, presupuesto y canal. Por ahora es compra asistida, no autoservicio con tarjeta.
      </p>

      <form action={action} className="mt-6 grid gap-4 rounded-[1.6rem] border border-white/10 bg-white/8 p-4 backdrop-blur lg:grid-cols-2">
        <label className="space-y-2 text-sm text-white/82">
          <span className="block text-xs uppercase tracking-[0.2em] text-white/45">Objetivo</span>
          <select name="objective" defaultValue="leads" className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-slate-950">
            <option value="leads">Generar interesados</option>
            <option value="whatsapp">Mensajes por WhatsApp</option>
            <option value="traffic">Tráfico al sitio</option>
            <option value="brand">Reconocimiento de marca</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-white/82">
          <span className="block text-xs uppercase tracking-[0.2em] text-white/45">Propiedad a promover</span>
          <select name="promotedPropertyId" defaultValue="" className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-slate-950">
            <option value="">Campaña general de la inmobiliaria</option>
            {activeProperties.map((property) => <option key={property.id} value={property.id}>{property.title}</option>)}
          </select>
        </label>
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/8 p-4 lg:col-span-2">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">Canales</p>
          <div className="flex flex-wrap gap-2">
            {["Facebook", "Instagram", "Google"].map((channel) => (
              <label key={channel} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white">
                <input type="checkbox" name="channels" value={channel.toLowerCase()} className="size-4" />
                {channel}
              </label>
            ))}
          </div>
        </div>
        <label className="space-y-2 text-sm text-white/82">
          <span className="block text-xs uppercase tracking-[0.2em] text-white/45">Presupuesto mensual sugerido</span>
          <input name="monthlyBudgetMxn" type="number" placeholder="Ej. 5000" className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-slate-950" />
        </label>
        <label className="space-y-2 text-sm text-white/82">
          <span className="block text-xs uppercase tracking-[0.2em] text-white/45">Zona objetivo</span>
          <input name="targetArea" placeholder="Ej. Boca del Río, Veracruz, CDMX" className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-slate-950" />
        </label>
        <label className="space-y-2 text-sm text-white/82 lg:col-span-2">
          <span className="block text-xs uppercase tracking-[0.2em] text-white/45">Notas</span>
          <textarea name="notes" rows={3} placeholder="Qué quieres vender, perfil del comprador, fechas o restricciones." className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-slate-950" />
        </label>
        {state.message ? <p className={`rounded-2xl border px-4 py-3 text-sm lg:col-span-2 ${state.success ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-rose-300 bg-rose-50 text-rose-800"}`}>{state.message}</p> : null}
        <button disabled={pending} className="rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-semibold text-[#17120e] transition hover:bg-[#e2b86d] disabled:opacity-60">
          {pending ? "Enviando..." : "Solicitar campaña"}
        </button>
      </form>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {requests.slice(0, 4).map((request) => (
          <article key={request.id} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm">
            <p className="font-semibold">{request.channels.join(", ") || "Canales pendientes"} · {request.status}</p>
            <p className="mt-1 text-white/58">{request.property_title ?? "Campaña general"} · {request.monthly_budget_mxn ? `$${request.monthly_budget_mxn.toLocaleString("es-MX")} MXN` : "Presupuesto por definir"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AdminPublicBrandingManager({ workspace, properties = [], adCampaignRequests = [], showAdvertising = true }: {
  workspace: WorkspaceBrandingRecord;
  properties?: Array<{ id: string; title: string; status: string }>;
  adCampaignRequests?: AdCampaignRequestRecord[];
  showAdvertising?: boolean;
}) {
  const [state, action, pending] = useActionState(updateWorkspaceBrandingAction, initialState);
  const [logoUrl, setLogoUrl] = useState(workspace.publicLogoUrl ?? "");
  const [heroUrl, setHeroUrl] = useState(workspace.publicHeroUrl ?? "");
  const [clientMessage, setClientMessage] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isUploading, startUploadTransition] = useTransition();
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const supabase = createSupabaseBrowserClient();

  async function uploadImage(file: File, kind: "logo" | "hero") {
    if (!workspace.workspaceId) throw new Error("No hay workspace activo.");
    if (!file.type.startsWith("image/")) throw new Error("Solo puedes subir imágenes válidas.");
    if (file.size > MAX_IMAGE_FILE_SIZE_MB * 1024 * 1024) throw new Error(`La imagen supera ${MAX_IMAGE_FILE_SIZE_MB} MB.`);

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeName = file.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const path = `${workspace.workspaceId}/branding/${kind}-${Date.now()}-${crypto.randomUUID()}-${safeName || `image.${extension}`}`;

    const { error } = await supabase.storage.from("property-images").upload(path, file, {
      upsert: false,
      contentType: file.type,
    });

    if (error) throw new Error(error.message);
    return supabase.storage.from("property-images").getPublicUrl(path).data.publicUrl;
  }

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>, kind: "logo" | "hero") {
    const file = event.target.files?.[0];
    if (!file) return;

    setClientError(null);
    setClientMessage(null);

    startUploadTransition(async () => {
      try {
        const url = await uploadImage(file, kind);
        if (kind === "logo") setLogoUrl(url);
        else setHeroUrl(url);
        setClientMessage(kind === "logo" ? "Logo cargado correctamente." : "Imagen hero cargada correctamente.");
      } catch (error) {
        setClientError(error instanceof Error ? error.message : "No pudimos subir la imagen.");
      } finally {
        if (kind === "logo" && logoInputRef.current) logoInputRef.current.value = "";
        if (kind === "hero" && heroInputRef.current) heroInputRef.current.value = "";
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:rounded-[2rem] sm:p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <p className="text-xs uppercase tracking-[0.24em] text-[#9b6f21]">Escaparate público</p>
        <h3 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Marca, contacto e imagen de la inmobiliaria</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Esta es la cara pública del negocio. El logo, la portada y el WhatsApp deben verse suficientemente claros para que un comprador confíe antes de escribir.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="overflow-hidden rounded-[2rem] border border-[#e7dccb] bg-[#17120e] text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
          <div className="relative min-h-72">
            {heroUrl ? <Image src={heroUrl} alt="Vista previa pública" fill className="object-cover opacity-55" unoptimized /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,#6f5a3a_0%,#201915_48%,#0f1117_100%)]" />}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,10,8,0.82)_0%,rgba(12,10,8,0.38)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="mb-6 flex h-20 w-32 items-center justify-center rounded-[1.4rem] border border-white/15 bg-white/86 p-3">
                {logoUrl ? <Image src={logoUrl} alt="Logo" width={180} height={80} className="max-h-full w-auto object-contain" unoptimized /> : <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Logo</span>}
              </div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#d7ab5b]">Vista previa</p>
              <h4 className="mt-3 max-w-lg text-3xl font-semibold leading-tight">{workspace.brandName ?? workspace.workspaceName ?? "Tu inmobiliaria"}</h4>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/72">{workspace.publicClaim ?? "Claim comercial de la inmobiliaria"}</p>
              {workspace.workspaceSlug ? <a href={`/w/${workspace.workspaceSlug}`} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-semibold text-[#17120e]">Abrir sitio público</a> : null}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Marca de la inmobiliaria", workspace.brandName ? "Lista" : "Pendiente"],
            ["Logo visible", logoUrl ? "Listo" : "Pendiente"],
            ["Imagen de portada", heroUrl ? "Lista" : "Pendiente"],
            ["WhatsApp comercial", workspace.publicWhatsapp || workspace.publicPhone ? "Listo" : "Pendiente"],
          ].map(([label, status]) => (
            <div key={label} className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
              <p className={`mt-3 text-lg font-semibold ${status === "Listo" || status === "Lista" ? "text-emerald-700" : "text-amber-700"}`}>{status}</p>
            </div>
          ))}
        </div>
      </div>

      <form action={action} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:rounded-[2rem] sm:p-6 shadow-sm shadow-slate-200/30 space-y-6">
        <input type="hidden" name="publicLogoUrl" value={logoUrl} />
        <input type="hidden" name="publicHeroUrl" value={heroUrl} />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Nombre comercial</span>
            <input name="brandName" defaultValue={workspace.brandName ?? workspace.workspaceName ?? ""} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-slate-950" />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Slug público principal</span>
            <input name="workspaceSlug" defaultValue={workspace.workspaceSlug ?? ""} placeholder="ej. sarita-homes" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-slate-950" />
            <span className="block text-xs leading-5 text-slate-500">Define la URL principal de la inmobiliaria: /w/slug-de-la-inmobiliaria. Usa minúsculas, números y guiones.</span>
          </label>
          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Claim</span>
            <input name="publicClaim" defaultValue={workspace.publicClaim ?? ""} placeholder="Ej. Propiedades bien elegidas, atención clara." className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-slate-950" />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Teléfono</span>
            <input name="publicPhone" defaultValue={workspace.publicPhone ?? ""} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-slate-950" />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">WhatsApp</span>
            <input name="publicWhatsapp" defaultValue={workspace.publicWhatsapp ?? ""} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-slate-950" />
          </label>
          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Email</span>
            <input name="publicEmail" defaultValue={workspace.publicEmail ?? ""} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-slate-950" />
          </label>
          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Bio institucional</span>
            <textarea name="publicBio" rows={4} defaultValue={workspace.publicBio ?? ""} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-slate-950" />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Servicios</span>
            <textarea name="publicServices" rows={4} defaultValue={workspace.publicServices ?? ""} placeholder="Venta residencial&#10;Renta de propiedades&#10;Asesoría para inversión" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-slate-950" />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Confianza / experiencia</span>
            <textarea name="publicTrustPoints" rows={4} defaultValue={workspace.publicTrustPoints ?? ""} placeholder="Atención personalizada&#10;Acompañamiento legal&#10;Inventario verificado" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-slate-950" />
          </label>
          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Dirección / zona de atención</span>
            <input name="publicAddress" defaultValue={workspace.publicAddress ?? ""} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-slate-950" />
          </label>
          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Link de Google Maps</span>
            <input name="publicMapsUrl" defaultValue={workspace.publicMapsUrl ?? ""} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-slate-950" />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Facebook</span>
            <input name="publicFacebookUrl" defaultValue={workspace.publicFacebookUrl ?? ""} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-slate-950" />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Instagram</span>
            <input name="publicInstagramUrl" defaultValue={workspace.publicInstagramUrl ?? ""} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-slate-950" />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Google Business</span>
            <input name="publicGoogleBusinessUrl" defaultValue={workspace.publicGoogleBusinessUrl ?? ""} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-slate-950" />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Aviso de privacidad</span>
            <input name="publicPrivacyUrl" defaultValue={workspace.publicPrivacyUrl ?? ""} placeholder="URL a PDF o página legal" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-slate-950" />
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Logo</p>
            <div className="mt-4 space-y-4">
              <div className="relative flex min-h-36 w-full items-center justify-center overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white px-6 py-5 shadow-sm">
                {logoUrl ? <Image src={logoUrl} alt="Logo" width={420} height={180} className="max-h-28 w-auto max-w-full object-contain" unoptimized /> : <span className="text-xs text-slate-400">Sin logo</span>}
              </div>
              <div className="space-y-3">
                <input ref={logoInputRef} type="file" accept="image/*" onChange={(event) => handleUpload(event, "logo")} className="block text-sm text-slate-600" />
                <p className="text-xs leading-5 text-slate-500">Usaremos este logo grande en la home pública y en una versión compacta en navegación. Ideal: PNG/WebP transparente, bien recortado, mínimo 800 px de ancho.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Imagen hero</p>
            <div className="mt-4 space-y-3">
              <div className="relative h-36 overflow-hidden rounded-2xl bg-white border border-slate-200">
                {heroUrl ? <Image src={heroUrl} alt="Hero" fill className="object-cover" unoptimized /> : <div className="flex h-full items-center justify-center text-xs text-slate-400">Sin imagen hero</div>}
              </div>
              <input ref={heroInputRef} type="file" accept="image/*" onChange={(event) => handleUpload(event, "hero")} className="block text-sm text-slate-600" />
            </div>
          </div>
        </div>

        {clientMessage ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{clientMessage}</p> : null}
        {clientError ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{clientError}</p> : null}
        {state.message ? <p className={`rounded-2xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{state.message}</p> : null}

        <button disabled={pending || isUploading} className="w-full rounded-full bg-[#d7ab5b] px-5 py-3 text-center text-sm sm:w-auto font-medium text-white transition hover:bg-[#c99a46] disabled:opacity-60">
          {pending || isUploading ? "Guardando..." : "Guardar marca de la inmobiliaria"}
        </button>
      </form>

      {showAdvertising ? <AdvertisingRequestManager properties={properties} requests={adCampaignRequests} /> : null}
    </div>
  );
}

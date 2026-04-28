"use client";

import Image from "next/image";
import { useActionState, useRef, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { updateWorkspaceBrandingAction, type WorkspaceBrandingState } from "@/app/admin/actions";

const initialState: WorkspaceBrandingState = { success: false, message: "" };
const MAX_IMAGE_FILE_SIZE_MB = 8;

export function AdminPublicBrandingManager({ workspace }: { workspace: any }) {
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
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Área Pública</p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-950">Branding de la inmobiliaria</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Configura la presencia básica de la marca para que el sitio público se sienta comercial y humano.</p>
      </div>

      <form action={action} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30 space-y-6">
        <input type="hidden" name="publicLogoUrl" value={logoUrl} />
        <input type="hidden" name="publicHeroUrl" value={heroUrl} />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Nombre comercial</span>
            <input name="brandName" defaultValue={workspace.brandName ?? workspace.workspaceName ?? ""} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950" />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Frase principal</span>
            <input name="publicClaim" defaultValue={workspace.publicClaim ?? ""} placeholder="Ej. Propiedades bien elegidas, atención clara." className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950" />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Teléfono</span>
            <input name="publicPhone" defaultValue={workspace.publicPhone ?? ""} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950" />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">WhatsApp</span>
            <input name="publicWhatsapp" defaultValue={workspace.publicWhatsapp ?? ""} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950" />
          </label>
          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Email</span>
            <input name="publicEmail" defaultValue={workspace.publicEmail ?? ""} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950" />
          </label>
          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Texto institucional breve</span>
            <textarea name="publicBio" rows={4} defaultValue={workspace.publicBio ?? ""} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950" />
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Logo</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-white border border-slate-200">
                {logoUrl ? <Image src={logoUrl} alt="Logo" fill className="object-contain p-3" unoptimized /> : <span className="text-xs text-slate-400">Sin logo</span>}
              </div>
              <div className="space-y-3">
                <input ref={logoInputRef} type="file" accept="image/*" onChange={(event) => handleUpload(event, "logo")} className="block text-sm text-slate-600" />
                <p className="text-xs text-slate-500">Usaremos este logo en home pública y navegación.</p>
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

        <button disabled={pending || isUploading} className="rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c99a46] disabled:opacity-60">
          {pending || isUploading ? "Guardando..." : "Guardar branding público"}
        </button>
      </form>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useMemo, useRef, useState, useTransition } from "react";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  deletePropertyImageAction,
  type PropertyFormState,
  updatePropertyAction,
  updatePropertyImagesAction,
  updatePropertyStatusAction,
  createPropertyAction,
} from "@/app/admin/actions";
import { useActiveWorkspace } from "@/components/providers/WorkspaceProvider";
import type { AgentOption, PropertyRecord } from "@/lib/admin-types";

type SharedProps = {
  workspaceName: string | null | undefined;
  properties: PropertyRecord[];
  agents: AgentOption[];
};

type GalleryImageDraft = {
  id?: string;
  storage_path: string;
  alt_text: string;
  sort_order: number;
  is_cover: boolean;
  previewUrl: string;
};

const initialState: PropertyFormState = { success: false, message: "" };

const propertyTypes = ["house", "apartment", "land", "office", "commercial", "warehouse", "building", "development", "mixed_use"];
const operationTypes = ["sale", "rent", "both"];
const statuses = ["draft", "active", "pending", "sold", "rented", "archived"];
const suggestedPhotoShots = ["Fachada", "Sala", "Cocina", "Recámara principal", "Baño principal"];

function normalizeText(value?: string | null) {
  return (value ?? "").toLowerCase();
}

function getPhotoCoverageFromDraft(images: Array<{ storage_path: string; alt_text?: string | null }>) {
  const combinedText = images.map((image) => `${normalizeText(image.storage_path)} ${normalizeText(image.alt_text)}`).join(" ");

  const checks = suggestedPhotoShots.map((label) => {
    const tokensByLabel: Record<string, string[]> = {
      Fachada: ["fachada", "frente", "exterior", "front"],
      Sala: ["sala", "living", "estancia"],
      Cocina: ["cocina", "kitchen"],
      "Recámara principal": ["recamara", "recámara", "habitacion principal", "habitación principal", "master", "bedroom"],
      "Baño principal": ["bano", "baño", "bathroom", "bath"],
    };

    const tokens = tokensByLabel[label] ?? [label.toLowerCase()];
    const covered = tokens.some((token) => combinedText.includes(token));

    return { label, covered };
  });

  const coveredCount = checks.filter((item) => item.covered).length;
  const completion = Math.round((coveredCount / checks.length) * 100);

  return {
    checks,
    coveredCount,
    completion,
    totalImages: images.length,
  };
}

function getPhotoCoverage(property: PropertyRecord) {
  return getPhotoCoverageFromDraft(property.property_images ?? []);
}

function formatImagePublicUrl(path: string) {
  const supabase = createSupabaseBrowserClient();
  const { data } = supabase.storage.from("property-images").getPublicUrl(path);
  return data.publicUrl;
}

function Field({
  label,
  name,
  defaultValue,
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="space-y-2 text-sm text-stone-700">
      <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
      />
    </label>
  );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/40 ${className}`}>{children}</div>;
}

function PropertiesHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Propiedades</p>
        <h3 className="mt-2 text-2xl font-semibold text-stone-950">{title}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{description}</p>
      </div>
      {action}
    </div>
  );
}

function PropertyForm({
  mode,
  property,
  agents,
  activeRole,
  ownAgentId,
}: {
  mode: "create" | "edit";
  property?: PropertyRecord;
  agents: AgentOption[];
  activeRole?: string | null;
  ownAgentId?: string | null;
}) {
  const action = mode === "create" ? createPropertyAction : updatePropertyAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const canManageAssignments = activeRole === "owner" || activeRole === "admin";
  const visibleAgents = canManageAssignments
    ? agents
    : agents.filter((agent) => !ownAgentId || agent.id === ownAgentId);

  return (
    <form action={formAction} className="space-y-5 rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/40">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{mode === "create" ? "Nueva propiedad" : "Editar propiedad"}</p>
          <h3 className="mt-2 text-xl font-semibold text-stone-950">{mode === "create" ? "Alta de propiedad" : property?.title}</h3>
          <p className="mt-2 text-sm text-stone-600">
            {mode === "create"
              ? "Captura una nueva propiedad en una vista enfocada y separada del listado principal."
              : "Edita la información comercial y visual de esta propiedad en una vista dedicada."}
          </p>
        </div>
      </div>

      {mode === "edit" ? <input type="hidden" name="propertyId" defaultValue={property?.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Título" name="title" defaultValue={property?.title} required placeholder="Casa amplia en zona norte" />
        <Field label="Slug" name="slug" defaultValue={property?.slug} placeholder="casa-amplia-zona-norte" />
        <Field label="Clave pública" name="publicCode" defaultValue={property?.public_code} placeholder="SH-102" />
        <Field label="Ubicación corta" name="locationLabel" defaultValue={property?.location_label} required placeholder="Lomas del Valle" />
        <Field label="Ciudad" name="city" defaultValue={property?.city} />
        <Field label="Estado" name="state" defaultValue={property?.state} />
        <Field label="Colonia / zona" name="neighborhood" defaultValue={property?.neighborhood} />
        <Field label="Dirección" name="addressLine" defaultValue={property?.address_line} />
        <Field label="Precio" name="priceAmount" defaultValue={property?.price_amount} />
        <Field label="Moneda" name="currencyCode" defaultValue={property?.currency_code ?? "MXN"} />
        <Field label="País" name="countryCode" defaultValue={property?.country_code ?? "MX"} />
        <Field label="Recámaras" name="bedrooms" defaultValue={property?.bedrooms} />
        <Field label="Baños" name="bathrooms" defaultValue={property?.bathrooms} />
        <Field label="Estacionamientos" name="parkingSpots" defaultValue={property?.parking_spots} />
        <Field label="Terreno m²" name="lotAreaM2" defaultValue={property?.lot_area_m2} />
        <Field label="Construcción m²" name="constructionAreaM2" defaultValue={property?.construction_area_m2} />
      </div>

      <label className="space-y-2 text-sm text-stone-700">
        <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Descripción</span>
        <textarea
          name="description"
          defaultValue={property?.description ?? ""}
          rows={4}
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
          placeholder="Describe lo más atractivo de la propiedad, su distribución y el valor comercial más claro."
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm text-stone-700">
          <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Tipo</span>
          <select name="propertyType" defaultValue={property?.property_type ?? "house"} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950">
            {propertyTypes.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-stone-700">
          <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Operación</span>
          <select name="operationType" defaultValue={property?.operation_type ?? "sale"} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950">
            {operationTypes.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-stone-700">
          <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Estatus</span>
          <select name="status" defaultValue={property?.status ?? "draft"} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950">
            {statuses.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-stone-700">
          <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Agente</span>
          <select
            name="agentId"
            defaultValue={property?.agent_id ?? ownAgentId ?? ""}
            disabled={!canManageAssignments}
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 disabled:bg-stone-100 disabled:text-stone-500"
          >
            <option value="">Sin asignar</option>
            {visibleAgents.map((agent) => (
              <option key={agent.id} value={agent.id}>{agent.display_name}</option>
            ))}
          </select>
          {!canManageAssignments ? (
            <p className="text-xs leading-5 text-stone-500">Tu rol no puede reasignar propiedades. La propiedad se guarda dentro de tu ámbito operativo.</p>
          ) : null}
        </label>
      </div>

      <label className="inline-flex items-center gap-3 text-sm text-stone-700">
        <input type="checkbox" name="isFeatured" defaultChecked={property?.is_featured ?? false} className="size-4 rounded border-stone-300 bg-white" />
        Marcar como destacada
      </label>

      {state.message ? (
        <p className={`rounded-2xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button disabled={pending} className="rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c99a46] disabled:opacity-60">
          {pending ? "Guardando..." : mode === "create" ? "Crear propiedad" : "Guardar cambios"}
        </button>
        <Link href="/admin/properties" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100">
          Volver al listado
        </Link>
      </div>
    </form>
  );
}

function PropertyImagesManager({ property }: { property: PropertyRecord }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { activeWorkspace } = useActiveWorkspace();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [gallery, setGallery] = useState<GalleryImageDraft[]>(() =>
    (property.property_images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image, index) => ({
        id: image.id,
        storage_path: image.storage_path,
        alt_text: image.alt_text ?? "",
        sort_order: index,
        is_cover: image.is_cover,
        previewUrl: formatImagePublicUrl(image.storage_path),
      })),
  );
  const [isUploading, startUploadTransition] = useTransition();
  const [isSavingGallery, startSaveTransition] = useTransition();
  const [clientMessage, setClientMessage] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const coverage = useMemo(() => getPhotoCoverageFromDraft(gallery), [gallery]);

  function normalizeGallery(nextGallery: GalleryImageDraft[]) {
    const coverIndex = nextGallery.findIndex((image) => image.is_cover);

    return nextGallery.map((image, index) => ({
      ...image,
      sort_order: index,
      is_cover: coverIndex === -1 ? index === 0 : index === coverIndex,
    }));
  }

  function updateGallery(nextGallery: GalleryImageDraft[]) {
    setGallery(normalizeGallery(nextGallery));
  }

  function handleSelectCover(index: number) {
    updateGallery(gallery.map((image, currentIndex) => ({ ...image, is_cover: currentIndex === index })));
  }

  function moveImage(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= gallery.length) return;

    const nextGallery = [...gallery];
    const [current] = nextGallery.splice(index, 1);
    nextGallery.splice(nextIndex, 0, current);
    updateGallery(nextGallery);
  }

  function removeFromGallery(index: number) {
    const image = gallery[index];

    startSaveTransition(async () => {
      try {
        if (image.id) {
          const formData = new FormData();
          formData.set("imageId", image.id);
          formData.set("storagePath", image.storage_path);
          await deletePropertyImageAction(formData);
        } else {
          await supabase.storage.from("property-images").remove([image.storage_path]);
        }

        updateGallery(gallery.filter((_, currentIndex) => currentIndex !== index));
        setClientMessage("Foto eliminada.");
        setClientError(null);
      } catch {
        setClientError("No pudimos eliminar la foto. Intenta de nuevo.");
        setClientMessage(null);
      }
    });
  }

  async function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length || !activeWorkspace?.workspaceId) return;

    setClientError(null);
    setClientMessage(null);

    startUploadTransition(async () => {
      const uploaded: GalleryImageDraft[] = [];

      try {
        for (const file of files) {
          if (!file.type.startsWith("image/")) {
            throw new Error(`El archivo ${file.name} no es una imagen válida.`);
          }

          if (!property.id || !activeWorkspace.workspaceId) {
            throw new Error("Primero guarda la propiedad antes de subir fotos.");
          }

          const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
          const safeName = file.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9.]+/g, "-")
            .replace(/(^-|-$)/g, "");

          const path = `${activeWorkspace.workspaceId}/${property.id}/${Date.now()}-${crypto.randomUUID()}-${safeName || `image.${extension}`}`;

          const { error } = await supabase.storage.from("property-images").upload(path, file, {
            upsert: false,
            contentType: file.type,
          });

          if (error) throw new Error(error.message);

          uploaded.push({
            storage_path: path,
            alt_text: "",
            sort_order: gallery.length + uploaded.length - 1,
            is_cover: gallery.length === 0 && uploaded.length === 1,
            previewUrl: URL.createObjectURL(file),
          });
        }

        updateGallery([...gallery, ...uploaded]);
        setClientMessage(`${uploaded.length} foto(s) cargada(s). Guarda la galería para confirmar orden y portada.`);
      } catch (error) {
        if (uploaded.length) {
          await supabase.storage.from("property-images").remove(uploaded.map((image) => image.storage_path));
        }

        const message = error instanceof Error ? error.message : "No pudimos subir las fotos.";

        if (message.toLowerCase().includes("row-level security") || message.toLowerCase().includes("permission")) {
          setClientError("Tu sesión no tiene permiso para subir fotos a este workspace. Revisa la configuración del bucket o vuelve a iniciar sesión.");
        } else if (message.toLowerCase().includes("duplicate")) {
          setClientError("Ya existe una foto con ese nombre. Intenta subirla otra vez.");
        } else {
          setClientError(message);
        }
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  }

  function handleAltTextChange(index: number, value: string) {
    updateGallery(gallery.map((image, currentIndex) => (currentIndex === index ? { ...image, alt_text: value } : image)));
  }

  function saveGallery() {
    setClientError(null);
    setClientMessage(null);

    startSaveTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("propertyId", property.id);
        formData.set(
          "images",
          JSON.stringify(
            gallery.map((image, index) => ({
              id: image.id,
              storage_path: image.storage_path,
              alt_text: image.alt_text,
              sort_order: index,
              is_cover: image.is_cover,
            })),
          ),
        );

        await updatePropertyImagesAction(formData);
        setClientMessage("Galería guardada correctamente.");
      } catch {
        setClientError("No pudimos guardar el orden de la galería. Intenta de nuevo.");
      }
    });
  }

  return (
    <SectionCard>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Fotos de la propiedad</p>
          <h3 className="mt-2 text-xl font-semibold text-stone-950">Galería visual</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Trabaja la galería en una vista enfocada: sube, revisa, ordena y define la portada principal sin mezclarlo con el listado general.
          </p>
        </div>
        <div className="min-w-[180px] rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Completitud visual</p>
          <p className="mt-2 text-3xl font-semibold text-amber-950">{coverage.completion}%</p>
          <p className="mt-1 text-sm text-amber-800">{coverage.coveredCount} de {coverage.checks.length} vistas sugeridas</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <p className="text-sm font-semibold text-stone-900">Checklist visual sugerido</p>
          <div className="mt-4 space-y-3">
            {coverage.checks.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm">
                <span className="text-stone-800">{item.label}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.covered ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-600"}`}>
                  {item.covered ? "Cubierta" : "Pendiente"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <p className="text-sm font-semibold text-stone-900">Cómo usar esta galería</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-600">
            <li>• Sube una o varias fotos.</li>
            <li>• Usa la vista previa para revisar la galería.</li>
            <li>• Ordena visualmente con subir y bajar.</li>
            <li>• Marca la foto principal como portada.</li>
            <li>• Guarda la galería para confirmar orden y portada.</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-stone-900">Agregar fotos</p>
            <p className="mt-2 text-sm text-stone-600">Acepta múltiples imágenes para construir la galería de una propiedad.</p>
          </div>
          <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c99a46]">
            {isUploading ? "Subiendo..." : "Seleccionar fotos"}
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelection} />
          </label>
        </div>
      </div>

      {clientMessage ? <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{clientMessage}</p> : null}
      {clientError ? <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{clientError}</p> : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {gallery.length ? (
          gallery.map((image, index) => (
            <div key={`${image.storage_path}-${index}`} className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm shadow-stone-200/30">
              <div className="relative aspect-[4/3] bg-stone-100">
                <Image src={image.previewUrl} alt={image.alt_text || `Foto ${index + 1}`} fill className="object-cover" unoptimized />
                {image.is_cover ? (
                  <span className="absolute left-3 top-3 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">Portada</span>
                ) : null}
              </div>
              <div className="space-y-3 p-4">
                <label className="space-y-2 text-sm text-stone-700">
                  <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Descripción</span>
                  <input
                    value={image.alt_text}
                    onChange={(event) => handleAltTextChange(index, event.target.value)}
                    placeholder="Ej. Fachada principal"
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                  />
                </label>
                <p className="text-xs text-stone-500">Orden visual: {index + 1}</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} className="rounded-full border border-stone-200 px-3 py-2 text-xs text-stone-700 transition hover:bg-stone-50 disabled:opacity-40">
                    Subir
                  </button>
                  <button type="button" onClick={() => moveImage(index, 1)} disabled={index === gallery.length - 1} className="rounded-full border border-stone-200 px-3 py-2 text-xs text-stone-700 transition hover:bg-stone-50 disabled:opacity-40">
                    Bajar
                  </button>
                  <button type="button" onClick={() => handleSelectCover(index)} className="rounded-full border border-stone-200 px-3 py-2 text-xs text-stone-700 transition hover:bg-stone-50">
                    {image.is_cover ? "Portada activa" : "Usar como portada"}
                  </button>
                  <button type="button" onClick={() => removeFromGallery(index)} className="rounded-full border border-rose-200 px-3 py-2 text-xs text-rose-700 transition hover:bg-rose-50">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-sm text-stone-500 md:col-span-2 xl:col-span-3">
            Todavía no hay fotos cargadas. Empieza por fachada, sala y cocina para mejorar rápido la presentación.
          </div>
        )}
      </div>

      {gallery.length ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={saveGallery} disabled={isSavingGallery} className="rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c99a46] disabled:opacity-60">
            {isSavingGallery ? "Guardando galería..." : "Guardar orden y portada"}
          </button>
        </div>
      ) : null}
    </SectionCard>
  );
}

export function AdminPropertiesIndex({ workspaceName, properties }: Pick<SharedProps, "workspaceName" | "properties">) {
  return (
    <div className="space-y-6">
      <PropertiesHeader
        title="Listado de propiedades"
        description="Aquí vive el inventario real del workspace. Desde esta vista priorizas lo existente y entras a editar cada propiedad por separado."
        action={
          <Link href="/admin/properties/new" className="rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c99a46]">
            Agregar propiedad
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <SectionCard>
          <p className="text-sm text-stone-500">Workspace activo</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{workspaceName ?? "Sin workspace"}</p>
        </SectionCard>
        <SectionCard>
          <p className="text-sm text-stone-500">Propiedades registradas</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{properties.length}</p>
        </SectionCard>
        <SectionCard>
          <p className="text-sm text-stone-500">Activas</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{properties.filter((property) => property.status === "active").length}</p>
        </SectionCard>
        <SectionCard>
          <p className="text-sm text-stone-500">Con fotos</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{properties.filter((property) => property.property_images.length > 0).length}</p>
        </SectionCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {properties.length ? (
          properties.map((property) => {
            const coverage = getPhotoCoverage(property);
            const coverImage = property.property_images.find((image) => image.is_cover) ?? property.property_images[0] ?? null;
            const publicWorkspaceSlug = workspaceName?.toLowerCase().replace(/[^a-z0-9]+/g, "-") ?? null;
            const specsInline = [
              property.bedrooms ? `${property.bedrooms} recámaras` : null,
              property.bathrooms ? `${property.bathrooms} baños` : null,
              property.construction_area_m2 ? `${property.construction_area_m2} m²` : null,
            ].filter(Boolean).join(" · ");

            return (
              <article key={property.id} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <div className="relative h-64 bg-sky-50">
                  {coverImage ? <Image src={formatImagePublicUrl(coverImage.storage_path)} alt={coverImage.alt_text ?? property.title} fill className="object-cover" unoptimized /> : null}
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${property.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {property.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{property.operation_type}</p>
                    <Link href={`/admin/properties/${property.id}`} className="mt-2 block text-2xl font-semibold text-slate-950 transition hover:text-slate-700">
                      {property.title}
                    </Link>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {property.location_label}
                      {property.city ? ` · ${property.city}` : ""}
                      {property.state ? `, ${property.state}` : ""}
                    </p>
                  </div>
                  <p className="text-lg font-medium text-slate-950">{property.currency_code} {property.price_amount?.toLocaleString("es-MX") ?? "—"}</p>
                  {specsInline ? <p className="text-sm text-slate-500">{specsInline}</p> : null}
                  <p className="text-xs text-slate-500">Cobertura visual: {coverage.completion}%</p>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/admin/properties/${property.id}`} className="rounded-full bg-[#d7ab5b] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#c99a46]">
                      Editar
                    </Link>
                    <a href={publicWorkspaceSlug ? `/w/${publicWorkspaceSlug}/properties/${property.slug}` : `/properties/${property.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                      Ver pública
                    </a>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-sm text-stone-500 md:col-span-2 xl:col-span-3">
            Todavía no hay propiedades registradas. Empieza creando la primera desde “Agregar propiedad”.
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminPropertyCreateView({ agents }: Pick<SharedProps, "agents">) {
  const { activeWorkspace } = useActiveWorkspace();
  return (
    <div className="space-y-6">
      <PropertiesHeader
        title="Agregar propiedad"
        description="Crea una nueva propiedad en una vista enfocada y sin mezclarla con el inventario existente."
        action={
          <Link href="/admin/properties" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100">
            Volver al listado
          </Link>
        }
      />
      <PropertyForm mode="create" agents={agents} activeRole={activeWorkspace?.role} ownAgentId={null} />
    </div>
  );
}

export function AdminPropertyEditView({ property, agents }: { property: PropertyRecord; agents: AgentOption[] }) {
  const { activeWorkspace } = useActiveWorkspace();
  const coverage = getPhotoCoverage(property);

  return (
    <div className="space-y-6">
      <PropertiesHeader
        title={property.title}
        description="Edita la propiedad en una vista separada, con su información comercial y su galería visual en el mismo contexto de trabajo."
        action={
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/properties" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100">
              Volver al listado
            </Link>
            <Link href="/admin/properties/new" className="rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c99a46]">
              Agregar propiedad
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <SectionCard>
          <p className="text-sm text-stone-500">Estatus</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{property.status}</p>
        </SectionCard>
        <SectionCard>
          <p className="text-sm text-stone-500">Operación</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{property.operation_type}</p>
        </SectionCard>
        <SectionCard>
          <p className="text-sm text-stone-500">Fotos</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{property.property_images.length}</p>
        </SectionCard>
        <SectionCard>
          <p className="text-sm text-stone-500">Cobertura visual</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{coverage.completion}%</p>
        </SectionCard>
      </div>

      <div className="space-y-6 xl:grid xl:grid-cols-[0.95fr_1.05fr] xl:gap-6 xl:space-y-0">
        <PropertyForm mode="edit" property={property} agents={agents} activeRole={activeWorkspace?.role} ownAgentId={property.agent_id ?? null} />
        <div className="space-y-6">
          <SectionCard>
            <p className="text-sm font-semibold text-stone-900">Cambio rápido de estatus</p>
            <p className="mt-2 text-sm text-stone-600">Ajusta el estatus desde esta vista sin volver al listado general.</p>
            <form action={updatePropertyStatusAction} className="mt-4 flex flex-wrap gap-3">
              {activeWorkspace?.role !== "owner" && activeWorkspace?.role !== "admin" ? (
                <p className="w-full text-xs leading-5 text-stone-500">Si operas desde perfil comercial puedes mover la propiedad entre draft y active. Archivar, vender o cerrar queda reservado para owner/admin.</p>
              ) : null}
              <input type="hidden" name="propertyId" value={property.id} />
              <select name="status" defaultValue={property.status} className="rounded-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950">
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button className="rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c99a46]">Guardar estatus</button>
            </form>
          </SectionCard>
          <PropertyImagesManager property={property} />
        </div>
      </div>
    </div>
  );
}

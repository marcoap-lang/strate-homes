"use client";

import { useActionState, useState } from "react";
import {
  addPropertyImageAction,
  createPropertyAction,
  deletePropertyImageAction,
  type PropertyFormState,
  updatePropertyAction,
  updatePropertyStatusAction,
} from "@/app/admin/actions";

type AgentOption = {
  id: string;
  display_name: string;
  slug: string;
};

type PropertyRecord = {
  id: string;
  title: string;
  slug: string;
  property_type: string;
  status: string;
  operation_type: string;
  location_label: string;
  city: string | null;
  state: string | null;
  price_amount: number | null;
  currency_code: string;
  public_code: string | null;
  description?: string | null;
  address_line?: string | null;
  neighborhood?: string | null;
  country_code?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking_spots?: number | null;
  lot_area_m2?: number | null;
  construction_area_m2?: number | null;
  is_featured: boolean;
  agent_id: string | null;
  property_images: Array<{
    id: string;
    workspace_id: string;
    property_id: string;
    storage_bucket: string;
    storage_path: string;
    alt_text: string | null;
    sort_order: number;
    is_cover: boolean;
    created_at: string;
    updated_at: string;
  }>;
  agents?: { id: string; display_name: string } | { id: string; display_name: string }[] | null;
};

type Props = {
  workspaceName: string | null | undefined;
  properties: PropertyRecord[];
  agents: AgentOption[];
};

const initialState: PropertyFormState = { success: false, message: "" };

const propertyTypes = ["house", "apartment", "land", "office", "commercial", "warehouse", "building", "development", "mixed_use"];
const operationTypes = ["sale", "rent", "both"];
const statuses = ["draft", "active", "pending", "sold", "rented", "archived"];

function Field({ label, name, defaultValue, required = false }: { label: string; name: string; defaultValue?: string | number | null; required?: boolean }) {
  return (
    <label className="space-y-2 text-sm text-white/80">
      <span className="block text-xs uppercase tracking-[0.2em] text-white/40">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
      />
    </label>
  );
}

function PropertyForm({
  mode,
  property,
  agents,
}: {
  mode: "create" | "edit";
  property?: PropertyRecord;
  agents: AgentOption[];
}) {
  const action = mode === "create" ? createPropertyAction : updatePropertyAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">{mode === "create" ? "Nueva propiedad" : "Editar propiedad"}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{mode === "create" ? "Captura inicial" : property?.title}</h3>
        </div>
      </div>

      {mode === "edit" ? <input type="hidden" name="propertyId" defaultValue={property?.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Título" name="title" defaultValue={property?.title} required />
        <Field label="Slug" name="slug" defaultValue={property?.slug} />
        <Field label="Clave pública" name="publicCode" defaultValue={property?.public_code} />
        <Field label="Ubicación corta" name="locationLabel" defaultValue={property?.location_label} required />
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

      <label className="space-y-2 text-sm text-white/80">
        <span className="block text-xs uppercase tracking-[0.2em] text-white/40">Descripción</span>
        <textarea
          name="description"
          defaultValue={property?.description ?? ""}
          rows={4}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm text-white/80">
          <span className="block text-xs uppercase tracking-[0.2em] text-white/40">Tipo</span>
          <select name="propertyType" defaultValue={property?.property_type ?? "house"} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white">
            {propertyTypes.map((option) => (
              <option key={option} value={option} className="text-black">
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-white/80">
          <span className="block text-xs uppercase tracking-[0.2em] text-white/40">Operación</span>
          <select name="operationType" defaultValue={property?.operation_type ?? "sale"} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white">
            {operationTypes.map((option) => (
              <option key={option} value={option} className="text-black">
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-white/80">
          <span className="block text-xs uppercase tracking-[0.2em] text-white/40">Estatus</span>
          <select name="status" defaultValue={property?.status ?? "draft"} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white">
            {statuses.map((option) => (
              <option key={option} value={option} className="text-black">
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-white/80">
          <span className="block text-xs uppercase tracking-[0.2em] text-white/40">Agente</span>
          <select name="agentId" defaultValue={property?.agent_id ?? ""} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white">
            <option value="" className="text-black">Sin asignar</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id} className="text-black">
                {agent.display_name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="inline-flex items-center gap-3 text-sm text-white/80">
        <input type="checkbox" name="isFeatured" defaultChecked={property?.is_featured ?? false} className="size-4 rounded border-white/20 bg-black/20" />
        Marcar como destacada
      </label>

      {state.message ? (
        <p className={`rounded-2xl px-4 py-3 text-sm ${state.success ? "bg-emerald-500/15 text-emerald-200" : "bg-rose-500/15 text-rose-200"}`}>
          {state.message}
        </p>
      ) : null}

      <button disabled={pending} className="rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-60">
        {pending ? "Guardando..." : mode === "create" ? "Crear propiedad" : "Guardar cambios"}
      </button>
    </form>
  );
}

function PropertyImagesManager({ property }: { property: PropertyRecord }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Imágenes</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Galería básica</h3>
      </div>

      <form action={addPropertyImageAction} className="mt-4 grid gap-4 md:grid-cols-2">
        <input type="hidden" name="propertyId" value={property.id} />
        <Field label="Storage path" name="storagePath" required />
        <Field label="Alt text" name="altText" />
        <Field label="Sort order" name="sortOrder" defaultValue={0} />
        <label className="inline-flex items-center gap-3 self-end text-sm text-white/80">
          <input type="checkbox" name="isCover" className="size-4 rounded border-white/20 bg-black/20" />
          Marcar como cover
        </label>
        <button className="rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 md:col-span-2 md:w-fit">
          Agregar imagen
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {property.property_images?.length ? (
          property.property_images
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((image) => (
              <div key={image.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                <div>
                  <p className="font-medium text-white">{image.storage_path}</p>
                  <p className="text-xs text-white/45">
                    {image.alt_text || "Sin alt text"} · order {image.sort_order} {image.is_cover ? "· cover" : ""}
                  </p>
                </div>
                <form action={deletePropertyImageAction}>
                  <input type="hidden" name="imageId" value={image.id} />
                  <button className="rounded-full border border-rose-400/30 px-4 py-2 text-xs text-rose-200 transition hover:bg-rose-500/10">
                    Eliminar
                  </button>
                </form>
              </div>
            ))
        ) : (
          <p className="text-sm text-white/45">Todavía no hay imágenes registradas.</p>
        )}
      </div>
    </div>
  );
}

export function AdminPropertiesManager({ workspaceName, properties, agents }: Props) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(properties[0]?.id ?? null);
  const selectedProperty = properties.find((property) => property.id === selectedPropertyId) ?? null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <p className="text-sm text-white/45">Workspace activo</p>
          <p className="mt-3 text-2xl font-semibold">{workspaceName ?? "Sin workspace"}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <p className="text-sm text-white/45">Propiedades registradas</p>
          <p className="mt-3 text-2xl font-semibold">{properties.length}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <p className="text-sm text-white/45">Agentes disponibles</p>
          <p className="mt-3 text-2xl font-semibold">{agents.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <PropertyForm mode="create" agents={agents} />

          <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Listado real</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Propiedades del workspace</h3>
            </div>
            <div className="mt-5 space-y-3">
              {properties.length ? (
                properties.map((property) => (
                  <div key={property.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <button onClick={() => setSelectedPropertyId(property.id)} className="text-left text-lg font-semibold text-white transition hover:text-zinc-300">
                          {property.title}
                        </button>
                        <p className="mt-1 text-sm text-white/50">
                          {property.location_label}
                          {property.city ? ` · ${property.city}` : ""}
                          {property.state ? `, ${property.state}` : ""}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/35">
                          {property.property_type} · {property.operation_type} · {property.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-white">
                          {property.currency_code} {property.price_amount?.toLocaleString("es-MX") ?? "—"}
                        </p>
                        <form action={updatePropertyStatusAction} className="mt-3 flex gap-2">
                          <input type="hidden" name="propertyId" value={property.id} />
                          <select name="status" defaultValue={property.status} className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white">
                            {statuses.map((status) => (
                              <option key={status} value={status} className="text-black">
                                {status}
                              </option>
                            ))}
                          </select>
                          <button className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/80 transition hover:bg-white/5">Cambiar</button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/45">Todavía no hay propiedades registradas en este workspace.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {selectedProperty ? (
            <>
              <PropertyForm mode="edit" property={selectedProperty} agents={agents} />
              <PropertyImagesManager property={selectedProperty} />
            </>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/45">
              Selecciona una propiedad del listado para editarla y gestionar imágenes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

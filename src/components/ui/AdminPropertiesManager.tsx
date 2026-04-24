"use client";

import { useActionState, useMemo, useState } from "react";
import {
  addPropertyImageAction,
  createPropertyAction,
  deletePropertyImageAction,
  type PropertyFormState,
  updatePropertyAction,
  updatePropertyStatusAction,
} from "@/app/admin/actions";
import type { AgentOption, PropertyRecord } from "@/lib/admin-types";

type Props = {
  workspaceName: string | null | undefined;
  properties: PropertyRecord[];
  agents: AgentOption[];
};

const initialState: PropertyFormState = { success: false, message: "" };

const propertyTypes = ["house", "apartment", "land", "office", "commercial", "warehouse", "building", "development", "mixed_use"];
const operationTypes = ["sale", "rent", "both"];
const statuses = ["draft", "active", "pending", "sold", "rented", "archived"];
const suggestedPhotoShots = ["Fachada", "Sala", "Cocina", "Recámara principal", "Baño principal"];

function normalizeText(value?: string | null) {
  return (value ?? "").toLowerCase();
}

function getPhotoCoverage(property: PropertyRecord) {
  const images = property.property_images ?? [];
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
    <form action={formAction} className="space-y-5 rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/40">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{mode === "create" ? "Nueva propiedad" : "Editar propiedad"}</p>
          <h3 className="mt-2 text-xl font-semibold text-stone-950">{mode === "create" ? "Captura inicial" : property?.title}</h3>
          <p className="mt-2 text-sm text-stone-600">
            {mode === "create"
              ? "Registra la base comercial de una propiedad para empezar a construir una publicación sólida."
              : "Ajusta la información clave y mejora la presentación general de esta propiedad."}
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
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-stone-700">
          <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Operación</span>
          <select name="operationType" defaultValue={property?.operation_type ?? "sale"} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950">
            {operationTypes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-stone-700">
          <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Estatus</span>
          <select name="status" defaultValue={property?.status ?? "draft"} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950">
            {statuses.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-stone-700">
          <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Agente</span>
          <select name="agentId" defaultValue={property?.agent_id ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950">
            <option value="">Sin asignar</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.display_name}
              </option>
            ))}
          </select>
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

      <button disabled={pending} className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60">
        {pending ? "Guardando..." : mode === "create" ? "Crear propiedad" : "Guardar cambios"}
      </button>
    </form>
  );
}

function PropertyImagesManager({ property }: { property: PropertyRecord }) {
  const coverage = useMemo(() => getPhotoCoverage(property), [property]);

  return (
    <SectionCard>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Fotos de la propiedad</p>
          <h3 className="mt-2 text-xl font-semibold text-stone-950">Galería guiada</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Carga la galería pensando en cobertura comercial: empieza por las vistas esenciales y luego completa con espacios secundarios.
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
          <p className="text-sm font-semibold text-stone-900">Guía rápida para cargar fotos</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-600">
            <li>• Empieza con una fachada clara para portada.</li>
            <li>• Usa alt text simple: “fachada principal”, “cocina integral”, “baño principal”.</li>
            <li>• Mantén el orden visual: portada primero, interiores clave después.</li>
            <li>• Este bloque ya deja lista una base para un uploader visual más completo después.</li>
          </ul>
          <div className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-4 text-sm text-stone-500">
            Próximo paso preparado: sustituir la captura manual por un uploader con arrastre, preview y orden visual.
          </div>
        </div>
      </div>

      <form action={addPropertyImageAction} className="mt-6 grid gap-4 md:grid-cols-2">
        <input type="hidden" name="propertyId" value={property.id} />
        <Field label="Ruta del archivo" name="storagePath" required placeholder="properties/casa-lomas/fachada-01.jpg" />
        <Field label="Descripción de la foto" name="altText" placeholder="Fachada principal" />
        <Field label="Orden" name="sortOrder" defaultValue={coverage.totalImages} />
        <label className="inline-flex items-center gap-3 self-end rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
          <input type="checkbox" name="isCover" className="size-4 rounded border-stone-300 bg-white" />
          Usar como portada
        </label>
        <button className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 md:col-span-2 md:w-fit">
          Agregar foto
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {property.property_images?.length ? (
          property.property_images
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((image) => (
              <div key={image.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
                <div>
                  <p className="font-medium text-stone-950">{image.storage_path}</p>
                  <p className="text-xs text-stone-500">
                    {image.alt_text || "Sin descripción"} · orden {image.sort_order} {image.is_cover ? "· portada" : ""}
                  </p>
                </div>
                <form action={deletePropertyImageAction}>
                  <input type="hidden" name="imageId" value={image.id} />
                  <button className="rounded-full border border-rose-200 px-4 py-2 text-xs text-rose-700 transition hover:bg-rose-50">
                    Eliminar
                  </button>
                </form>
              </div>
            ))
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-sm text-stone-500">
            Todavía no hay fotos registradas. Empieza por fachada, sala y cocina para mejorar rápido la presentación.
          </div>
        )}
      </div>
    </SectionCard>
  );
}

export function AdminPropertiesManager({ workspaceName, properties, agents }: Props) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(properties[0]?.id ?? null);
  const selectedProperty = properties.find((property) => property.id === selectedPropertyId) ?? null;
  const selectedCoverage = selectedProperty ? getPhotoCoverage(selectedProperty) : null;

  return (
    <div className="space-y-6">
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
          <p className="text-sm text-stone-500">Agentes disponibles</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{agents.length}</p>
        </SectionCard>
        <SectionCard>
          <p className="text-sm text-stone-500">Cobertura visual</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{selectedCoverage ? `${selectedCoverage.completion}%` : "—"}</p>
          <p className="mt-2 text-sm text-stone-600">{selectedProperty ? "de la propiedad seleccionada" : "selecciona una propiedad"}</p>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <PropertyForm mode="create" agents={agents} />

          <SectionCard>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Inventario real</p>
                <h3 className="mt-2 text-xl font-semibold text-stone-950">Propiedades del workspace</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Selecciona una propiedad para revisar su información, ajustar estatus y mejorar su galería visual.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {properties.length ? (
                properties.map((property) => {
                  const coverage = getPhotoCoverage(property);
                  const isSelected = property.id === selectedPropertyId;

                  return (
                    <div key={property.id} className={`rounded-2xl border p-4 transition ${isSelected ? "border-stone-900 bg-stone-950 text-white" : "border-stone-200 bg-stone-50"}`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <button
                            type="button"
                            onClick={() => setSelectedPropertyId(property.id)}
                            className={`text-left text-lg font-semibold transition ${isSelected ? "text-white" : "text-stone-950 hover:text-stone-700"}`}
                          >
                            {property.title}
                          </button>
                          <p className={`mt-1 text-sm ${isSelected ? "text-white/70" : "text-stone-500"}`}>
                            {property.location_label}
                            {property.city ? ` · ${property.city}` : ""}
                            {property.state ? `, ${property.state}` : ""}
                          </p>
                          <p className={`mt-2 text-xs uppercase tracking-[0.2em] ${isSelected ? "text-white/60" : "text-stone-400"}`}>
                            {property.property_type} · {property.operation_type} · {property.status}
                          </p>
                          <p className={`mt-3 text-xs ${isSelected ? "text-white/70" : "text-stone-500"}`}>
                            Fotos: {property.property_images.length} · Cobertura sugerida: {coverage.completion}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-medium ${isSelected ? "text-white" : "text-stone-950"}`}>
                            {property.currency_code} {property.price_amount?.toLocaleString("es-MX") ?? "—"}
                          </p>
                          <form action={updatePropertyStatusAction} className="mt-3 flex gap-2">
                            <input type="hidden" name="propertyId" value={property.id} />
                            <select name="status" defaultValue={property.status} className={`rounded-full border px-3 py-2 text-xs ${isSelected ? "border-white/20 bg-white/10 text-white" : "border-stone-200 bg-white text-stone-900"}`}>
                              {statuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                            <button className={`rounded-full border px-3 py-2 text-xs transition ${isSelected ? "border-white/20 text-white hover:bg-white/10" : "border-stone-200 text-stone-700 hover:bg-white"}`}>
                              Cambiar
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-stone-500">Todavía no hay propiedades registradas en este workspace.</p>
              )}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          {selectedProperty ? (
            <>
              <PropertyForm mode="edit" property={selectedProperty} agents={agents} />
              <PropertyImagesManager property={selectedProperty} />
            </>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-500">
              Selecciona una propiedad del listado para editarla y mejorar su cobertura visual.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

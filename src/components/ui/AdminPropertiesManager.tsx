"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  createPropertyAction,
  createPropertyLeadAction,
  deletePropertyImageAction,
  type PropertyFormState,
  type PropertyLeadCreateState,
  updatePropertyAction,
  updatePropertyImagesAction,
  updatePropertyStatusAction,
} from "@/app/admin/actions";
import { useActiveWorkspace } from "@/components/providers/WorkspaceProvider";
import type { AgentOption, PropertyRecord } from "@/lib/admin-types";
import { buildPublicPropertyUrl } from "@/lib/public-links";

type SharedProps = {
  workspaceName: string | null | undefined;
  workspaceSlug?: string | null | undefined;
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
  fileSizeLabel?: string;
};

const initialState: PropertyFormState = { success: false, message: "" };
const initialPropertyLeadCreateState: PropertyLeadCreateState = { success: false, message: "" };

const propertyTypes = ["house", "apartment", "land", "office", "commercial", "warehouse", "building", "development", "mixed_use"];
const operationTypes = ["sale", "rent", "both"];
const statuses = ["draft", "active", "pending", "sold", "rented", "archived"];
const suggestedPhotoShots = ["Fachada", "Sala", "Cocina", "Recámara principal", "Baño principal"];
const wizardSteps = ["Base", "Ubicación", "Características", "Fotos", "Descripción", "Publicación", "Revisión"] as const;
const descriptionTones = ["premium", "familiar", "inversion", "ejecutivo", "comercial"] as const;
const amenityOptions = [
  "terraza",
  "jardín",
  "alberca",
  "seguridad",
  "balcón",
  "roof garden",
  "vista al mar",
  "cocina integral",
  "cuarto de lavado",
  "estacionamiento techado",
  "portón eléctrico",
  "alta plusvalía",
  "cerca de playa",
  "cerca de centros comerciales",
  "ideal para inversión",
] as const;
const MAX_PROPERTY_IMAGES = 20;
const MAX_IMAGE_FILE_SIZE_MB = 8;
const MAX_IMAGE_DIMENSION = 2000;

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

function getPropertyTypeLabel(value?: string | null) {
  if (value === "house") return "casa";
  if (value === "apartment") return "departamento";
  if (value === "land") return "terreno";
  if (value === "office") return "oficina";
  if (value === "commercial") return "local comercial";
  return "propiedad";
}

function pickVariant(options: string[], seed: string) {
  const total = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return options[total % options.length];
}

function buildSuggestedDescription({
  type,
  tone,
  operation,
  location,
  price,
  bedrooms,
  bathrooms,
  area,
  advisor,
  amenities,
  extraFeatures,
}: {
  type: string;
  tone: string;
  operation: string;
  location: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  advisor: string;
  amenities: string[];
  extraFeatures: string;
}) {
  const typeLabel = getPropertyTypeLabel(type);
  const operationLabel = operation === "rent" ? "renta" : "venta";
  const specs = [
    bedrooms ? `${bedrooms} recámaras` : null,
    bathrooms ? `${bathrooms} baños` : null,
    area ? `${area} m²` : null,
  ].filter(Boolean).join(", ");
  const seed = `${tone}-${type}-${location}-${price}-${bedrooms}-${bathrooms}-${area}-${advisor}-${amenities.join("|")}-${extraFeatures}`;

  const variants: Record<string, { intros: string[]; bodies: string[]; closes: string[] }> = {
    premium: {
      intros: [
        `Descubre esta ${typeLabel} diseñada para quienes valoran ubicación, presencia y una experiencia patrimonial más aspiracional.`,
        `Esta ${typeLabel} proyecta una lectura elegante desde el primer contacto y se posiciona bien dentro de una búsqueda orientada a plusvalía.`,
      ],
      bodies: [
        `Su propuesta en ${location || "una zona atractiva"}${price ? `, con un precio de referencia de ${price},` : ""} la convierte en una opción con narrativa sólida para ${operationLabel}.`,
        `${location ? `Ubicada en ${location},` : ""}${price ? ` con un precio de ${price},` : ""} ofrece una combinación especialmente atractiva entre percepción, valor y proyección de largo plazo.`,
      ],
      closes: [
        `${specs ? `Además, ${specs} ayudan a sostener una experiencia residencial más completa. ` : ""}${advisor ? `${advisor} puede presentarla con una conversación más estratégica y orientada a valor.` : "Es una opción que puede destacar por su equilibrio entre presencia, funcionalidad y proyección."}`,
        `${specs ? `Sus atributos clave —${specs}— refuerzan una propuesta elegante y bien resuelta. ` : ""}Es una propiedad con argumentos claros para comunicar calidad, ubicación y plusvalía.`,
      ],
    },
    familiar: {
      intros: [
        `Una ${typeLabel} pensada para quienes buscan comodidad, espacios funcionales y una mejor vida diaria.`,
        `Esta ${typeLabel} destaca por ofrecer una base práctica para una rutina más cómoda y bien resuelta en familia.`,
      ],
      bodies: [
        `${location ? `En ${location},` : ""}${price ? ` con un precio de ${price},` : ""} reúne elementos que ayudan a imaginar una vida cotidiana más sencilla, cercana y ordenada.`,
        `${location ? `Su ubicación en ${location}` : "Su ubicación"}${price ? `, junto con un precio de referencia de ${price},` : ""} suma valor para quienes priorizan estabilidad, distribución y entorno.`,
      ],
      closes: [
        `${specs ? `Con ${specs},` : "Con una distribución clara,"} puede conectar bien con clientes que buscan practicidad, calidez y espacio suficiente para su etapa actual.`,
        `${specs ? `Sus espacios —${specs}—` : "Su distribución"} ayudan a sostener una experiencia más cómoda, funcional y cercana para la vida diaria.`,
      ],
    },
    inversion: {
      intros: [
        `Una ${typeLabel} con condiciones atractivas para quienes analizan plusvalía, ubicación y potencial comercial.`,
        `Esta ${typeLabel} se puede leer como una oportunidad alineada con criterios de ubicación, rentabilidad y resguardo de valor.`,
      ],
      bodies: [
        `${location ? `Ubicada en ${location},` : ""}${price ? ` con un precio de ${price},` : ""} ofrece un punto de entrada interesante para evaluar retorno, demanda y posición dentro de su zona.`,
        `${location ? `Su presencia en ${location}` : "Su ubicación"}${price ? ` y su referencia de ${price}` : ""} permiten construir una conversación enfocada en plusvalía, comparables y rentabilidad potencial.`,
      ],
      closes: [
        `${specs ? `Atributos como ${specs}` : "Sus atributos clave"} ayudan a sostener una propuesta más clara para compradores que valoran eficiencia de capital y proyección.`,
        `${advisor ? `${advisor} puede comunicarla mejor desde un ángulo de retorno, mercado y oportunidad. ` : ""}Es una opción que puede defenderse bien frente a clientes con mirada patrimonial o de inversión.`,
      ],
    },
    ejecutivo: {
      intros: [
        `Una ${typeLabel} orientada a quienes priorizan practicidad, conectividad y operación diaria eficiente.`,
        `Esta ${typeLabel} ofrece una lectura clara para perfiles que valoran funcionalidad, tiempos de traslado y uso práctico del espacio.`,
      ],
      bodies: [
        `${location ? `Desde ${location},` : ""}${price ? ` con un precio de ${price},` : ""} responde bien a una búsqueda donde ubicación, orden y desempeño del espacio pesan más que el discurso decorativo.`,
        `${location ? `Su base en ${location}` : "Su ubicación"}${price ? `, junto con un precio de ${price},` : ""} refuerza una propuesta orientada a eficiencia, conectividad y operación cotidiana.`,
      ],
      closes: [
        `${specs ? `Con ${specs},` : "Con una estructura funcional,"} puede conectar con clientes que quieren resolver su necesidad con claridad y sin fricción.`,
        `Es una opción especialmente útil para una conversación comercial enfocada en funcionalidad, movilidad y decisión práctica${specs ? `, apoyada por ${specs}` : ""}.`,
      ],
    },
    comercial: {
      intros: [
        `Una ${typeLabel} con lectura comercial clara para quien necesita visibilidad, operación y una ubicación estratégica.`,
        `Esta ${typeLabel} reúne atributos valiosos para negocios o actividades que dependen de flujo, presencia y ejecución ágil.`,
      ],
      bodies: [
        `${location ? `En ${location},` : ""}${price ? ` con un precio de ${price},` : ""} puede sostener una conversación enfocada en exposición, funcionamiento y aprovechamiento del punto.`,
        `${location ? `Su posición en ${location}` : "Su ubicación"}${price ? `, sumada a un precio de ${price},` : ""} ayuda a leerla desde la lógica de operación, captación y desempeño comercial.`,
      ],
      closes: [
        `${specs ? `Características como ${specs}` : "Sus características principales"} refuerzan una propuesta con buena lógica para operación y atención al cliente.`,
        `${advisor ? `${advisor} puede presentarla mejor desde una narrativa operativa y estratégica. ` : ""}Es una propiedad que puede destacar por visibilidad, uso claro y potencial de activación.`,
      ],
    },
  };

  const selected = variants[tone] ?? variants.premium;
  const amenitiesText = [...amenities, extraFeatures].filter(Boolean).join(", ");

  return [
    pickVariant(selected.intros, `${seed}-intro`),
    pickVariant(selected.bodies, `${seed}-body`),
    amenitiesText ? `Entre sus atributos más vendibles destacan ${amenitiesText}.` : null,
    pickVariant(selected.closes, `${seed}-close`),
  ].filter(Boolean).join(" ");
}

function buildSuggestedShortDescription({
  type,
  tone,
  operation,
  location,
  price,
}: {
  type: string;
  tone: string;
  operation: string;
  location: string;
  price: string;
}) {
  const typeLabel = getPropertyTypeLabel(type);
  const variants: Record<string, string[]> = {
    premium: [
      `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} ${operation === "rent" ? "en renta" : "en venta"}${location ? ` en ${location}` : ""}${price ? ` · ${price}` : ""}. Presencia, ubicación y plusvalía.`,
      `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}${location ? ` en ${location}` : ""}${price ? ` · ${price}` : ""}. Opción premium con excelente percepción comercial.`,
    ],
    familiar: [
      `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}${location ? ` en ${location}` : ""}${price ? ` · ${price}` : ""}. Espacios cómodos para una vida diaria más práctica.`,
      `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} ${operation === "rent" ? "en renta" : "en venta"}${location ? ` en ${location}` : ""}. Ideal para comodidad y rutina familiar.`,
    ],
    inversion: [
      `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}${location ? ` en ${location}` : ""}${price ? ` · ${price}` : ""}. Ubicación y valor para mirada de inversión.`,
      `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} ${operation === "rent" ? "en renta" : "en venta"}${location ? ` en ${location}` : ""}. Buena base para plusvalía y retorno.`,
    ],
    ejecutivo: [
      `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}${location ? ` en ${location}` : ""}${price ? ` · ${price}` : ""}. Funcional, conectada y fácil de operar.`,
      `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} ${operation === "rent" ? "en renta" : "en venta"}${location ? ` en ${location}` : ""}. Practicidad y buena conectividad.`,
    ],
    comercial: [
      `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}${location ? ` en ${location}` : ""}${price ? ` · ${price}` : ""}. Visibilidad y operación en punto estratégico.`,
      `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} ${operation === "rent" ? "en renta" : "en venta"}${location ? ` en ${location}` : ""}. Buena base para flujo y actividad comercial.`,
    ],
  };

  return pickVariant(variants[tone] ?? variants.premium, `${tone}-${type}-${location}-${price}-${operation}-short`);
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

async function optimizeImageFile(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    return { file, previewUrl: URL.createObjectURL(file), fileSizeLabel: formatFileSize(file.size) };
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const tryWebp = await new Promise<Blob | null>((resolve) => canvas.toBlob((blob) => resolve(blob), "image/webp", 0.82));
  const tryOriginal = await new Promise<Blob | null>((resolve) => canvas.toBlob((blob) => resolve(blob), file.type || "image/jpeg", 0.84));
  const chosenBlob = tryWebp && tryOriginal ? (tryWebp.size <= tryOriginal.size ? tryWebp : tryOriginal) : (tryWebp ?? tryOriginal);

  if (!chosenBlob) {
    return { file, previewUrl: URL.createObjectURL(file), fileSizeLabel: formatFileSize(file.size) };
  }

  const extension = chosenBlob.type === "image/webp" ? "webp" : file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const optimizedFile = new File([chosenBlob], `${file.name.replace(/\.[^.]+$/, "") || "image"}.${extension}`, { type: chosenBlob.type });

  return {
    file: optimizedFile,
    previewUrl: URL.createObjectURL(optimizedFile),
    fileSizeLabel: formatFileSize(optimizedFile.size),
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
  const storageKey = useMemo(() => `property-wizard:${mode}:${property?.id ?? "new"}`, [mode, property?.id]);
  const [currentStep, setCurrentStep] = useState(0);
  const [draftSnapshot, setDraftSnapshot] = useState<Record<string, string | boolean>>({});
  const [descriptionToneState, setDescriptionToneState] = useState("premium");
  const [descriptionValue, setDescriptionValue] = useState("");
  const [shortDescriptionValue, setShortDescriptionValue] = useState("");
  const [descriptionEditedManually, setDescriptionEditedManually] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const form = document.getElementById(storageKey) as HTMLFormElement | null;
    if (!form) return;

    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Record<string, string | boolean>;
      setDraftSnapshot(parsed);
      setDescriptionToneState(String(parsed.descriptionTone ?? "premium"));
      Object.entries(parsed).forEach(([name, value]) => {
        const field = form.elements.namedItem(name);
        if (!field) return;
        if (field instanceof RadioNodeList) return;
        if (field instanceof HTMLInputElement && field.type === "checkbox") {
          field.checked = Boolean(value);
          return;
        }
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
          field.value = String(value);
        }
      });
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (!state.success || typeof window === "undefined") return;
    window.localStorage.removeItem(storageKey);
    setDraftSnapshot({});
  }, [state.success, storageKey]);

  function persistDraft(form: HTMLFormElement) {
    if (typeof window === "undefined") return;
    const data = new FormData(form);
    const next: Record<string, string | boolean> = {};
    for (const [key, value] of data.entries()) {
      next[key] = value.toString();
    }
    const featured = form.querySelector('input[name="isFeatured"]') as HTMLInputElement | null;
    if (featured) next.isFeatured = featured.checked;
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setDraftSnapshot(next);
  }

  const reviewTitle = String(draftSnapshot.title ?? property?.title ?? "Sin título");
  const reviewOperation = String(draftSnapshot.operationType ?? property?.operation_type ?? "sale");
  const reviewPrice = String(draftSnapshot.priceAmount ?? property?.price_amount ?? "");
  const reviewCurrency = String(draftSnapshot.currencyCode ?? property?.currency_code ?? "MXN");
  const reviewLocation = [draftSnapshot.locationLabel ?? property?.location_label, draftSnapshot.city ?? property?.city, draftSnapshot.state ?? property?.state].filter(Boolean).join(" · ");
  const reviewType = String(draftSnapshot.propertyType ?? property?.property_type ?? "house");
  const reviewTone = String(draftSnapshot.descriptionTone ?? "premium");
  const reviewSpecs = [
    draftSnapshot.bedrooms ?? property?.bedrooms,
    draftSnapshot.bathrooms ?? property?.bathrooms,
    draftSnapshot.constructionAreaM2 ?? property?.construction_area_m2,
  ];
  const reviewAmenities = amenityOptions.filter((amenity) => Boolean(draftSnapshot[`amenity:${amenity}`]));
  const reviewExtraFeatures = String(draftSnapshot.extraFeatures ?? "");
  const reviewAgentId = String(draftSnapshot.agentId ?? property?.agent_id ?? ownAgentId ?? "");
  const reviewAgent = visibleAgents.find((agent) => agent.id === reviewAgentId) ?? null;
  const reviewStatus = String(draftSnapshot.status ?? property?.status ?? "draft");
  const suggestedDescription = buildSuggestedDescription({
    type: reviewType,
    tone: descriptionToneState,
    operation: reviewOperation,
    location: reviewLocation,
    price: reviewPrice ? `${reviewCurrency} ${reviewPrice}` : "",
    bedrooms: String(draftSnapshot.bedrooms ?? property?.bedrooms ?? ""),
    bathrooms: String(draftSnapshot.bathrooms ?? property?.bathrooms ?? ""),
    area: String(draftSnapshot.constructionAreaM2 ?? property?.construction_area_m2 ?? ""),
    advisor: reviewAgent?.display_name ?? "",
    amenities: reviewAmenities,
    extraFeatures: reviewExtraFeatures,
  });
  const suggestedShortDescription = buildSuggestedShortDescription({
    type: reviewType,
    tone: descriptionToneState,
    operation: reviewOperation,
    location: reviewLocation,
    price: reviewPrice ? `${reviewCurrency} ${reviewPrice}` : "",
  });
  useEffect(() => {
    if (!descriptionEditedManually) {
      setDescriptionValue(String(draftSnapshot.description ?? property?.description ?? suggestedDescription));
      setShortDescriptionValue(String(draftSnapshot.shortDescription ?? suggestedShortDescription));
    }
  }, [draftSnapshot.description, draftSnapshot.shortDescription, property?.description, suggestedDescription, suggestedShortDescription, descriptionEditedManually]);

  const reviewDescription = descriptionValue || String(draftSnapshot.description ?? property?.description ?? suggestedDescription);
  const photosCount = property?.property_images.length ?? 0;
  const reviewChecklist = [
    { label: "Datos base", done: Boolean(reviewTitle && reviewTitle !== "Sin título") },
    { label: "Ubicación", done: Boolean(reviewLocation) },
    { label: "Precio", done: Boolean(reviewPrice) },
    { label: "Descripción", done: Boolean(reviewDescription.trim()) },
    { label: "Fotos", done: photosCount > 0 },
    { label: "Asesor", done: Boolean(reviewAgent) },
  ];

  const stepCompletion = [
    Boolean(property?.title),
    Boolean(property?.location_label || property?.city || property?.state),
    Boolean(property?.bedrooms || property?.bathrooms || property?.construction_area_m2),
    Boolean(property?.property_images?.length),
    Boolean(property?.description),
    Boolean(property?.status || property?.operation_type),
    false,
  ];
  const visibleCompletion = Math.round((((currentStep + 1) / wizardSteps.length) * 100));

  return (
    <form id={storageKey} action={formAction} onChange={(event) => persistDraft(event.currentTarget)} onSubmit={(event) => persistDraft(event.currentTarget)} className="space-y-5 rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{mode === "create" ? "Nueva propiedad" : "Editar propiedad"}</p>
          <h3 className="mt-2 text-xl font-semibold text-stone-950">{mode === "create" ? "Alta guiada de propiedad" : property?.title}</h3>
          <p className="mt-2 text-sm text-stone-600">
            Completa la propiedad paso a paso para mantener claridad, progreso visible y una captura más fácil de terminar.
          </p>
        </div>
        <div className="min-w-[170px] rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Progreso</p>
          <p className="mt-2 text-3xl font-semibold text-amber-950">{visibleCompletion}%</p>
          <p className="mt-1 text-sm text-amber-800">Paso {currentStep + 1} de {wizardSteps.length}</p>
        </div>
      </div>

      {mode === "edit" ? <input type="hidden" name="propertyId" defaultValue={property?.id} /> : null}

      <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
        {wizardSteps.map((step, index) => (
          <button
            key={step}
            type="button"
            onClick={() => setCurrentStep(index)}
            className={`rounded-2xl border px-4 py-3 text-left transition ${index === currentStep ? "border-[#d7ab5b]/40 bg-[#fff8ec] text-stone-950" : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-white"}`}
          >
            <p className="text-[11px] uppercase tracking-[0.18em]">Paso {index + 1}</p>
            <p className="mt-2 text-sm font-medium">{step}</p>
            {stepCompletion[index] ? <p className="mt-2 text-xs text-emerald-600">Completo</p> : null}
          </button>
        ))}
      </div>

      {currentStep === 0 ? (
        <div className="space-y-5">
          <SectionCard>
            <p className="text-sm font-semibold text-stone-900">Operación</p>
            <p className="mt-2 text-sm leading-6 text-stone-600">Define desde el inicio si esta propiedad se trabajará para venta o renta.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { value: "sale", label: "Venta", description: "Propiedad orientada a compraventa." },
                { value: "rent", label: "Renta", description: "Propiedad orientada a arrendamiento." },
              ].map((option) => {
                const selected = reviewOperation === option.value;
                return (
                  <label key={option.value} className={`cursor-pointer rounded-[1.5rem] border p-4 transition ${selected ? "border-[#d7ab5b]/40 bg-[#fff8ec]" : "border-stone-200 bg-stone-50 hover:bg-white"}`}>
                    <input type="radio" name="operationType" value={option.value} defaultChecked={reviewOperation === option.value} className="sr-only" />
                    <p className="text-base font-semibold text-stone-950">{option.label}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{option.description}</p>
                  </label>
                );
              })}
            </div>
          </SectionCard>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Título" name="title" defaultValue={String(draftSnapshot.title ?? property?.title ?? "")} required placeholder="Casa amplia en zona norte" />
            <Field label="Slug" name="slug" defaultValue={String(draftSnapshot.slug ?? property?.slug ?? "")} placeholder="casa-amplia-zona-norte" />
            <Field label="Clave pública" name="publicCode" defaultValue={String(draftSnapshot.publicCode ?? property?.public_code ?? "")} placeholder="SH-102" />
            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Asesor asignado</span>
              <select name="agentId" defaultValue={String(draftSnapshot.agentId ?? property?.agent_id ?? ownAgentId ?? "")} disabled={!canManageAssignments} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 disabled:bg-stone-100 disabled:text-stone-500">
                <option value="">Sin asesor asignado</option>
                {visibleAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>{agent.display_name}</option>
                ))}
              </select>
              {!canManageAssignments ? <p className="text-xs leading-5 text-stone-500">Tu cuenta no puede cambiar este asesor. La propiedad se guardará con tu asignación comercial cuando corresponda.</p> : null}
            </label>
          </div>
        </div>
      ) : null}

      {currentStep === 1 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Ubicación corta" name="locationLabel" defaultValue={String(draftSnapshot.locationLabel ?? property?.location_label ?? "")} required placeholder="Lomas del Valle" />
          <Field label="Ciudad" name="city" defaultValue={String(draftSnapshot.city ?? property?.city ?? "")} />
          <Field label="Estado" name="state" defaultValue={String(draftSnapshot.state ?? property?.state ?? "")} />
          <Field label="País" name="countryCode" defaultValue={String(draftSnapshot.countryCode ?? property?.country_code ?? "MX")} />
          <Field label="Colonia / zona" name="neighborhood" defaultValue={String(draftSnapshot.neighborhood ?? property?.neighborhood ?? "")} />
          <Field label="Dirección" name="addressLine" defaultValue={String(draftSnapshot.addressLine ?? property?.address_line ?? "")} />
        </div>
      ) : null}

      {currentStep === 2 ? (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Tipo</span>
              <select name="propertyType" defaultValue={property?.property_type ?? "house"} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950">{propertyTypes.map((option) => <option key={option} value={option}>{option}</option>)}</select>
            </label>
            <Field label="Recámaras" name="bedrooms" defaultValue={property?.bedrooms} />
            <Field label="Baños" name="bathrooms" defaultValue={property?.bathrooms} />
            <Field label="Estacionamientos" name="parkingSpots" defaultValue={property?.parking_spots} />
            <Field label="Terreno m²" name="lotAreaM2" defaultValue={property?.lot_area_m2} />
            <Field label="Construcción m²" name="constructionAreaM2" defaultValue={property?.construction_area_m2} />
            <Field label="Precio" name="priceAmount" defaultValue={property?.price_amount} />
            <Field label="Moneda" name="currencyCode" defaultValue={property?.currency_code ?? "MXN"} />
          </div>

          <SectionCard>
            <p className="text-sm font-semibold text-stone-900">Amenidades y atributos vendibles</p>
            <p className="mt-2 text-sm leading-6 text-stone-600">Selecciona rápido lo que mejor ayuda a vender o posicionar esta propiedad.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {amenityOptions.map((amenity) => (
                <label key={amenity} className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-700 transition hover:bg-white">
                  <input type="checkbox" name={`amenity:${amenity}`} defaultChecked={Boolean(draftSnapshot[`amenity:${amenity}`])} className="size-4 rounded border-stone-300 bg-white" />
                  {amenity}
                </label>
              ))}
            </div>
            <label className="mt-4 block space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Otras características</span>
              <input name="extraFeatures" defaultValue={reviewExtraFeatures} placeholder="Ej. doble altura, pet friendly, vista panorámica" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>
          </SectionCard>
        </div>
      ) : null}

      {currentStep === 3 ? (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <SectionCard>
              <p className="text-sm font-semibold text-stone-900">Fotos de la propiedad</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Este paso te ayuda a revisar rápido si la propiedad ya tiene material visual suficiente antes de publicar.
              </p>

              {mode === "edit" && property ? (
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm">
                    <span className="text-stone-700">Fotos disponibles</span>
                    <span className="font-semibold text-stone-950">{property.property_images.length}</span>
                  </div>

                  {property.property_images.length ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {property.property_images
                        .slice()
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((image, index) => (
                          <div key={image.id} className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm shadow-stone-200/30">
                            <div className="relative aspect-[4/3] bg-stone-100">
                              <Image src={formatImagePublicUrl(image.storage_path)} alt={image.alt_text ?? `Foto ${index + 1}`} fill className="object-cover" unoptimized />
                              {image.is_cover ? (
                                <span className="absolute left-3 top-3 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">Portada</span>
                              ) : null}
                            </div>
                            <div className="p-4 text-sm text-stone-600">
                              <p className="font-medium text-stone-900">{image.alt_text ?? `Foto ${index + 1}`}</p>
                              <p className="mt-1 text-xs text-stone-500">Orden visual: {index + 1}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-sm text-stone-500">
                      Todavía no hay fotos cargadas para esta propiedad.
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-sm text-stone-600">
                  Primero guarda la propiedad para habilitar la galería. Después podrás volver a este paso y cargar fotos sin perder la captura.
                </div>
              )}
            </SectionCard>

            <SectionCard>
              <p className="text-sm font-semibold text-stone-900">Checklist visual mínimo</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Usa esta referencia para detectar rápido qué material falta antes de cerrar la publicación.
              </p>
              <div className="mt-4 space-y-3">
                {getPhotoCoverageFromDraft(
                  (property?.property_images ?? []).map((image) => ({
                    storage_path: image.storage_path,
                    alt_text: image.alt_text ?? "",
                  })),
                ).checks.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm">
                    <span className="text-stone-800">{item.label}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.covered ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {item.covered ? "Lista" : "Falta"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-600">
                {mode === "edit" && property ? "Puedes seguir usando el módulo actual de galería en esta misma pantalla para subir, ordenar y definir portada." : "La galería se activa después de guardar la propiedad por primera vez."}
              </div>
            </SectionCard>
          </div>
        </div>
      ) : null}

      {currentStep === 4 ? (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[0.8fr_1.2fr]">
            <SectionCard>
              <p className="text-sm font-semibold text-stone-900">Tono de la descripción</p>
              <div className="mt-4 space-y-3">
                <label className="space-y-2 text-sm text-stone-700">
                  <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Tono sugerido</span>
                  <select name="descriptionTone" value={descriptionToneState} onChange={(event) => setDescriptionToneState(event.target.value)} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950">
                    {descriptionTones.map((tone) => (
                      <option key={tone} value={tone}>{tone}</option>
                    ))}
                  </select>
                </label>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-600">
                  <p className="font-medium text-stone-900">Plantilla sugerida</p>
                  <p className="mt-2">La propuesta se arma con tipo de propiedad, ubicación, precio y características ya capturadas para que no empieces desde cero.</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <p className="text-sm font-semibold text-stone-900">Descripción comercial</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">Puedes usar la propuesta sugerida tal como está o editarla para adaptarla a tu estilo comercial.</p>
              <label className="mt-4 block space-y-2 text-sm text-stone-700">
                <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Versión larga</span>
                <textarea name="description" value={descriptionValue} onChange={(event) => { setDescriptionValue(event.target.value); setDescriptionEditedManually(true); }} rows={7} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
              </label>
              <label className="mt-4 block space-y-2 text-sm text-stone-700">
                <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Versión corta para WhatsApp / redes</span>
                <textarea name="shortDescription" value={shortDescriptionValue} onChange={(event) => setShortDescriptionValue(event.target.value)} rows={3} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
              </label>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => { setDescriptionValue(suggestedDescription); setShortDescriptionValue(suggestedShortDescription); setDescriptionEditedManually(false); }} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100">
                  Generar descripción
                </button>
                <button type="button" onClick={() => { setDescriptionValue(suggestedDescription); setShortDescriptionValue(suggestedShortDescription); setDescriptionEditedManually(false); }} className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100">
                  Regenerar con este tono
                </button>
                {descriptionEditedManually ? <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-2 text-xs text-slate-600">Edición manual detectada</span> : null}
              </div>
            </SectionCard>
          </div>
        </div>
      ) : null}

      {currentStep === 5 ? (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <input type="hidden" name="operationType" value={reviewOperation} />
            <div className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Operación</span>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-950">
                {reviewOperation === "rent" ? "Renta" : "Venta"}
              </div>
            </div>
            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Estado</span>
              <select name="status" defaultValue={property?.status ?? "draft"} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950">
                <option value="draft">Borrador</option>
                <option value="active">Activa</option>
                <option value="archived">Archivada</option>
                {property?.status === "pending" ? <option value="pending">Pendiente</option> : null}
                {property?.status === "sold" ? <option value="sold">Vendida</option> : null}
                {property?.status === "rented" ? <option value="rented">Rentada</option> : null}
              </select>
            </label>
            <label className="inline-flex items-center gap-3 text-sm text-stone-700 xl:col-span-2 xl:mt-8">
              <input type="checkbox" name="isFeatured" defaultChecked={property?.is_featured ?? false} className="size-4 rounded border-stone-300 bg-white" />
              Marcar como destacada
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <SectionCard>
              <p className="text-sm font-semibold text-stone-900">Visibilidad actual</p>
              <div className="mt-4 space-y-3 text-sm text-stone-600">
                <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                  <span>Estado de la propiedad</span>
                  <span className="font-semibold text-stone-950">{reviewStatus === "active" ? "Activa" : reviewStatus === "archived" ? "Archivada" : "Borrador"}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                  <span>Visibilidad</span>
                  <span className="font-semibold text-stone-950">{reviewStatus === "active" ? "Visible en el sitio público" : "No visible para clientes"}</span>
                </div>
                <div className={`rounded-2xl border px-4 py-4 ${reviewStatus === "active" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                  {reviewStatus === "active" ? "Esta propiedad será visible en el sitio público." : "Esta propiedad no será visible hasta activarla."}
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <p className="text-sm font-semibold text-stone-900">Avisos antes de publicar</p>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Precio", ok: Boolean(reviewPrice) },
                  { label: "Ubicación", ok: Boolean(reviewLocation) },
                  { label: "Fotos", ok: photosCount > 0 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm">
                    <span className="text-stone-800">{item.label}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {item.ok ? "Listo" : "Revisar"}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-stone-600">
                Si faltan datos clave, puedes guardar como borrador y completarlos después. Por ahora esto es una advertencia visual, no un bloqueo.
              </p>
            </SectionCard>
          </div>
        </div>
      ) : null}

      {currentStep === 6 ? (
        <div className="space-y-5">
          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5 text-sm text-stone-600">
            <p className="font-semibold text-stone-900">Revisión final</p>
            <p className="mt-2">Antes de guardar, revisa el resumen general y detecta rápido qué falta completar.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SectionCard>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Título</p>
              <p className="mt-2 text-lg font-semibold text-stone-950">{reviewTitle}</p>
            </SectionCard>
            <SectionCard>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Operación</p>
              <p className="mt-2 text-lg font-semibold text-stone-950">{reviewOperation}</p>
            </SectionCard>
            <SectionCard>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Precio</p>
              <p className="mt-2 text-lg font-semibold text-stone-950">{reviewPrice ? `${reviewCurrency} ${reviewPrice}` : "Pendiente"}</p>
            </SectionCard>
            <SectionCard>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Ubicación</p>
              <p className="mt-2 text-lg font-semibold text-stone-950">{reviewLocation || "Pendiente"}</p>
            </SectionCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <SectionCard>
              <p className="text-sm font-semibold text-stone-900">Resumen comercial</p>
              <div className="mt-4 space-y-3 text-sm text-stone-600">
                <p><span className="font-medium text-stone-900">Specs principales:</span> {[reviewSpecs[0] ? `${reviewSpecs[0]} recámaras` : null, reviewSpecs[1] ? `${reviewSpecs[1]} baños` : null, reviewSpecs[2] ? `${reviewSpecs[2]} m²` : null].filter(Boolean).join(" · ") || "Pendientes"}</p>
                <p><span className="font-medium text-stone-900">Asesor asignado:</span> {reviewAgent?.display_name ?? "Pendiente"}</p>
                <p><span className="font-medium text-stone-900">Estado / publicación:</span> {reviewStatus}</p>
                <p><span className="font-medium text-stone-900">Fotos disponibles:</span> {photosCount ? `${photosCount} cargadas` : mode === "create" ? "Se habilitan después de guardar" : "Pendientes"}</p>
                <p><span className="font-medium text-stone-900">Amenidades:</span> {[...reviewAmenities, reviewExtraFeatures].filter(Boolean).join(", ") || "Pendientes"}</p>
                <p><span className="font-medium text-stone-900">Descripción:</span> {reviewDescription.trim() ? "Lista" : "Pendiente"}</p>
              </div>
            </SectionCard>

            <SectionCard>
              <p className="text-sm font-semibold text-stone-900">Checklist de completitud</p>
              <div className="mt-4 space-y-3">
                {reviewChecklist.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm">
                    <span className="text-stone-800">{item.label}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.done ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {item.done ? "Listo" : "Falta"}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      ) : null}

      {state.message ? (
        <p className={`rounded-2xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setCurrentStep((value) => Math.max(0, value - 1))} disabled={currentStep === 0} className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:opacity-50">
            Anterior
          </button>
          <button type="button" onClick={() => setCurrentStep((value) => Math.min(wizardSteps.length - 1, value + 1))} disabled={currentStep === wizardSteps.length - 1} className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:opacity-50">
            Siguiente
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <button disabled={pending} className="rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c99a46] disabled:opacity-60">
            {pending ? "Guardando..." : mode === "create" ? "Guardar borrador" : "Guardar cambios"}
          </button>
          {currentStep === 5 ? (
            <button type="submit" disabled={pending} className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60">
              Publicar propiedad
            </button>
          ) : null}
          {property?.id && property.status === "active" ? (
            <a href={buildPublicPropertyUrl(property.slug)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100">
              Ver pública
            </a>
          ) : null}
          <Link href="/admin/properties" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100">
            Volver al listado
          </Link>
        </div>
      </div>
    </form>
  );
}

function PropertyLeadInterestsManager({ property }: { property: PropertyRecord }) {
  const [state, action, pending] = useActionState(createPropertyLeadAction, initialPropertyLeadCreateState);
  const interests = property.lead_interests ?? [];

  return (
    <SectionCard className="scroll-mt-28">
      <div id="interesados" className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-stone-900">Interesados en esta propiedad</p>
          <p className="mt-2 text-sm text-stone-600">Seguimiento básico para saber quién se interesó y agregar contactos manuales asociados a esta propiedad.</p>
        </div>
        <div className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-700">
          {interests.length} interesados
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {interests.length ? interests.map((interest) => (
          <div key={`${interest.lead_id}-${interest.created_at}`} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-stone-950">{interest.full_name}</p>
                <p className="mt-1 text-sm text-stone-500">{interest.phone}{interest.email ? ` · ${interest.email}` : ""}</p>
              </div>
              <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-700">{interest.status}</span>
            </div>
            <p className="mt-3 text-sm text-stone-700"><span className="font-medium text-stone-900">Fecha de entrada:</span> {new Date(interest.created_at).toLocaleString("es-MX")}</p>
            {interest.message ? <p className="mt-2 text-sm leading-6 text-stone-600"><span className="font-medium text-stone-900">Mensaje inicial:</span> {interest.message}</p> : null}
            {interest.internal_note ? <p className="mt-2 text-sm leading-6 text-stone-600"><span className="font-medium text-stone-900">Nota interna:</span> {interest.internal_note}</p> : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={`https://wa.me/${interest.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-100">WhatsApp</a>
              <Link href="/admin/leads" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-100">Ver lead</Link>
              <button type="button" onClick={() => navigator.clipboard.writeText(interest.phone)} className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-100">Copiar teléfono</button>
            </div>
          </div>
        )) : <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-sm text-stone-500">Todavía no hay interesados registrados para esta propiedad.</div>}
      </div>

      <form action={action} className="mt-6 space-y-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <input type="hidden" name="propertyId" value={property.id} />
        <p className="text-sm font-semibold text-stone-900">Agregar lead manual</p>
        <div className="grid gap-4 md:grid-cols-2">
          <input name="fullName" placeholder="Nombre completo" className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
          <input name="phone" placeholder="Teléfono" className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
          <input name="email" placeholder="Email (opcional)" className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400 md:col-span-2" />
        </div>
        <textarea name="message" rows={3} placeholder="Mensaje o nota inicial" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
        {state.message ? <p className={`rounded-2xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{state.message}</p> : null}
        <button disabled={pending} className="rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c99a46] disabled:opacity-60">{pending ? "Guardando..." : "Agregar interesado"}</button>
      </form>
    </SectionCard>
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

    if (!property.id || !activeWorkspace.workspaceId) {
      setClientError("Primero guarda la propiedad antes de subir fotos.");
      return;
    }

    if (gallery.length + files.length > MAX_PROPERTY_IMAGES) {
      setClientError(`Puedes tener máximo ${MAX_PROPERTY_IMAGES} fotos por propiedad.`);
      return;
    }

    startUploadTransition(async () => {
      const uploaded: GalleryImageDraft[] = [];

      try {
        for (const originalFile of files) {
          if (!originalFile.type.startsWith("image/")) {
            throw new Error(`El archivo ${originalFile.name} no es una imagen válida.`);
          }

          if (originalFile.size > MAX_IMAGE_FILE_SIZE_MB * 1024 * 1024) {
            throw new Error(`El archivo ${originalFile.name} supera el límite de ${MAX_IMAGE_FILE_SIZE_MB} MB.`);
          }

          const optimized = await optimizeImageFile(originalFile);
          const file = optimized.file;
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
            previewUrl: optimized.previewUrl,
            fileSizeLabel: optimized.fileSizeLabel,
          });
        }

        updateGallery([...gallery, ...uploaded]);
        setClientMessage(`${uploaded.length} foto(s) cargada(s) y optimizadas. Guarda la galería para confirmar orden y portada.`);
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
        <p className="mt-4 text-xs leading-5 text-stone-500">Máximo {MAX_PROPERTY_IMAGES} fotos por propiedad · hasta {MAX_IMAGE_FILE_SIZE_MB} MB por archivo · ancho máximo aproximado {MAX_IMAGE_DIMENSION}px · optimización previa a la subida.</p>
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
                <p className="text-xs text-stone-500">Orden visual: {index + 1}{image.fileSizeLabel ? ` · ${image.fileSizeLabel}` : ""}</p>
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

export function AdminPropertiesIndex({ workspaceName, workspaceSlug, properties }: Pick<SharedProps, "workspaceName" | "workspaceSlug" | "properties">) {
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
            const interestedCount = property.lead_interests?.length ?? 0;
            const coverImage = property.property_images.find((image) => image.is_cover) ?? property.property_images[0] ?? null;
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
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <p>Cobertura visual: {coverage.completion}%</p>
                    <p>{interestedCount} interesados</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/admin/properties/${property.id}`} className="rounded-full bg-[#d7ab5b] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#c99a46]">
                      Editar
                    </Link>
                    <Link href={`/admin/properties/${property.id}#interesados`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                      Ver interesados
                    </Link>
                    <a href={buildPublicPropertyUrl(property.slug, workspaceSlug ?? null)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
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

      <PropertyLeadInterestsManager property={property} />

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

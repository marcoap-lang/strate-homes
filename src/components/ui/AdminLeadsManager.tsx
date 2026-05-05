"use client";

import { useActionState } from "react";
import { createPropertyTourAction, updateLeadStateAction, type LeadUpdateState, type PropertyTourCreateState } from "@/app/admin/actions";
import type { LeadRecord } from "@/lib/admin-access";
import type { PropertyRecord } from "@/lib/admin-types";
import { buildPublicTourUrl } from "@/lib/public-links";

const initialState: LeadUpdateState = { success: false, message: "" };
const initialTourState: PropertyTourCreateState = { success: false, message: "" };

function CreateTourBox({ lead, properties, workspaceSlug }: { lead: LeadRecord; properties: PropertyRecord[]; workspaceSlug?: string | null }) {
  const [state, action, pending] = useActionState(createPropertyTourAction, initialTourState);
  const publicProperties = properties.filter((property) => property.status === "active");
  const defaultTitle = `Recorrido para ${lead.full_name}`;

  return (
    <form action={action} className="mt-4 rounded-2xl border border-amber-100 bg-[#fff8ec] p-4">
      <input type="hidden" name="leadId" value={lead.id} />
      <input type="hidden" name="title" value={defaultTitle} />
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#9b6f21]">Recorrido personalizado</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        Crea un link curado con varias propiedades para mandárselo al lead por WhatsApp.
      </p>

      {lead.tours?.length ? (
        <div className="mt-3 space-y-2">
          {lead.tours.map((tour) => (
            <a key={tour.id} href={buildPublicTourUrl(tour.slug, workspaceSlug)} target="_blank" rel="noreferrer" className="block rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-amber-50">
              Ver recorrido: {tour.title}
            </a>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid max-h-56 gap-2 overflow-y-auto pr-1">
        {publicProperties.length ? publicProperties.map((property, index) => (
          <label key={property.id} className="flex items-start gap-3 rounded-xl border border-amber-100 bg-white px-3 py-2 text-sm text-slate-700">
            <input type="checkbox" name="propertyIds" value={property.id} defaultChecked={index < 3} className="mt-1" />
            <span>
              <span className="block font-medium text-slate-950">{property.title}</span>
              <span className="text-xs text-slate-500">{property.location_label} · {property.currency_code} {property.price_amount?.toLocaleString("es-MX") ?? "Consultar"}</span>
            </span>
          </label>
        )) : (
          <p className="rounded-xl border border-dashed border-amber-200 bg-white px-3 py-3 text-sm text-slate-500">No hay propiedades activas para armar un recorrido.</p>
        )}
      </div>

      <label className="mt-4 block space-y-2 text-sm text-slate-700">
        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Mensaje de introducción</span>
        <textarea name="introMessage" rows={3} defaultValue={`Te preparé esta selección para revisar opciones que podrían encajar con lo que estás buscando.`} className="w-full rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#d7ab5b]" />
      </label>

      {state.message ? <p className={`mt-3 rounded-2xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{state.message}</p> : null}

      <button disabled={pending || !publicProperties.length} className="mt-4 w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto">
        {pending ? "Creando recorrido..." : "Crear recorrido"}
      </button>
    </form>
  );
}

function LeadCard({ lead, properties, workspaceSlug }: { lead: LeadRecord; properties: PropertyRecord[]; workspaceSlug?: string | null }) {
  const [state, action, pending] = useActionState(updateLeadStateAction, initialState);

  return (
    <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30 sm:rounded-[1.5rem] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-950">{lead.full_name}</p>
          <p className="mt-1 text-sm text-slate-500">{lead.phone}{lead.email ? ` · ${lead.email}` : ""}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">{lead.status}</span>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
        <p><span className="font-medium text-slate-900">Propiedad de origen:</span> {lead.property_title ?? "Sin referencia"}</p>
        <p><span className="font-medium text-slate-900">Fecha de entrada:</span> {new Date(lead.created_at).toLocaleString("es-MX")}</p>
      </div>

      {lead.message ? <p className="mt-4 text-sm leading-7 text-slate-600"><span className="font-medium text-slate-900">Mensaje inicial:</span> {lead.message}</p> : null}

      <CreateTourBox lead={lead} properties={properties} workspaceSlug={workspaceSlug} />

      <form action={action} className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <input type="hidden" name="leadId" value={lead.id} />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Estado</span>
            <select name="status" defaultValue={lead.status} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-950 sm:py-3 sm:text-sm">
              <option value="new">nuevo</option>
              <option value="contacted">contactado</option>
              <option value="interested">interesado</option>
              <option value="lost">perdido</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Nota interna</span>
            <input name="internalNote" defaultValue={lead.internal_note ?? ""} placeholder="Ej. pidió llamada por la tarde" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-950 outline-none transition focus:border-slate-400 sm:py-3 sm:text-sm" />
          </label>
        </div>

        {state.message ? <p className={`rounded-2xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{state.message}</p> : null}

        <button disabled={pending} className="w-full rounded-full bg-[#d7ab5b] px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-[#c99a46] disabled:opacity-60 sm:w-auto">
          {pending ? "Guardando..." : "Guardar seguimiento"}
        </button>
      </form>
    </div>
  );
}

export function AdminLeadsManager({ leads, properties, workspaceSlug }: { leads: LeadRecord[]; properties: PropertyRecord[]; workspaceSlug?: string | null }) {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:rounded-[2rem] sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Leads</p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-950">Interesados recibidos</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Seguimiento básico, recorrido personalizado y link compartible para cada lead.</p>
      </div>

      <div className="grid gap-4">
        {leads.length ? leads.map((lead) => <LeadCard key={`${lead.id}-${lead.created_at}`} lead={lead} properties={properties} workspaceSlug={workspaceSlug} />) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">Todavía no hay leads recibidos.</div>}
      </div>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { createPropertyTourAction, updateLeadStateAction, type LeadUpdateState, type PropertyTourCreateState } from "@/app/admin/actions";
import type { LeadRecord } from "@/lib/admin-access";
import type { PropertyRecord } from "@/lib/admin-types";
import { defaultWhatsAppTemplates, fillMessageTemplate } from "@/lib/commercial";
import { buildPublicTourUrl } from "@/lib/public-links";

const initialState: LeadUpdateState = { success: false, message: "" };
const initialTourState: PropertyTourCreateState = { success: false, message: "" };

const leadStatuses = [
  { value: "new", label: "Nuevo" },
  { value: "contacted", label: "Contactado" },
  { value: "interested", label: "Interesado" },
  { value: "visited", label: "Visita agendada" },
  { value: "negotiation", label: "Negociación" },
  { value: "closed", label: "Cerrado" },
  { value: "lost", label: "Perdido" },
];

function formatWhatsAppUrl(phone?: string | null, message?: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message ?? "Hola, te contacto por tu interés en una propiedad.")}`;
}

function formatDateTimeInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function getLeadAlert(lead: LeadRecord) {
  const ageHours = (Date.now() - new Date(lead.created_at).getTime()) / 36e5;
  const followUpAgeHours = lead.last_contacted_at
    ? (Date.now() - new Date(lead.last_contacted_at).getTime()) / 36e5
    : ageHours;

  if (lead.status === "new" && ageHours >= 2) return "Lead nuevo sin primera respuesta.";
  if (!lead.next_follow_up_at && !["closed", "lost"].includes(lead.status)) return "Falta próximo seguimiento.";
  if (followUpAgeHours >= 48 && !["closed", "lost"].includes(lead.status)) return "Sin movimiento en más de 48h.";
  return null;
}

function getSourceLabel(value?: string | null) {
  if (value === "property_form") return "Formulario de propiedad";
  if (value === "manual") return "Carga manual";
  if (value === "tour") return "Recorrido";
  if (value === "whatsapp") return "WhatsApp";
  if (value === "demo_request") return "Solicitud de demo";
  return "Origen pendiente";
}

function getStatusLabel(value: string) {
  return leadStatuses.find((status) => status.value === value)?.label ?? value;
}

function getStatusTone(value: string) {
  if (value === "closed") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (value === "lost") return "border-slate-200 bg-slate-100 text-slate-500";
  if (value === "negotiation" || value === "visited") return "border-amber-200 bg-amber-50 text-amber-800";
  if (value === "new") return "border-sky-200 bg-sky-50 text-sky-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

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

function LeadCard({ lead, properties, agents, workspaceSlug }: { lead: LeadRecord; properties: PropertyRecord[]; agents: Array<{ id: string; display_name: string; whatsapp?: string | null }>; workspaceSlug?: string | null }) {
  const [state, action, pending] = useActionState(updateLeadStateAction, initialState);
  const alert = getLeadAlert(lead);
  const whatsappUrl = formatWhatsAppUrl(lead.phone, `Hola ${lead.full_name}, te contacto por tu interés${lead.property_title ? ` en ${lead.property_title}` : ""}.`);
  const openTasks = (lead.tasks ?? []).filter((task) => task.status === "open");
  const templateValues = {
    nombre: lead.full_name,
    asesor: lead.assigned_agent_name,
    propiedad: lead.property_title,
    link: "",
  };

  return (
    <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30 sm:rounded-[1.5rem] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-950">{lead.full_name}</p>
          <p className="mt-1 text-sm text-slate-500">{lead.phone}{lead.email ? ` · ${lead.email}` : ""}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{getSourceLabel(lead.source_type)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700">
              WhatsApp
            </a>
          ) : null}
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(lead.status)}`}>{getStatusLabel(lead.status)}</span>
        </div>
      </div>

      {alert ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {alert}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
        <p><span className="font-medium text-slate-900">Propiedad de origen:</span> {lead.property_title ?? "Sin referencia"}</p>
        <p><span className="font-medium text-slate-900">Fecha de entrada:</span> {new Date(lead.created_at).toLocaleString("es-MX")}</p>
        <p><span className="font-medium text-slate-900">Responsable:</span> {lead.assigned_agent_name ?? "Sin asignar"}</p>
        <p><span className="font-medium text-slate-900">Próximo seguimiento:</span> {lead.next_follow_up_at ? new Date(lead.next_follow_up_at).toLocaleString("es-MX") : "Pendiente"}</p>
      </div>

      {lead.message ? <p className="mt-4 text-sm leading-7 text-slate-600"><span className="font-medium text-slate-900">Mensaje inicial:</span> {lead.message}</p> : null}

      <CreateTourBox lead={lead} properties={properties} workspaceSlug={workspaceSlug} />

      <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Templates de WhatsApp</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {defaultWhatsAppTemplates.slice(0, 4).map((template) => {
            const url = formatWhatsAppUrl(lead.phone, fillMessageTemplate(template.body, templateValues));
            return url ? (
              <a key={template.key} href={url} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100">
                {template.title}
              </a>
            ) : null;
          })}
        </div>
      </div>

      <form action={action} className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <input type="hidden" name="leadId" value={lead.id} />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Estado</span>
            <select name="status" defaultValue={lead.status} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-950 sm:py-3 sm:text-sm">
              {leadStatuses.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Responsable comercial</span>
            <select name="assignedAgentId" defaultValue={lead.assigned_agent_id ?? ""} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-950 sm:py-3 sm:text-sm">
              <option value="">Sin asignar</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.display_name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Próximo contacto</span>
            <input name="nextFollowUpAt" type="datetime-local" defaultValue={formatDateTimeInput(lead.next_follow_up_at)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-950 outline-none transition focus:border-slate-400 sm:py-3 sm:text-sm" />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Nota rápida fija</span>
            <input name="internalNote" defaultValue={lead.internal_note ?? ""} placeholder="Ej. pidió llamada por la tarde" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-950 outline-none transition focus:border-slate-400 sm:py-3 sm:text-sm" />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Nueva nota de historial</span>
            <textarea name="newNote" rows={3} placeholder="Qué se habló, objeciones, presupuesto o siguiente paso." className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400" />
          </label>

          <div className="space-y-3">
            <label className="block space-y-2 text-sm text-slate-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Nueva tarea</span>
              <input name="taskTitle" placeholder="Ej. llamar para confirmar visita" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400" />
            </label>
            <input name="taskDueAt" type="datetime-local" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400" />
          </div>
        </div>

        {openTasks.length ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tareas abiertas</p>
            <div className="mt-3 space-y-2">
              {openTasks.map((task) => (
                <label key={task.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <input type="checkbox" name="completedTaskIds" value={task.id} className="mt-1" />
                  <span>
                    <span className="block font-medium text-slate-950">{task.title}</span>
                    <span className="text-xs text-slate-500">{task.due_at ? new Date(task.due_at).toLocaleString("es-MX") : "Sin fecha"}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {state.message ? <p className={`rounded-2xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{state.message}</p> : null}

        <button disabled={pending} className="w-full rounded-full bg-[#d7ab5b] px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-[#c99a46] disabled:opacity-60 sm:w-auto">
          {pending ? "Guardando..." : "Guardar seguimiento"}
        </button>
      </form>

      {lead.notes?.length ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Historial</p>
          <div className="mt-3 space-y-3">
            {lead.notes.slice(0, 4).map((note) => (
              <article key={note.id} className="rounded-xl bg-white px-3 py-3 text-sm text-slate-700">
                <p className="leading-6">{note.body}</p>
                <p className="mt-2 text-xs text-slate-400">{note.author_name ?? "Equipo"} · {new Date(note.created_at).toLocaleString("es-MX")}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AdminLeadsManager({ leads, properties, agents, workspaceSlug }: { leads: LeadRecord[]; properties: PropertyRecord[]; agents: Array<{ id: string; display_name: string; whatsapp?: string | null }>; workspaceSlug?: string | null }) {
  const openLeads = leads.filter((lead) => !["closed", "lost"].includes(lead.status));
  const overdueAlerts = leads.filter((lead) => getLeadAlert(lead)).length;
  const byStatus = leadStatuses.map((status) => ({
    ...status,
    leads: leads.filter((lead) => lead.status === status.value),
  }));
  const sourceCounts = leads.reduce<Record<string, number>>((acc, lead) => {
    const label = getSourceLabel(lead.source_type);
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:rounded-[2rem] sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Leads</p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-950">Pipeline comercial</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Dale dueño, estado, próximo contacto, tareas e historial a cada interesado para que ningún lead se enfríe.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Abiertos</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{openLeads.length}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Alertas</p>
            <p className="mt-2 text-2xl font-semibold text-amber-900">{overdueAlerts}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cerrados</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{leads.filter((lead) => lead.status === "closed").length}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {Object.entries(sourceCounts).map(([source, count]) => (
            <span key={source} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
              {source}: {count}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:rounded-[2rem]">
        <div className="grid min-w-[980px] grid-cols-7 gap-3">
          {byStatus.map((column) => (
            <article key={column.value} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{column.label}</p>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getStatusTone(column.value)}`}>{column.leads.length}</span>
              </div>
              <div className="mt-3 space-y-2">
                {column.leads.slice(0, 4).map((lead) => (
                  <a key={lead.id} href={`#lead-${lead.id}`} className="block rounded-xl border border-slate-100 bg-white px-3 py-3 text-sm shadow-sm transition hover:border-slate-300">
                    <span className="block font-semibold text-slate-950">{lead.full_name}</span>
                    <span className="mt-1 block text-xs text-slate-500">{lead.property_title ?? getSourceLabel(lead.source_type)}</span>
                    {getLeadAlert(lead) ? <span className="mt-2 inline-flex rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">Alerta</span> : null}
                  </a>
                ))}
                {column.leads.length > 4 ? <p className="text-xs text-slate-400">+{column.leads.length - 4} más</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {leads.length ? leads.map((lead) => <div id={`lead-${lead.id}`} key={`${lead.id}-${lead.created_at}`}><LeadCard lead={lead} properties={properties} agents={agents} workspaceSlug={workspaceSlug} /></div>) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">Todavía no hay leads recibidos. Cuando alguien escriba desde una propiedad, aparecerá aquí con seguimiento accionable.</div>}
      </div>
    </div>
  );
}

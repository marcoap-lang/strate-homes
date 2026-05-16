"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createLeadAppointmentAction,
  updateLeadProfileAction,
  type LeadDetailActionState,
} from "@/app/admin/actions";
import { defaultWhatsAppTemplates, fillMessageTemplate } from "@/lib/commercial";
import type { LeadDetail } from "@/lib/lead-detail";

const initialState: LeadDetailActionState = { success: false, message: "" };

const leadStatuses = [
  ["new", "Nuevo"],
  ["contacted", "Contactado"],
  ["interested", "Interesado"],
  ["visited", "Visita agendada"],
  ["negotiation", "Negociación"],
  ["closed", "Cerrado"],
  ["lost", "Perdido"],
];

const operations = [
  ["", "Sin preferencia"],
  ["sale", "Compra"],
  ["rent", "Renta"],
  ["both", "Compra o renta"],
];

const propertyTypes = [
  ["", "Sin preferencia"],
  ["house", "Casa"],
  ["apartment", "Departamento"],
  ["land", "Terreno"],
  ["office", "Oficina"],
  ["commercial", "Comercial"],
  ["warehouse", "Bodega"],
  ["building", "Edificio"],
  ["development", "Desarrollo"],
  ["mixed_use", "Uso mixto"],
];

function formatDateTimeInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function formatMoney(value?: number | null, currency = "MXN") {
  if (!value) return "Consultar";
  return `${currency} ${value.toLocaleString("es-MX")}`;
}

function formatWhatsAppUrl(phone?: string | null, message?: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message ?? "Hola, te contacto por tu búsqueda inmobiliaria.")}`;
}

export function LeadDetailManager({ detail }: { detail: LeadDetail }) {
  const [profileState, profileAction, profilePending] = useActionState(updateLeadProfileAction, initialState);
  const [appointmentState, appointmentAction, appointmentPending] = useActionState(createLeadAppointmentAction, initialState);
  const lead = detail.lead;
  const templateValues = {
    nombre: lead.full_name,
    asesor: detail.assignedAgent?.display_name,
    propiedad: detail.interests[0]?.title,
    link: detail.interests[0] && detail.workspace.slug ? `/w/${detail.workspace.slug}/properties/${detail.interests[0].slug}` : "",
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <article className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Cliente / contacto</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">{lead.full_name}</h1>
              <p className="mt-2 text-sm text-slate-500">{lead.phone}{lead.email ? ` · ${lead.email}` : ""}</p>
            </div>
            <Link href="/app/leads" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Volver a clientes
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Estado", lead.status],
              ["Responsable", detail.assignedAgent?.display_name ?? "Sin asignar"],
              ["Origen", lead.source_type ?? "Pendiente"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>

          {lead.message ? <p className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">{lead.message}</p> : null}
        </article>

        <article className="rounded-[1.8rem] border border-emerald-100 bg-emerald-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">WhatsApp comercial</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Mensajes listos para accionar</h2>
          <div className="mt-5 grid gap-2">
            {defaultWhatsAppTemplates.map((template) => {
              const url = formatWhatsAppUrl(lead.phone, fillMessageTemplate(template.body, templateValues));
              return url ? (
                <a key={template.key} href={url} target="_blank" rel="noreferrer" className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100">
                  {template.title}
                </a>
              ) : null;
            })}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <form action={profileAction} className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
          <input type="hidden" name="leadId" value={lead.id} />
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Ficha comercial</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Preferencias y siguiente paso</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span>Estado</span>
              <select name="status" defaultValue={lead.status} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
                {leadStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>Responsable</span>
              <select name="assignedAgentId" defaultValue={lead.assigned_agent_id ?? ""} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
                <option value="">Sin asignar</option>
                {detail.agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.display_name}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>Operación buscada</span>
              <select name="preferredOperation" defaultValue={lead.preferred_operation ?? ""} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
                {operations.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>Tipo de propiedad</span>
              <select name="preferredPropertyType" defaultValue={lead.preferred_property_type ?? ""} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
                {propertyTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>Zona deseada</span>
              <input name="preferredLocation" defaultValue={lead.preferred_location ?? ""} className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Ej. Riviera, Boca del Río, Condesa" />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>Urgencia</span>
              <input name="urgency" defaultValue={lead.urgency ?? ""} className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Ej. este mes, 3 meses, inversión" />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>Presupuesto mínimo</span>
              <input name="budgetMin" type="number" defaultValue={lead.budget_min ?? ""} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>Presupuesto máximo</span>
              <input name="budgetMax" type="number" defaultValue={lead.budget_max ?? ""} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>Recámaras mínimas</span>
              <input name="bedroomsMin" type="number" defaultValue={lead.bedrooms_min ?? ""} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>Próximo contacto</span>
              <input name="nextFollowUpAt" type="datetime-local" defaultValue={formatDateTimeInput(lead.next_follow_up_at)} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
            </label>
          </div>

          <label className="mt-4 block space-y-2 text-sm text-slate-700">
            <span>Nota fija</span>
            <input name="internalNote" defaultValue={lead.internal_note ?? ""} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
          <label className="mt-4 block space-y-2 text-sm text-slate-700">
            <span>Nueva nota al historial</span>
            <textarea name="newNote" rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Resumen de llamada, objeciones o siguiente acción." />
          </label>
          <label className="mt-4 block space-y-2 text-sm text-slate-700">
            <span>Motivo de pérdida, si aplica</span>
            <input name="lostReason" defaultValue={lead.lost_reason ?? ""} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>

          {profileState.message ? <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${profileState.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{profileState.message}</p> : null}
          <button disabled={profilePending} className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
            {profilePending ? "Guardando..." : "Guardar ficha comercial"}
          </button>
        </form>

        <div className="space-y-5">
          <form action={appointmentAction} className="rounded-[1.8rem] border border-amber-100 bg-[#fff8ec] p-6">
            <input type="hidden" name="leadId" value={lead.id} />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9b6f21]">Visitas y citas</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Agendar siguiente visita</h2>
            <div className="mt-5 grid gap-4">
              <input name="title" defaultValue="Visita a propiedad" className="rounded-2xl border border-amber-100 px-4 py-3" />
              <input name="scheduledAt" type="datetime-local" className="rounded-2xl border border-amber-100 px-4 py-3" />
              <select name="propertyId" className="rounded-2xl border border-amber-100 px-4 py-3" defaultValue={detail.interests[0]?.property_id ?? ""}>
                <option value="">Sin propiedad específica</option>
                {detail.properties.map((property) => <option key={property.id} value={property.id}>{property.title}</option>)}
              </select>
              <select name="assignedAgentId" className="rounded-2xl border border-amber-100 px-4 py-3" defaultValue={lead.assigned_agent_id ?? ""}>
                <option value="">Sin asesor</option>
                {detail.agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.display_name}</option>)}
              </select>
            </div>
            {appointmentState.message ? <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${appointmentState.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{appointmentState.message}</p> : null}
            <button disabled={appointmentPending} className="mt-5 rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#e2b86d] disabled:opacity-60">
              {appointmentPending ? "Agendando..." : "Agendar visita"}
            </button>
          </form>

          <article className="rounded-[1.8rem] border border-slate-200 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Matching</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Propiedades compatibles</h2>
            <div className="mt-5 space-y-3">
              {detail.matches.map((match) => (
                <Link key={match.property.id} href={`/app/properties/${match.property.id}`} className="block rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 transition hover:bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{match.property.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{match.property.location_label ?? "Ubicación pendiente"} · {formatMoney(match.property.price_amount, match.property.currency_code)}</p>
                    </div>
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">{match.score}%</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Coincide por: {match.reasons.join(", ")}</p>
                </Link>
              ))}
              {!detail.matches.length ? <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">Completa preferencias para sugerir propiedades compatibles.</p> : null}
            </div>
          </article>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <article className="rounded-[1.8rem] border border-slate-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Historial</p>
          <div className="mt-4 space-y-3">
            {detail.notes.map((note) => (
              <div key={note.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <p>{note.body}</p>
                <p className="mt-2 text-xs text-slate-400">{note.author_name ?? "Equipo"} · {new Date(note.created_at).toLocaleString("es-MX")}</p>
              </div>
            ))}
            {!detail.notes.length ? <p className="text-sm text-slate-500">Sin notas todavía.</p> : null}
          </div>
        </article>
        <article className="rounded-[1.8rem] border border-slate-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Tareas</p>
          <div className="mt-4 space-y-3">
            {detail.tasks.map((task) => (
              <div key={task.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <p className="font-semibold text-slate-950">{task.title}</p>
                <p className="mt-1 text-xs text-slate-500">{task.status} · {task.due_at ? new Date(task.due_at).toLocaleString("es-MX") : "Sin fecha"}</p>
              </div>
            ))}
            {!detail.tasks.length ? <p className="text-sm text-slate-500">Sin tareas todavía.</p> : null}
          </div>
        </article>
        <article className="rounded-[1.8rem] border border-slate-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Visitas</p>
          <div className="mt-4 space-y-3">
            {detail.appointments.map((appointment) => (
              <div key={appointment.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <p className="font-semibold text-slate-950">{appointment.title}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(appointment.scheduled_at).toLocaleString("es-MX")} · {appointment.status}</p>
                <p className="mt-1 text-xs text-slate-500">{appointment.property_title ?? "Sin propiedad"} · {appointment.agent_name ?? "Sin asesor"}</p>
              </div>
            ))}
            {!detail.appointments.length ? <p className="text-sm text-slate-500">Sin visitas agendadas.</p> : null}
          </div>
        </article>
      </section>
    </div>
  );
}

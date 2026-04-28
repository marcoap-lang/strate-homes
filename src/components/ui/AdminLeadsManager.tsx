"use client";

import { useActionState } from "react";
import { updateLeadStateAction, type LeadUpdateState } from "@/app/admin/actions";

const initialState: LeadUpdateState = { success: false, message: "" };

function LeadCard({ lead }: { lead: any }) {
  const [state, action, pending] = useActionState(updateLeadStateAction, initialState);

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30">
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

      <form action={action} className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <input type="hidden" name="leadId" value={lead.id} />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Estado</span>
            <select name="status" defaultValue={lead.status} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950">
              <option value="new">nuevo</option>
              <option value="contacted">contactado</option>
              <option value="interested">interesado</option>
              <option value="lost">perdido</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Nota interna</span>
            <input name="internalNote" defaultValue={lead.internal_note ?? ""} placeholder="Ej. pidió llamada por la tarde" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400" />
          </label>
        </div>

        {state.message ? <p className={`rounded-2xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{state.message}</p> : null}

        <button disabled={pending} className="rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c99a46] disabled:opacity-60">
          {pending ? "Guardando..." : "Guardar seguimiento"}
        </button>
      </form>
    </div>
  );
}

export function AdminLeadsManager({ leads }: { leads: any[] }) {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Leads</p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-950">Interesados recibidos</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Seguimiento básico para saber de qué propiedad viene cada lead y en qué estado va la conversación.</p>
      </div>

      <div className="grid gap-4">
        {leads.length ? leads.map((lead) => <LeadCard key={`${lead.id}-${lead.created_at}`} lead={lead} />) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">Todavía no hay leads recibidos.</div>}
      </div>
    </div>
  );
}

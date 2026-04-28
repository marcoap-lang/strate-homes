"use client";

import { useActionState } from "react";
import { captureLeadFromPropertyAction, type LeadCaptureState } from "@/app/admin/actions";

const initialState: LeadCaptureState = { success: false, message: "" };

export function PublicLeadCaptureForm({ propertyId, workspaceId }: { propertyId: string; workspaceId: string }) {
  const [state, action, pending] = useActionState(captureLeadFromPropertyAction, initialState);

  return (
    <form action={action} className="space-y-4 rounded-[2rem] bg-white p-6 shadow-sm">
      <input type="hidden" name="propertyId" value={propertyId} />
      <input type="hidden" name="workspaceId" value={workspaceId} />

      <div>
        <p className="text-2xl font-semibold text-slate-950">¿Te interesa esta propiedad?</p>
        <p className="mt-2 text-sm leading-7 text-slate-600">Déjanos tus datos y un asesor te contactará con más información.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input name="fullName" placeholder="Nombre completo" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400" />
        <input name="phone" placeholder="Teléfono" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400" />
        <input name="email" placeholder="Email (opcional)" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 md:col-span-2" />
      </div>

      <textarea name="message" rows={4} placeholder="Cuéntanos qué te interesa de esta propiedad" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400" />

      {state.message ? <p className={`rounded-2xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{state.message}</p> : null}

      <button disabled={pending} className="rounded-full bg-[#d7ab5b] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#c99a46] disabled:opacity-60">
        {pending ? "Enviando..." : "Enviar mis datos"}
      </button>
    </form>
  );
}
